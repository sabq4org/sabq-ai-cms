/**
 * نظام مركزي لمعالجة الصور
 * يدعم S3, CloudFront, Cloudinary وغيرها
 */

// Cloudinary configuration
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/sabq/image/upload';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'sabq';

// CloudFront configuration
const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || '';

// S3 domains المعروفة
const S3_DOMAINS = [
  'sabq-cms-content.s3.amazonaws.com',
  'sabq-cms-content.s3.us-east-1.amazonaws.com',
  'sabq-uploader.s3.amazonaws.com',
  's3.amazonaws.com',
  's3.us-east-1.amazonaws.com'
];

// Fallback images - روابط صحيحة وموثوقة
const FALLBACK_IMAGES = {
  article: 'https://ui-avatars.com/api/?name=مقال&background=0D8ABC&color=fff&size=800&font-size=0.33&rounded=false',
  author: 'https://ui-avatars.com/api/?name=كاتب&background=0D8ABC&color=fff&size=200&font-size=0.33&rounded=true',
  category: 'https://ui-avatars.com/api/?name=تصنيف&background=00A86B&color=fff&size=800&font-size=0.33&rounded=false',
  default: 'https://ui-avatars.com/api/?name=سبق&background=1E40AF&color=fff&size=800&font-size=0.33&rounded=false'
};

// تنظيف رابط S3 من معاملات التوقيع
export function cleanS3Url(url: string): string {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    
    // إذا كان رابط S3
    if (S3_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
      // إزالة معاملات التوقيع
      const paramsToRemove = ['X-Amz-Algorithm', 'X-Amz-Credential', 'X-Amz-Date', 
                             'X-Amz-Expires', 'X-Amz-SignedHeaders', 'X-Amz-Signature'];
      
      paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
      
      // إذا كان هناك CloudFront، استخدمه
      if (CLOUDFRONT_DOMAIN) {
        const path = urlObj.pathname;
        return `https://${CLOUDFRONT_DOMAIN}${path}`;
      }
      
      return urlObj.toString();
    }
    
    return url;
  } catch {
    return url;
  }
}

// معالجة رابط S3 لإضافة تحسينات الصور
export function processS3Url(url: string, options: { width?: number; height?: number } = {}): string {
  const cleanUrl = cleanS3Url(url);
  
  // إذا كان CloudFront متاح وفيه image resizing
  if (CLOUDFRONT_DOMAIN && cleanUrl.includes(CLOUDFRONT_DOMAIN)) {
    const { width = 800, height = 600 } = options;
    // يمكن إضافة معاملات التحجيم حسب إعدادات CloudFront
    return `${cleanUrl}?w=${width}&h=${height}&fit=cover`;
  }
  
  return cleanUrl;
}

// تحويل الصورة إلى رابط CDN
export function getImageUrl(
  imageUrl: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    fallbackType?: keyof typeof FALLBACK_IMAGES;
  } = {}
): string {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'auto',
    fallbackType = 'default'
  } = options;

  // إذا لم توجد صورة أو كانت فارغة أو undefined أو null
  if (!imageUrl || 
      imageUrl === '' || 
      imageUrl === 'undefined' || 
      imageUrl === 'null' || 
      imageUrl.includes('/api/placeholder') ||
      imageUrl.includes('undefined') ||
      imageUrl.includes('null')
  ) {
    console.log(`🖼️ استخدام fallback image للنوع: ${fallbackType}`);
    return FALLBACK_IMAGES[fallbackType];
  }

  // معالجة روابط S3
  if (imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('s3.us-east-1.amazonaws.com')) {
    return processS3Url(imageUrl, { width, height });
  }

  // إذا كانت الصورة محلية (تبدأ بـ /)
  if (imageUrl.startsWith('/')) {
    // معالجة خاصة لمجلد uploads
    if (imageUrl.startsWith('/uploads/')) {
      // في بيئة الإنتاج، استخدم رابط مباشر
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        // إذا كان لدينا NEXT_PUBLIC_SITE_URL، استخدمه
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.io';
        return `${siteUrl}${imageUrl}`;
      }
    }
    
    // في بيئة الإنتاج، أضف URL الأساسي
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL) {
      return `${process.env.NEXT_PUBLIC_SITE_URL}${imageUrl}`;
    }
    // في بيئة التطوير، إرجاع المسار المحلي كما هو
    return imageUrl;
  }

  // إذا كانت الصورة من Cloudinary
  if (imageUrl.includes('cloudinary.com')) {
    // التحقق من وجود transformations موجودة
    if (imageUrl.includes('/upload/v') || imageUrl.includes('/upload/f_') || imageUrl.includes('/upload/w_')) {
      // إذا كانت الصورة تحتوي على transformations بالفعل، أعدها كما هي
      return imageUrl;
    }
    
    // إضافة transformations
    const transformations = [
      `w_${width}`,
      `h_${height}`,
      `c_fill`,
      `q_${quality}`,
      `f_${format}`
    ].join(',');

    // إدراج التحويلات في الرابط
    const parts = imageUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
    return imageUrl;
  }

  // إذا كانت الصورة من Unsplash
  if (imageUrl.includes('unsplash.com')) {
    try {
      const url = new URL(imageUrl);
      // تنظيف المعاملات القديمة
      url.search = '';
      // إضافة معاملات جديدة
      url.searchParams.set('w', width.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      return url.toString();
    } catch {
      console.log(`❌ رابط Unsplash غير صحيح: ${imageUrl}`);
      return FALLBACK_IMAGES[fallbackType];
    }
  }

  // إذا كانت الصورة من مصدر آخر
  // نحاول استخدامها مباشرة أو نستخدم fallback
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    return FALLBACK_IMAGES[fallbackType];
  }
}

// رفع صورة إلى Cloudinary
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'sabq_preset');
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('فشل رفع الصورة');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

// التحقق من صحة رابط الصورة
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType?.startsWith('image/') || false;
  } catch {
    return false;
  }
}

// إنشاء placeholder ديناميكي
export function generatePlaceholder(
  text: string,
  options: {
    width?: number;
    height?: number;
    bgColor?: string;
    textColor?: string;
  } = {}
): string {
  const {
    width = 400,
    height = 300,
    bgColor = '00A86B',
    textColor = 'FFFFFF'
  } = options;

  // استخدام placeholder.com API
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
}

// معالج الصور لـ Next.js Image component
export function getOptimizedImageProps(
  src: string | null | undefined,
  alt: string,
  options: Parameters<typeof getImageUrl>[1] = {}
) {
  const imageUrl = getImageUrl(src, options);
  
  return {
    src: imageUrl,
    alt,
    width: options.width || 800,
    height: options.height || 600,
    quality: options.quality || 80,
    loading: 'lazy' as const,
    placeholder: 'blur' as const,
    blurDataURL: generatePlaceholder(alt, {
      width: 10,
      height: 10,
      bgColor: 'E5E7EB'
    })
  };
} 