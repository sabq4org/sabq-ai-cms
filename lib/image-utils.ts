/**
 * نظام مركزي لمعالجة الصور
 * يدعم S3, CloudFront, Cloudinary وغيرها
 */

// Cloudinary configuration
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/sabq/image/upload";
const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "sabq";

// CloudFront configuration
const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || "";

// S3 domains المعروفة
const S3_DOMAINS = [
  "sabq-cms-content.s3.amazonaws.com",
  "sabq-cms-content.s3.us-east-1.amazonaws.com",
  "sabq-uploader.s3.amazonaws.com",
  "s3.amazonaws.com",
  "s3.us-east-1.amazonaws.com",
];

// Fallback images - روابط صحيحة وموثوقة
const FALLBACK_IMAGES = {
  article:
    "https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/defaults/article-placeholder.jpg",
  author:
    "https://ui-avatars.com/api/?name=كاتب&background=0D8ABC&color=fff&size=200&font-size=0.33&rounded=true",
  category:
    "https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/defaults/category-placeholder.jpg",
  news:
    "https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/defaults/news-placeholder.jpg",
  featured:
    "https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/defaults/featured-placeholder.jpg",
  default:
    "https://ui-avatars.com/api/?name=سبق&background=1E40AF&color=fff&size=800&font-size=0.33&rounded=false",
};

// تنظيف رابط S3 (مع الحفاظ على الروابط الموقّعة كما هي)
export function cleanS3Url(url: string): string {
  if (!url) return url;

  try {
    const urlObj = new URL(url);

    // إذا كان رابط S3
    if (S3_DOMAINS.some((domain) => urlObj.hostname.includes(domain))) {
      // إذا كانت موقّعة (تتضمن X-Amz*) لا تلمس الرابط إطلاقاً
      const hasSignature = Array.from(urlObj.searchParams.keys()).some((k) => k.startsWith("X-Amz-"));
      if (hasSignature) {
        return url; // الحفاظ على جميع معلمات التوقيع
      }

      // إذا لم تكن موقّعة وكان لدينا CloudFront، يمكن إعادة التوجيه إلى CloudFront دون معامل توقيع
      if (CLOUDFRONT_DOMAIN) {
        const path = urlObj.pathname;
        return `https://${CLOUDFRONT_DOMAIN}${path}`;
      }

      return url; // إرجاع الرابط كما هو لسلامة الوصول
    }

    return url;
  } catch {
    return url;
  }
}

// معالجة رابط S3 لإضافة تحسينات الصور
export function processS3Url(
  url: string,
  options: { width?: number; height?: number } = {}
): string {
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
export function optimizeImageUrl(
  imageUrl: string,
  width: number = 400,
  height: number = 300,
  quality: number = 80,
  format: string = "auto",
  cropMode: string = "fill" // جديد: دعم crop modes مختلفة
): string {
  if (!imageUrl || typeof imageUrl !== "string") {
    return imageUrl;
  }

  // إذا كانت الصورة من Cloudinary
  if (imageUrl.includes("cloudinary.com")) {
    // التحقق من وجود transformations موجودة
    if (
      imageUrl.includes("/upload/v") ||
      imageUrl.includes("/upload/f_") ||
      imageUrl.includes("/upload/w_")
    ) {
      // إذا كانت الصورة تحتوي على transformations بالفعل، أعدها كما هي
      return imageUrl;
    }

    // إضافة transformations مع دعم crop modes مختلفة
    const transformations = [
      `w_${width}`,
      `h_${height}`,
      `c_${cropMode}`, // استخدام cropMode المُمرر
      `q_${quality}`,
      `f_${format}`,
    ].join(",");

    // إدراج التحويلات في الرابط
    const parts = imageUrl.split("/upload/");
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
    return imageUrl;
  }

  // للـ CDNs الأخرى أو الصور العادية
  return imageUrl;
}

// رفع صورة إلى Cloudinary (client-side)
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/upload/cloudinary", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "فشل رفع الصورة");
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "فشل رفع الصورة");
    }

    return data.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

// التحقق من صحة رابط الصورة
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type");
    return (response.ok && contentType?.startsWith("image/")) || false;
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
    bgColor = "00A86B",
    textColor = "FFFFFF",
  } = options;

  // استخدام placeholder.com API
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(
    text
  )}`;
}

// معالج الصور لـ Next.js Image component
export function getOptimizedImageProps(
  src: string | null | undefined,
  alt: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    cropMode?: string;
  } = {}
) {
  const imageUrl = optimizeImageUrl(src || '', options.width, options.height, options.quality, options.format, options.cropMode);

  return {
    src: imageUrl,
    alt,
    width: options.width || 800,
    height: options.height || 600,
    quality: options.quality || 80,
    loading: "lazy" as const,
    placeholder: "blur" as const,
    blurDataURL: generatePlaceholder(alt, {
      width: 10,
      height: 10,
      bgColor: "E5E7EB",
    }),
  };
}

/**
 * التحقق من صحة رابط الصورة وتوفر الصورة
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // تجاهل الصور base64 الضخمة (أكبر من 100KB)
  if (url.startsWith("data:image/") && url.length > 100000) {
    return false;
  }
  
  // قبول صور base64 الصغيرة المناسبة
  if (url.startsWith("data:image/") && url.length <= 100000) {
    return true;
  }
  
  try {
    const urlObj = new URL(url);
    const validHosts = [
      "res.cloudinary.com",
      "cloudinary.com", 
      "amazonaws.com",
      "s3.amazonaws.com",
      "cloudfront.net",
      "ui-avatars.com",
      "images.unsplash.com",
      "sabq.org",
      "www.sabq.org",
      "sabq.io",
      "www.sabq.io"
    ];
    
    // التحقق من النطاقات الموثوقة
    const isValidHost = validHosts.some(host => 
      urlObj.hostname.includes(host) || urlObj.hostname.endsWith(host)
    );
    
    if (!isValidHost) return false;
    
    // التحقق من امتدادات الصور الصحيحة
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
    const pathname = urlObj.pathname.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => pathname.includes(ext));
    
    // قبول روابط Cloudinary حتى لو لم تحتوي على امتداد واضح
    const isCloudinary = urlObj.hostname.includes('cloudinary.com');
    
    return hasValidExtension || isCloudinary;
  } catch {
    return false;
  }
}

/**
 * إرجاع صورة آمنة - إما الصورة الأصلية أو بديل مناسب
 */
export function getSafeImageUrl(
  imageUrl: string | null | undefined,
  type: 'article' | 'author' | 'category' | 'news' | 'featured' | 'default' = 'default'
): string {
  // إذا كانت الصورة صحيحة، إرجعها كما هي
  if (isValidImageUrl(imageUrl)) {
    return imageUrl as string;
  }
  
  // إرجاع الصورة البديلة المناسبة
  return FALLBACK_IMAGES[type] || FALLBACK_IMAGES.default;
}

/**
 * معالجة شاملة للصور مع نظام fallback متقدم
 */
export function processArticleImage(
  imageUrl: string | null | undefined,
  title: string,
  type: 'featured' | 'article' | 'news' = 'article'
): string {
  // جرب الصورة الأصلية أولاً
  if (isValidImageUrl(imageUrl)) {
    return optimizeImageUrl(imageUrl as string, 
      type === 'featured' ? 1200 : 800,
      type === 'featured' ? 675 : 450,
      80
    );
  }
  
  // إذا فشلت، استخدم الصورة البديلة المناسبة
  return getSafeImageUrl(null, type);
}
