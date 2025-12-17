import { betterAuth } from "better-auth";

export const auth = betterAuth({
    // Stateless mode - no database, JWT in cookies
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
            // GitHub App uses fine-grained permissions set at app level
            // Only request email scope for user identification
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24, // 24 hours
        },
    },
});
