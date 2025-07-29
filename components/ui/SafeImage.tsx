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
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // معالجة مسار الصورة
    const processedSrc = getImageUrl(src, {
      width,
      height,
      fallbackType
    });
    
    setImageSrc(processedSrc);
    setIsError(false);
    setIsLoading(true);
  }, [src, width, height, fallbackType]);

  const handleError = () => {
    console.error(`❌ فشل تحميل الصورة: ${imageSrc}`);
    
    // استخدام صورة احتياطية حسب النوع
    const fallbacks = {
      article: '/images/placeholder-featured.jpg',
      category: '/images/category-default.jpg',
      author: '/images/default-avatar.jpg',
      default: '/images/placeholder-featured.jpg'
    };
    
    setImageSrc(fallbacks[fallbackType]);
    setIsError(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // في حالة عدم وجود src، استخدم الصورة الافتراضية مباشرة
  if (!src && !isError) {
    const fallbacks = {
      article: '/images/placeholder-featured.jpg',
      category: '/images/category-default.jpg',
      author: '/images/default-avatar.jpg',
      default: '/images/placeholder-featured.jpg'
    };
    
    setImageSrc(fallbacks[fallbackType]);
  }

  const imageProps = fill ? { fill: true } : { width, height };

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`} style={style}>
      {/* شريط التحميل */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}
      
      <Image
        {...imageProps}
        src={imageSrc}
        alt={alt}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${fill ? 'object-cover' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
      />
    </div>
  );
} 