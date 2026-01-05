'use server'

import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getArticles() {
    try {
        const data = await db.select().from(articles).orderBy(desc(articles.createdAt));
        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch articles:", error);
        return { success: false, error: "Failed to fetch articles" };
    }
}

export async function getArticle(id: string) {
    try {
        const data = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
        if (data.length > 0) return { success: true, data: data[0] };
        return { success: false, error: "Not found" };
    } catch (error) {
        console.error("Failed to fetch article:", error);
        return { success: false, error: "Failed to fetch article" };
    }
}

export async function createArticle(formData: FormData) {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const image = formData.get('image') as string;
    const seoSchemaStr = formData.get('seoSchema') as string;

    let seoSchema = null;
    try {
        seoSchema = seoSchemaStr ? JSON.parse(seoSchemaStr) : null;
    } catch (e) {
        console.error("Invalid JSON for SEO Schema", e);
    }

    // Auto-generate Schema if missing
    if (!seoSchema) {
        seoSchema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": excerpt,
            "image": [image],
            "author": {
                "@type": "Organization",
                "name": "Rentaloop"
            }
        };
    }

    try {
        await db.insert(articles).values({
            slug,
            title,
            excerpt,
            content,
            image,
            seoSchema,
            isPublished: true,
            author: "Rentaloop Admin"
        });
        revalidatePath('/admin/articles');
        revalidatePath('/'); // Homepage
        return { success: true };
    } catch (error) {
        console.error("Create Article Error:", error);
        return { success: false, error: "Failed to create article" };
    }
}

export async function updateArticle(id: string, formData: FormData) {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const image = formData.get('image') as string;
    const seoSchemaStr = formData.get('seoSchema') as string;

    let seoSchema = null;
    try {
        seoSchema = seoSchemaStr ? JSON.parse(seoSchemaStr) : null;
    } catch (e) {
        // Keep existing if parse fails? Or null? Let's default to auto-regen.
    }

    if (!seoSchema) {
        seoSchema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": excerpt,
            "image": [image],
            "author": {
                "@type": "Organization",
                "name": "Rentaloop"
            }
        };
    }

    try {
        await db.update(articles).set({
            slug,
            title,
            excerpt,
            content,
            image,
            seoSchema
        }).where(eq(articles.id, id));
        revalidatePath('/admin/articles');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Update Article Error:", error);
        return { success: false, error: "Failed to update article" };
    }
}

export async function deleteArticle(id: string) {
    try {
        await db.delete(articles).where(eq(articles.id, id));
        revalidatePath('/admin/articles');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Delete Article Error:", error);
        return { success: false, error: "Failed to delete article" };
    }
}
