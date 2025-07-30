/**
 * معالج خاص لصور الإنتاج
 * يحل مشاكل عرض الصور في بيئة الإنتاج
 */

// الدومين الرئيسي للإنتاج
const PRODUCTION_DOMAIN = 'https://sabq.me';

// Cloudinary الافتراضي
const DEFAULT_CLOUDINARY_CLOUD = 'dybhezmvb';
const CLOUDINARY_BASE = `https://res.cloudinary.com/${DEFAULT_CLOUDINARY_CLOUD}/image/upload`;

// صور افتراضية مباشرة من Cloudinary
const CLOUDINARY_DEFAULTS = {
  article: `${CLOUDINARY_BASE}/v1753111461/defaults/article-placeholder.jpg`,
  category: `${CLOUDINARY_BASE}/v1753111461/defaults/category-placeholder.jpg`,
  author: `${CLOUDINARY_BASE}/v1753111461/defaults/default-avatar.png`,
  default: `${CLOUDINARY_BASE}/v1753111461/defaults/article-placeholder.jpg`
};

/**
 * معالج صور الإنتاج المحسّن
 */
export function getProductionImageUrl(
  imageUrl: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    fallbackType?: keyof typeof CLOUDINARY_DEFAULTS;
  } = {}
): string {
  const {
    width = 800,
    height = 600,
    quality = 85,
    fallbackType = 'default'
  } = options;

  // إذا لم توجد صورة أو كانت فارغة
  if (!imageUrl || imageUrl === '' || imageUrl === 'null' || imageUrl === 'undefined') {
    console.log(`🖼️ استخدام صورة Cloudinary الافتراضية: ${fallbackType}`);
    return CLOUDINARY_DEFAULTS[fallbackType];
  }

  // تنظيف الرابط من المسافات
  imageUrl = imageUrl.trim();

  // إذا كانت الصورة من Cloudinary بالفعل
  if (imageUrl.includes('res.cloudinary.com')) {
    // إذا كانت تحتوي على transformations، أعدها كما هي
    if (imageUrl.includes('/upload/v') || imageUrl.includes('/upload/c_') || imageUrl.includes('/upload/w_')) {
      return imageUrl;
    }
    
    // إضافة transformations للصور بدونها
    const parts = imageUrl.split('/upload/');
    if (parts.length === 2) {
      const transformations = `c_fill,w_${width},h_${height},q_${quality},f_auto`;
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
    
    return imageUrl;
  }

  // إذا كانت الصورة محلية (تبدأ بـ /)
  if (imageUrl.startsWith('/')) {
    // في بيئة الإنتاج، استخدم الدومين الكامل
    if (typeof window !== 'undefined') {
      // Client-side
      const currentDomain = window.location.origin;
      return `${currentDomain}${imageUrl}`;
    } else {
      // Server-side - استخدم دومين الإنتاج
      return `${PRODUCTION_DOMAIN}${imageUrl}`;
    }
  }

  // إذا كانت الصورة من S3
  if (imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('s3.us-east-1.amazonaws.com')) {
    // إزالة معاملات التوقيع المنتهية
    try {
      const url = new URL(imageUrl);
      const paramsToRemove = [
        'X-Amz-Algorithm', 'X-Amz-Credential', 'X-Amz-Date',
        'X-Amz-Expires', 'X-Amz-SignedHeaders', 'X-Amz-Signature',
        'X-Amz-Security-Token'
      ];
      
      paramsToRemove.forEach(param => url.searchParams.delete(param));
      
      // إعادة بناء الرابط النظيف
      return url.toString();
    } catch {
      // في حالة فشل معالجة الرابط، استخدم صورة افتراضية
      return CLOUDINARY_DEFAULTS[fallbackType];
    }
  }

  // إذا كانت الصورة من مصدر خارجي آخر
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // التحقق من صحة الرابط
    try {
      new URL(imageUrl);
      return imageUrl;
    } catch {
      // رابط غير صالح
      return CLOUDINARY_DEFAULTS[fallbackType];
    }
  }

  // إذا لم نتمكن من تحديد نوع الصورة، استخدم الافتراضية
  console.warn(`⚠️ نوع صورة غير معروف: ${imageUrl}`);
  return CLOUDINARY_DEFAULTS[fallbackType];
}

/**
 * تحديد نوع المحتوى من السياق
 */
export function detectContentType(context: {
  isCategory?: boolean;
  isAuthor?: boolean;
  isArticle?: boolean;
}): keyof typeof CLOUDINARY_DEFAULTS {
  if (context.isCategory) return 'category';
  if (context.isAuthor) return 'author';
  if (context.isArticle) return 'article';
  return 'default';
}

/**
 * معالج صور البطاقات للإنتاج
 */
export function getCardImageUrl(
  imageUrl: string | null | undefined,
  type: 'article' | 'category' | 'author' = 'article'
): string {
  return getProductionImageUrl(imageUrl, {
    width: 800,
    height: 600,
    quality: 85,
    fallbackType: type
  });
}

/**
 * معالج الصور المصغرة
 */
export function getThumbnailUrl(
  imageUrl: string | null | undefined,
  type: 'article' | 'category' | 'author' = 'article'
): string {
  return getProductionImageUrl(imageUrl, {
    width: 400,
    height: 300,
    quality: 80,
    fallbackType: type
  });
} 