import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const authConfig: NextAuthConfig = {
    providers: [Google],
    callbacks: {
        async session({ session, user }) {
            session.user.id = user.id;
            return session;
        },
        async signIn({ user }) {
            if (user.email !== process.env.MY_EMAIL) {
                return false;
            }
            return true;
        },
    },
};

export default authConfig;
