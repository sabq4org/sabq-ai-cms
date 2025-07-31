import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// أنواع الصور المسموحة
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

// حدود الحجم
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// تحديد المجلد بناءً على النوع
function getCloudinaryFolder(type: string): string {
  const folderMap: Record<string, string> = {
    'articles': 'sabq-cms/articles',
    'categories': 'sabq-cms/categories',
    'avatars': 'sabq-cms/avatars',
    'featured': 'sabq-cms/featured',
    'gallery': 'sabq-cms/gallery',
    'team': 'sabq-cms/team',
    'analysis': 'sabq-cms/analysis',
    'daily-doses': 'sabq-cms/daily-doses',
    'opinions': 'sabq-cms/opinions',
    'audio': 'sabq-cms/audio',
    'logos': 'sabq-cms/logos'
  };
  
  return folderMap[type] || 'sabq-cms/general';
}

// تحسينات الصورة بناءً على النوع
function getTransformations(type: string) {
  const baseTransformations = [
    { quality: 'auto:good' },
    { fetch_format: 'auto' },
    { dpr: 'auto' }
  ];

  const typeTransformations: Record<string, any[]> = {
    'avatars': [
      ...baseTransformations,
      { width: 300, height: 300, crop: 'fill', gravity: 'face' }
    ],
    'featured': [
      ...baseTransformations,
      { width: 1200, height: 630, crop: 'fill' }
    ],
    'articles': [
      ...baseTransformations,
      { width: 1200, crop: 'limit' }
    ],
    'categories': [
      ...baseTransformations,
      { width: 800, height: 600, crop: 'fill' }
    ],
    'thumbnails': [
      ...baseTransformations,
      { width: 400, height: 300, crop: 'fill' }
    ]
  };

  return typeTransformations[type] || baseTransformations;
}

export async function POST(request: NextRequest) {
  console.log('📸 بدء معالجة طلب رفع الصورة لـ Cloudinary');
  
  // التحقق من متغيرات البيئة
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ متغيرات Cloudinary مفقودة في البيئة');
    return NextResponse.json({
      success: false,
      error: 'خطأ في إعدادات الخادم. يرجى التواصل مع الدعم الفني.',
      details: 'Missing Cloudinary configuration'
    }, { status: 500 });
  }
  
  try {
    // التحقق من بيانات Cloudinary
    console.log('🔑 بيانات Cloudinary:', {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key ? '✅ موجود' : '❌ مفقود',
      api_secret: cloudinary.config().api_secret ? '✅ موجود' : '❌ مفقود'
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';
    const generateThumbnail = formData.get('generateThumbnail') === 'true';

    console.log('📋 تفاصيل الطلب:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      uploadType: type,
      generateThumbnail
    });

    // التحقق من وجود الملف
    if (!file) {
      console.error('❌ لا يوجد ملف في الطلب');
      return NextResponse.json(
        { success: false, error: 'لم يتم تحديد ملف' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('❌ نوع الملف غير مسموح:', file.type);
      return NextResponse.json(
        { success: false, error: 'نوع الملف غير مدعوم' },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف
    if (file.size > MAX_FILE_SIZE) {
      console.error('❌ حجم الملف كبير جداً:', `${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return NextResponse.json(
        { success: false, error: `حجم الملف كبير جداً. الحد الأقصى ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // تحويل الملف إلى Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // إعداد خيارات الرفع
    const folder = getCloudinaryFolder(type);
    const transformations = getTransformations(type);
    
    // إعداد معرف فريد
    const publicId = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log('📤 بدء رفع الملف إلى Cloudinary:', {
      folder,
      publicId,
      transformations: transformations.length
    });

    // رفع الصورة مع معالجة أفضل للأخطاء
    const uploadResult = await new Promise<any>((resolve, reject) => {
      // إعداد timeout لمنع الانتظار الطويل
      const timeoutId = setTimeout(() => {
        reject(new Error('تجاوز الوقت المسموح لرفع الصورة (30 ثانية)'));
      }, 30000); // 30 ثانية كحد أقصى
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'auto',
          overwrite: true,
          invalidate: true,
          transformation: transformations,
          eager: generateThumbnail ? [
            { width: 200, height: 150, crop: 'fill', quality: 'auto' }
          ] : undefined,
          eager_async: generateThumbnail,
          timeout: 25000 // 25 ثانية كحد أقصى من جانب Cloudinary
        },
        (error, result) => {
          clearTimeout(timeoutId); // إلغاء timeout بعد الانتهاء
          
          if (error) {
            console.error('❌ خطأ من Cloudinary:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name
            });
            reject(error);
          } else if (!result) {
            console.error('❌ لم يتم استلام نتيجة من Cloudinary');
            reject(new Error('لم يتم استلام نتيجة من Cloudinary'));
          } else {
            console.log('✅ نجح رفع الصورة إلى Cloudinary');
            resolve(result);
          }
        }
      );

      // معالجة أخطاء stream
      uploadStream.on('error', (error) => {
        clearTimeout(timeoutId);
        console.error('❌ خطأ في stream رفع الصورة:', error);
        reject(error);
      });

      uploadStream.end(buffer);
    });

    // إعداد البيانات المرجعة
    const response: any = {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      size: uploadResult.bytes,
      resourceType: uploadResult.resource_type,
      createdAt: uploadResult.created_at,
      folder: folder,
      version: uploadResult.version,
      etag: uploadResult.etag
    };

    // إضافة رابط الصورة المصغرة إن وجدت
    if (generateThumbnail && uploadResult.eager) {
      response.thumbnail = uploadResult.eager[0]?.secure_url;
    }

    // إضافة روابط بأحجام مختلفة
    response.sizes = {
      small: cloudinary.url(uploadResult.public_id, {
        width: 400,
        crop: 'scale',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      medium: cloudinary.url(uploadResult.public_id, {
        width: 800,
        crop: 'scale',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      large: cloudinary.url(uploadResult.public_id, {
        width: 1200,
        crop: 'scale',
        quality: 'auto',
        fetch_format: 'auto'
      })
    };

    console.log('📊 تفاصيل الرفع:', {
      publicId: response.publicId,
      url: response.url,
      size: `${(response.size / 1024).toFixed(2)} KB`,
      dimensions: `${response.width}x${response.height}`
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ خطأ في رفع الصورة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في رفع الصورة',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// معالجة طلبات OPTIONS لـ CORS
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