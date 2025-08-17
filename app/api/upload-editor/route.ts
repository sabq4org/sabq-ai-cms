import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 [EDITOR IMAGE UPLOAD] بدء رفع صورة محرر...");

    // قراءة FormData
    const data = await request.formData();
    const file: File | null = data.get("file") as File;
    const type: string = (data.get("type") as string) || "article";

    if (!file) {
      console.log("❌ لا يوجد ملف مرفق");
      return NextResponse.json(
        {
          success: false,
          error: "لم يتم العثور على ملف للرفع",
        },
        { status: 400 }
      );
    }

    console.log("📋 معلومات الملف:", {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)}KB`,
      type: file.type,
      uploadType: type,
    });

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          error: "نوع الملف غير صالح. يجب أن يكون صورة",
        },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "حجم الملف كبير جداً. الحد الأقصى 5MB",
        },
        { status: 400 }
      );
    }

    // تحويل الملف إلى buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // إنشاء اسم ملف فريد
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `editor_${timestamp}_${randomId}.${extension}`;

    // تحديد مجلد الحفظ
    const uploadsPath = join(process.cwd(), "public", "uploads", "articles");
    const filePath = join(uploadsPath, fileName);

    console.log("📂 مسار الحفظ:", {
      uploadsPath,
      fileName,
      fullPath: filePath,
    });

    // التأكد من وجود المجلد
    try {
      if (!existsSync(uploadsPath)) {
        await mkdir(uploadsPath, { recursive: true });
        console.log("📁 تم إنشاء مجلد articles");
      }
    } catch (mkdirError) {
      console.error("❌ خطأ في إنشاء المجلد:", mkdirError);
      return NextResponse.json(
        {
          success: false,
          error: "فشل في إنشاء مجلد الحفظ",
        },
        { status: 500 }
      );
    }

    // حفظ الملف
    try {
      await writeFile(filePath, buffer);
      console.log("✅ تم حفظ الملف بنجاح");
    } catch (writeError) {
      console.error("❌ خطأ في حفظ الملف:", writeError);
      return NextResponse.json(
        {
          success: false,
          error: "فشل في حفظ الملف على الخادم",
        },
        { status: 500 }
      );
    }

    // إنشاء URL للملف
    const fileUrl = `/uploads/articles/${fileName}`;

    console.log("🎉 تم رفع الصورة بنجاح:", fileUrl);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      message: "تم رفع الصورة بنجاح",
    });
  } catch (error: any) {
    console.error("❌ خطأ عام في رفع الصورة:", {
      message: error.message,
      name: error.name,
      stack: error.stack?.split("\n")[0],
    });

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ غير متوقع أثناء رفع الصورة",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "خدمة رفع صور المحرر تعمل بشكل طبيعي",
    version: "1.0",
    endpoint: "/api/upload-editor",
    supportedTypes: ["image/*"],
    maxSize: "5MB",
  });
}
