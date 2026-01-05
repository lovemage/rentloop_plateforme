'use server'

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { Session } from "next-auth";
import { revalidatePath } from "next/cache";

function assertAdmin(session: Session | null) {
    if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
    if (session.user.role !== "admin") throw new Error("FORBIDDEN");
}

export type BannerSetting = {
    key: string;
    imageUrl: string | null;
    title: string | null;
    subtitle: string | null;
    tagText: string | null;
    styles: any | null; // Using any for JSON content for now
    updatedAt: Date | null;
};

/**
 * Get all banner settings
 */
export async function getAllBannerSettings(): Promise<{ success: true; data: BannerSetting[] }> {
    const session = await auth();
    assertAdmin(session);

    const rows = await db.select().from(siteSettings);
    return { success: true, data: rows as BannerSetting[] };
}

/**
 * Get a specific banner setting by key
 */
export async function getBannerSetting(key: string): Promise<{ success: true; data: BannerSetting | null }> {
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    return { success: true, data: (rows[0] as BannerSetting) ?? null };
}

/**
 * Update or create a banner setting
 */
export async function upsertBannerSetting(
    key: string,
    data: {
        imageUrl?: string | null;
        title?: string | null;
        subtitle?: string | null;
        tagText?: string | null;
        styles?: any | null;
    }
): Promise<{ success: true } | { success: false; error: string }> {
    const session = await auth();
    assertAdmin(session);

    try {
        // Check if exists
        const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);

        if (existing.length > 0) {
            // Update
            await db
                .update(siteSettings)
                .set({
                    imageUrl: data.imageUrl ?? existing[0].imageUrl,
                    title: data.title ?? existing[0].title,
                    subtitle: data.subtitle ?? existing[0].subtitle,
                    tagText: data.tagText ?? existing[0].tagText,
                    styles: data.styles ?? existing[0].styles,
                    updatedAt: new Date(),
                })
                .where(eq(siteSettings.key, key));
        } else {
            // Insert
            await db.insert(siteSettings).values({
                key,
                imageUrl: data.imageUrl ?? null,
                title: data.title ?? null,
                subtitle: data.subtitle ?? null,
                tagText: data.tagText ?? null,
                styles: data.styles ?? null,
                updatedAt: new Date(),
            });
        }

        // Revalidate pages that use banners
        revalidatePath('/');
        revalidatePath('/products');
        revalidatePath('/admin/banners');

        return { success: true };
    } catch (error) {
        console.error('Failed to upsert banner setting:', error);
        return { success: false, error: 'Failed to update banner setting' };
    }
}
