import { NextRequest, NextResponse } from 'next/server';

// إعدادات رفع الملفات
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// تكوين runtime للدعم الأمثل
export const runtime = 'nodejs';

// ملاحظة: لا يمكن استخدام DOM APIs مثل Image/Canvas في بيئة السيرفر (Route Handler)
// إذا احتجنا ضغط الصور على السيرفر، يجب استخدام مكتبة مثل sharp. حالياً نتخطى الضغط هنا.
async function compressImage(file: File): Promise<File> {
  return file;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [UPLOAD] بدء رفع ملف...');

    // التحقق من Content-Length
    const contentLength = request.headers.get('content-length');
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'حجم الملف كبير جداً. الحد الأقصى 10MB'
      }, { status: 413 });
    }

    // قراءة FormData بحذر
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('❌ خطأ في قراءة FormData:', error);
      return NextResponse.json({
        success: false,
        error: 'فشل في قراءة بيانات الملف'
      }, { status: 400 });
    }

    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على ملف للرفع'
      }, { status: 400 });
    }

    console.log('📋 [UPLOAD] معلومات الملف:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // التحقق من نوع الملف
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP, GIF'
      }, { status: 400 });
    }

    // التحقق من حجم الملف
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: `حجم الملف كبير جداً (${Math.round(file.size / 1024 / 1024)}MB). الحد الأقصى 10MB`
      }, { status: 413 });
    }

    // تحويل إلى Base64 للحفظ المؤقت
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // إنشاء URL مؤقت
    const fileName = `${Date.now()}-${file.name}`;
    const fileUrl = `/api/files/${fileName}`;

    console.log('✅ [UPLOAD] تم رفع الملف بنجاح:', fileName);

    return NextResponse.json({
      success: true,
      url: dataUrl, // استخدام data URL مباشرة
      fileName: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('❌ [UPLOAD] خطأ في رفع الملف:', error);

    // التحقق من نوع الخطأ
    if (error instanceof Error) {
      if (error.message.includes('PayloadTooLargeError') ||
          error.message.includes('Request Entity Too Large')) {
        return NextResponse.json({
          success: false,
          error: 'حجم الملف كبير جداً. يرجى اختيار ملف أصغر من 10MB'
        }, { status: 413 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء رفع الملف'
    }, { status: 500 });
  }
}
