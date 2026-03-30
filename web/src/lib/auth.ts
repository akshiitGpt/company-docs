import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const authEnabled = !!(
  process.env.GITHUB_ID && process.env.GITHUB_SECRET
);

export const authOptions: NextAuthOptions = {
  providers: authEnabled
    ? [
        GitHubProvider({
          clientId: process.env.GITHUB_ID!,
          clientSecret: process.env.GITHUB_SECRET!,
        }),
      ]
    : [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as Record<string, unknown>).id = token.sub;
      }
      return session;
    },
  },
};

export { authEnabled };
