import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/auth";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folderRaw = formData.get("folder");
    const folder = typeof folderRaw === "string" && folderRaw.length > 0 ? folderRaw : "rentaloop/items";
    const isBanner = folder.includes("banner");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            format: "webp",
            fetch_format: "webp",
            quality: "auto:good",
            flags: "lossy",
            transformation: [
              isBanner
                ? {
                    width: 2400,
                    crop: "limit",
                    fetch_format: "webp",
                    quality: "auto:good",
                  }
                : {
                    width: 1600,
                    crop: "limit",
                    fetch_format: "webp",
                    quality: "auto:good",
                    flags: "progressive",
                  },
            ],
            invalidate: true,
            unique_filename: true,
            overwrite: false,
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
              return;
            }
            if (!uploadResult) {
              reject(new Error("Upload failed: No result returned"));
              return;
            }
            resolve(uploadResult as unknown as CloudinaryUploadResult);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error("Upload API failed:", error);
    return NextResponse.json({ success: false, error: "Image upload failed" }, { status: 500 });
  }
}
