# Git Wrapped 2025 🎁

A "Spotify Wrapped" style experience for developers. Visualize your 2025 GitHub contributions with a cyberpunk/bioluminescence aesthetic.

## Features
- **The Volume:** Total contributions counter.
- **The Rhythm:** Peak productivity time analysis.
- **The Arsenal:** Top languages visualization.
- **The Consistency:** Longest streak calculation.
- **The Persona:** Auto-generated developer archetype.

## Setup & Running

1.  **Clone & Install**
    ```bash
    git clone <your-repo>
    cd git-wrapped
    pnpm install
    ```

2.  **API Token (Crucial for Rate Limits)**
    The app uses the GitHub API. Unauthenticated requests are limited to 60/hr. To avoid "Request quota exhausted" errors:

    *   Create a `.env.local` file in the root directory.
    *   Add your GitHub Token (Classic or Fine-grained):
        ```bash
        GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx
        ```
    *   [Generate a token here](https://github.com/settings/tokens) (No special scopes needed for public data).

3.  **Run Development Server**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Tech Stack
- Next.js 16 (App Router)
- Tailwind CSS 4
- Framer Motion
- Octokit
