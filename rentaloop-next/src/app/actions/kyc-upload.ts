'use server'

import cloudinary from "@/lib/cloudinary";
import { auth } from "@/auth";

export async function uploadKycImage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "UNAUTHENTICATED" };

  const file = formData.get("file") as File;
  const side = (formData.get("side") as string) || "unknown";

  if (!file) return { success: false as const, error: "NO_FILE" };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `rentaloop/kyc/${session.user.id}`,
            resource_type: "image",
            format: "webp",
            fetch_format: "webp",
            quality: "auto:good",
            flags: "lossy",
            transformation: [
              {
                width: 2000,
                crop: "limit",
                fetch_format: "webp",
                quality: "auto:good",
                flags: "progressive",
              },
            ],
            invalidate: true,
            unique_filename: true,
            overwrite: false,
            context: { side },
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return { success: true as const, url: result.secure_url as string };
  } catch (error) {
    console.error("KYC upload failed:", error);
    return { success: false as const, error: "UPLOAD_FAILED" };
  }
}
