"use client";

import { getImageUrl } from "@/lib/image-utils";
import Image from "next/image";
import React, { useState, useEffect } from "react";

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
}

export default function CloudImageFixed({
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
}: CloudImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>("");

  // معالجة رابط الصورة
  useEffect(() => {
    try {
      const processedUrl = getImageUrl(hasError ? null : src, {
        width,
        height,
        quality,
        fallbackType,
      });
      
      setImageUrl(processedUrl);
      
      // سجل تشخيصي
      console.log(`🖼️ CloudImageFixed - معالجة الصورة:`, {
        originalSrc: src,
        processedUrl,
        fallbackType,
        hasError,
        width,
        height
      });
    } catch (error) {
      console.error("خطأ في معالجة رابط الصورة:", error);
      setImageUrl(getImageUrl(null, { fallbackType }));
    }
  }, [src, hasError, width, height, quality, fallbackType]);

  const handleError = (error: any) => {
    console.log(`❌ فشل تحميل الصورة: ${src} - التبديل إلى fallback`);
    console.error("تفاصيل خطأ الصورة:", error);
    
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    console.log(`✅ تم تحميل الصورة بنجاح: ${imageUrl}`);
    setIsLoading(false);
  };

  // إذا لم يتم تحديد URL الصورة بعد، اعرض placeholder
  if (!imageUrl) {
    return (
      <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center`}>
        <span className="text-gray-400 text-xs">تحميل...</span>
      </div>
    );
  }

  // للصور التي تملأ الحاوية
  if (fill) {
    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
        <Image
          src={imageUrl}
          alt={alt}
          fill={true}
          sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          quality={quality}
          priority={priority}
          className={`${className} object-cover object-center ${
            isLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          onLoadingComplete={() => setIsLoading(false)}
          style={{ 
            objectFit: "cover", 
            width: "100%", 
            height: "100%",
            display: "block"
          }}
          unoptimized={false} // استخدام تحسين Next.js
        />
      </div>
    );
  }

  // للصور ذات الأبعاد المحددة
  const validWidth = width && !isNaN(width) ? width : 800;
  const validHeight = height && !isNaN(height) ? height : 600;

  return (
    <div className="relative" style={{ width: validWidth, height: validHeight }}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center"
          style={{ width: validWidth, height: validHeight }}
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt}
        width={validWidth}
        height={validHeight}
        quality={quality}
        priority={priority}
        className={`${className} object-cover object-center ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
        onLoadingComplete={() => setIsLoading(false)}
        style={{ 
          objectFit: "cover",
          display: "block"
        }}
        unoptimized={false} // استخدام تحسين Next.js
      />
    </div>
  );
}

// مكون بسيط للاختبار السريع
export function SimpleImageTest({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div className="w-full h-48 bg-red-100 border border-red-300 rounded flex items-center justify-center">
        <span className="text-red-600 text-sm">فشل تحميل الصورة</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-500 text-sm">تحميل الصورة...</span>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover rounded ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        style={{ display: 'block' }}
        unoptimized
      />
    </div>
  );
}
