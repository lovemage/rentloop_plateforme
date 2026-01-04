'use server'

import { db } from "@/lib/db";
import { emailTemplates } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { DEFAULT_TEMPLATES } from "@/lib/email";

export async function getEmailTemplates() {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    const existing = await db.select().from(emailTemplates);

    // Seed if missing any default keys
    const missingKeys = Object.keys(DEFAULT_TEMPLATES).filter(key =>
        !existing.find(t => t.key === key)
    );

    if (missingKeys.length > 0) {
        await db.insert(emailTemplates).values(
            missingKeys.map(key => {
                const def = DEFAULT_TEMPLATES[key as keyof typeof DEFAULT_TEMPLATES];
                return {
                    key,
                    subject: def.subject,
                    body: def.body,
                    description: def.description,
                    variables: def.variables
                };
            })
        );
        return await db.select().from(emailTemplates);
    }

    return existing;
}

export async function updateEmailTemplate(key: string, subject: string, body: string) {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    await db.update(emailTemplates)
        .set({ subject, body, updatedAt: new Date() })
        .where(eq(emailTemplates.key, key));

    revalidatePath("/admin/emails");
    return { success: true };
}
