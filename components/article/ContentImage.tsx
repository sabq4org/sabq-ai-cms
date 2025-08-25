'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ContentImageProps {
  src: string;
  alt: string;
  caption?: string;
  variant?: 'default' | 'full-bleed' | 'wide';
  aspectRatio?: '16/9' | '4/3' | 'square' | 'auto';
  priority?: boolean;
  className?: string;
}

export default function ContentImage({
  src,
  alt,
  caption,
  variant = 'default',
  aspectRatio = 'auto',
  priority = false,
  className
}: ContentImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // حساب الأبعاد بناءً على نسبة الأبعاد
  const getImageDimensions = () => {
    switch (aspectRatio) {
      case '16/9':
        return { width: 1920, height: 1080 };
      case '4/3':
        return { width: 1600, height: 1200 };
      case 'square':
        return { width: 1200, height: 1200 };
      default:
        return { width: 1920, height: 1080 }; // افتراضي
    }
  };

  const { width, height } = getImageDimensions();

  // تحديد حجم الصورة حسب العرض
  const getSizes = () => {
    switch (variant) {
      case 'full-bleed':
        return '100vw';
      case 'wide':
        return '(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px';
      default:
        return '(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1100px';
    }
  };

  // تطبيق الفئات حسب النوع
  const getVariantClasses = () => {
    switch (variant) {
      case 'full-bleed':
        return 'col-span-3 -mx-4 sm:-mx-6 lg:-mx-8';
      case 'wide':
        return '-mx-2 sm:-mx-4';
      default:
        return '';
    }
  };

  // معالجة الخطأ
  if (hasError) {
    return (
      <figure className={cn('my-8', getVariantClasses(), className)}>
        <div 
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center" 
          style={{ 
            aspectRatio: aspectRatio === 'auto' ? undefined : aspectRatio.replace('/', ' / '),
            minHeight: '200px'
          }}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            فشل تحميل الصورة
          </p>
        </div>
        {caption && (
          <figcaption className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400 italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={cn('relative my-8', getVariantClasses(), className)}>
      <div className={cn(
        'relative overflow-hidden rounded-xl',
        isLoading && 'bg-gray-200 dark:bg-gray-700 animate-pulse'
      )}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'w-full h-auto object-cover transition-all duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            aspectRatio !== 'auto' && `aspect-[${aspectRatio}]`
          )}
          style={aspectRatio !== 'auto' ? { aspectRatio: aspectRatio.replace('/', ' / ') } : undefined}
          sizes={getSizes()}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
      
      {caption && (
        <figcaption className="mt-3 text-sm text-center text-gray-600 dark:text-gray-400 italic px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// مكون مساعد لاستخدامه في المحتوى المحرر
export function renderContentImage(html: string): string {
  // استبدال علامات img بمكون ContentImage
  // هذا مثال بسيط، قد تحتاج لمعالجة أكثر تعقيداً
  return html.replace(
    /<img\s+([^>]*?)src="([^"]+)"([^>]*?)alt="([^"]*)"([^>]*?)>/gi,
    (match, before, src, middle, alt, after) => {
      // استخراج العرض إذا كان موجوداً
      const widthMatch = match.match(/width="(\d+)"/);
      const isSmallImage = widthMatch && parseInt(widthMatch[1]) < 300;
      
      if (isSmallImage) {
        // احتفظ بالصور الصغيرة كما هي (أيقونات، شعارات)
        return match;
      }
      
      // تحديد النوع بناءً على الفئات أو الخصائص
      const isFullBleed = match.includes('full-bleed');
      const isWide = match.includes('wide-image');
      
      return `<div class="content-image-wrapper ${isFullBleed ? 'full-bleed' : ''}" 
                   data-src="${src}" 
                   data-alt="${alt}" 
                   data-variant="${isFullBleed ? 'full-bleed' : isWide ? 'wide' : 'default'}">
              </div>`;
    }
  );
}
