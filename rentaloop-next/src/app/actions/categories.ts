'use server'

import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// 取得所有分類 (扁平列表，前端轉樹狀)
export async function getCategories() {
    try {
        const allCategories = await db.select().from(categories).orderBy(asc(categories.level));
        return { success: true, data: allCategories };
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return { success: false, error: "Failed to fetch categories" };
    }
}

// 新增分類
export async function createCategory(data: NewCategory) {
    try {
        await db.insert(categories).values(data);
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error("Failed to create category:", error);
        return { success: false, error: "Failed to create category" };
    }
}

// 更新分類
export async function updateCategory(id: string, data: Partial<NewCategory>) {
    try {
        await db.update(categories).set(data).where(eq(categories.id, id));
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error("Failed to update category:", error);
        return { success: false, error: "Failed to update category" };
    }
}

// 刪除分類
export async function deleteCategory(id: string) {
    try {
        // TODO: 檢查是否有子分類或關聯商品，若有則阻止刪除
        await db.delete(categories).where(eq(categories.id, id));
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        return { success: false, error: "Failed to delete category" };
    }
}
