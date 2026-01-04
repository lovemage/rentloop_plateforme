'use server'
import cloudinary from '@/lib/cloudinary';

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: 'rentaloop/items', // Organized folder
                resource_type: 'image',
                format: 'webp',            // Auto convert to WebP
                quality: 'auto:good',      // Smart compression
                transformation: [
                    { width: 1600, crop: "limit" } // Max width to prevent massive 4K uploads
                ]
            }, (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }).end(buffer);
        });

        return { success: true, url: result.secure_url };
    } catch (error) {
        console.error('Upload failed:', error);
        return { success: false, error: 'Image upload failed' };
    }
}
