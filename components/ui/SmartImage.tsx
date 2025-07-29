'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { logError } from '@/lib/services/error-logger';

interface SmartImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackType?: 'avatar' | 'article' | 'general';
  retryCount?: number;
  silentFail?: boolean;
}

// صور الفولباك حسب النوع
const FALLBACK_IMAGES = {
  avatar: '/default-avatar.png',
  article: '/images/placeholder-featured.jpg',
  general: '/images/placeholder.jpg',
};

// قائمة النطاقات المعروفة بالمشاكل
const PROBLEMATIC_DOMAINS = [
  'unsplash.com',
  'cloudinary.com',
  'images.unsplash.com',
  'res.cloudinary.com',
];

export default function SmartImage({
  src,
  alt,
  fallbackSrc,
  fallbackType = 'general',
  retryCount = 1,
  silentFail = true,
  ...props
}: SmartImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [retries, setRetries] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // إعادة تعيين عند تغيير المصدر
    if (src !== imgSrc && !hasError) {
      setImgSrc(src);
      setRetries(0);
      setHasError(false);
    }
  }, [src]);

  const handleError = () => {
    const currentSrc = imgSrc.toString();
    
    // تحقق من النطاق
    const isProblematicDomain = PROBLEMATIC_DOMAINS.some(domain => 
      currentSrc.includes(domain)
    );

    // تحقق إذا كانت الصورة تأتي من AWS S3
    const isS3Image = currentSrc.includes('amazonaws.com');

    // سجل الخطأ بصمت إذا كان من نطاق معروف
    if ((isProblematicDomain || isS3Image) && process.env.NODE_ENV === 'development') {
      logError(new Error(`Image failed to load: ${currentSrc}`), {
        ignored: true,
        type: 'image_404',
        url: currentSrc,
        fallbackUsed: true,
        source: isS3Image ? 'S3' : 'Other'
      });
    }

    // بالنسبة للصور من S3، نستخدم مباشرة طريقة تحويل لخدمة الصور
    if (isS3Image && !hasError) {
      try {
        // محاولة تحويل رابط S3 إلى API داخلية
        const apiUrl = `/api/images/optimize?url=${encodeURIComponent(currentSrc)}&w=800&h=600&f=webp&q=80`;
        setImgSrc(apiUrl);
        setRetries(retryCount); // لا نرغب في محاولات أخرى
        return;
      } catch (e) {
        console.warn('فشل تحويل رابط S3:', e);
        // استمر في معالجة الخطأ العادية
      }
    }

    // محاولة إعادة التحميل
    if (retries < retryCount && !hasError) {
      setRetries(prev => prev + 1);
      // أضف timestamp لإجبار إعادة التحميل
      const separator = currentSrc.includes('?') ? '&' : '?';
      setImgSrc(`${currentSrc}${separator}retry=${Date.now()}`);
      return;
    }

    // استخدم الفولباك
    setHasError(true);
    const fallback = fallbackSrc || FALLBACK_IMAGES[fallbackType];
    setImgSrc(fallback);

    // لا تعرض رسالة خطأ للمستخدم إذا كان silentFail
    if (!silentFail && !isProblematicDomain) {
      console.warn(`Failed to load image: ${currentSrc}, using fallback: ${fallback}`);
    }
  };

  // لا تحاول تحميل الصور الفارغة
  if (!imgSrc || imgSrc === '') {
    const fallback = fallbackSrc || FALLBACK_IMAGES[fallbackType];
    return (
      <Image
        {...props}
        src={fallback}
        alt={alt || 'صورة افتراضية'}
      />
    );
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      unoptimized={hasError} // تجنب optimization للصور الفولباك
    />
  );
} 