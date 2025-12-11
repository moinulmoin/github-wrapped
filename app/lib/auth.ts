import { betterAuth } from "better-auth";

export const auth = betterAuth({
    // Stateless mode - no database, JWT in cookies
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
            // Request repo scope for private repo access
            scope: ["repo", "read:user", "read:org"],
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24, // 24 hours
        },
    },
});
