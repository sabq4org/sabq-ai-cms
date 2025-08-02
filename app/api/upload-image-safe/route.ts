import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [SAFE IMAGE UPLOAD] بدء رفع صورة بأمان...');
    
    // معالجة FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';
    
    console.log('📋 [SAFE IMAGE UPLOAD] معلومات الطلب:', {
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
    
    // تحويل الملف إلى Base64 (حل آمن لبيئة الإنتاج)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    
    // إنشاء Data URL
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    // في بيئة الإنتاج، نعيد البيانات مباشرة بدلاً من حفظها
    console.log(`✅ [SAFE IMAGE UPLOAD] تم تحويل الصورة إلى Base64 بنجاح`);
    
    // إنشاء معرف فريد للصورة
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueId = `${type}_${timestamp}_${randomString}`;
    
    return NextResponse.json({
      success: true,
      url: dataUrl, // إرجاع البيانات مباشرة
      fileName: `${uniqueId}.${extension}`,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadType: type,
      method: 'base64',
      uploaded_at: new Date().toISOString(),
      message: 'تم رفع الصورة بنجاح (Base64)'
    });
    
  } catch (error: any) {
    console.error('❌ [SAFE IMAGE UPLOAD] خطأ عام:', {
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
    message: 'خدمة رفع الصور الآمنة تعمل بشكل صحيح',
    version: '1.0-safe',
    supportedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: '10MB',
    method: 'base64',
    note: 'هذا API آمن لبيئة الإنتاج - يستخدم Base64 بدلاً من حفظ الملفات'
  });
}