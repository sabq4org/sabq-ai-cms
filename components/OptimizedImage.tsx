'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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
  onError
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Fallback للصور المفقودة
  const fallbackSrc = '/placeholder.jpg';
  
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);
  
  const handleError = () => {
    console.warn(`فشل تحميل الصورة: ${src}`);
    setHasError(true);
    setImgSrc(fallbackSrc);
    onError?.();
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