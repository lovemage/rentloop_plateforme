'use server'

import { db } from "@/lib/db";
import { siteSettings, articles } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function getHomepageStats() {
    try {
        const settings = await db.select().from(siteSettings).where(eq(siteSettings.key, 'home_stats')).limit(1);
        if (settings.length > 0 && settings[0].value) {
            return { success: true, data: settings[0].value as any[] };
        }
        return { success: false, error: "Not found" };
    } catch (error) {
        console.error("Failed to fetch homepage stats:", error);
        return { success: false, error: "Database error" };
    }
}

export async function getHomepageFeatures() {
    try {
        const settings = await db.select().from(siteSettings).where(eq(siteSettings.key, 'home_features')).limit(1);
        if (settings.length > 0 && settings[0].value) {
            return { success: true, data: settings[0].value as any[] };
        }
        return { success: false, error: "Not found" };
    } catch (error) {
        console.error("Failed to fetch homepage features:", error);
        return { success: false, error: "Database error" };
    }
}

export async function getHomepageArticles() {
    try {
        const data = await db.select().from(articles)
            .where(eq(articles.isPublished, true))
            .orderBy(desc(articles.createdAt))
            .limit(3);

        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch homepage articles:", error);
        return { success: false, error: "Database error" };
    }
}
