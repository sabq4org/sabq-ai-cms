import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('📁 بدء رفع ملف...');
    
    // معالجة آمنة لـ FormData
    let formData: FormData;
    let file: File | null = null;
    let type: string = 'general';
    
    try {
      formData = await request.formData();
      file = formData.get('file') as File;
      type = formData.get('type') as string || 'general';
      
      console.log('📋 معلومات FormData:', {
        fileExists: !!file,
        type: type,
        formDataKeys: Array.from(formData.keys())
      });
      
    } catch (formError: any) {
      console.error('❌ خطأ في تحليل FormData:', formError);
      return NextResponse.json({
        success: false,
        error: 'فشل في تحليل بيانات الملف',
        details: 'تأكد من إرسال الملف بصيغة FormData صحيحة',
        code: 'INVALID_FORM_DATA'
      }, { status: 400 });
    }
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على ملف' },
        { status: 400 }
      );
    }
    
    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'نوع الملف غير مدعوم. يجب أن يكون JPG, PNG, WEBP, أو GIF' },
        { status: 400 }
      );
    }
    
    // التحقق من حجم الملف (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'حجم الملف كبير جداً. الحد الأقصى 5MB' },
        { status: 400 }
      );
    }
    
    console.log(`📊 معلومات الملف: ${file.name}, الحجم: ${Math.round(file.size / 1024)}KB, النوع: ${file.type}`);
    
    // إنشاء اسم ملف فريد
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${type}_${timestamp}_${randomString}.${extension}`;
    
    // تحديد مجلد الحفظ حسب النوع
    const folderMap: { [key: string]: string } = {
      'article-image': 'articles',
      'author-avatar': 'authors', 
      'avatar': 'avatar',          // ✅ إضافة مجلد avatar
      'featured-image': 'featured',
      'featured': 'featured',      // ✅ إضافة دعم featured
      'general': 'general'         // ✅ إصلاح مسار general
    };
    
    const folder = folderMap[type] || 'general';
    console.log(`📁 نوع الرفع: ${type}, مجلد الحفظ: ${folder}`);
    
    try {
      // تحويل الملف إلى buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // إنشاء مسار الحفظ
      const uploadsDir = join(process.cwd(), 'public', 'uploads', folder);
      const filePath = join(uploadsDir, fileName);
      
      console.log(`📂 مسار الحفظ: ${uploadsDir}`);
      console.log(`📄 مسار الملف: ${filePath}`);
      
      // إنشاء المجلد إذا لم يكن موجوداً
      const fs = require('fs');
      if (!fs.existsSync(uploadsDir)) {
        console.log(`📁 إنشاء مجلد: ${uploadsDir}`);
        fs.mkdirSync(uploadsDir, { recursive: true });
      } else {
        console.log(`✅ المجلد موجود: ${uploadsDir}`);
      }
      
      // حفظ الملف
      await writeFile(filePath, buffer);
      
      // إنشاء URL للملف
      const fileUrl = `/uploads/${folder}/${fileName}`;
      
      console.log(`✅ تم رفع الملف بنجاح: ${fileUrl}`);
      
      return NextResponse.json({
        success: true,
        url: fileUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        folder: folder,
        uploaded_at: new Date().toISOString()
      });
      
    } catch (fileError: any) {
      console.error('❌ خطأ في حفظ الملف:', fileError);
      
      // محاولة استخدام خدمة سحابية كبديل (يمكن تطويرها لاحقاً)
      return NextResponse.json(
        { 
          success: false, 
          error: 'فشل في حفظ الملف على الخادم',
          details: fileError.message,
          suggestion: 'تأكد من صلاحيات الكتابة في مجلد public/uploads'
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('❌ خطأ عام في رفع الملف:', {
      error: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack?.split('\n')[0]
    });
    
    // معالجة خاصة لأنواع الأخطاء المختلفة
    let errorMessage = 'حدث خطأ أثناء رفع الملف';
    let errorDetails = error?.message || 'خطأ غير معروف';
    let statusCode = 500;
    let errorCode = 'UPLOAD_ERROR';
    
    if (error.name === 'SyntaxError') {
      errorMessage = 'خطأ في تنسيق البيانات';
      errorDetails = 'البيانات المرسلة غير صحيحة';
      statusCode = 400;
      errorCode = 'SYNTAX_ERROR';
    } else if (error.code === 'ENOENT') {
      errorMessage = 'مجلد الرفع غير موجود';
      errorDetails = 'تأكد من وجود مجلد uploads في النظام';
      errorCode = 'DIRECTORY_NOT_FOUND';
    } else if (error.code === 'EACCES') {
      errorMessage = 'لا توجد صلاحيات للكتابة';
      errorDetails = 'النظام لا يملك صلاحيات لحفظ الملف';
      errorCode = 'PERMISSION_DENIED';
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
        code: errorCode
      },
      { status: statusCode }
    );
  }
}

// دعم GET لاختبار الخدمة
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'خدمة رفع الملفات تعمل بشكل طبيعي',
    supported_types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    max_size: '5MB',
    endpoints: {
      upload: 'POST /api/upload',
      test: 'GET /api/upload'
    }
  });
}