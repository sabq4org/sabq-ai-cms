import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlaibl7id',
  api_key: process.env.CLOUDINARY_API_KEY || '566744491984695',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'WiWCbXJ5SDYeE24cNaI1o1Wm0CU',
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
    'audio': 'sabq-cms/audio'
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
  try {
    console.log('🚀 بدء رفع الصورة إلى Cloudinary...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';
    const generateThumbnail = formData.get('generateThumbnail') === 'true';

    // التحقق من وجود الملف
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم رفع أي ملف'
      }, { status: 400 });
    }

    // التحقق من نوع الملف
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'نوع الملف غير مسموح',
        allowedTypes: ALLOWED_TYPES
      }, { status: 400 });
    }

    // التحقق من حجم الملف
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `حجم الملف يجب أن يكون أقل من ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    }

    // تحويل الملف إلى Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // إعداد خيارات الرفع
    const folder = getCloudinaryFolder(type);
    const transformations = getTransformations(type);
    
    // إنشاء public_id فريد
    const timestamp = Date.now();
    const fileName = file.name.replace(/\.[^/.]+$/, ''); // إزالة الامتداد
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = `${timestamp}_${sanitizedFileName}`;

    console.log(`📁 رفع إلى المجلد: ${folder}`);
    console.log(`🔧 تطبيق التحسينات:`, transformations);

    // رفع الصورة إلى Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
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
          eager_async: generateThumbnail
        },
        (error, result) => {
          if (error) {
            console.error('❌ خطأ في رفع الصورة:', error);
            reject(error);
          } else {
            console.log('✅ تم رفع الصورة بنجاح');
            resolve(result);
          }
        }
      );

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