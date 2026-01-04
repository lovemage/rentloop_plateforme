'use server'
import cloudinary from '@/lib/cloudinary';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
}

export async function uploadAvatar(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: 'rentaloop/avatars',
                resource_type: 'image',
                format: 'webp',
                fetch_format: 'webp',
                quality: 70, // Fixed quality generic
                transformation: [
                    {
                        width: 400, // Avatar doesn't need to be huge
                        height: 400,
                        crop: 'fill',
                        gravity: 'face', // Center on face
                        fetch_format: 'webp',
                        quality: 70
                    }
                ],
                invalidate: true,
                unique_filename: true,
                overwrite: false
            }, (error, result) => {
                if (error) {
                    console.error('Cloudinary Avatar Upload Error:', error);
                    reject(error);
                } else if (!result) {
                    reject(new Error('Upload failed: No result returned'));
                } else {
                    resolve(result);
                }
            }).end(buffer);
        });

        const imageUrl = uploadResult.secure_url;

        // Update user in DB
        await db.update(users)
            .set({ image: imageUrl })
            .where(eq(users.id, session.user.id));

        revalidatePath('/member');

        return { success: true, url: imageUrl };
    } catch (error) {
        console.error('Avatar upload failed:', error);
        return { success: false, error: 'Avatar upload failed' };
    }
}
