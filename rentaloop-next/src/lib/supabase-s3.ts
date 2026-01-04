import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 Client for Supabase Storage
export const s3Client = new S3Client({
    region: process.env.SUPABASE_S3_REGION!,
    endpoint: process.env.SUPABASE_S3_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY!,
        secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY!,
    },
    forcePathStyle: true,
});

export const BUCKET_NAME = process.env.SUPABASE_S3_BUCKET_NAME!;

/**
 * Generate a signed URL for private S3 objects
 * @param key - The object key (path) in the bucket
 * @param expiresInSeconds - URL expiration time (default: 1 hour)
 */
export async function getSignedKycUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    if (!key) return '';

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    return signedUrl;
}

/**
 * Upload a file to Supabase S3
 */
export async function uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    await s3Client.send(command);
}
