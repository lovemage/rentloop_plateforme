import NextAuth, { type User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { accounts, sessions, users, verificationTokens } from "@/lib/schema"
import { authConfig } from "./auth.config"
import { eq } from "drizzle-orm"

const ADMIN_EMAILS = ['rexliaobusiness@gmail.com', 'aistorm0910@gmail.com'];

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user }) {
            try {
                if (user.id) {
                    // Fetch user from DB to check isBlocked
                    // user object from param might be from provider profile, so better check DB
                    const dbUser = await db.query.users.findFirst({
                        where: eq(users.id, user.id),
                    });
                    if (dbUser?.isBlocked) {
                        return false;
                    }
                } else if (user.email) {
                    // Fallback for initial sign in or if id not present (e.g. magic link)
                    const dbUser = await db.query.users.findFirst({
                        where: eq(users.email, user.email),
                    });
                    if (dbUser?.isBlocked) {
                        return false;
                    }
                }
                return true;
            } catch (error) {
                console.error("SignIn Block Check Error:", error);
                return true; // Fail open or closed? Better fail open if DB error to avoid lockout due to bug, but strict security says closed. Let's fail open but log.
            }
        },
        async session({ session, user, token }) {
            if (session.user) {
                if (user) {
                    session.user.id = user.id;

                    if (session.user.email && ADMIN_EMAILS.includes(session.user.email)) {
                        session.user.role = 'admin';

                        if ((user as User & { role?: string }).role !== 'admin') {
                            try {
                                await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id));
                            } catch (e) {
                                console.error("Failed to auto-update admin role", e);
                            }
                        }
                    } else {
                        session.user.role = (user as User & { role?: string }).role || 'basic';
                    }
                } else if (token) {
                    session.user.id = token.sub as string;
                    session.user.role = (token.role as string) || session.user.role;

                    if (session.user.email && ADMIN_EMAILS.includes(session.user.email)) {
                        session.user.role = 'admin';
                    }
                }
            }

            return session;
        },
    }
})
