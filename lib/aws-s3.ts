import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// إعداد عميل S3 - متوافق مع DigitalOcean Environment Variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'sabq-ai-cms-images';
const S3_DOMAIN = process.env.AWS_S3_DOMAIN || `https://${BUCKET_NAME}.s3.amazonaws.com`;

// مجلدات S3
export const S3_FOLDERS = {
  ARTICLES: 'articles',
  AVATARS: 'avatars', 
  BANNERS: 'banners',
  THUMBNAILS: 'thumbnails',
  UPLOADS: 'uploads',
  TEMP: 'temp',
  CATEGORIES: 'categories'
} as const;

/**
 * الحصول على وقت انتهاء صلاحية افتراضي حسب نوع المجلد
 */
function getDefaultExpirationTime(folder: string): number {
  const expirationTimes = {
    'articles': 3600 * 24 * 365,   // سنة كاملة - مقالات دائمة
    'avatars': 3600 * 24 * 90,     // 3 أشهر - صور شخصية
    'banners': 3600 * 24 * 180,    // 6 أشهر - بانرات إعلانية
    'thumbnails': 3600 * 24 * 90,  // 3 أشهر - صور مصغرة
    'uploads': 3600 * 24 * 30,     // شهر - رفعات عامة
    'temp': 3600 * 24,             // يوم واحد - ملفات مؤقتة
  };
  
  return expirationTimes[folder as keyof typeof expirationTimes] || 3600 * 24 * 30; // افتراضي: شهر
}

/**
 * رفع صورة إلى S3
 */
export async function uploadImageToS3(
  file: Buffer, 
  fileName: string, 
  contentType: string, 
  folder: string = 'uploads',
  customExpiresIn?: number
): Promise<{ url: string; key: string }> {
  try {
    console.log(`📤 بدء عملية رفع الصورة إلى S3...`);
    console.log(`📁 معالجة ملف: ${fileName} (${file.length} bytes) - نوع: ${folder}`);

    // إنشاء اسم ملف فريد
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const key = `${folder}/${uniqueFileName}`;

    // تنظيف اسم الملف من الأحرف الخاصة والعربية للـ metadata
    const cleanFileName = fileName
      .replace(/[^\w\-_.]/g, '_')  // إزالة جميع الأحرف الخاصة
      .replace(/[أ-ي]/g, '_')     // إزالة الأحرف العربية
      .replace(/_+/g, '_')        // تقليل تكرار الشرطات السفلية
      .replace(/^_|_$/g, '');     // إزالة الشرطات من البداية والنهاية

    // إعداد الأمر لرفع الملف
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // حذف ACL لأن البكت لا يدعمه بشكل افتراضي
      Metadata: {
        originalName: cleanFileName || 'unnamed_file', // تأكد من وجود قيمة
        uploadedAt: new Date().toISOString(),
        folder: folder,
      },
    });

    // رفع الملف
    await s3Client.send(putCommand);

    // إنشاء رابط عام مباشر (Public URL)
    const publicUrl = `${S3_DOMAIN}/${key}`;

    console.log(`✅ تم رفع الصورة بنجاح: ${publicUrl}`);
    console.log(`🔗 رابط عام دائم للصورة`);
    
    return { url: publicUrl, key };
  } catch (error) {
    console.error('❌ خطأ في رفع الصورة إلى S3:', error);
    throw new Error('فشل في رفع الصورة');
  }
}

/**
 * حذف صورة من S3
 */
export async function deleteImageFromS3(key: string): Promise<void> {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);
    console.log(`✅ تم حذف الصورة بنجاح: ${key}`);
  } catch (error) {
    console.error('❌ خطأ في حذف الصورة من S3:', error);
    throw new Error('فشل في حذف الصورة');
  }
}

/**
 * إنشاء presigned URL لصورة موجودة
 */
export async function getPresignedImageUrl(
  key: string, 
  customExpiresIn?: number,
  folder?: string
): Promise<string> {
  try {
    // تحديد مدة انتهاء الصلاحية بناءً على المجلد أو القيمة المخصصة
    const detectedFolder = folder || key.split('/')[0] || 'uploads';
    const expiresIn = customExpiresIn || getDefaultExpirationTime(detectedFolder);
    
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn });
    console.log(`🔗 تم إنشاء presigned URL لمدة ${Math.floor(expiresIn / 3600)} ساعة`);
    
    return presignedUrl;
  } catch (error) {
    console.error('❌ خطأ في إنشاء presigned URL:', error);
    throw new Error('فشل في إنشاء رابط الصورة');
  }
}

/**
 * الحصول على presigned URL للرفع المباشر من العميل
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = 'uploads',
  customExpiresIn?: number
): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
  try {
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const key = `${folder}/${uniqueFileName}`;
    const expiresIn = customExpiresIn || 3600; // ساعة واحد للرفع (أقصر مدة للأمان)

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn });

    console.log(`📤 تم إنشاء presigned upload URL لمدة ${Math.floor(expiresIn / 3600)} ساعة`);
    
    return { uploadUrl, key, expiresIn };
  } catch (error) {
    console.error('❌ خطأ في إنشاء presigned upload URL:', error);
    throw new Error('فشل في إنشاء رابط الرفع');
  }
}

/**
 * التحقق من صحة نوع الملف
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mp3',
    'audio/wav'
  ];

  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'نوع الملف غير مدعوم. الأنواع المسموحة: صور، فيديو، صوت'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت'
    };
  }

  return { isValid: true };
}

/**
 * الحصول على معلومات أوقات انتهاء الصلاحية
 */
export function getExpirationInfo() {
  return {
    articles: { 
      duration: 'سنة كاملة', 
      reason: 'مقالات دائمة تحتاج صلاحية طويلة جداً للأرشفة والمشاركة' 
    },
    avatars: { 
      duration: '3 أشهر', 
      reason: 'صور شخصية شبه ثابتة' 
    },
    banners: { 
      duration: '6 أشهر', 
      reason: 'بانرات إعلانية لحملات طويلة المدى' 
    },
    thumbnails: { 
      duration: '3 أشهر', 
      reason: 'صور مصغرة للمعاينة المستمرة' 
    },
    uploads: { 
      duration: 'شهر', 
      reason: 'رفعات عامة بصلاحية معقولة' 
    },
    temp: { 
      duration: 'يوم واحد', 
      reason: 'ملفات مؤقتة للمعالجة' 
    },
    default: { 
      duration: 'شهر', 
      reason: 'المدة الافتراضية المحسنة' 
    }
  };
}
