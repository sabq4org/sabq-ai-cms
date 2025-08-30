"use client";

import { getImageUrl } from "@/lib/image-utils";
import { getProductionImageUrl } from "@/lib/production-image-fix";
import Image from "next/image";
import React, { useState } from "react";
import SmartPlaceholder from "./SmartPlaceholder";

interface CloudImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  fallbackType?: "article" | "author" | "category" | "default";
  quality?: number;
  onError?: () => void;
  unoptimized?: boolean;
  fetchPriority?: "high" | "low";
}

export default function CloudImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  priority = false,
  fill = false,
  sizes,
  fallbackType = "default",
  quality = 80,
  onError,
  unoptimized = false,
  fetchPriority,
}: CloudImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // الحصول على رابط الصورة المحسن مع معالجة أفضل للأخطاء
  const imageUrl = React.useMemo(() => {
    try {
      // إذا لم يكن هناك src أو كان فارغاً، استخدم الصورة الافتراضية مباشرة
      if (!src || src.trim() === "" || hasError) {
        // سيتم استخدام SmartPlaceholder في مكان آخر
        return "/images/placeholder-featured.jpg";
      }

      // تحديد بيئة التشغيل - استخدام تحديد أكثر دقة للإنتاج
      const isProduction =
        process.env.NODE_ENV === "production" ||
        (typeof window !== "undefined" &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1" &&
          !window.location.hostname.includes("192.168.") &&
          !window.location.hostname.includes("dev-"));

      // استخدام معالج الإنتاج في بيئة الإنتاج
      if (isProduction) {
        return getProductionImageUrl(src, {
          width,
          height,
          quality,
          fallbackType,
        });
      }

      // في بيئة التطوير، استخدم المعالج العادي
      return getImageUrl(src, {
        width,
        height,
        quality,
        fallbackType,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("خطأ في معالجة رابط الصورة:", error);
      }
      // إرجاع الصورة الافتراضية عند حدوث خطأ
      return "/images/placeholder-featured.jpg";
    }
  }, [src, hasError, width, height, quality, fallbackType]);

  const handleError = () => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`❌ فشل تحميل الصورة: ${src} - التبديل إلى fallback`);
    }
    
    // تجربة الصورة الافتراضية مباشرة
    setHasError(true);
    setIsLoading(false);
    onError?.();

    // إضافة سجل تشخيصي مفصل
    if (process.env.NODE_ENV !== "production") {
      console.log(`🔍 تشخيص الصورة:
        - المصدر الأصلي: ${src}
        - نوع البديل: ${fallbackType}
        - العرض: ${width}
        - الارتفاع: ${height}
        - URL المعالج: ${imageUrl}
        - hasError: ${hasError}
      `);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // للصور التي تملأ الحاوية
  if (fill) {
    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <span className="text-4xl">📰</span>
          </div>
        )}
        <Image
          src={imageUrl}
          alt={alt}
          fill={true}
          sizes={
            sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          quality={quality}
          priority={priority}
          unoptimized={unoptimized}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={fetchPriority}
          className={`${className} object-cover object-center ${
            isLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          // onLoadingComplete أكثر اعتمادية خاصة مع الصور المحملة مسبقاً و SSR
          onLoadingComplete={() => setIsLoading(false)}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </>
    );
  }

  // للصور ذات الأبعاد المحددة - التحقق من صحة القيم
  const validWidth = width && !isNaN(width) ? width : 800;
  const validHeight = height && !isNaN(height) ? height : 600;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width: validWidth, height: validHeight }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <Image
        src={imageUrl}
        alt={alt || "صورة"}
        width={validWidth}
        height={validHeight}
        quality={quality}
        priority={priority}
        unoptimized={unoptimized}
        loading={priority ? "eager" : "lazy"}
        sizes={
          sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
        fetchPriority={fetchPriority}
        className={`object-cover object-center rounded-xl w-full h-full ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        onLoadingComplete={() => setIsLoading(false)}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
      />
    </div>
  );
}

// مكون للصور الدائرية (للمؤلفين)
export function CloudAvatar({
  src,
  alt,
  size = 40,
  className = "",
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <CloudImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      fallbackType="author"
    />
  );
}

// مكون لصور المقالات
export function ArticleImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <CloudImage
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={className}
      fallbackType="article"
      priority={priority}
    />
  );
}
