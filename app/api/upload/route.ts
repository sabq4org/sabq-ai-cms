import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // تحديد مجلد الحفظ حسب النوع
    let uploadDir = 'images';
    if (type === 'logo') uploadDir = 'logos';
    if (type === 'avatar') uploadDir = 'avatars';
    
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', uploadDir);
    
    // إنشاء المجلد إذا لم يكن موجوداً
    await mkdir(uploadPath, { recursive: true });

    // إنشاء اسم فريد للملف
    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
    const filePath = path.join(uploadPath, fileName);

    // قراءة الملف وحفظه
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // إرجاع رابط الملف
    const fileUrl = `/uploads/${uploadDir}/${fileName}`;

    return NextResponse.json({
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 