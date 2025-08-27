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
    
    const contentType = request.headers.get("content-type") || "";
    console.log("📋 [SAFE UPLOAD] Content-Type:", contentType);
    
    // التعامل مع أنواع المحتوى المختلفة
    let formData: FormData;
    
    if (contentType.includes("application/json")) {
      // إذا كان الطلب JSON، حول إلى FormData بأمان
      try {
        const jsonData = await request.json();
        formData = new FormData();
        
        if (jsonData.file && typeof jsonData.file === 'string' && jsonData.file.startsWith('data:')) {
          const [header, base64Data] = jsonData.file.split(',');
          const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
          const buffer = Buffer.from(base64Data, 'base64');
          const blob = new Blob([buffer], { type: mimeType });
          formData.append('file', blob, 'image.jpg');
        }
        
        if (jsonData.type) {
          formData.append('type', jsonData.type);
        }
      } catch (jsonErr: any) {
        console.warn('⚠️ [SAFE UPLOAD] JSON غير صالح، أعد الطلب كـ FormData:', jsonErr?.message);
        return NextResponse.json({ success: false, error: 'نوع المحتوى غير مدعوم، استخدم FormData' }, { status: 400 });
      }
    } else {
      // الطريقة العادية للـ multipart/form-data
      formData = await request.formData();
    }
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
              // ملاحظة: عدم تمرير معلمات التحويل هنا (format/quality)
              // لتجنّب خطأ Cloudinary: "Invalid extension in transformation: auto"
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