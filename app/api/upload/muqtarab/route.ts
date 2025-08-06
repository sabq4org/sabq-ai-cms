import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

// إعداد runtime لـ Node.js
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("📁 [مقترب] بدء رفع ملف...");

    // معالجة آمنة لـ FormData
    let formData: FormData;
    let file: File | null = null;
    let type: string = "angle-cover"; // النوع الافتراضي لزوايا مقترب

    try {
      formData = await request.formData();
      file = formData.get("file") as File;
      type = (formData.get("type") as string) || "angle-cover";

      console.log("📋 معلومات FormData:", {
        fileExists: !!file,
        type: type,
        formDataKeys: Array.from(formData.keys()),
      });
    } catch (formError: any) {
      console.error("❌ خطأ في تحليل FormData:", formError);
      return NextResponse.json(
        {
          success: false,
          error: "فشل في تحليل بيانات الملف",
          details:
            formError.message || "تأكد من إرسال الملف بصيغة FormData صحيحة",
          code: "INVALID_FORM_DATA",
        },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لم يتم العثور على ملف" },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `نوع الملف غير مدعوم (${file.type}). يجب أن يكون JPG, PNG, WEBP, أو GIF`,
        },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `حجم الملف كبير جداً (${Math.round(
            file.size / 1024
          )}KB). الحد الأقصى 5MB`,
        },
        { status: 400 }
      );
    }

    console.log(
      `📊 معلومات الملف: ${file.name}, الحجم: ${Math.round(
        file.size / 1024
      )}KB, النوع: ${file.type}`
    );

    // إنشاء اسم ملف فريد
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `${type}_${timestamp}_${randomString}.${extension}`;

    // تحويل الملف إلى buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // إنشاء مسار الحفظ - استخدام مجلد muqtarab مخصص
    const uploadsDir = join(process.cwd(), "public", "uploads", "muqtarab");
    const filePath = join(uploadsDir, fileName);

    console.log(`📂 مسار الحفظ: ${uploadsDir}`);
    console.log(`📄 مسار الملف: ${filePath}`);

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!existsSync(uploadsDir)) {
      console.log(`📁 إنشاء مجلد: ${uploadsDir}`);
      await mkdir(uploadsDir, { recursive: true });
    } else {
      console.log(`✅ المجلد موجود: ${uploadsDir}`);
    }

    try {
      // حفظ الملف
      await writeFile(filePath, buffer);

      // إنشاء URL للملف
      const fileUrl = `/uploads/muqtarab/${fileName}`;

      console.log(`✅ تم رفع الملف بنجاح: ${fileUrl}`);

      return NextResponse.json({
        success: true,
        url: fileUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
      });
    } catch (fileError: any) {
      console.error("❌ خطأ في حفظ الملف:", fileError);

      // معلومات تشخيصية
      let errorDetails = fileError.message || "خطأ غير معروف";
      let errorCode = fileError.code || "UNKNOWN_ERROR";
      let suggestions = [];

      if (fileError.code === "EACCES") {
        errorDetails = "لا توجد صلاحيات للكتابة في المجلد";
        suggestions.push(
          "تأكد من صلاحيات الوصول إلى مجلد public/uploads/muqtarab"
        );
        suggestions.push(
          "تغيير صلاحيات المجلد باستخدام chmod 777 public/uploads/muqtarab"
        );
      } else if (fileError.code === "ENOENT") {
        errorDetails = "المسار غير موجود";
        suggestions.push("تأكد من وجود المجلد public/uploads/muqtarab");
        suggestions.push("قم بإنشاء المجلد يدوياً");
      }

      return NextResponse.json(
        {
          success: false,
          error: "فشل في حفظ الملف على الخادم",
          details: errorDetails,
          code: errorCode,
          suggestions: suggestions,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ خطأ عام في رفع الملف:", {
      error: error.message,
      name: error.name,
      code: error.code,
    });

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء رفع الملف",
        details: error.message || "خطأ غير معروف",
      },
      { status: 500 }
    );
  }
}

// دعم GET لاختبار الخدمة
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "خدمة رفع ملفات مقترب تعمل بشكل طبيعي",
    supported_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    max_size: "5MB",
  });
}
