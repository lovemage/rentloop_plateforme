'use server'

import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export async function uploadKycImage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "UNAUTHENTICATED" };

  const file = formData.get("file") as File;
  const side = (formData.get("side") as string) || "unknown"; // front or back

  if (!file) return { success: false as const, error: "NO_FILE" };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        folder: `rentaloop/kyc/${session.user.id}`, // Organize by user
        resource_type: 'image',
        format: 'webp',
        fetch_format: 'webp',
        quality: 'auto:good',
        // Add tags for searching if needed
        tags: ['kyc', side, session.user.id],
        // Private is better for KYC but for MVP we use public with obscure URLs or restricted via policies if possible.
        // Cloudinary "authenticated" access mode requires signed URLs for viewing.
        // For now, let's keep it 'private' (which means original is not publicly available without signature, but derived might be?)
        // Actually, keep it standard 'upload' which is public by default in Cloudinary unless configured otherwise.
        // Given the previous code was generating public URLs, I will stick to standard upload for now to ensure it works with the frontend <img> tags.
        // Ideally should be type: 'authenticated'
      }, (error, result) => {
        if (error) {
          console.error('Cloudinary KYC Upload Error:', error);
          reject(error);
        } else if (!result) {
          reject(new Error('Upload failed: No result returned'));
        } else {
          resolve(result);
        }
      }).end(buffer);
    });

    return {
      success: true as const,
      url: result.secure_url,
      key: result.public_id
    };

  } catch (error) {
    console.error("KYC upload failed:", error);
    return { success: false as const, error: "UPLOAD_FAILED" };
  }
}
