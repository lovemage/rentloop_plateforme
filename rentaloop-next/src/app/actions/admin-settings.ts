'use server'

import { db } from "@/lib/db";
import { siteSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateHomepageStats(stats: any[]) {
    const session = await auth();
    if (session?.user?.role !== 'admin') return { success: false, error: "Unauthorized" };

    try {
        await db.insert(siteSettings).values({
            key: 'home_stats',
            value: stats,
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: siteSettings.key,
            set: { value: stats, updatedAt: new Date() }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Update Stats Info Error:", error);
        return { success: false, error: "Failed to update stats" };
    }
}

export async function updateHomepageFeatures(features: any[]) {
    const session = await auth();
    if (session?.user?.role !== 'admin') return { success: false, error: "Unauthorized" };

    try {
        await db.insert(siteSettings).values({
            key: 'home_features',
            value: features,
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: siteSettings.key,
            set: { value: features, updatedAt: new Date() }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Update Features Info Error:", error);
        return { success: false, error: "Failed to update features" };
    }
}

export async function updateHomepageNotice(notice: any) {
    const session = await auth();
    if (session?.user?.role !== 'admin') return { success: false, error: "Unauthorized" };

    try {
        await db.insert(siteSettings).values({
            key: 'home_notice',
            value: notice,
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: siteSettings.key,
            set: { value: notice, updatedAt: new Date() }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Update Notice Error:", error);
        return { success: false, error: "Failed to update notice" };
    }
}
