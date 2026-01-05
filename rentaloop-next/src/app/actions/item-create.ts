'use server'

import { db } from "@/lib/db";
import { items } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createItem(formData: FormData) {
    // Check auth
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false as const, error: "UNAUTHENTICATED" };
    }

    // Extract data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string; // We need category selection
    const price = parseInt(formData.get('price') as string);
    const deposit = parseInt(formData.get('deposit') as string);
    const location = formData.get('location') as string;

    // Images come as a JSON string of URLs array (from client side uploader)
    const imagesJson = formData.get('images') as string;
    const images = JSON.parse(imagesJson || '[]');

    // Pickup locations (new Google Places format)
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

    const ownerId = session.user.id;

    const availableFromStr = formData.get('availableFrom') as string;
    const availableToStr = formData.get('availableTo') as string;
    const availableFrom = availableFromStr ? new Date(availableFromStr) : null;
    const availableTo = availableToStr ? new Date(availableToStr) : null;

    const condition = formData.get('condition') as string || 'good';
    const notes = formData.get('notes') as string || '';
    const discountRate3Days = parseInt(formData.get('discountRate3Days') as string) || 0;
    const discountRate7Days = parseInt(formData.get('discountRate7Days') as string) || 0;

    try {
        const inserted = await db
            .insert(items)
            .values({
            ownerId,
            categoryId: categoryId || null,
            title,
            description,
            pricePerDay: price,
            deposit,
            pickupLocation: location, // Legacy fallback
            pickupLocations, // New JSON array of locations
            images,
            availableFrom,
            availableTo,
            status: 'active',
            condition,
            notes,
            discountRate3Days,
            discountRate7Days
        })
            .returning({ id: items.id });

        revalidatePath('/products');
        revalidatePath('/admin/items');
        revalidatePath('/member');

        return { success: true as const, id: inserted[0]?.id };
    } catch (error) {
        console.error("Create Item Error:", error);
        return { success: false as const, error: "CREATE_FAILED" };
    }
}

