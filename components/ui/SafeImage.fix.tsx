"use client";

import { getImageUrl } from "@/lib/image-utils";
import { getProductionImageUrl } from "@/lib/production-image-fix";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackType?: "article" | "category" | "author" | "default";
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

// الصور الافتراضية المحلية
const LOCAL_FALLBACK_IMAGES = {
  article: "/images/placeholder-featured.jpg",
  category: "/images/category-default.jpg",
  author: "/images/default-avatar.jpg",
  default: "/images/placeholder-featured.jpg",
};

// Cloudinary fallbacks from production-image-fix.ts
const CLOUDINARY_FALLBACKS = {
  article:
    "https://res.cloudinary.com/dybhezmvb/image/upload/v1753111461/defaults/article-placeholder.jpg",
  category:
    "https://res.cloudinary.com/dybhezmvb/image/upload/v1753111461/defaults/category-placeholder.jpg",
  author:
    "https://res.cloudinary.com/dybhezmvb/image/upload/v1753111461/defaults/default-avatar.png",
  default:
    "https://res.cloudinary.com/dybhezmvb/image/upload/v1753111461/defaults/article-placeholder.jpg",
};

export default function SafeImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  fallbackType = "default",
  priority = false,
  fill = false,
  sizes,
  style,
}: SafeImageProps) {
  // تهيئة imageSrc بالصورة الافتراضية مباشرة (استخدم المحلية أولاً)
  const [imageSrc, setImageSrc] = useState<string>(
    LOCAL_FALLBACK_IMAGES[fallbackType]
  );
  const [fallbackAttempted, setFallbackAttempted] = useState<boolean>(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // إذا لم يكن هناك src، استخدم الصورة الافتراضية
    if (!src) {
      setImageSrc(LOCAL_FALLBACK_IMAGES[fallbackType]);
      setIsError(false);
      setIsLoading(false);
      return;
    }

    // تحديد بيئة التشغيل
    const isProduction =
      process.env.NODE_ENV === "production" ||
      (typeof window !== "undefined" &&
        window.location.hostname !== "localhost");

    // معالجة مسار الصورة
    const processedSrc = isProduction
      ? getProductionImageUrl(src, {
          width,
          height,
          quality: 85,
          fallbackType,
        })
      : getImageUrl(src, {
          width,
          height,
          fallbackType,
        });

    // التأكد من أن processedSrc ليس فارغاً
    if (processedSrc && processedSrc.trim() !== "") {
      setImageSrc(processedSrc);
      setIsError(false);
      setIsLoading(true);
      setFallbackAttempted(false); // إعادة تعيين عند تغيير المصدر
    } else {
      setImageSrc(LOCAL_FALLBACK_IMAGES[fallbackType]);
      setIsError(true);
      setIsLoading(false);
    }
  }, [src, width, height, fallbackType]);

  const handleError = () => {
    // إذا حصل خطأ وكنا نستخدم بالفعل الصورة الافتراضية المحلية
    if (imageSrc === LOCAL_FALLBACK_IMAGES[fallbackType]) {
      // جرب استخدام الصورة الافتراضية من Cloudinary كملاذ أخير
      if (!fallbackAttempted) {
        console.log(
          `⚠️ استخدام الصورة الافتراضية من Cloudinary: ${fallbackType}`
        );
        setImageSrc(CLOUDINARY_FALLBACKS[fallbackType]);
        setFallbackAttempted(true);
        return;
      }
    }

    // إذا لم تكن الصورة الافتراضية المحلية، استخدمها الآن
    if (!fallbackAttempted) {
      console.log(
        `⚠️ فشل تحميل الصورة، استخدام الصورة الافتراضية المحلية: ${fallbackType}`
      );
      setImageSrc(LOCAL_FALLBACK_IMAGES[fallbackType]);
      setFallbackAttempted(true);
    } else {
      // لقد حاولنا بالفعل استخدام صورتين افتراضيتين، ولا شيء يعمل
      console.error(
        `❌ فشل تحميل الصورة الأصلية والصور الاحتياطية: ${imageSrc}`
      );
      setIsError(true);
    }

    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`relative ${fill ? "w-full h-full" : ""} ${className}`}
      style={style}
    >
      {/* شريط التحميل */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}

      {fill ? (
        <Image
          fill
          src={imageSrc}
          alt={alt}
          className={`${
            isLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-300 object-cover`}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
          sizes={sizes || "100vw"}
        />
      ) : (
        <Image
          width={width}
          height={height}
          src={imageSrc}
          alt={alt}
          className={`${
            isLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
        />
      )}
    </div>
  );
}
