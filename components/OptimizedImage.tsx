'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageService } from '@/lib/services/imageService';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onError?: () => void;
  category?: string; // إضافة category للصور الاحتياطية المناسبة
}

// توليد placeholder بسيط
const generatePlaceholder = (width = 10, height = 10): string => {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) return '';
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};

export default function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  priority = false,
  fill = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  onError,
  category
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    if (!src) {
      setImgSrc(ImageService.getFallbackImage(category));
      return;
    }

    // معالجة روابط S3 بطريقة خاصة
    if (src.includes('amazonaws.com')) {
      try {
        // استخدام API الصور الداخلية مباشرة
        const apiUrl = `/api/images/optimize?url=${encodeURIComponent(src)}&w=${width}&h=${height}&f=webp&q=${quality}`;
        setImgSrc(apiUrl);
      } catch (error) {
        console.warn('خطأ في معالجة صورة S3:', error);
        // مواصلة المعالجة العادية
        const optimizedUrl = ImageService.getOptimizedImageUrl(src, {
          width,
          height,
          quality,
          format: 'webp',
          fit: 'cover'
        });

        setImgSrc(optimizedUrl);
      }
      setHasError(false);
      return;
    }

    // تحسين الصورة باستخدام الخدمة الجديدة
    const optimizedUrl = ImageService.getOptimizedImageUrl(src, {
      width,
      height,
      quality,
      format: 'webp',
      fit: 'cover'
    });

    setImgSrc(optimizedUrl);
    setHasError(false);
  }, [src, width, height, quality, category]);
  
  const handleError = () => {
    console.warn(`فشل تحميل الصورة: ${src}`);
    if (!hasError) {
      setHasError(true);
      setImgSrc(ImageService.getFallbackImage(category));
      onError?.();
    }
  };
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  // إنشاء blur placeholder إذا لم يتم توفيره
  const placeholderData = blurDataURL || generatePlaceholder();
  
  // تحسين مسار الصورة
  const optimizedSrc = imgSrc.startsWith('http') ? imgSrc : 
    imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`;
  
  if (fill) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && placeholder === 'blur' && (
          <div 
            className="absolute inset-0 bg-gray-200 animate-pulse"
            style={{ filter: 'blur(20px)' }}
          />
        )}
        <Image
          src={optimizedSrc}
          alt={alt}
          fill
          quality={quality}
          priority={priority}
          className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ filter: 'blur(20px)' }}
        />
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={placeholderData}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}