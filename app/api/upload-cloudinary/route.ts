import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "sabq-ai-cms",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  console.log("☁️ [CLOUDINARY UPLOAD] بدء رفع صورة إلى Cloudinary...");

  try {
    // التحقق من إعدادات Cloudinary
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ إعدادات Cloudinary مفقودة");
      return NextResponse.json(
        {
          success: false,
          error: "خطأ في إعدادات الخادم. يرجى التواصل مع الدعم الفني.",
          details: "Missing Cloudinary configuration",
        },
        { status: 500 }
      );
    }

    // معالجة FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "general";

    console.log("📋 معلومات الطلب:", {
      fileExists: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      uploadType: type,
    });

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "لم يتم العثور على ملف للرفع",
        },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP, GIF",
        },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "حجم الملف كبير جداً. الحد الأقصى 10MB",
        },
        { status: 400 }
      );
    }

    // تحويل الملف إلى Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // تحديد مجلد الرفع في Cloudinary
    const folderMap: { [key: string]: string } = {
      general: "sabq-cms/general",
      ads: "sabq-cms/ads",
      featured: "sabq-cms/featured",
      avatar: "sabq-cms/avatars",
      article: "sabq-cms/articles",
    };

    const folder = folderMap[type] || "sabq-cms/general";

    // إنشاء معرف فريد للملف
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const publicId = `${type}_${timestamp}_${randomString}`;

    console.log("☁️ رفع إلى Cloudinary:", {
      folder,
      publicId,
      originalName: file.name,
    });

    // رفع الملف إلى Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: "image",
          overwrite: true,
          invalidate: true,
          transformation: [
            { width: 1200, height: 800, crop: "limit", quality: "auto:good" },
            { format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("❌ خطأ Cloudinary:", error);
            reject(error);
          } else if (!result) {
            reject(new Error("لم يتم استلام نتيجة من Cloudinary"));
          } else {
            console.log("✅ تم رفع الصورة إلى Cloudinary بنجاح");
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    console.log("📊 تفاصيل الرفع:", {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      size: `${(uploadResult.bytes / 1024).toFixed(2)} KB`,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadType: type,
      width: uploadResult.width,
      height: uploadResult.height,
      cloudinary: true,
      uploaded_at: new Date().toISOString(),
      message: "تم رفع الصورة بنجاح إلى Cloudinary",
    });
  } catch (error: any) {
    console.error("❌ خطأ في رفع الصورة:", error);

    // في حالة فشل Cloudinary، إرجاع صورة افتراضية
    const placeholderUrl = `https://via.placeholder.com/800x600/6B7280/FFFFFF?text=${encodeURIComponent(
      "صورة افتراضية"
    )}`;

    return NextResponse.json({
      success: true, // نرجع true مع صورة افتراضية
      url: placeholderUrl,
      fileName: "placeholder.png",
      originalName: "placeholder.png",
      size: 0,
      type: "image/png",
      uploadType: "fallback",
      isPlaceholder: true,
      cloudinary: false,
      uploaded_at: new Date().toISOString(),
      message: "تم استخدام صورة افتراضية بسبب خطأ في الرفع",
      error_details: error.message,
    });
  }
}

// اختبار الخدمة
export async function GET() {
  const hasCloudinaryConfig = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  return NextResponse.json({
    success: true,
    message: "خدمة رفع الصور عبر Cloudinary",
    version: "3.0-cloudinary",
    cloudinary_configured: hasCloudinaryConfig,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "غير محدد",
    supportedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxSize: "10MB",
    folders: ["general", "ads", "featured", "avatar", "article"],
  });
}
