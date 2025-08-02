import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 [SIMPLE UPLOAD] بدء رفع صورة...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'featured';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على ملف' },
        { status: 400 }
      );
    }
    
    console.log(`📊 معلومات الملف: ${file.name}, الحجم: ${Math.round(file.size / 1024)}KB, النوع: ${file.type}`);
    
    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'نوع الملف غير مدعوم. يجب أن يكون JPG, PNG, WEBP, أو GIF' },
        { status: 400 }
      );
    }
    
    // التحقق من حجم الملف (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'حجم الملف كبير جداً. الحد الأقصى 10MB' },
        { status: 400 }
      );
    }
    
    try {
      // تحويل الملف إلى buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // إنشاء اسم ملف فريد
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `${type}_${timestamp}_${randomString}.${extension}`;
      
      // تحديد مجلد الحفظ حسب النوع
      const folderMap: { [key: string]: string } = {
        'featured': 'featured',
        'article-image': 'articles',
        'avatar': 'avatar',
        'general': 'uploads'
      };
      
      const folder = folderMap[type] || 'uploads';
      console.log(`📁 نوع الرفع: ${type}, مجلد الحفظ: ${folder}`);
      
      // إنشاء مسار الحفظ
      const uploadsDir = join(process.cwd(), 'public', 'uploads', folder);
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
      
      // حفظ الملف
      await writeFile(filePath, buffer);
      
      // إنشاء URL للملف
      const fileUrl = `/uploads/${folder}/${fileName}`;
      
      console.log(`✅ [SIMPLE UPLOAD] تم رفع الصورة بنجاح: ${fileUrl}`);
      
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
      
    } catch (fileError: any) {
      console.error('❌ [SIMPLE UPLOAD] خطأ في حفظ الملف:', {
        message: fileError.message,
        code: fileError.code,
        path: fileError.path,
        stack: fileError.stack
      });
      
      // تشخيص إضافي
      const diagnostics = {
        uploadsDir: uploadsDir,
        fileName: fileName,
        fileExists: existsSync(uploadsDir),
        processWorkingDir: process.cwd(),
        nodeVersion: process.version
      };
      
      console.error('📊 [SIMPLE UPLOAD] تشخيص إضافي:', diagnostics);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'فشل في حفظ الملف على الخادم',
          details: fileError.message,
          errorCode: fileError.code,
          diagnostics: diagnostics,
          suggestion: 'تأكد من صلاحيات الكتابة في مجلد public/uploads'
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('❌ [SIMPLE UPLOAD] خطأ عام في رفع الملف:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء رفع الملف',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'خدمة رفع الصور البسيطة تعمل',
    note: 'هذه خدمة مؤقتة تحول الصور إلى base64'
  });
}