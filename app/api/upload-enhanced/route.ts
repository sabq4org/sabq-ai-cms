import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary-server';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
  // تسجيل تفصيلي لتشخيص المشكلة
  console.log('🔥 =================================');
  console.log('📤 بدء معالجة طلب رفع الصورة');
  console.log('🌍 البيئة:', process.env.NODE_ENV);
  console.log('🔧 إعدادات Cloudinary:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'غير محدد',
    api_key: process.env.CLOUDINARY_API_KEY ? 'موجود' : 'غير موجود',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'موجود' : 'غير موجود',
    url: process.env.CLOUDINARY_URL ? 'موجود' : 'غير موجود'
  });

  try {
    // استخراج الملف من FormData
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string || 'general';

    console.log('📁 معلومات الملف:', {
      name: file?.name || 'غير محدد',
      size: file?.size || 0,
      type: file?.type || 'غير محدد',
      uploadType: type
    });

    if (!file) {
      console.error('❌ لم يتم العثور على ملف في الطلب');
      return NextResponse.json({ 
        success: false, 
        error: 'لم يتم رفع أي ملف',
        debug: 'FILE_NOT_FOUND'
      });
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ نوع ملف غير مدعوم:', file.type);
      return NextResponse.json({ 
        success: false, 
        error: `نوع الملف غير مدعوم: ${file.type}. الأنواع المدعومة: JPG, PNG, GIF, WebP`,
        debug: 'INVALID_FILE_TYPE'
      });
    }

    // التحقق من حجم الملف (10MB كحد أقصى)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('❌ حجم الملف كبير جداً:', file.size);
      return NextResponse.json({ 
        success: false, 
        error: `حجم الملف كبير جداً. الحد الأقصى: ${maxSize / (1024 * 1024)}MB`,
        debug: 'FILE_TOO_LARGE'
      });
    }

    // التحقق من توفر إعدادات Cloudinary
    const hasCloudinaryConfig = !!(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    );

    console.log('☁️ حالة Cloudinary:', {
      configured: hasCloudinaryConfig,
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET
    });

    if (!hasCloudinaryConfig) {
      console.warn('⚠️ إعدادات Cloudinary غير مكتملة - استخدام صورة placeholder');
      
      const placeholderUrl = type === 'avatar' 
        ? '/images/placeholder-avatar.jpg'
        : type === 'featured'
        ? '/images/placeholder-featured.jpg'
        : '/images/placeholder.jpg';

      return NextResponse.json({ 
        success: true, 
        url: placeholderUrl,
        message: 'تم استخدام صورة مؤقتة - يرجى إعداد Cloudinary للرفع الحقيقي',
        is_placeholder: true,
        debug: 'CLOUDINARY_NOT_CONFIGURED'
      });
    }

    // محاولة رفع الصورة إلى Cloudinary
    try {
      console.log('☁️ بدء رفع الصورة إلى Cloudinary...');
      
      // تحديد المجلد حسب النوع
      let folder = 'sabq-cms/general';
      switch (type) {
        case 'avatar':
          folder = 'sabq-cms/avatars';
          break;
        case 'featured':
          folder = 'sabq-cms/featured';
          break;
        case 'article':
          folder = 'sabq-cms/articles';
          break;
        case 'category':
          folder = 'sabq-cms/categories';
          break;
        default:
          folder = 'sabq-cms/general';
      }

      console.log('📂 المجلد المستهدف:', folder);

      const result = await uploadToCloudinary(file, {
        folder,
        fileName: file.name
      });

      console.log('✅ نجح رفع الصورة إلى Cloudinary:', {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      });

      return NextResponse.json({ 
        success: true, 
        url: result.url,
        public_id: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        message: 'تم رفع الصورة إلى السحابة بنجاح',
        cloudinary_storage: true,
        is_placeholder: false,
        debug: 'CLOUDINARY_SUCCESS'
      });

    } catch (cloudinaryError) {
      console.error('❌ فشل رفع الصورة إلى Cloudinary:', cloudinaryError);
      
      // في حالة فشل Cloudinary، استخدم fallback
      const placeholderUrl = type === 'avatar' 
        ? '/images/placeholder-avatar.jpg'
        : type === 'featured'
        ? '/images/placeholder-featured.jpg'
        : '/images/placeholder.jpg';

      console.log('🔄 استخدام صورة placeholder بدلاً من Cloudinary');

      return NextResponse.json({ 
        success: true, 
        url: placeholderUrl,
        message: 'فشل رفع الصورة - تم استخدام صورة مؤقتة',
        is_placeholder: true,
        error_details: cloudinaryError instanceof Error ? cloudinaryError.message : 'خطأ غير معروف',
        debug: 'CLOUDINARY_FAILED_FALLBACK'
      });
    }

  } catch (error) {
    console.error('❌ خطأ عام في معالجة الطلب:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'حدث خطأ أثناء معالجة الطلب',
      error_details: error instanceof Error ? error.message : 'خطأ غير معروف',
      debug: 'GENERAL_ERROR'
    }, { 
      status: 500
    });
  } finally {
    console.log('🔥 انتهاء معالجة طلب رفع الصورة');
    console.log('🔥 =================================');
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
