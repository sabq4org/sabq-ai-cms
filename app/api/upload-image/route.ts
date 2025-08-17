import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [IMAGE UPLOAD] بدء رفع صورة...');
    
    // معالجة FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';
    
    console.log('📋 [IMAGE UPLOAD] معلومات الطلب:', {
      fileExists: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      uploadType: type
    });
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على ملف للرفع'
      }, { status: 400 });
    }
    
    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP, GIF'
      }, { status: 400 });
    }
    
    // التحقق من حجم الملف (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'حجم الملف كبير جداً. الحد الأقصى 10MB'
      }, { status: 400 });
    }
    
    // تحويل الملف إلى buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // إنشاء اسم ملف فريد
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${type}_${timestamp}_${randomString}.${extension}`;
    
    // تحديد مجلد الحفظ
    const folderMap: { [key: string]: string } = {
      'featured': 'featured',
      'avatar': 'avatar',
      'article': 'articles',
      'general': 'general'
    };
    
    const folder = folderMap[type] || 'general';
    
    // إنشاء مسار الحفظ
    const publicDir = join(process.cwd(), 'public');
    const uploadsBaseDir = join(publicDir, 'uploads');
    const targetDir = join(uploadsBaseDir, folder);
    const filePath = join(targetDir, fileName);
    
    console.log('📂 [IMAGE UPLOAD] مسارات الحفظ:', {
      publicDir,
      uploadsBaseDir,
      targetDir,
      filePath,
      fileName
    });
    
    // إنشاء المجلدات إذا لم تكن موجودة
    try {
      if (!existsSync(publicDir)) {
        await mkdir(publicDir, { recursive: true });
        console.log('📁 تم إنشاء مجلد public');
      }
      
      if (!existsSync(uploadsBaseDir)) {
        await mkdir(uploadsBaseDir, { recursive: true });
        console.log('📁 تم إنشاء مجلد uploads');
      }
      
      if (!existsSync(targetDir)) {
        await mkdir(targetDir, { recursive: true });
        console.log(`📁 تم إنشاء مجلد ${folder}`);
      }
    } catch (mkdirError: any) {
      console.error('❌ [IMAGE UPLOAD] خطأ في إنشاء المجلدات:', mkdirError);
      return NextResponse.json({
        success: false,
        error: 'فشل في إنشاء مجلدات الحفظ',
        details: mkdirError.message
      }, { status: 500 });
    }
    
    // حفظ الملف
    try {
      await writeFile(filePath, buffer);
      console.log(`✅ [IMAGE UPLOAD] تم حفظ الملف: ${filePath}`);
    } catch (writeError: any) {
      console.error('❌ [IMAGE UPLOAD] خطأ في حفظ الملف:', writeError);
      return NextResponse.json({
        success: false,
        error: 'فشل في حفظ الملف',
        details: writeError.message
      }, { status: 500 });
    }
    
    // إنشاء URL للملف
    const fileUrl = `/uploads/${folder}/${fileName}`;
    
    console.log(`✅ [IMAGE UPLOAD] تم رفع الصورة بنجاح: ${fileUrl}`);
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      folder: folder,
      uploaded_at: new Date().toISOString(),
      message: 'تم رفع الصورة بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ [IMAGE UPLOAD] خطأ عام:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n')[0]
    });
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء رفع الصورة',
      details: error.message,
      code: 'GENERAL_ERROR'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'خدمة رفع الصور تعمل بشكل صحيح',
    version: '2.0',
    supportedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: '10MB'
  });
}