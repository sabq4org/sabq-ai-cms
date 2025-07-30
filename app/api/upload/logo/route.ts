import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على ملف' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'يجب أن يكون الملف صورة' },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' },
        { status: 400 }
      );
    }

    // تحويل الملف إلى Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `logo-${timestamp}${extension}`;
    
    // التأكد من وجود مجلد الرفع
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // حفظ الملف
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // إرجاع رابط الملف
    const fileUrl = `/uploads/logos/${filename}`;
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename
    });

  } catch (error) {
    console.error('خطأ في رفع الملف:', error);
    return NextResponse.json(
      { success: false, error: 'فشل رفع الملف' },
      { status: 500 }
    );
  }
}