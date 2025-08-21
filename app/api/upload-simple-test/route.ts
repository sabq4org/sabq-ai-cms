import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 [SIMPLE TEST UPLOAD] بدء رفع صورة...");

    const data = await request.formData();
    const file: File | null = data.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لا يوجد ملف" },
        { status: 400 }
      );
    }

    console.log("📋 معلومات الملف:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // فحص أساسي للصورة
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "يجب أن يكون ملف صورة" },
        { status: 400 }
      );
    }

    // تحويل إلى buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // اسم ملف بسيط
    const timestamp = Date.now();
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `test_${timestamp}.${extension}`;

    // مجلد الحفظ
    const uploadsPath = join(process.cwd(), "public", "uploads", "test");
    const filePath = join(uploadsPath, fileName);

    // إنشاء المجلد إذا لم يوجد
    if (!existsSync(uploadsPath)) {
      await mkdir(uploadsPath, { recursive: true });
    }

    // حفظ الملف
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/test/${fileName}`;

    console.log("✅ تم حفظ الملف بنجاح:", fileUrl);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: "تم رفع الصورة بنجاح",
    });
  } catch (error: any) {
    console.error("❌ خطأ في رفع الصورة:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطأ في الخادم",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "خدمة الاختبار تعمل",
  });
}
