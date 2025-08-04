import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لم يتم اختيار ملف" },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "يرجى اختيار ملف صورة فقط" },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" },
        { status: 400 }
      );
    }

    // تحويل الملف إلى Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // إنشاء اسم ملف فريد
    const timestamp = Date.now();
    const fileName = `muqtarab_cover_${timestamp}_${file.name}`;

    try {
      // محاولة رفع إلى Cloudinary
      console.log("🔄 Attempting Cloudinary upload...");
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", "muqtarab_covers");
      cloudinaryFormData.append("folder", "muqtarab/covers");
      
      // إضافة API key إذا كان متوفر
      if (process.env.CLOUDINARY_API_KEY) {
        cloudinaryFormData.append("api_key", process.env.CLOUDINARY_API_KEY);
      }

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      if (cloudinaryResponse.ok) {
        const cloudinaryData = await cloudinaryResponse.json();
        console.log("✅ Cloudinary upload successful");
        return NextResponse.json({
          success: true,
          imageUrl: cloudinaryData.secure_url,
          publicId: cloudinaryData.public_id,
        });
      } else {
        const errorText = await cloudinaryResponse.text();
        console.error("❌ Cloudinary error:", cloudinaryResponse.status, errorText);
      }
    } catch (cloudinaryError) {
      console.error("❌ Cloudinary upload failed, using fallback:", cloudinaryError);
    }

    // Fallback: إنشاء Data URL محلي
    console.log("⚠️ Using fallback: base64 data URL");
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      fileName: fileName,
      fallback: true,
      message: "تم حفظ الصورة محلياً (Cloudinary غير متاح)",
    });
  } catch (error) {
    console.error("خطأ في رفع الصورة:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطأ في رفع الصورة",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
