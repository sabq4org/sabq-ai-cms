/**
 * مكتبة آمنة لمعالجة خصائص الصور في Next.js
 * تمنع أخطاء getImgProps وتضمن التوافق
 */

import { ImageProps } from "next/image";

/**
 * معالج آمن لخصائص الصور
 * يضمن عدم تعارض fill مع width/height
 */
export function getSafeImageProps(
  props: Partial<ImageProps> & {
    src?: string | null;
    alt?: string;
    width?: number;
    height?: number;
    fill?: boolean;
  }
): Partial<ImageProps> {
  const { src, alt, width, height, fill, ...restProps } = props;

  // التحقق من صحة المصدر
  const validSrc =
    src && typeof src === "string" && src.trim() !== ""
      ? src
      : "/images/placeholder-featured.jpg";

  // التحقق من صحة النص البديل
  const validAlt =
    alt && typeof alt === "string" && alt.trim() !== "" ? alt : "صورة";

  // إذا كان fill = true، لا نضع width و height
  if (fill === true) {
    return {
      src: validSrc,
      alt: validAlt,
      fill: true,
      ...restProps,
      // إزالة width و height إذا كانا موجودين
      width: undefined,
      height: undefined,
    };
  }

  // التحقق من صحة الأبعاد
  const validWidth = width && !isNaN(width) && width > 0 ? width : 800;
  const validHeight = height && !isNaN(height) && height > 0 ? height : 600;

  return {
    src: validSrc,
    alt: validAlt,
    width: validWidth,
    height: validHeight,
    ...restProps,
    // التأكد من أن fill ليس موجوداً
    fill: undefined,
  };
}

/**
 * التحقق من صحة رابط الصورة
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;

  const trimmedUrl = url.trim();
  if (trimmedUrl === "") return false;

  // التحقق من أن الرابط يبدأ بـ http أو https أو / (رابط محلي)
  if (
    !trimmedUrl.startsWith("http") &&
    !trimmedUrl.startsWith("/") &&
    !trimmedUrl.startsWith("data:")
  ) {
    return false;
  }

  return true;
}

/**
 * الحصول على رابط الصورة الاحتياطية حسب النوع
 */
export function getFallbackImage(
  type: "article" | "author" | "category" | "default" = "default"
): string {
  const fallbacks = {
    article: "/images/placeholder-featured.jpg",
    author: "/images/default-avatar.png",
    category: "/images/category-placeholder.jpg",
    default: "/images/placeholder-featured.jpg",
  };

  return fallbacks[type] || fallbacks.default;
}

/**
 * معالج شامل للصور مع الأخطاء
 */
export function createSafeImageHandler(options?: {
  onError?: (error: any) => void;
  onLoad?: () => void;
  fallbackType?: "article" | "author" | "category" | "default";
}) {
  const { onError, onLoad, fallbackType = "default" } = options || {};

  return {
    handleError: (e: any) => {
      console.error("❌ Image loading error:", e);

      // محاولة تغيير المصدر إلى الصورة الاحتياطية
      if (e.target && e.target.src) {
        const fallback = getFallbackImage(fallbackType);
        if (e.target.src !== fallback) {
          e.target.src = fallback;
        }
      }

      onError?.(e);
    },

    handleLoad: () => {
      console.log("✅ Image loaded successfully");
      onLoad?.();
    },
  };
}

/**
 * تحديد حجم الصورة بناءً على نوع الجهاز
 */
export function getResponsiveImageSizes(
  type: "hero" | "card" | "thumbnail" | "full" = "card"
): string {
  const sizes = {
    hero: "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px",
    card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    thumbnail: "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px",
    full: "100vw",
  };

  return sizes[type] || sizes.card;
}
