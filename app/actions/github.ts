'use server'

import { Octokit } from "octokit";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

// Global octokit removed in favor of function-scoped instance to support dynamic tokens

export interface WrappedData {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    publicRepos: number;
    followers: number;
    yearCreated: number;
  };
  stats: {
    totalStars: number;
    totalForks: number;
    topLanguages: { name: string; count: number; color: string }[];
    totalContributions: number;
    longestStreak: number;
    busyDay: string;
    busyTime: string;
    rank: string;
    specifics: {
        commits: number;
        prs: number;
        issues: number;
    };
  };
  contributions: {
    total: number;
    calendar: { date: string; count: number; level: number }[];
  };
  // Year-over-year comparison (2024 vs 2025)
  previousYear?: {
    totalContributions: number;
    longestStreak: number;
    busyDay: string;
  };
}

type Repo = {
  stargazers_count: number | null;
  forks_count: number | null;
  language: string | null;
};

type ContributionDay = {
  contributionCount: number;
  date: string;
  contributionLevel: string;
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
};

type ContributionCalendar = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

type ContributionsCollection = {
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalIssueContributions: number;
  contributionCalendar: ContributionCalendar;
};

type ContributionsQueryResponse = {
  user: {
    contributionsCollection: ContributionsCollection;
  };
};

type PrevContributionDay = {
  contributionCount: number;
  date: string;
};

type PrevContributionWeek = {
  contributionDays: PrevContributionDay[];
};

type PrevContributionCalendar = {
  totalContributions: number;
  weeks: PrevContributionWeek[];
};

type PrevYearQueryResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: PrevContributionCalendar;
    };
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractAccessToken(tokenResult: unknown): string | undefined {
  if (!isRecord(tokenResult)) return undefined;

  const direct = tokenResult["accessToken"];
  if (typeof direct === "string") return direct;

  const data = tokenResult["data"];
  if (!isRecord(data)) return undefined;

  const dataAccessToken = data["accessToken"];
  if (typeof dataAccessToken === "string") return dataAccessToken;

  const token = data["token"];
  if (!isRecord(token)) return undefined;

  const nestedAccessToken = token["accessToken"];
  return typeof nestedAccessToken === "string" ? nestedAccessToken : undefined;
}

