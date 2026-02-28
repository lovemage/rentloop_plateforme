'use server'

import { db } from "@/lib/db";
import { categories, items } from "@/lib/schema";
import { eq, asc, and, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// 取得所有分類 (扁平列表，前端轉樹狀)
export async function getCategories() {
    try {
        const allCategories = await db.select().from(categories).orderBy(asc(categories.level));

        const itemCounts = await db
            .select({
                categoryId: items.categoryId,
                count: sql<number>`count(*)::int`,
            })
            .from(items)
            .where(and(isNotNull(items.categoryId), eq(items.status, 'active')))
            .groupBy(items.categoryId);

        const directCountByCategoryId = new Map(itemCounts.map((row) => [row.categoryId, row.count]));
        const childrenByParentId = new Map<string, string[]>();

        for (const category of allCategories) {
            if (!category.parentId) continue;
            const children = childrenByParentId.get(category.parentId) ?? [];
            children.push(category.id);
            childrenByParentId.set(category.parentId, children);
        }

        const aggregateCache = new Map<string, number>();
        const getAggregateCount = (categoryId: string): number => {
            const cachedCount = aggregateCache.get(categoryId);
            if (cachedCount !== undefined) return cachedCount;

            const directCount = directCountByCategoryId.get(categoryId) ?? 0;
            const children = childrenByParentId.get(categoryId) ?? [];
            const descendantsCount = children.reduce((sum, childId) => sum + getAggregateCount(childId), 0);
            const totalCount = directCount + descendantsCount;

            aggregateCache.set(categoryId, totalCount);
            return totalCount;
        };

        const categoriesWithCount = allCategories.map((category) => ({
            ...category,
            itemCount: getAggregateCount(category.id),
        }));

        return { success: true, data: categoriesWithCount };
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
