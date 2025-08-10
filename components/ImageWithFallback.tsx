"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  unoptimized?: boolean;
}

const DEFAULT_FALLBACKS = {
  article: "/images/placeholder-featured.jpg",
  category: "/images/category-default.jpg",
  author: "/images/default-avatar.jpg",
  muqtarab: "/images/default-muqtarab.jpg",
  default: "/images/placeholder.jpg",
};

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  priority = false,
  quality = 85,
  sizes,
  style,
  fallbackSrc,
  unoptimized = false,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // تحديد نوع الصورة من السياق
  const getDefaultFallback = () => {
    if (fallbackSrc) return fallbackSrc;
    
    const srcLower = src?.toLowerCase() || "";
    if (srcLower.includes("category")) return DEFAULT_FALLBACKS.category;
    if (srcLower.includes("author") || srcLower.includes("avatar")) return DEFAULT_FALLBACKS.author;
    if (srcLower.includes("muqtarab")) return DEFAULT_FALLBACKS.muqtarab;
    if (srcLower.includes("article") || srcLower.includes("featured")) return DEFAULT_FALLBACKS.article;
    
    return DEFAULT_FALLBACKS.default;
  };

  const handleError = () => {
    if (!hasError) {
      console.warn(`Image failed to load: ${src}`);
      setHasError(true);
      const fallback = getDefaultFallback();
      
      // إذا كان الفولباك هو SVG، نستخدمه مباشرة
      if (fallback.endsWith('.svg')) {
        setImgSrc(fallback);
      } else {
        // محاولة تحميل صورة من placeholder service
        setImgSrc(`https://via.placeholder.com/${width || 800}x${height || 600}?text=${encodeURIComponent(alt || 'صورة')}`);
      }
    }
  };

  // التحقق من صحة الـ URL
  const isValidSrc = (url: string) => {
    if (!url) return false;
    
    // السماح بـ SVG files
    if (url.endsWith('.svg')) return true;
    
    // السماح بـ placeholder services
    if (url.includes('placeholder.com')) return true;
    
    // السماح بالروابط النسبية والمطلقة
    return /^(https?:\/\/|\/|data:)/.test(url);
  };

  // إذا كان الـ src غير صالح من البداية
  if (!isValidSrc(imgSrc)) {
    const fallback = getDefaultFallback();
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{
          width: fill ? "100%" : width,
          height: fill ? "100%" : height,
          ...style,
        }}
      >
        <span className="text-gray-400 dark:text-gray-500 text-sm">
          {alt || "صورة"}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      fill={fill}
      className={className}
      priority={priority}
      quality={quality}
      sizes={sizes}
      style={style}
      onError={handleError}
      unoptimized={unoptimized || imgSrc.endsWith('.svg')}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
}