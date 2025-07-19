'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  lazy?: boolean;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc,
  lazy = true,
  quality = 80, // تحسين جودة أفضل
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer للتحميل الكسول
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  // معالج تحميل الصورة
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // معالج خطأ الصورة
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    const error = new Error(`Failed to load image: ${currentSrc}`);
    onError?.(error);

    // محاولة استخدام الصورة البديلة
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    }
  };

  // إعادة المحاولة
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setCurrentSrc(src);
  };

  // مكون التحميل
  const LoadingPlaceholder = () => (
    <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-xs text-gray-500 dark:text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  );

  // مكون الخطأ
  const ErrorPlaceholder = () => (
    <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
      <div className="text-center p-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">فشل تحميل الصورة</p>
        <button
          onClick={handleRetry}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );

  // مكون العنصر النائب
  const Placeholder = () => (
    <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
      <ImageIcon className="w-8 h-8 text-gray-400" />
    </div>
  );

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isInView ? (
        <Placeholder />
      ) : hasError ? (
        <ErrorPlaceholder />
      ) : (
        <>
          {isLoading && <LoadingPlaceholder />}
          <Image
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            quality={quality}
            priority={priority}
            className={`transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              objectFit: 'cover',
              ...(isLoading && { position: 'absolute', top: 0, left: 0 })
            }}
          />
        </>
      )}
    </div>
  );
};

export default OptimizedImage;