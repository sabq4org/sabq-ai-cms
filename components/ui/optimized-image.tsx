'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const [isInView, setIsInView] = useState(priority); // إذا كانت أولوية، فهي دائماً مرئية
  const imgRef = useRef<HTMLImageElement>(null);

  // مراقب التقاطع للتحميل المؤجل المحسن
  useEffect(() => {
    if (priority || isInView) return; // لا نحتاج مراقب إذا كانت أولوية أو مرئية بالفعل

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // بدء التحميل قبل 50px من الظهور
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // تحويل مسار الصورة إلى صيغ مختلفة محسن
  const getImageFormat = (url: string, format: string) => {
    // دعم أفضل لـ CDN وخدمات الصور
    if (url.includes('cloudinary.com')) {
      // Cloudinary format conversion
      return url.replace(/\.(jpg|jpeg|png|webp)/, `.${format}`);
    }
    
    // إذا كانت الصورة من S3 أو CDN آخر
    const urlParts = url.split('.');
    if (urlParts.length > 1) {
      urlParts[urlParts.length - 1] = format;
      return urlParts.join('.');
    }
    return url;
  };

  const aspectRatioClasses = {
    '16:9': 'aspect-[16/9]',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
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
    <div 
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        aspectRatio !== 'auto' && aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* مؤشر التحميل محسن */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
            <div className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">جاري التحميل...</div>
          </div>
        </div>
      )}

      {/* تحميل الصورة فقط عند الحاجة */}
      {(isInView || priority) && (
        <picture className={cn('block w-full h-full', aspectRatio !== 'auto' && 'absolute inset-0')}>
          {/* AVIF format (أحدث وأكثر كفاءة) */}
          {!hasError && imageSrc !== fallbackSrc && (
            <source
              type="image/avif"
              srcSet={`
                ${getImageFormat(imageSrc, 'avif')} 1x,
                ${getImageFormat(imageSrc, 'avif')}?w=1600 2x
              `}
              sizes={sizes}
            />
          )}
          
          {/* WebP format */}
          {!hasError && imageSrc !== fallbackSrc && (
            <source
              type="image/webp"
              srcSet={`
                ${getImageFormat(imageSrc, 'webp')} 1x,
                ${getImageFormat(imageSrc, 'webp')}?w=1600 2x
              `}
              sizes={sizes}
            />
          )}

          {/* الصورة الافتراضية */}
          <img
            src={imageSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'w-full h-full transition-opacity duration-500',
              isLoading ? 'opacity-0' : 'opacity-100',
              aspectRatio === 'auto' ? 'object-contain' : 'object-cover'
            )}
            onLoad={handleLoad}
            onError={handleError}
            sizes={sizes}
          />
        </picture>
      )}

      {/* رسالة الخطأ محسنة */}
      {hasError && (
        <div className="absolute bottom-2 left-2 right-2 bg-yellow-50/90 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 text-xs text-yellow-800 dark:text-yellow-200 backdrop-blur-sm">
          ⚠️ تم استخدام صورة بديلة
        </div>
      )}
    </div>
  );
}