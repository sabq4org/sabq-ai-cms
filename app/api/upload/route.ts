import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, uploadWithRetry } from '@/lib/cloudinary-server';









export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع أي ملف' });
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'نوع الملف غير مسموح',
        message: 'يسمح فقط بملفات الصور (JPEG, PNG, GIF, WebP)'
      }, { status: 400 });
    }

    // التحقق من حجم الملف (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'حجم الملف كبير جداً',
        message: 'حجم الملف يجب أن يكون أقل من 10 ميجابايت'
      }, { status: 400 });
    }

    // التحقق من توفر Cloudinary
    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                         process.env.CLOUDINARY_API_KEY && 
                         process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      try {
        // تحديد مجلد Cloudinary حسب النوع
        let folder = 'sabq-cms/general';
        switch (type) {
          case 'avatar':
            folder = 'sabq-cms/avatars';
            break;
          case 'featured':
            folder = 'sabq-cms/featured';
            break;
          case 'gallery':
            folder = 'sabq-cms/gallery';
            break;
          case 'team':
            folder = 'sabq-cms/team';
            break;
          case 'analysis':
            folder = 'sabq-cms/analysis';
            break;
          default:
            folder = 'sabq-cms/general';
        }

        console.log('📤 رفع الصورة إلى Cloudinary...');

        // رفع الصورة إلى Cloudinary مع إعادة المحاولة
        const result = await uploadWithRetry(file, {
          folder,
          fileName: file.name
        }, 3);

        console.log('✅ تم رفع الصورة إلى Cloudinary بنجاح:', result.url);

        return NextResponse.json({ 
          success: true, 
          url: result.url,
          public_id: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          message: 'تم رفع الصورة إلى السحابة بنجاح',
          cloudinary_storage: true
        });

      } catch (uploadError) {
        console.error('❌ خطأ في رفع الملف إلى Cloudinary:', uploadError);
        
        // إرجاع خطأ واضح بدلاً من نجاح زائف
        return NextResponse.json({ 
          success: false,
          error: 'فشل رفع الصورة إلى السحابة',
          message: 'حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.',
          details: uploadError instanceof Error ? uploadError.message : 'خطأ غير معروف',
          is_placeholder: true,
          placeholder_url: '/placeholder.jpg'
        }, { status: 400 });
      }
    }

    // إذا لم يتوفر Cloudinary، إرجاع خطأ
    console.log('⚠️ Cloudinary غير مُعد بشكل صحيح');
    
    return NextResponse.json({ 
      success: false,
      error: 'خدمة رفع الصور غير متوفرة',
      message: 'لم يتم إعداد خدمة رفع الصور. يرجى الاتصال بالدعم الفني.',
      cloudinary_storage: false,
      is_placeholder: true
    }, { status: 503 });

  } catch (error) {
    console.error('❌ خطأ في معالجة الملف:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'فشل في معالجة الملف',
      message: error instanceof Error ? error.message : 'خطأ غير معروف' 
    }, { status: 500 });
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