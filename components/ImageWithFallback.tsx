'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fallbackSrc?: string;
  loadingText?: string;
  errorText?: string;
  showLoadingIndicator?: boolean;
  onLoadComplete?: () => void;
  onError?: (error: any) => void;
}

export default function ImageWithFallback({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder,
  blurDataURL,
  sizes,
  fallbackSrc = '/images/placeholder-featured.jpg',
  loadingText = 'جاري تحميل الصورة...',
  errorText = 'فشل في تحميل الصورة',
  showLoadingIndicator = true,
  onLoadComplete,
  onError
}: ImageWithFallbackProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setImageState('loaded');
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback((error: any) => {
    console.warn('فشل تحميل الصورة:', currentSrc, error);
    setImageState('error');
    
    // جرب الصورة البديلة إذا لم نكن نستخدمها بالفعل
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setImageState('loading');
    }
    
    onError?.(error);
  }, [currentSrc, fallbackSrc, onError]);

  const imageProps = {
    src: currentSrc,
    alt,
    className: `${className} transition-opacity duration-300 ${imageState === 'loaded' ? 'opacity-100' : 'opacity-0'}`,
    priority,
    quality,
    placeholder,
    blurDataURL,
    sizes,
    onLoad: handleLoad,
    onError: handleError,
    ...(fill ? { fill: true } : { width, height })
  };

  return (
    <div className="relative">
      <Image {...imageProps} />
      
      {/* مؤشر التحميل */}
      {showLoadingIndicator && imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 transition-opacity duration-300">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{loadingText}</p>
          </div>
        </div>
      )}
      
      {/* رسالة خطأ */}
      {imageState === 'error' && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400">{errorText}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">تحقق من الاتصال بالإنترنت</p>
          </div>
        </div>
      )}
    </div>
  );
}
