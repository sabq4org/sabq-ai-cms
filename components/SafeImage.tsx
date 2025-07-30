'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { ImageOff, Loader2 } from 'lucide-react';

interface SafeImageProps {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  showLoader?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  width = 400,
  height = 300,
  className = '',
  fallbackSrc = 'https://via.placeholder.com/400x300/2563eb/ffffff?text=سبق',
  showLoader = true,
  objectFit = 'cover',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  quality = 75,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    console.warn('Image failed to load:', currentSrc);
    setIsLoading(false);
    
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }
    
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // إذا لم يكن هناك مصدر للصورة
  if (!src && !fallbackSrc) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width, height }}
      >
        <ImageOff className="w-8 h-8 text-gray-400 dark:text-gray-600" />
      </div>
    );
  }

  // إذا فشل تحميل الصورة تماماً
  if (hasError) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width, height }}
      >
        <ImageOff className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2" />
        <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
          فشل تحميل الصورة
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* مؤشر التحميل */}
      {isLoading && showLoader && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10"
          style={{ width, height }}
        >
          <Loader2 className="w-6 h-6 text-gray-400 dark:text-gray-600 animate-spin" />
        </div>
      )}
      
      {/* الصورة الفعلية */}
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${objectFit === 'cover' ? 'object-cover' : 
                   objectFit === 'contain' ? 'object-contain' : 
                   objectFit === 'fill' ? 'object-fill' : 
                   objectFit === 'none' ? 'object-none' : 'object-scale-down'} 
                   ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        quality={quality}
        unoptimized={currentSrc.startsWith('http') && !currentSrc.includes('cloudinary')}
      />
    </div>
  );
};

export default SafeImage;