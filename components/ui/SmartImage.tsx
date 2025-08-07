'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { logError } from '@/lib/services/error-logger';

interface SmartImageProps extends Omit<ImageProps, 'onError' | 'src'> {
  article?: any; // إضافة دعم للمقال الكامل
  src?: string | null; // src منفصل للتحكم الكامل
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

// استخراج رابط الصورة من جميع المصادر المحتملة في المقال
const extractImageFromArticle = (article: any): string | null => {
  if (!article) return null;

  // قائمة شاملة بجميع المسارات المحتملة للصور
  const imagePaths = [
    article.featured_image,
    article.image_url,
    article.image,
    article.thumbnail,
    article.cover,
    article.media?.[0]?.url,
    article.meta?.image,
    article.metadata?.image,
    article.images?.[0],
    article.attachments?.[0]?.url,
    // مسارات إضافية للأخبار المخصصة
    article.customFields?.image,
    article.seo?.image,
    article.openGraph?.image,
  ];

  // البحث عن أول رابط صورة صالح
  for (const path of imagePaths) {
    if (path && typeof path === "string" && path.length > 5) {
      // تجنب القيم الفارغة أو غير الصالحة
      if (
        path !== "undefined" &&
        path !== "null" &&
        !path.includes("undefined") &&
        !path.includes("null") &&
        path !== "/api/placeholder"
      ) {
        return path;
      }
    }
  }

  return null;
};

export default function SmartImage({
  src,
  article, // إضافة المقال
  alt,
  fallbackSrc,
  fallbackType = 'general',
  retryCount = 1,
  silentFail = true,
  ...props
}: SmartImageProps) {
  // استخراج الصورة من المقال إذا لم يتم تمرير src
  const extractedSrc = src || extractImageFromArticle(article);
  const [imgSrc, setImgSrc] = useState(extractedSrc);
  const [retries, setRetries] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // إعادة تعيين عند تغيير المصدر أو المقال
    const newSrc = src || extractImageFromArticle(article);
    if (newSrc !== imgSrc && !hasError) {
      setImgSrc(newSrc);
      setRetries(0);
      setHasError(false);
    }
  }, [src, article]);

  const handleError = () => {
    if (!imgSrc) return;
    
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