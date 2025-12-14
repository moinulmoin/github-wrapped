# GitHub Wrapped 2025

A "Spotify Wrapped" style experience for developers. Visualize your 2025 GitHub contributions with beautiful animated slides.

## Features

- **GitHub OAuth Sign-in** - Get private contribution stats with authenticated access
- **Public Mode** - Enter any GitHub username to view their public stats
- **Shareable Links** - Share your wrapped via `/u/[username]`
- **Download as Image** - Save your final persona card as PNG

### Slides

- **The Volume** - Total contributions with dynamic commentary
- **The Rhythm** - Peak productivity time analysis
- **The Arsenal** - Top languages visualization
- **The Collaboration** - PR and issue stats
- **The Consistency** - Longest streak calculation
- **The Evolution** - Year-over-year comparison
- **The Persona** - Auto-generated developer archetype

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/moinulmoin/github-wrapped.git
cd github-wrapped
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file:

```bash
# GitHub OAuth (Better Auth)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# Better Auth
BETTER_AUTH_SECRET=your_random_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Convex
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Optional: Server-side GitHub token for public data (higher rate limits)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx
```

### 3. GitHub OAuth App Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

### 4. Convex Setup

```bash
pnpm convex dev
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS 4
- Framer Motion
- Better Auth (GitHub OAuth)
- Convex (Data caching)
- Octokit (GitHub API)
- html2canvas-pro (Image download)
