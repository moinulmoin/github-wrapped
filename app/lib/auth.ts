import { betterAuth } from "better-auth";

export const auth = betterAuth({
    // Stateless mode: No database config provided.
    // better-auth defaults to stateless (using cookies/JWT) if no DB is set.
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
            scope: ["repo", "read:user"],
        },
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            // @ts-ignore
            session.accessToken = token.accessToken;
            return session;
        },
    },
});
