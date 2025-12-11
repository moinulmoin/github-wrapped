'use server'

import { Octokit } from "octokit";

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

export async function fetchUserStats(username: string, token?: string): Promise<WrappedData> {
  // Use provided token (user's PAT) or fall back to server environment token
  const authToken = token || process.env.GITHUB_TOKEN;

  const octokit = new Octokit({
    auth: authToken,
    request: { fetch: fetch },
    retry: { enabled: false },
  });

  console.log(`Starting fetch for ${username}`);
  console.log(`Auth Strategy: ${token ? 'User PAT (Private Access)' : (process.env.GITHUB_TOKEN ? 'Server Token' : 'No Auth')}`);
  if (token) console.log("✅ Using User's Personal Access Token (Private/Org Access Possible)");
  try {
    // 1. Identify if we are the authenticated user
    let isMe = false;
    try {
      const { data: currentUser } = await octokit.rest.users.getAuthenticated();
      if (currentUser.login.toLowerCase() === username.toLowerCase()) {
        isMe = true;
      }
    } catch (e) {
      // Token might be invalid or public-only without 'user' scope, ignore
    }

    console.log(`Fetching data for ${username} (Is Authenticated User: ${isMe})`);

    // 2. Fetch User Data & Repos
    // If it's me, I can see my private repos. If not, only public.
    const userRes = await octokit.rest.users.getByUsername({ username });

    let repos: any[] = [];
    if (isMe) {
       console.log("Fetching ALL repositories (Public + Private)...");
       const res = await octokit.rest.repos.listForAuthenticatedUser({
           sort: "updated",
           per_page: 100,
           visibility: "all"
       });
       repos = res.data;
    } else {
       console.log("Fetching PUBLIC repositories...");
       const res = await octokit.rest.repos.listForUser({
           username,
           per_page: 100,
           sort: "updated"
       });
       repos = res.data;
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
        color: "#ffffff", // Placeholder, will map colors locally or fetch if needed
      }));

    // 3. Fetch Contribution Data (GraphQL)
    // We try GraphQL for the heatmap, but fallback if it fails (often due to rate limits or auth)
    console.log('Fetching GraphQL data...');
    let calendar = { totalContributions: 0, weeks: [] };
    let busyDay = "N/A";
    let maxStreak = 0;
    var commits = 0;
    var prs = 0;
    var issues = 0;

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

      const graphqlRes: any = await octokit.graphql(contributionQuery, {
        username,
      });
      console.log('GraphQL data fetched');
      const collection = graphqlRes.user.contributionsCollection;
      calendar = collection.contributionCalendar;

      // Process calendar for streaks and busy days
      const days = calendar.weeks.flatMap((w: any) => w.contributionDays);
      const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

      let currentStreak = 0;
      days.forEach((day: any) => {
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

      const prev2024Res: any = await octokit.graphql(prev2024Query, { username });
      const prevCalendar = prev2024Res.user.contributionsCollection.contributionCalendar;
      const prevDays = prevCalendar.weeks.flatMap((w: any) => w.contributionDays);

      // Calculate prev year streak
      let prevStreak = 0;
      let prevMaxStreak = 0;
      const prevDayCounts = [0, 0, 0, 0, 0, 0, 0];

      prevDays.forEach((day: any) => {
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
        calendar: calendar.weeks.flatMap((w: any) => w.contributionDays).map((d: any) => ({
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
