import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
const { v4: uuidv4 } = require('uuid');

// التحقق من أن المجلد موجود
async function ensureUploadDir(uploadPath: string) {
  try {
    await mkdir(uploadPath, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم تحديد ملف' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم' },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً (الحد الأقصى 5MB)' },
        { status: 400 }
      );
    }

    // قراءة الملف
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // توليد اسم فريد للملف
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    
    // تحديد مسار الحفظ
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
    await ensureUploadDir(uploadDir);
    
    const filePath = path.join(uploadDir, uniqueFileName);
    
    // حفظ الملف
    await writeFile(filePath, buffer);
    
    // إرجاع URL الصورة
    const imageUrl = `/uploads/${type}/${uniqueFileName}`;
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      filename: uniqueFileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء رفع الملف',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// دعم OPTIONS للـ CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 