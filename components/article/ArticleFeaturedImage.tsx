"use client";

import OptimizedImage from "@/components/ui/optimized-image";
import { IMAGE_CONFIG } from "./ImageDisplayConfig";

interface ArticleFeaturedImageProps {
  imageUrl: string;
  title: string;
  alt?: string; // النص البديل للصورة (Alt Text)
  category?: {
    name: string;
    color?: string;
    icon?: string;
  };
  caption?: string; // وصف الصورة
  className?: string;
}

export default function ArticleFeaturedImage({
  imageUrl,
  title,
  alt,
  category,
  caption,
  className,
}: ArticleFeaturedImageProps) {
  // عرض بناءً على الوضع المحدد في الإعدادات
  switch (IMAGE_CONFIG.DISPLAY_MODE) {
    case "default":
      return (
        <div className={`relative w-full ${className || ''}`}>
          {/* حاوية بنسبة 16:9 للحفاظ على النسبة عبر جميع الشاشات */}
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl shadow-lg bg-gray-50 dark:bg-gray-900">
            <OptimizedImage
              src={imageUrl}
              alt={alt || title}
              fill
              className="object-cover"
              priority={true}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1536px) 110ch, 110ch"
              decoding="async"
              fetchPriority="high"
            />
          </div>
          
          {/* عرض شرح الصورة (Alt Text) أو وصف الصورة إذا وُجد */}
          {(alt || caption) && (
            <div className="mt-3 text-left">
              {alt && alt !== title && (
                <div className="flex items-start gap-2 justify-start">
                  <span className="text-sm text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0">📷</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {alt}
                  </p>
                </div>
              )}
              {caption && caption !== alt && (
                <div className="flex items-start gap-2 justify-start mt-1">
                  <span className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0">💬</span>
                  <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                    {caption}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );

    case "blur-overlay":
      return (
        <div className={`article-featured-image relative w-full overflow-hidden bg-gray-900 dark:bg-black ${className || ''}`}>
          {/* صورة الخلفية المموهة بنسبة ثابتة */}
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden">
            <OptimizedImage
              src={imageUrl}
              alt=""
              fill
              className="object-cover blur-2xl scale-110 opacity-60"
              priority={false}
              sizes="100vw"
              decoding="async"
              fetchPriority="low"
            />
            {/* الطبقة الداكنة */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
            {/* الصورة الأمامية بنفس الحاوية */}
            <OptimizedImage
              src={imageUrl}
              alt={title}
              fill
              className="object-cover shadow-2xl transition-all duration-500 md:hover:scale-[1.02]"
              priority={true}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              style={{ objectPosition: 'center 35%' }}
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      );

    case "aspect-ratio":
      return (
        <div className="article-featured-image w-full bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative overflow-hidden shadow-xl aspect-[16/9] rounded-2xl">
              <OptimizedImage
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                priority={true}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                style={{ objectPosition: 'center 35%' }}
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      );

    case "fullwidth":
      return (
        <div className="article-featured-image relative w-full">
          {/* تحويل الارتفاعات الثابتة إلى نسبة أبعاد ثابتة ومتجاوبة */}
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-2xl">
            <OptimizedImage
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority={true}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1200px"
              style={{ objectPosition: 'center 35%' }}
              decoding="async"
              fetchPriority="high"
            />
            {/* تدرج خفيف للتحسين البصري */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      );

    default:
      return null;
  }
}
