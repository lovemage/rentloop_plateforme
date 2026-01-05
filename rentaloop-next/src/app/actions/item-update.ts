'use server'

import { db } from "@/lib/db";
import { items } from "@/lib/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function updateItem(itemId: string, formData: FormData) {
    // Check auth
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/auth');
    }

    // Verify ownership
    const existingItem = await db.select({ ownerId: items.ownerId }).from(items).where(eq(items.id, itemId)).limit(1);
    if (!existingItem.length) {
        return { error: "找不到此商品" };
    }
    if (existingItem[0].ownerId !== session.user.id) {
        return { error: "您沒有權限編輯此商品" };
    }

    // Extract data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const price = parseInt(formData.get('price') as string);
    const deposit = parseInt(formData.get('deposit') as string);
    const location = formData.get('location') as string;

    // Images come as a JSON string of URLs array
    const imagesJson = formData.get('images') as string;
    const images = JSON.parse(imagesJson || '[]');

    // Pickup locations (Google Places format)
    const pickupLocationsJson = formData.get('pickupLocations') as string;
    let pickupLocations = null;
    try {
        pickupLocations = JSON.parse(pickupLocationsJson || '[]');
        if (!Array.isArray(pickupLocations) || pickupLocations.length === 0) {
            pickupLocations = null;
        }
    } catch {
        pickupLocations = null;
    }

    const availableFromStr = formData.get('availableFrom') as string;
    const availableToStr = formData.get('availableTo') as string;
    const availableFrom = availableFromStr ? new Date(availableFromStr) : null;
    const availableTo = availableToStr ? new Date(availableToStr) : null;

    const condition = formData.get('condition') as string || 'good';
    const notes = formData.get('notes') as string || '';
    const discountRate3Days = parseInt(formData.get('discountRate3Days') as string) || 0;
    const discountRate7Days = parseInt(formData.get('discountRate7Days') as string) || 0;

    try {
        await db.update(items).set({
            categoryId: categoryId || null,
            title,
            description,
            pricePerDay: price,
            deposit,
            pickupLocation: location,
            pickupLocations,
            images,
            availableFrom,
            availableTo,
            condition,
            notes,
            discountRate3Days,
            discountRate7Days
        }).where(eq(items.id, itemId));

        revalidatePath('/products');
        revalidatePath(`/products/${itemId}`);
        revalidatePath('/admin/items');
        revalidatePath('/member');
    } catch (error) {
        console.error("Update Item Error:", error);
        return { error: "更新失敗，請稍後再試" };
    }

    redirect(`/products/${itemId}`);
}

// Get single item for editing
export async function getItemForEdit(itemId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "請先登入" };
    }

    const item = await db.select().from(items).where(eq(items.id, itemId)).limit(1);

    if (!item.length) {
        return { error: "找不到此商品" };
    }

    if (item[0].ownerId !== session.user.id) {
        return { error: "您沒有權限編輯此商品" };
    }

    return { success: true, data: item[0] };
}
