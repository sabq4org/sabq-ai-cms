/**
 * معالج خاص لصور الإنتاج
 * يحل مشاكل عرض الصور في بيئة الإنتاج
 */

const PRODUCTION_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.io';

export const PLACEHOLDER_IMAGES = {
  article: `https://ui-avatars.com/api/?name=مقال&background=0D8ABC&color=fff&size=800&font-size=0.33&rounded=false`,
  author: `https://ui-avatars.com/api/?name=كاتب&background=0D8ABC&color=fff&size=200&font-size=0.33&rounded=true`,
  category: `https://ui-avatars.com/api/?name=تصنيف&background=00A86B&color=fff&size=800&font-size=0.33&rounded=false`,
  analysis: `https://ui-avatars.com/api/?name=تحليل&background=7C3AED&color=fff&size=800&font-size=0.33&rounded=false`,
  default: `https://ui-avatars.com/api/?name=سبق&background=1E40AF&color=fff&size=800&font-size=0.33&rounded=false`,
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
    fallbackType?: keyof typeof PLACEHOLDER_IMAGES;
  } = {}
): string {
  const {
    width = 800,
    height = 600,
    quality = 85,
    fallbackType = "default",
  } = options;

  // إذا لم توجد صورة أو كانت فارغة
  if (
    !imageUrl ||
    imageUrl === "" ||
    imageUrl === "null" ||
    imageUrl === "undefined"
  ) {
    console.log(`🖼️ استخدام صورة Cloudinary الافتراضية: ${fallbackType}`);
    return PLACEHOLDER_IMAGES[fallbackType];
  }

  // تنظيف الرابط من المسافات
  imageUrl = imageUrl.trim();

  // إذا كانت الصورة من Cloudinary بالفعل
  if (imageUrl.includes("res.cloudinary.com")) {
    // إذا كانت تحتوي على transformations، أعدها كما هي
    if (
      imageUrl.includes("/upload/v") ||
      imageUrl.includes("/upload/c_") ||
      imageUrl.includes("/upload/w_")
    ) {
      return imageUrl;
    }

    // إضافة transformations للصور بدونها
    const parts = imageUrl.split("/upload/");
    if (parts.length === 2) {
      const transformations = `c_fill,g_auto,w_${width},h_${height},q_${quality},f_auto`;
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }

    return imageUrl;
  }

  // إذا كان الرابط يبدأ بـ data:image (base64)
  if (imageUrl.startsWith("data:image")) {
    return imageUrl;
  }

  // معالجة الروابط المطلقة (http/https) — تُعاد كما هي بدون إضافة الدومين
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // الروابط النسبية التي تبدأ بـ "/" — أضف الدومين المناسب
  if (imageUrl.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${imageUrl}`;
    }
    return `${PRODUCTION_DOMAIN}${imageUrl}`;
  }

  // إذا كانت الصورة من S3
  if (
    imageUrl.includes("s3.amazonaws.com") ||
    imageUrl.includes("s3.us-east-1.amazonaws.com")
  ) {
    // إذا كان الرابط موقّعاً (يحتوي على X-Amz*) يجب تركه كما هو
    try {
      const url = new URL(imageUrl);
      const hasSignature = Array.from(url.searchParams.keys()).some((k) => k.startsWith('X-Amz-'));
      if (hasSignature) {
        return imageUrl; // لا تحذف التوقيع
      }
      // إن لم يكن موقّعاً نعيده كما هو أيضاً لتجنب كسر الروابط
      return imageUrl;
    } catch {
      return imageUrl;
    }
  }

  // إذا كانت الصورة من مصدر خارجي آخر
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    // التحقق من صحة الرابط
    try {
      new URL(imageUrl);
      return imageUrl;
    } catch {
      // رابط غير صالح
      return PLACEHOLDER_IMAGES[fallbackType];
    }
  }

  // إذا لم نتمكن من تحديد نوع الصورة، استخدم الافتراضية
  console.warn(`⚠️ نوع صورة غير معروف: ${imageUrl}`);
  return PLACEHOLDER_IMAGES[fallbackType];
}

/**
 * تحديد نوع المحتوى من السياق
 */
export function detectContentType(context: {
  isCategory?: boolean;
  isAuthor?: boolean;
  isArticle?: boolean;
}): keyof typeof PLACEHOLDER_IMAGES {
  if (context.isCategory) return "category";
  if (context.isAuthor) return "author";
  if (context.isArticle) return "article";
  return "default";
}

/**
 * معالج صور البطاقات للإنتاج
 */
export function getCardImageUrl(
  imageUrl: string | null | undefined,
  type: "article" | "category" | "author" = "article"
): string {
  return getProductionImageUrl(imageUrl, {
    width: 800,
    height: 600,
    quality: 85,
    fallbackType: type,
  });
}

/**
 * معالج الصور المصغرة
 */
export function getThumbnailUrl(
  imageUrl: string | null | undefined,
  type: "article" | "category" | "author" = "article"
): string {
  return getProductionImageUrl(imageUrl, {
    width: 400,
    height: 300,
    quality: 80,
    fallbackType: type,
  });
}
