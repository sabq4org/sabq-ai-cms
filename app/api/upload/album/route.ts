import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [Album Upload API] بدء معالجة رفع الألبوم...');
    
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const albumType = formData.get("type") as string || "gallery";
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files uploaded." },
        { status: 400 }
      );
    }

    // حد أقصى 10 صور في الألبوم الواحد
    if (files.length > 10) {
      return NextResponse.json(
        { success: false, error: "يمكن رفع حد أقصى 10 صور في الألبوم الواحد" },
        { status: 400 }
      );
    }

    console.log(`📸 رفع ${files.length} صور للألبوم...`);

    const uploadPromises = files.map(async (file, index) => {
      try {
        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
          throw new Error(`الملف ${file.name} ليس صورة صالحة`);
        }

        // التحقق من حجم الملف (5MB حد أقصى)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`حجم الصورة ${file.name} كبير جداً`);
        }

        const bytes = await file.arrayBuffer();
        const fileBuffer = Buffer.from(bytes);

        // رفع الصورة
        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `sabq-cms/albums/${albumType}`,
              resource_type: "auto",
              public_id: `${Date.now()}_${index}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
              overwrite: false,
              tags: ["sabq-cms", "album", albumType],
              // تحسينات تلقائية
              transformation: [
                { quality: "auto:good" },
                { fetch_format: "auto" },
                { if: "w_gt_1920", width: 1920, crop: "scale" },
                { if: "h_gt_1080", height: 1080, crop: "scale" }
              ]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(fileBuffer);
        });

        return {
          success: true,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          size: uploadResult.bytes,
          originalName: file.name
        };

      } catch (error: any) {
        console.error(`❌ خطأ في رفع ${file.name}:`, error);
        return {
          success: false,
          error: error.message || "فشل رفع الصورة",
          originalName: file.name
        };
      }
    });

    // انتظار جميع عمليات الرفع
    const results = await Promise.all(uploadPromises);
    
    // فصل النتائج الناجحة والفاشلة
    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);

    console.log(`✅ نجح رفع ${successful.length} من أصل ${files.length} صور`);
    
    if (failed.length > 0) {
      console.warn(`⚠️ فشل في رفع ${failed.length} صور:`, failed);
    }

    return NextResponse.json({
      success: successful.length > 0,
      total: files.length,
      successful: successful.length,
      failed: failed.length,
      images: successful,
      errors: failed.length > 0 ? failed : undefined,
      albumType
    });

  } catch (error: any) {
    console.error("❌ خطأ عام في رفع الألبوم:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "حدث خطأ أثناء رفع الألبوم",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

// معلومات الـ endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: "Album Upload API",
    description: "رفع عدة صور كألبوم إلى Cloudinary",
    methods: ["POST"],
    maxFiles: 10,
    maxSizePerFile: "5MB",
    supportedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
    albumTypes: ["gallery", "featured", "thumbnail", "general"],
    usage: {
      formData: {
        files: "File[] - مجموعة الصور المراد رفعها",
        type: "string - نوع الألبوم (اختياري، افتراضي: gallery)"
      }
    }
  });
}
