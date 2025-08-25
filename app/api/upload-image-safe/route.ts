import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

// تهيئة Cloudinary إن توفرت المتغيرات
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 [SAFE UPLOAD] بداية الرفع الآمن");
    
    // إزالة التحقق من Content-Type لأن المتصفح يديره تلقائياً
    const contentType = request.headers.get("content-type") || "";
    console.log("📋 [SAFE UPLOAD] Content-Type:", contentType);
    
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

    console.log(`📸 [SAFE UPLOAD] معالجة ملف: ${file.name} (${Math.round(file.size / 1024)}KB)`);

    // تحويل الملف إلى buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // محاولة رفع إلى Cloudinary أولاً (إن توفر)
    if (hasCloudinary) {
      try {
        console.log("☁️ [SAFE UPLOAD] محاولة رفع Cloudinary...");
        
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: `uploads/${type}`,
              format: "auto",
              quality: "auto:good"
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        console.log("✅ [SAFE UPLOAD] Cloudinary نجح");
        return NextResponse.json({ success: true, url: (uploadResult as any).secure_url });
      } catch (cloudinaryError) {
        console.log("⚠️ [SAFE UPLOAD] Cloudinary فشل، التبديل إلى data URL...");
        const dataUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
        return NextResponse.json({ success: true, url: dataUrl, fallback: true });
      }
    }

    // إذا لم تتوفر Cloudinary، استخدم data URL مباشرة
    console.log("💾 [SAFE UPLOAD] استخدام data URL...");
    const dataUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    
    return NextResponse.json({ success: true, url: dataUrl, fallback: true });
  } catch (error: any) {
    console.error("❌ [SAFE UPLOAD] خطأ عام:", error.message);
    return NextResponse.json({ success: false, error: "فشل رفع الصورة" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'upload-image-safe ok' });
}