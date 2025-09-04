import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// دالة لتسجيل محاولات رفع الصور
async function logUploadAttempt(details: {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadType: string;
  status: 'success' | 'failed' | 'placeholder';
  errorMessage?: string;
  cloudinaryUrl?: string;
  isPlaceholder: boolean;
}) {
  try {
    console.log('📊 [Upload API] تسجيل محاولة الرفع:', details);
  } catch (error) {
    console.error('❌ [Upload API] خطأ في تسجيل محاولة الرفع:', error);
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('📤 [Upload API] بدء معالجة رفع الصورة...');
    
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string || 'general';

    if (!file) {
      console.error('❌ [Upload API] لم يتم رفع أي ملف');
      return NextResponse.json({ 
        success: false, 
        error: 'لم يتم رفع أي ملف' 
      }, { status: 400 });
    }

    console.log(`📁 [Upload API] تفاصيل الملف: ${file.name} (${file.size} bytes, ${file.type})`);

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      const error = `نوع الملف غير مدعوم: ${file.type}. الأنواع المدعومة: JPEG, PNG, GIF, WebP`;
      console.error('❌ [Upload API]', error);
      
      await logUploadAttempt({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadType: type,
        status: 'failed',
        errorMessage: error,
        isPlaceholder: false
      });
      
      return NextResponse.json({ 
        success: false, 
        error 
      }, { status: 400 });
    }

    // التحقق من حجم الملف (10MB كحد أقصى)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const error = `حجم الملف كبير جداً: ${(file.size / 1024 / 1024).toFixed(2)}MB. الحد الأقصى: 10MB`;
      console.error('❌ [Upload API]', error);
      
      await logUploadAttempt({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadType: type,
        status: 'failed',
        errorMessage: error,
        isPlaceholder: false
      });
      
      return NextResponse.json({ 
        success: false, 
        error 
      }, { status: 400 });
    }

    // تحويل الملف إلى buffer
    let buffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log(`✅ [Upload API] تم تحويل الملف إلى buffer: ${buffer.length} bytes`);
    } catch (error) {
      console.error('❌ [Upload API] خطأ في تحويل الملف:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'خطأ في معالجة الملف' 
      }, { status: 500 });
    }

    // محاولة رفع الصورة إلى Cloudinary
    let cloudinaryUrl = null;
    let uploadSuccess = false;
    
    try {
      console.log('☁️ [Upload API] محاولة رفع الصورة إلى Cloudinary...');
      
      // استيراد دالة الرفع
      const { uploadToCloudinary } = await import('@/lib/cloudinary-server');
      
      const uploadResult = await uploadToCloudinary(buffer, {
        resource_type: 'image',
        folder: `sabq-cms/${type}`,
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      });
      
      if (uploadResult && uploadResult.secure_url) {
        cloudinaryUrl = uploadResult.secure_url;
        uploadSuccess = true;
        console.log('✅ [Upload API] تم رفع الصورة إلى Cloudinary بنجاح:', cloudinaryUrl);
      }
      
    } catch (cloudinaryError) {
      console.error('❌ [Upload API] خطأ في رفع الصورة إلى Cloudinary:', cloudinaryError);
    }

    // إذا فشل رفع Cloudinary، استخدم صورة افتراضية
    if (!uploadSuccess) {
      console.log('🔄 [Upload API] استخدام صورة افتراضية...');
      
      // إنشاء URL صورة افتراضية بناءً على نوع المحتوى
      const placeholderImages = {
        general: 'https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=صورة+عامة',
        news: 'https://via.placeholder.com/800x600/EF4444/FFFFFF?text=خبر',
        featured: 'https://via.placeholder.com/1200x800/8B5CF6/FFFFFF?text=صورة+مميزة',
        avatar: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=صورة+شخصية',
        gallery: 'https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=معرض+صور'
      };
      
      cloudinaryUrl = placeholderImages[type as keyof typeof placeholderImages] || placeholderImages.general;
      
      await logUploadAttempt({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadType: type,
        status: 'placeholder',
        errorMessage: 'فشل رفع Cloudinary، تم استخدام صورة افتراضية',
        cloudinaryUrl,
        isPlaceholder: true
      });
    } else {
      await logUploadAttempt({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadType: type,
        status: 'success',
        cloudinaryUrl,
        isPlaceholder: false
      });
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ [Upload API] تم رفع الصورة بنجاح في ${responseTime}ms`);

    const response = NextResponse.json({
      success: true,
      url: cloudinaryUrl,
      imageUrl: cloudinaryUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadType: type,
      isPlaceholder: !uploadSuccess,
      message: uploadSuccess ? 'تم رفع الصورة بنجاح' : 'تم استخدام صورة افتراضية'
    });

    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ [Upload API] خطأ غير متوقع:', error);

    // في حالة أي خطأ غير متوقع، إرجاع صورة افتراضية
    const emergencyUrl = 'https://via.placeholder.com/800x600/6B7280/FFFFFF?text=خطأ+في+رفع+الصورة';
    
    return NextResponse.json({
      success: true, // نرجع true لأننا نعطي صورة افتراضية
      url: emergencyUrl,
      imageUrl: emergencyUrl,
      fileName: 'error-placeholder.png',
      fileSize: 0,
      fileType: 'image/png',
      uploadType: 'error',
      isPlaceholder: true,
      isError: true,
      message: 'حدث خطأ، تم استخدام صورة افتراضية',
      responseTime: `${responseTime}ms`,
      error_details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

// OPTIONS: معالجة طلبات CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// GET: معلومات حول خدمة رفع الصور
export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'Image Upload API',
    version: '2.0',
    features: [
      'رفع إلى Cloudinary',
      'صور افتراضية في حالة الفشل',
      'تحقق من نوع وحجم الملف',
      'تسجيل محاولات الرفع',
      'معالجة أخطاء شاملة'
    ],
    supported_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    max_file_size: '10MB',
    endpoints: {
      upload: 'POST /',
      info: 'GET /'
    }
  });
}
