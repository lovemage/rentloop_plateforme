'use server'

import { auth } from "@/auth";
import { uploadToS3 } from "@/lib/supabase-s3";
import sharp from "sharp";

export async function uploadKycImage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "UNAUTHENTICATED" };

  const file = formData.get("file") as File;
  const side = (formData.get("side") as string) || "unknown"; // front or back

  if (!file) return { success: false as const, error: "NO_FILE" };

  // 1. Basic type validation
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!validTypes.includes(file.type)) {
    // Check if it's HEIC/HEIF which we know fails
    if (file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith(".heic")) {
      return { success: false as const, error: "HEIC_NOT_SUPPORTED" };
    }
    // Keep generic for others, or strict
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to WebP using sharp for optimization
    // Wrap in specific try/catch to identify image processing errors
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer();
    } catch (sharpError: any) {
      console.error("Sharp processing error:", sharpError);
      if (sharpError.message.includes("heif") || sharpError.message.includes("format")) {
        return { success: false as const, error: "UNSUPPORTED_FORMAT" };
      }
      throw sharpError; // Re-throw to outer catch for generic handling
    }

    const timestamp = Date.now();
    // Store with user ID subfolder for organization
    // Key format: kyc/{userId}/{side}-{timestamp}.webp
    const key = `kyc/${session.user.id}/${side}-${timestamp}.webp`;

    await uploadToS3(optimizedBuffer, key, "image/webp");

    // Return the key (not URL) - we will generate signed URLs when viewing
    return {
      success: true as const,
      url: key, // Store the key, not a public URL
      key: key
    };

  } catch (error) {
    console.error("KYC upload failed:", error);
    return { success: false as const, error: "UPLOAD_FAILED" };
  }
}
