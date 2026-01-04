'use server'
import cloudinary from '@/lib/cloudinary';

interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
}

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: 'rentaloop/items',
                resource_type: 'image',
                // 強制轉檔為 WebP
                format: 'webp',
                fetch_format: 'webp',
                // 優化設置
                quality: 'auto:good',      // 智能壓縮
                flags: 'lossy',            // 使用有損壓縮以獲得更小的文件
                // 轉換設置（強制 WebP）
                transformation: [
                    {
                        width: 1600,
                        crop: 'limit',
                        fetch_format: 'webp',  // 強制輸出 WebP
                        quality: 'auto:good',
                        flags: 'progressive'    // 漸進式加載
                    }
                ],
                // 額外優化
                invalidate: true,          // 清除 CDN 緩存
                unique_filename: true,     // 唯一文件名
                overwrite: false           // 不覆蓋現有文件
            }, (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    reject(error);
                } else if (!result) {
                    reject(new Error('Upload failed: No result returned'));
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
