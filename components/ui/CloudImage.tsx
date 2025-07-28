'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getImageUrl, getOptimizedImageProps } from '@/lib/image-utils';

interface CloudImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  fallbackType?: 'article' | 'author' | 'category' | 'default';
  quality?: number;
  onError?: () => void;
}

export default function CloudImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  priority = false,
  fill = false,
  sizes,
  fallbackType = 'default',
  quality = 80,
  onError
}: CloudImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // الحصول على رابط الصورة المحسن مع معالجة أفضل للأخطاء
  const imageUrl = React.useMemo(() => {
    try {
      return getImageUrl(hasError ? null : src, {
        width,
        height,
        quality,
        fallbackType
      });
    } catch (error) {
      console.error('خطأ في معالجة رابط الصورة:', error);
      return getImageUrl(null, { fallbackType });
    }
  }, [src, hasError, width, height, quality, fallbackType]);

  const handleError = () => {
    console.log(`❌ فشل تحميل الصورة: ${src} - التبديل إلى fallback`);
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // للصور التي تملأ الحاوية
  if (fill) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizes || '100vw'}
          quality={quality}
          priority={priority}
          className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    );
  }

  // للصور ذات الأبعاد المحددة
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        className={`object-cover w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

// مكون للصور الدائرية (للمؤلفين)
export function CloudAvatar({
  src,
  alt,
  size = 40,
  className = ''
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
  className = '',
  priority = false
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