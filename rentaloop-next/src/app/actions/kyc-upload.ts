'use server'

import { auth } from "@/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

export async function uploadKycImage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "UNAUTHENTICATED" };

  const file = formData.get("file") as File;
  const side = (formData.get("side") as string) || "unknown";

  if (!file) return { success: false as const, error: "NO_FILE" };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to WebP using sharp
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality: 80 }) // Optimize quality as requested
      .toBuffer();

    // S3 Client Configuration
    const s3Client = new S3Client({
      region: process.env.SUPABASE_S3_REGION!,
      endpoint: process.env.SUPABASE_S3_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY!,
        secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY!,
      },
      forcePathStyle: true, // Required for some S3-compatible providers like Supabase
    });

    const timestamp = Date.now();
    const filename = `kyc/${session.user.id}/${side}-${timestamp}.webp`;

    const command = new PutObjectCommand({
      Bucket: process.env.SUPABASE_S3_BUCKET_NAME!,
      Key: filename,
      Body: optimizedBuffer,
      ContentType: "image/webp",
      // ACL: "private", // Supabase Storage controls access via policies, ACL might not be supported or needed depending on bucket config
    });

    await s3Client.send(command);

    // Construct URL - Assuming typical Supabase Storage URL structure
    // Note: The visibility depends on your Supabase Storage Bucket Policies (RLS)
    // If the bucket is private, you would typically generate a signed URL here or on retrieval.
    // For now, returning the path for reference.
    // Ideally, for KYC, this should definitely be private and accessed via signed URLs.

    // Constructing the full URL for reference, though for private buckets this won't be publicly accessible without a token.
    // Extract project ID from endpoint for URL construction if needed, or just return the key.
    // Endpoint: https://<project_id>.storage.supabase.co/storage/v1/s3
    const endpointUrl = new URL(process.env.SUPABASE_S3_ENDPOINT!);
    const projectId = endpointUrl.hostname.split('.')[0];
    const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${process.env.SUPABASE_S3_BUCKET_NAME}/${filename}`;

    return {
      success: true as const,
      url: publicUrl, // Or just return the 'filename' (key) if you plan to sign URLs on retrieval
      key: filename
    };

  } catch (error) {
    console.error("KYC upload failed:", error);
    return { success: false as const, error: "UPLOAD_FAILED" };
  }
}
