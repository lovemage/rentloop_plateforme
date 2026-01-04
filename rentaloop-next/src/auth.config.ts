import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

const ADMIN_EMAILS = ['rexliaobusiness@gmail.com', 'aistorm0910@gmail.com'];

export const authConfig = {
    trustHost: true,
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const protectedPaths = ["/items/new", "/member", "/admin"];
            const isOnProtectedPage = protectedPaths.some(path => nextUrl.pathname.startsWith(path));

            if (isOnProtectedPage) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.role = (user as any).role || 'basic';

                if ((user as any).email && ADMIN_EMAILS.includes((user as any).email)) {
                    token.role = 'admin';
                }
            }
            return token;
        },
        async session({ session, user, token }) {
            // Note: In middleware (using JWT strategy by default if no adapter), 'user' might be undefined
            // When using adapter in auth.ts, 'user' is populated from DB.
            // When using middleware, we rely on JWT or simple checks.

            // For correct type handling between JWT/Database flows:
            if (session.user) {
                if (user) {
                    session.user.id = user.id;
                    // Handle other fields from DB user if available
                    session.user.role = (user as any).role || 'basic';
                } else if (token) {
                    session.user.id = token.sub as string;
                    session.user.role = (token as any).role || session.user.role;
                    // If we are using JWT strategy, role should be improved via jwt callback
                }

                // Admin Whitelist Check (Backup)
                if (session.user.email && ADMIN_EMAILS.includes(session.user.email)) {
                    session.user.role = 'admin';
                }
            }
            return session;
        }
    }
} satisfies NextAuthConfig
