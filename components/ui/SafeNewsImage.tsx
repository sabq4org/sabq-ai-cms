/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, CSSProperties } from 'react';
import Image from 'next/image';
import { getSafeImageUrl, isValidImageUrl } from '@/lib/image-utils';

interface SafeNewsImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  style?: CSSProperties;
  imageType?: 'featured' | 'article' | 'news' | 'author' | 'category' | 'default';
}

export default function SafeNewsImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  width = 300,
  height = 200,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
  decoding = 'async',
  fetchPriority,
  style,
  imageType = 'default',
}: SafeNewsImageProps) {
  // استخدام نظام الصور المُحسَّن
  const [imageSrc, setImageSrc] = useState(() => {
    return isValidImageUrl(src) ? src : getSafeImageUrl(src, imageType);
  });
  const [imageError, setImageError] = useState(false);
  
  // التحقق من نوع الصورة
  const isDataUrl = imageSrc.startsWith('data:image/');
  const isExternalUrl = imageSrc.startsWith('http') || imageSrc.includes('cloudinary.com') || imageSrc.includes('s3.amazonaws.com');
  
  const handleError = () => {
    if (!imageError) {
      setImageError(true);
      // استخدام الصورة البديلة المناسبة عند حدوث خطأ
      setImageSrc(getSafeImageUrl(null, imageType));
    }
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
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
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
      sizes={sizes}
      onError={handleError}
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
      fetchPriority={fetchPriority}
    />
  );
}