export async function fetchUserStats(username: string, token?: string): Promise<WrappedData> {
  // Use provided token (user's PAT) or fall back to server environment token
  const authToken = token || process.env.GITHUB_TOKEN;

  const octokit = new Octokit({
    auth: authToken,
    request: { fetch: fetch },
    retry: { enabled: false },
  });

  console.log(`Starting fetch for ${username}`);
  console.log(
    `Auth Strategy: ${token ? "User PAT (Private Access)" : process.env.GITHUB_TOKEN ? "Server Token" : "No Auth"}`
  );
  if (token)
    console.log("✅ Using User's Personal Access Token (Private/Org Access Possible)");

  try {
    // 1. Identify if we are the authenticated user & derive effective username
    let isMe = false;
    let effectiveUsername = username;

    try {
      const { data: currentUser } = await octokit.rest.users.getAuthenticated();

      if (token) {
        // When a user is signed in and we have their token,
        // always treat the token owner as the canonical username
        effectiveUsername = currentUser.login;
        isMe = true;
      } else if (currentUser.login.toLowerCase() === username.toLowerCase()) {
        // Server token belongs to the requested username
        effectiveUsername = currentUser.login;
        isMe = true;
      }
    } catch {
      // Token might be invalid or public-only without 'user' scope, ignore
    }

    console.log(
      `Fetching data for ${effectiveUsername} (Is Authenticated User: ${isMe})`
    );

    // 2. Fetch User Data & Repos
    // If it's me, I can see my private repos. If not, only public.
    const userRes = await octokit.rest.users.getByUsername({ username: effectiveUsername });

    let repos: Repo[] = [];
    if (isMe) {
      console.log("Fetching ALL repositories (Public + Private)...");
      const res = await octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
        visibility: "all",
      });
      repos = res.data as unknown as Repo[];
    } else {
      console.log("Fetching PUBLIC repositories...");
      const res = await octokit.rest.repos.listForUser({
        username: effectiveUsername,
        per_page: 100,
        sort: "updated",
      });
      repos = res.data as unknown as Repo[];
    }

    const user = userRes.data;

    // 2. Calculate Stats from Repos
    let totalStars = 0;
    let totalForks = 0;
    const languageMap = new Map<string, number>();

    repos.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      if (repo.language) {
        languageMap.set(repo.language, (languageMap.get(repo.language) || 0) + 1);
      }
    });

    const topLanguages = Array.from(languageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        color: getLanguageColor(name),
      }));

    // 3. Fetch Contribution Data (GraphQL)
    // We try GraphQL for the heatmap, but fallback if it fails (often due to rate limits or auth)
    console.log('Fetching GraphQL data...');
    let calendar: ContributionCalendar = { totalContributions: 0, weeks: [] };
    let busyDay = "N/A";
    let maxStreak = 0;
    let commits = 0;
    let prs = 0;
    let issues = 0;

    try {
      const contributionQuery = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              totalCommitContributions
              totalPullRequestContributions
              totalIssueContributions
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    contributionLevel
                  }
                }
              }
            }
          }
        }
      `;

      const graphqlRes = await octokit.graphql<ContributionsQueryResponse>(contributionQuery, {
        username: effectiveUsername,
      });
      console.log('GraphQL data fetched');
      const collection = graphqlRes.user.contributionsCollection;
      calendar = collection.contributionCalendar;

      // Process calendar for streaks and busy days
      const days = calendar.weeks.flatMap((w) => w.contributionDays);
      const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

      let currentStreak = 0;
      days.forEach((day) => {
        if (day.contributionCount > 0) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
          const date = new Date(day.date);
          dayCounts[date.getDay()] += day.contributionCount;
        } else {
          currentStreak = 0;
        }
      });

      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const busyDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
      if (Math.max(...dayCounts) > 0) {
          busyDay = daysOfWeek[busyDayIndex];
      }

      // Store specifics
      commits = collection.totalCommitContributions;
      prs = collection.totalPullRequestContributions;
      issues = collection.totalIssueContributions;

    } catch (gqlError) {
      console.warn("GraphQL fetch failed, falling back to basic stats:", gqlError);
      // Fallback values
      commits = 0;
      prs = 0;
      issues = 0;
    }

    // 4. Fetch 2024 contributions for year-over-year comparison
    let previousYear = undefined;
    try {
      const prev2024Query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection(from: "2024-01-01T00:00:00Z", to: "2024-12-31T23:59:59Z") {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }
      `;

      const prev2024Res = await octokit.graphql<PrevYearQueryResponse>(prev2024Query, { username: effectiveUsername });
      const prevCalendar = prev2024Res.user.contributionsCollection.contributionCalendar;
      const prevDays = prevCalendar.weeks.flatMap((w) => w.contributionDays);

      // Calculate prev year streak
      let prevStreak = 0;
      let prevMaxStreak = 0;
      const prevDayCounts = [0, 0, 0, 0, 0, 0, 0];

      prevDays.forEach((day) => {
        if (day.contributionCount > 0) {
          prevStreak++;
          prevMaxStreak = Math.max(prevMaxStreak, prevStreak);
          const date = new Date(day.date);
          prevDayCounts[date.getDay()] += day.contributionCount;
        } else {
          prevStreak = 0;
        }
      });

      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const prevBusyDayIndex = prevDayCounts.indexOf(Math.max(...prevDayCounts));
      const prevBusyDay = Math.max(...prevDayCounts) > 0 ? daysOfWeek[prevBusyDayIndex] : "N/A";

      previousYear = {
        totalContributions: prevCalendar.totalContributions,
        longestStreak: prevMaxStreak,
        busyDay: prevBusyDay,
      };
      console.log("2024 stats fetched:", previousYear);
    } catch (e) {
      console.warn("Could not fetch 2024 data:", e);
    }


    // 5. Calculate Rank
    // Formula: (Commits * 0.1) + (Stars * 2) + (Forks * 3) + (Followers * 1) + (Repos * 1)
    const score = (calendar.totalContributions * 0.1) + (totalStars * 2) + (totalForks * 3) + (user.followers * 1) + (repos.length * 1);

    // Virtual "Level" for internal scaling, but not shown to user
    const level = Math.max(1, Math.floor(Math.sqrt(score)));

    let rank = "Novice Byte";
    if (level > 5) rank = "Code Explorer";
    if (level > 10) rank = "Git Artisan";
    if (level > 20) rank = "Repo Ranger";
    if (level > 30) rank = "Commit Connoisseur";
    if (level > 40) rank = "Open Source Ninja";
    if (level > 50) rank = "Stack Overflow Saviour";
    if (level > 60) rank = "10x Developer";
    if (level > 75) rank = "Tech Lead";
    if (level > 90) rank = "System Architect";
    if (level > 100) rank = "Singularity";

    return {
      user: {
        login: user.login,
        name: user.name,
        avatarUrl: user.avatar_url,
        publicRepos: user.public_repos,
        followers: user.followers,
        yearCreated: new Date(user.created_at).getFullYear(),
      },
      stats: {
        totalStars,
        totalForks,
        topLanguages,
        totalContributions: calendar.totalContributions,
        longestStreak: maxStreak,
        busyDay,
        busyTime: "N/A",
        rank,
        specifics: {
            commits,
            prs,
            issues
        }
      },
      contributions: {
        total: calendar.totalContributions,
        calendar: calendar.weeks.flatMap((w) => w.contributionDays).map((d) => ({
            date: d.date,
            count: d.contributionCount,
            level: 0
        })),
      },
      previousYear,
    };

  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    throw new Error("Failed to fetch user data. Check the username or try again later.");
  }
}

export async function fetchSignedInUserStats(): Promise<WrappedData> {
  const hdrs = headers();

  const session = await auth.api.getSession({
    headers: hdrs,
  });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const tokenResult = await auth.api.getAccessToken({
    body: { providerId: "github" },
    headers: hdrs,
  });

  // Better Auth may return the token directly or wrapped in a data object
  const accessToken = extractAccessToken(tokenResult);

  if (!accessToken) {
    throw new Error("GitHub access token is not available for this account.");
  }

  // Username is derived from the token via getAuthenticated inside fetchUserStats
  return fetchUserStats("", accessToken);
}

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    "TypeScript": "#3178c6",
    "JavaScript": "#f1e05a",
    "Python": "#3572A5",
    "Java": "#b07219",
    "Go": "#00ADD8",
    "Rust": "#dea584",
    "C++": "#f34b7d",
    "C": "#555555",
    "C#": "#178600",
    "PHP": "#4F5D95",
    "Ruby": "#701516",
    "Shell": "#89e051",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "Vue": "#41b883",
    "Svelte": "#ff3e00",
    "Swift": "#F05138",
    "Kotlin": "#A97BFF",
    "Dart": "#00B4AB",
    "Lua": "#000080"
  };
  return colors[language] || "#ffffff";
}
