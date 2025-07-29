'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackType?: 'article' | 'category' | 'author' | 'default';
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

// الصور الافتراضية حسب النوع
const FALLBACK_IMAGES = {
  article: '/images/placeholder-featured.jpg',
  category: '/images/category-default.jpg',  
  author: '/images/default-avatar.jpg',
  default: '/images/placeholder-featured.jpg'
};

export default function SafeImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  fallbackType = 'default',
  priority = false,
  fill = false,
  sizes,
  style
}: SafeImageProps) {
  // تهيئة imageSrc بالصورة الافتراضية مباشرة
  const [imageSrc, setImageSrc] = useState<string>(FALLBACK_IMAGES[fallbackType]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // إذا لم يكن هناك src، استخدم الصورة الافتراضية
    if (!src) {
      setImageSrc(FALLBACK_IMAGES[fallbackType]);
      setIsError(false);
      setIsLoading(false);
      return;
    }

    // معالجة مسار الصورة
    const processedSrc = getImageUrl(src, {
      width,
      height,
      fallbackType
    });
    
    // التأكد من أن processedSrc ليس فارغاً
    if (processedSrc && processedSrc.trim() !== '') {
      setImageSrc(processedSrc);
      setIsError(false);
      setIsLoading(true);
    } else {
      setImageSrc(FALLBACK_IMAGES[fallbackType]);
      setIsError(true);
      setIsLoading(false);
    }
  }, [src, width, height, fallbackType]);

  const handleError = () => {
    console.error(`❌ فشل تحميل الصورة: ${imageSrc}`);
    
    // استخدام صورة احتياطية
    setImageSrc(FALLBACK_IMAGES[fallbackType]);
    setIsError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`} style={style}>
      {/* شريط التحميل */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}
      
      {fill ? (
        <Image
          fill
          src={imageSrc}
          alt={alt}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 object-cover`}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
          sizes={sizes || '100vw'}
        />
      ) : (
        <Image
          width={width}
          height={height}
          src={imageSrc}
          alt={alt}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
        />
      )}
    </div>
  );
} 