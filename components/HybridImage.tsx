'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface HybridImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function HybridImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes
}: HybridImageProps) {
  const [imageError, setImageError] = useState(false);
  const [useSimpleImg, setUseSimpleImg] = useState(false);

  // تجبر استخدام HTML img للصور من Cloudinary أو في حالة الخطأ
  useEffect(() => {
    if (src.includes('cloudinary.com') || imageError) {
      setUseSimpleImg(true);
    }
  }, [src, imageError]);

  console.log('🔄 HybridImage:', { src, useSimpleImg, imageError });

  // النسخة البسيطة - HTML img
  if (useSimpleImg) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className}`}
        style={fill ? { 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          objectFit: 'cover'
        } : { 
          width: width || 'auto', 
          height: height || 'auto',
          objectFit: 'cover'
        }}
        onLoad={() => console.log('✅ HTML img loaded successfully:', src)}
        onError={(e) => {
          console.error('❌ HTML img failed, trying placeholder:', src);
          const target = e.target as HTMLImageElement;
          target.src = '/images/placeholder-featured.jpg';
        }}
      />
    );
  }

  // النسخة المحسنة - Next.js Image
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      unoptimized={true}
      onLoad={() => console.log('✅ Next.js Image loaded successfully:', src)}
      onError={() => {
        console.error('❌ Next.js Image failed, switching to HTML img:', src);
        setImageError(true);
        setUseSimpleImg(true);
      }}
    />
  );
}
