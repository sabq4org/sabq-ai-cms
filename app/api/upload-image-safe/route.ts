import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

// تهيئة Cloudinary إن توفرت المتغيرات
const hasCloudinary = Boolean(
  (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "general";

    if (!file) {
      return NextResponse.json({ success: false, error: "لم يتم اختيار ملف" }, { status: 400 });
    }

    // قيود حجم معقولة (25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "حجم الملف كبير جداً (الحد 25MB)" }, { status: 400 });
    }

    // دعم أنواع شائعة بما فيها HEIC/AVIF
    const supported = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "image/heic",
      "image/heif"
    ];
    if (!supported.includes(file.type)) {
      // سنقبل النوع ونستخدم data URL كحل بديل
      // لا نرفض مباشرة لتفادي تعطل الواجهة
    }

    // إذا Cloudinary متاح ارفع مباشرة، مع fallback إلى data URL عند الفشل
    if (hasCloudinary) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const folder = `sabq-cms/${type}`;
      try {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: "auto",
              public_id: `${Date.now()}_${(file.name || "upload").replace(/[^a-zA-Z0-9.-]/g, "_")}`,
              overwrite: false,
              tags: ["sabq-cms", type],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(buffer);
        });
        return NextResponse.json({ success: true, url: uploadResult.secure_url });
      } catch (err) {
        console.warn("⚠️ Cloudinary failed in upload-image-safe. Falling back to data URL.", (err as any)?.message || err);
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;
        return NextResponse.json({ success: true, url: dataUrl, fallback: true });
      }
    }

    // Fallback: إرجاع Data URL مباشرةً (لا يعتمد على نظام الملفات)
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;
    return NextResponse.json({ success: true, url: dataUrl, fallback: true });
  } catch (error: any) {
    console.error("❌ upload-image-safe error:", error?.message || error);
    return NextResponse.json({ success: false, error: "فشل رفع الصورة" }, { status: 500 });
  }
}

// مسار فحص صحي اختياري
export async function GET() {
  return NextResponse.json({ success: true, message: 'upload-image-safe ok' });
}