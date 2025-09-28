"use client";

import { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";
import { motion } from "framer-motion";

interface SmartImageLoaderProps extends Omit<ImageProps, 'onLoadingComplete'> {
  lowQualitySrc?: string;
  blurEffect?: boolean;
  fadeInDuration?: number;
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
}

export default function SmartImageLoader({
  src,
  alt,
  width,
  height,
  lowQualitySrc,
  blurEffect = true,
  fadeInDuration = 0.5,
  loadingPlaceholder,
  errorPlaceholder,
  onLoadSuccess,
  onLoadError,
  className,
  style,
  ...props
}: SmartImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // تحميل الصورة عالية الجودة بعد تحميل الصورة منخفضة الجودة
  useEffect(() => {
    if (lowQualitySrc && currentSrc === lowQualitySrc) {
      const highQualityImage = new window.Image();
      highQualityImage.src = src as string;
      
      highQualityImage.onload = () => {
        setCurrentSrc(src);
      };
      
      highQualityImage.onerror = (error) => {
        console.error('فشل تحميل الصورة عالية الجودة:', error);
        if (onLoadError) {
          onLoadError(new Error('فشل تحميل الصورة عالية الجودة'));
        }
      };
    }
  }, [lowQualitySrc, currentSrc, src, onLoadError]);
  
  // التعامل مع اكتمال التحميل
  const handleLoadingComplete = () => {
    setIsLoading(false);
    if (onLoadSuccess) {
      onLoadSuccess();
    }
  };
  
  // التعامل مع خطأ التحميل
  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
    if (onLoadError) {
      onLoadError(new Error('فشل تحميل الصورة'));
    }
  };
  
  // عرض مؤشر التحميل
  if (isLoading && loadingPlaceholder) {
    return (
      <div 
        className={className} 
        style={{ 
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style 
        }}
      >
        {loadingPlaceholder}
      </div>
    );
  }
  
  // عرض مؤشر الخطأ
  if (isError && errorPlaceholder) {
    return (
      <div 
        className={className} 
        style={{ 
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style 
        }}
      >
        {errorPlaceholder}
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0.5 : 1 }}
      transition={{ duration: fadeInDuration }}
      className={`relative overflow-hidden ${className || ''}`}
      style={style}
    >
      <Image
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
        className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          filter: blurEffect && isLoading ? 'blur(10px)' : 'none',
          transition: 'filter 0.5s ease-out',
        }}
        loading="lazy"
        {...props}
      />
      
      {isLoading && !loadingPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </motion.div>
  );
}
