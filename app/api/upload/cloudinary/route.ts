import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  let formData: FormData;
  let file: File | null = null;
  let fileBuffer: Buffer | null = null;

  try {
    formData = await request.formData();
    file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    fileBuffer = Buffer.from(bytes);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "sabq-cms/general",
          resource_type: "auto",
          public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
          overwrite: false,
          tags: ["sabq-cms", "upload"],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    return NextResponse.json({ success: true, url: uploadResult.secure_url });
  } catch (error: any) {
    console.error("❌ Cloudinary Upload Error:", error);
    
    // Fallback: إرجاع Data URL باستخدام البيانات المحفوظة
    if (file && fileBuffer) {
      try {
        const base64 = fileBuffer.toString("base64");
        const dataUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;
        return NextResponse.json({ success: true, url: dataUrl, fallback: true });
      } catch (fallbackError) {
        console.error("❌ Fallback Error:", fallbackError);
      }
    }
    
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
