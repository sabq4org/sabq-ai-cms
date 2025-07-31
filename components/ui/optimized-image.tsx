'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = '/images/placeholder-featured.jpg', // صورة بديلة افتراضية
  aspectRatio = 'auto',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px',
  priority = false,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // تحويل مسار الصورة إلى صيغ مختلفة
  const getImageFormat = (url: string, format: string) => {
    // إذا كانت الصورة من S3 أو CDN، نفترض أن الخادم يدعم تحويل الصيغ
    const urlParts = url.split('.');
    if (urlParts.length > 1) {
      urlParts[urlParts.length - 1] = format;
      return urlParts.join('.');
    }
    return url;
  };

  const aspectRatioClasses = {
    '16:9': 'aspect-w-16 aspect-h-9',
    '4:3': 'aspect-w-4 aspect-h-3',
    '1:1': 'aspect-w-1 aspect-h-1',
    'auto': ''
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
    onError?.();
  };

  return (
    <div className={cn(
      'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
      aspectRatio !== 'auto' && aspectRatioClasses[aspectRatio],
      className
    )}>
      {/* مؤشر التحميل */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
        </div>
      )}

      {/* الصورة مع دعم صيغ متعددة */}
      <picture className={cn('block w-full h-full', aspectRatio !== 'auto' && 'absolute inset-0')}>
        {/* WebP format */}
        {!hasError && imageSrc !== fallbackSrc && (
          <>
            <source
              type="image/webp"
              srcSet={`
                ${getImageFormat(imageSrc, 'webp')} 1x,
                ${getImageFormat(imageSrc, 'webp')}?w=1600 2x
              `}
              sizes={sizes}
            />
            
            {/* AVIF format (أحدث وأكثر كفاءة) */}
            <source
              type="image/avif"
              srcSet={`
                ${getImageFormat(imageSrc, 'avif')} 1x,
                ${getImageFormat(imageSrc, 'avif')}?w=1600 2x
              `}
              sizes={sizes}
            />
          </>
        )}

        {/* الصورة الافتراضية */}
        <img
          src={imageSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'w-full h-full transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            aspectRatio === 'auto' ? 'object-contain' : 'object-cover'
          )}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
        />
      </picture>

      {/* رسالة الخطأ */}
      {hasError && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 text-xs text-yellow-800 dark:text-yellow-200">
          تم استخدام صورة بديلة
        </div>
      )}
    </div>
  );
}