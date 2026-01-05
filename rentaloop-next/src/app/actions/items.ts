'use server'

import { db } from "@/lib/db";
import { items, categories, users, rentals, itemQuestions, reviews, rentalMessages } from "@/lib/schema";
import { eq, desc, ilike, inArray, or, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// 取得所有商品 (包含 Owner 和 Category 資訊)
export async function getItems() {
    try {
        const allItems = await db.select({
            id: items.id,
            title: items.title,
            price: items.pricePerDay,
            status: items.status,
            createdAt: items.createdAt,
            ownerName: users.name,
            ownerEmail: users.email,
            categoryName: categories.name,
            images: items.images,
        })
            .from(items)
            .leftJoin(users, eq(items.ownerId, users.id))
            .leftJoin(categories, eq(items.categoryId, categories.id))
            .orderBy(desc(items.createdAt));

        return { success: true, data: allItems };
    } catch (error) {
        console.error("Failed to fetch items:", error);
        return { success: false, error: "Failed to fetch items" };
    }
}

// 變更商品狀態 (下架/刪除)
export async function updateItemStatus(id: string, status: string) {
    try {
        await db.update(items).set({ status }).where(eq(items.id, id));
        revalidatePath('/admin/items');
        return { success: true };
    } catch (error) {
        console.error("Failed to update item status:", error);
        return { success: false, error: "Failed to update item status" };
    }
}


export async function toggleItemStatus(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const item = await db.select().from(items).where(eq(items.id, id)).limit(1);
    if (!item.length) return { success: false, error: "Item not found" };
    if (item[0].ownerId !== session.user.id) return { success: false, error: "Forbidden" };

    const newStatus = item[0].status === 'active' ? 'inactive' : 'active';
    await db.update(items).set({ status: newStatus }).where(eq(items.id, id));

    revalidatePath('/member');
    revalidatePath(`/products/${id}`);

    return { success: true, status: newStatus };
}

export async function deleteItem(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const item = await db.select().from(items).where(eq(items.id, id)).limit(1);
    if (!item.length) return { success: false, error: "Item not found" };
    if (item[0].ownerId !== session.user.id) return { success: false, error: "Forbidden" };

    // Check for active rentals
    const activeRentals = await db.select().from(rentals).where(
        and(
            or(
                eq(rentals.status, 'ongoing'),
                eq(rentals.status, 'approved')
            ),
            eq(rentals.itemId, id)
        )
    );

    if (activeRentals.length > 0) {
        return { success: false, error: "無法刪除：尚有進行中或已核准的租賃訂單" };
    }

    try {
        await db.transaction(async (tx) => {
            // 1. Get all rental IDs to delete messages and reviews
            const itemRentals = await tx.select({ id: rentals.id }).from(rentals).where(eq(rentals.itemId, id));
            const rentalIds = itemRentals.map(r => r.id);

            if (rentalIds.length > 0) {
                // Delete rental messages
                await tx.delete(rentalMessages).where(inArray(rentalMessages.rentalId, rentalIds));
                // Delete reviews
                await tx.delete(reviews).where(inArray(reviews.rentalId, rentalIds));
                // Delete rentals
                await tx.delete(rentals).where(eq(rentals.itemId, id));
            }

            // 2. Delete item questions
            await tx.delete(itemQuestions).where(eq(itemQuestions.itemId, id));

            // 3. Delete item
            await tx.delete(items).where(eq(items.id, id));
        });

        revalidatePath('/member');
        revalidatePath('/products');

        return { success: true };
    } catch (e) {
        console.error("Delete item failed:", e);
        return { success: false, error: "刪除失敗：資料庫錯誤" };
    }
}
