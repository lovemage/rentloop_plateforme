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
        async session({ session, user, token }: { session: { user: { id: string; role?: string; email?: string | null } }; user?: User; token?: JWT }) {
            if (session.user) {
                if (user) {
                    session.user.id = user.id;

                    if (session.user.email && ADMIN_EMAILS.includes(session.user.email)) {
                        session.user.role = 'admin';

                        if (user.role !== 'admin') {
                            try {
                                await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id));
                            } catch (e) {
                                console.error("Failed to auto-update admin role", e);
                            }
                        }
                    } else {
                        session.user.role = user.role || 'basic';
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
