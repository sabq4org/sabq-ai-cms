import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم العثور على ملف' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. يُسمح فقط بـ: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً. الحد الأقصى 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // إنشاء اسم ملف فريد
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    const fileName = `${timestamp}-${originalName}`;

    // إنشاء مجلد الرفع إذا لم يكن موجوداً
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'images');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // حفظ الملف
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // إرجاع رابط الملف
    const fileUrl = `/uploads/images/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    return NextResponse.json(
      { error: 'خطأ في رفع الصورة' },
      { status: 500 }
    );
  }
}

// دعم GET لعرض معلومات الصور المرفوعة
export async function GET() {
  return NextResponse.json({
    message: 'خدمة رفع الصور تعمل بشكل طبيعي',
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: '5MB'
  });
}
