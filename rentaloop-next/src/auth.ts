import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { accounts, sessions, users, verificationTokens } from "@/lib/schema"

import { eq } from "drizzle-orm"

const ADMIN_EMAILS = ['rexliaobusiness@gmail.com', 'aistorm0910@gmail.com'];

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
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
        async session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id;

                // Admin Whitelist Check
                if (session.user.email && ADMIN_EMAILS.includes(session.user.email)) {
                    session.user.role = 'admin';

                    // Sync to DB if needed (e.g. if their role in DB is still 'basic')
                    // Note: 'user' object from adapter might not reflect immediate update if we don't return new values
                    if ((user as any).role !== 'admin') {
                        try {
                            await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id));
                        } catch (e) {
                            console.error("Failed to auto-update admin role", e);
                        }
                    }
                } else {
                    // Normal user, read from DB
                    session.user.role = (user as any).role || 'basic';
                }
            }
            return session;
        }
    }
})
