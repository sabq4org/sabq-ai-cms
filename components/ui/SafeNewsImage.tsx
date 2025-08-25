'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeNewsImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function SafeNewsImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  width = 300,
  height = 200,
  priority = false
}: SafeNewsImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  
  // التحقق من نوع الصورة
  const isDataUrl = src.startsWith('data:image/');
  const isExternalUrl = src.startsWith('http') || src.includes('cloudinary.com') || src.includes('s3.amazonaws.com');
  
  const handleError = () => {
    setImageError(true);
    setImageSrc('/images/placeholder-news.svg');
  };

  // استخدام img عادي للصور base64 أو في حالة وجود خطأ
  if (isDataUrl || imageError) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        loading={loading}
        onError={handleError}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }

  // استخدام Next.js Image للصور العادية
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      loading={loading}
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      onError={handleError}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
