import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

// تهيئة Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 [UPLOAD IMAGE2] بداية رفع الصورة");
    
    const contentType = request.headers.get("content-type") || "";
    console.log("📋 [UPLOAD IMAGE2] Content-Type:", contentType);
    
    let file: File | null = null;
    let type = "general";
    
    // قراءة البيانات مرة واحدة فقط حسب نوع المحتوى
    if (contentType.includes("application/json")) {
      console.log("📦 [UPLOAD IMAGE2] معالجة application/json");
      const jsonData = await request.json();
      console.log("📋 [UPLOAD IMAGE2] مفاتيح JSON:", Object.keys(jsonData));
      if (jsonData.file && typeof jsonData.file === 'string' && jsonData.file.startsWith('data:')) {
        const [header, base64Data] = jsonData.file.split(',');
        const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: mimeType });
        file = new File([blob], 'image.jpg', { type: mimeType });
        console.log("✅ [UPLOAD IMAGE2] تم تحويل base64 إلى File");
      }
      type = jsonData.type || "general";
    } else {
      console.log("📦 [UPLOAD IMAGE2] معالجة FormData");
      const formData = await request.formData();
      const keys = Array.from(formData.keys());
      console.log("🔑 [UPLOAD IMAGE2] مفاتيح FormData:", keys);
      // دعم مفاتيح متعددة محتملة للملف
      const possibleKeys = ["file", "image", "upload", "files[]", "asset"];
      for (const key of possibleKeys) {
        const candidate = formData.get(key);
        if (candidate instanceof File) {
          file = candidate;
          break;
        }
      }
      // إن لم نجد عبر المفاتيح الشائعة، جرّب المفتاح الافتراضي
      if (!file) file = formData.get("file") as File | null;
      type = (formData.get("type") as string) || "general";
    }

    if (!file) {
      console.error("❌ [UPLOAD IMAGE2] لم يتم العثور على ملف");
      return NextResponse.json(
        { success: false, error: "لم يتم اختيار ملف" },
        { status: 400 }
      );
    }

    console.log(`📸 [UPLOAD IMAGE2] معالجة ملف: ${file.name} (${Math.round(file.size / 1024)}KB) - النوع: ${file.type}`);

    // التحقق من حجم الملف
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "حجم الملف كبير جداً (الحد الأقصى 25MB)" },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    const supportedTypes = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "image/heic",
      "image/heif"
    ];
    
    if (!supportedTypes.includes(file.type)) {
      console.warn(`⚠️ [UPLOAD IMAGE2] نوع ملف غير مدعوم: ${file.type}`);
      // لا نرفض الملف، بل نحاول رفعه
    }

    // تحويل الملف إلى buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`📊 [UPLOAD IMAGE2] حجم البيانات: ${buffer.length} bytes`);

    // رفع إلى Cloudinary
    try {
      console.log("☁️ [UPLOAD IMAGE2] بدء رفع Cloudinary...");
      
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: `sabq-cms/${type}`,
            format: "auto",
            quality: "auto:good",
            public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
            overwrite: false,
            tags: ["sabq-cms", "upload", type],
            transformation: [
              { width: 1200, height: 800, crop: "limit" },
              { quality: "auto:good" },
              { format: "auto" }
            ]
          },
          (error, result) => {
            if (error) {
              console.error("❌ [UPLOAD IMAGE2] Cloudinary error:", error);
              reject(error);
            } else {
              console.log("✅ [UPLOAD IMAGE2] Cloudinary success:", result?.public_id);
              resolve(result);
            }
          }
        );
        
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      });

    } catch (cloudinaryError) {
      console.error("❌ [UPLOAD IMAGE2] Cloudinary فشل:", cloudinaryError);
      
      // Fallback إلى data URL
      console.log("💾 [UPLOAD IMAGE2] استخدام data URL كبديل...");
      const mimeType = file.type || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      
      return NextResponse.json({
        success: true,
        url: dataUrl,
        fallback: true,
        error: "تم استخدام التخزين المحلي بدلاً من السحابة"
      });
    }

  } catch (error: any) {
    console.error("❌ [UPLOAD IMAGE2] خطأ عام:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "فشل رفع الصورة" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "upload-image2 API جاهز",
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME
    }
  });
}