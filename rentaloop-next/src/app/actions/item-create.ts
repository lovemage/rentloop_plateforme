'use server'

import { db } from "@/lib/db";
import { items, users } from "@/lib/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createItem(formData: FormData) {
    // Check auth
    const session = await auth();
    if (!session?.user?.id) {
        // In server actions, returning error object is better than throwing raw redirect if used with client forms handling errors
        // But for simple <form action> redirect works.
        redirect('/auth');
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

    const ownerId = session.user.id;

    const availableFromStr = formData.get('availableFrom') as string;
    const availableToStr = formData.get('availableTo') as string;
    const availableFrom = availableFromStr ? new Date(availableFromStr) : null;
    const availableTo = availableToStr ? new Date(availableToStr) : null;

    try {
        const [newItem] = await db.insert(items).values({
            ownerId,
            categoryId: categoryId || null,
            title,
            description,
            pricePerDay: price,
            deposit,
            pickupLocation: location,
            images,
            availableFrom,
            availableTo,
            status: 'active',
        }).returning({ id: items.id });

        revalidatePath('/products');
        revalidatePath('/admin/items');
    } catch (error) {
        console.error("Create Item Error:", error);
        return { error: "Failed to create item" };
    }

    redirect('/products');
}
