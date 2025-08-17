import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3-config';
import { validateImage } from '@/lib/image-optimizer';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 بدء رفع الصورة إلى S3...');
    
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string || 'general';
    const userId = data.get('userId') as string;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'لم يتم رفع أي ملف' 
      }, { status: 400 });
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'نوع الملف غير مدعوم. الأنواع المدعومة: JPEG, PNG, GIF, WebP' 
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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // التحقق من صحة الصورة (تحقق بسيط)
    if (buffer.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'الملف فارغ أو تالف' 
      }, { status: 400 });
    }

    // إنشاء اسم ملف فريد
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const folder = type === 'avatar' ? 'avatars' : 'uploads';
    const fileName = userId ? 
      `${folder}/${userId}_${timestamp}_${randomString}.${fileExtension}` :
      `${folder}/${timestamp}_${randomString}.${fileExtension}`;

    console.log('📁 اسم الملف:', fileName);

    // رفع إلى S3
    try {
      const s3Url = await uploadToS3(buffer, fileName, file.type);
      
      console.log('✅ تم رفع الصورة إلى S3 بنجاح:', s3Url);

      // إرجاع النتيجة
      return NextResponse.json({
        success: true,
        message: 'تم رفع الصورة بنجاح',
        data: {
          url: s3Url,
          fileName: fileName,
          fileSize: file.size,
          fileType: file.type,
          uploadType: type
        }
      });

    } catch (s3Error) {
      console.error('❌ خطأ في رفع الصورة إلى S3:', s3Error);
      
      return NextResponse.json({ 
        success: false, 
        error: 'فشل في رفع الصورة إلى الخادم' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('💥 خطأ عام في رفع الصورة:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'حدث خطأ غير متوقع في رفع الصورة' 
    }, { status: 500 });
  }
}
