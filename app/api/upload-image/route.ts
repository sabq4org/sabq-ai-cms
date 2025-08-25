import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

// تهيئة Cloudinary
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
    console.log("🔄 [UPLOAD IMAGE] بداية رفع الصورة");
    
    const contentType = request.headers.get("content-type") || "";
    console.log("📋 [UPLOAD IMAGE] Content-Type:", contentType);
    
    let file: File | null = null;
    let type = "general";
    
    // التعامل مع أنواع المحتوى المختلفة
    if (contentType.includes("multipart/form-data")) {
      // الطريقة العادية
      const formData = await request.formData();
      file = formData.get("file") as File | null;
      type = (formData.get("type") as string) || "general";
    } else if (contentType.includes("application/json")) {
      // إذا كان الطلب JSON
      const jsonData = await request.json();
      
      if (jsonData.file && typeof jsonData.file === 'string' && jsonData.file.startsWith('data:')) {
        // تحويل base64 إلى File
        const [header, base64Data] = jsonData.file.split(',');
        const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: mimeType });
        file = new File([blob], 'image.jpg', { type: mimeType });
      }
      
      type = jsonData.type || "general";
    } else {
      // محاولة قراءة كـ FormData بأي حال
      try {
        const formData = await request.formData();
        file = formData.get("file") as File | null;
        type = (formData.get("type") as string) || "general";
      } catch (e) {
        console.error("❌ فشل في قراءة FormData:", e);
        return NextResponse.json(
          { success: false, error: "نوع المحتوى غير مدعوم" },
          { status: 400 }
        );
      }
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لم يتم اختيار ملف" },
        { status: 400 }
      );
    }

    console.log(`📸 [UPLOAD IMAGE] معالجة ملف: ${file.name} (${Math.round(file.size / 1024)}KB)`);

    // قيود حجم معقولة (25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "حجم الملف كبير جداً (الحد 25MB)" },
        { status: 400 }
      );
    }

    // دعم أنواع شائعة
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
      console.warn("⚠️ نوع ملف غير مدعوم:", file.type);
    }

    // تحويل الملف إلى buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // محاولة رفع إلى Cloudinary أولاً
    if (hasCloudinary) {
      try {
        console.log("☁️ [UPLOAD IMAGE] محاولة رفع Cloudinary...");
        
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: `uploads/${type}`,
              format: "auto",
              quality: "auto:good",
              public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
              overwrite: false,
              tags: ["sabq-cms", "upload"],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        console.log("✅ [UPLOAD IMAGE] Cloudinary نجح");
        return NextResponse.json({ 
          success: true, 
          url: (uploadResult as any).secure_url 
        });
      } catch (cloudinaryError) {
        console.log("⚠️ [UPLOAD IMAGE] Cloudinary فشل:", cloudinaryError);
      }
    }

    // Fallback إلى data URL
    console.log("💾 [UPLOAD IMAGE] استخدام data URL...");
    const dataUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    
    return NextResponse.json({ 
      success: true, 
      url: dataUrl, 
      fallback: true 
    });

  } catch (error: any) {
    console.error("❌ [UPLOAD IMAGE] خطأ عام:", error.message);
    return NextResponse.json(
      { success: false, error: "فشل رفع الصورة" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'upload-image API ready',
    cloudinary: hasCloudinary 
  });
}