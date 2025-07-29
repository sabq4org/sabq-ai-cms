import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3-config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 بدء رفع الصورة إلى S3...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'لم يتم اختيار ملف' 
      }, { status: 400 });
    }

    // التحقق من نوع الملف
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP, GIF, AVIF' 
      }, { status: 400 });
    }

    // التحقق من حجم الملف (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت'
      }, { status: 400 });
    }

    // تحويل الملف إلى Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // تحديد اسم الملف مع إضافة نوع الرفع
    let folder = 'general';
    switch (type) {
      case 'avatar':
        folder = 'avatars';
        break;
      case 'featured':
        folder = 'featured';
        break;
      case 'gallery':
        folder = 'gallery';
        break;
      case 'team':
        folder = 'team';
        break;
      case 'analysis':
        folder = 'analysis';
        break;
      case 'categories':
        folder = 'categories';
        break;
      default:
        folder = 'general';
    }

    const fileName = `${folder}/${Date.now()}-${file.name}`;

    console.log('📤 رفع إلى S3...');
    console.log('📁 اسم الملف:', fileName);
    console.log('📊 حجم الملف:', (file.size / 1024).toFixed(2) + ' KB');

    // رفع الصورة إلى S3
    let imageUrl: string;
    
    try {
      imageUrl = await uploadToS3(buffer, fileName, file.type);
      console.log('✅ تم رفع الصورة بنجاح إلى S3');
      console.log('🔗 رابط الصورة:', imageUrl);

      return NextResponse.json({
        success: true,
        url: imageUrl,
        fileName: fileName,
        size: file.size,
        type: file.type,
        uploadType: type,
        message: 'تم رفع الصورة بنجاح إلى Amazon S3'
      });
    } catch (s3Error) {
      console.error('⚠️ فشل رفع S3، محاولة الحل البديل:', s3Error);
      
      // في حالة فشل S3 بسبب ACL، استخدم Base64 كحل مؤقت
      const base64 = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;
      
      // حفظ الصورة مؤقتاً كـ data URI
      return NextResponse.json({
        success: true,
        url: dataUri,
        fileName: fileName,
        size: file.size,
        type: file.type,
        uploadType: type,
        message: 'تم حفظ الصورة مؤقتاً - يرجى تكوين S3 للوصول العام',
        warning: 'الصورة محفوظة كـ Base64 مؤقتاً',
        temporary: true
      });
    }

  } catch (error) {
    console.error('❌ خطأ في رفع الصورة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في رفع الصورة إلى S3',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

// دعم OPTIONS للـ CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
