'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
}

export function CloudinaryImage({
  src,
  alt,
  width = 200,
  height = 150,
  className = '',
  fallbackSrc = '/placeholder.jpg',
  onError
}: CloudinaryImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // التحقق من صحة URL
  const isValidUrl = (url: string) => {
    try {
      // التحقق من أن URL يبدأ بـ http أو https أو /
      if (!url || url.trim() === '') return false;
      if (url.startsWith('/')) return true; // مسار محلي
      new URL(url); // سيرمي خطأ إذا كان URL غير صحيح
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // إعادة تعيين الحالة عند تغيير src
    if (src && isValidUrl(src)) {
      setImgSrc(src);
      setHasError(false);
      setIsLoading(true);
    } else {
      setImgSrc(fallbackSrc);
      setHasError(true);
      setIsLoading(false);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    console.error(`❌ فشل تحميل الصورة: ${src}`);
    setImgSrc(fallbackSrc);
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // التحقق من أن الصورة ليست placeholder
  const isPlaceholder = imgSrc.includes('placeholder') || !src || src === '' || hasError;

  return (
    <div className="relative">
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={isPlaceholder} // تجنب تحسين placeholder
      />
      
      {/* مؤشر التحميل */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* تحذير عند استخدام placeholder */}
      {isPlaceholder && (
        <div className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          صورة مؤقتة
        </div>
      )}
    </div>
  );
}

export default CloudinaryImage; 