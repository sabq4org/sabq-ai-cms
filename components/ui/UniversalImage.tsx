"use client";

import {
  createSafeImageHandler,
  getResponsiveImageSizes,
  getSafeImageProps,
} from "@/lib/safe-image-props";
import { ImageOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface UniversalImageProps {
  src?: string | null;
  article?: any; // إضافة دعم كامل للمقال
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackType?: "article" | "author" | "category" | "default";
  showLoader?: boolean;
  responsiveType?: "hero" | "card" | "thumbnail" | "full";
  onError?: (error: any) => void;
  onLoad?: () => void;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty" | `data:image/${string}`;
  blurDataURL?: string;
}

/**
 * مكون صورة عالمي آمن ومحسّن
 * يعالج جميع حالات الأخطاء ويضمن التوافق مع Next.js
 */
export default function UniversalImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  fallbackType = "default",
  showLoader = true,
  responsiveType = "card",
  onError,
  onLoad,
  priority = false,
  quality = 85,
  placeholder = "empty",
  blurDataURL,
  ...restProps
}: UniversalImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // إنشاء معالجات آمنة
  const { handleError, handleLoad } = createSafeImageHandler({
    onError: (e) => {
      setHasError(true);
      setIsLoading(false);
      onError?.(e);
    },
    onLoad: () => {
      setIsLoading(false);
      onLoad?.();
    },
    fallbackType,
  });

  // الحصول على خصائص آمنة للصورة
  const safeProps = getSafeImageProps({
    src: hasError ? undefined : src,
    alt,
    width,
    height,
    fill,
    priority,
    quality,
    placeholder,
    blurDataURL,
    ...restProps,
  });

  // إضافة sizes للصور التي تستخدم fill
  if (safeProps.fill) {
    safeProps.sizes =
      safeProps.sizes || getResponsiveImageSizes(responsiveType);
  }

  // إذا فشلت الصورة تماماً
  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={fill ? { position: "absolute", inset: 0 } : { width, height }}
      >
        <ImageOff className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2" />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          فشل تحميل الصورة
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative ${fill ? "w-full h-full" : ""} ${className}`}
      style={fill ? {} : { width: safeProps.width, height: safeProps.height }}
    >
      {/* مؤشر التحميل */}
      {showLoader && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <Loader2 className="w-6 h-6 text-gray-400 dark:text-gray-600 animate-spin" />
        </div>
      )}

      {/* الصورة الفعلية */}
      <Image
        {...safeProps}
        className={`${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300 ${fill ? "object-cover" : ""}`}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={
          safeProps.src?.includes("cloudinary.com") ||
          safeProps.src?.startsWith("data:")
        }
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

/**
 * مكون صورة البطل (Hero)
 */
export function HeroImage(props: Omit<UniversalImageProps, "responsiveType">) {
  return <UniversalImage {...props} responsiveType="hero" priority />;
}

/**
 * مكون صورة البطاقة (Card)
 */
export function CardImage(props: Omit<UniversalImageProps, "responsiveType">) {
  return <UniversalImage {...props} responsiveType="card" />;
}

/**
 * مكون الصورة المصغرة (Thumbnail)
 */
export function ThumbnailImage(
  props: Omit<UniversalImageProps, "responsiveType">
) {
  return (
    <UniversalImage {...props} responsiveType="thumbnail" showLoader={false} />
  );
}

/**
 * مكون صورة الملف الشخصي (Avatar)
 */
export function AvatarImage({
  size = 40,
  ...props
}: Omit<UniversalImageProps, "width" | "height" | "fill" | "responsiveType"> & {
  size?: number;
}) {
  return (
    <UniversalImage
      {...props}
      width={size}
      height={size}
      fallbackType="author"
      showLoader={false}
      className={`rounded-full ${props.className || ""}`}
    />
  );
}
