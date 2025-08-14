"use client";

import OptimizedImage from "@/components/ui/optimized-image";
import { IMAGE_CONFIG } from "./ImageDisplayConfig";

interface ArticleFeaturedImageProps {
  imageUrl: string;
  title: string;
  category?: {
    name: string;
    color?: string;
    icon?: string;
  };
  caption?: string;
  className?: string;
}

export default function ArticleFeaturedImage({
  imageUrl,
  title,
  category,
  caption,
  className,
}: ArticleFeaturedImageProps) {
  // عرض بناءً على الوضع المحدد في الإعدادات
  switch (IMAGE_CONFIG.DISPLAY_MODE) {
    case "default":
      return (
        <div className={`relative w-full ${className || ''}`}>
          {/* الصورة الرئيسية - ضبط للحفاظ على الأبعاد الأصلية دون قص */}
          <div className="relative rounded-lg shadow-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <OptimizedImage
              src={imageUrl}
              alt={title}
              className="w-full h-auto object-center"
              priority={true}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1536px) 110ch, 110ch"
            />
            {/* التصنيف */}
            {category && (
              <div className="absolute top-4 right-4">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-md backdrop-blur-sm"
                  style={{
                    backgroundColor: `${category.color || "#1a73e8"}CC`,
                  }}
                >
                  {category.icon && <span>{category.icon}</span>}
                  <span>{category.name}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      );

    case "blur-overlay":
      return (
        <div className={`article-featured-image relative h-[400px] sm:h-[500px] lg:h-[600px] w-full overflow-hidden bg-gray-900 dark:bg-black ${className || ''}`}>
          {/* صورة الخلفية المموهة */}
          <OptimizedImage
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
            priority={false}
            sizes="100vw"
          />

          {/* الطبقة الداكنة فوق الخلفية المموهة */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />

          {/* حاوي الصورة الرئيسية */}
          <div className="relative z-10 h-full flex items-center justify-center p-4 sm:p-8">
            <div className="max-w-4xl w-full h-full flex items-center justify-center">
              <OptimizedImage
                src={imageUrl}
                alt={title}
                className="max-w-full max-h-full shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                priority={true}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              />
            </div>
          </div>

          {/* معلومات إضافية اختيارية على الصورة */}
          {category && (
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="max-w-4xl mx-auto">
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-md"
                  style={{
                    backgroundColor: `${category.color || "#1a73e8"}99`,
                  }}
                >
                  {category.icon && <span>{category.icon}</span>}
                  {category.name}
                </span>
              </div>
            </div>
          )}
        </div>
      );

    case "aspect-ratio":
      return (
        <div className="article-featured-image w-full bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative overflow-hidden shadow-xl">
              <OptimizedImage
                src={imageUrl}
                alt={title}
                className="w-full"
                priority={true}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              />

              {/* تراكب التصنيف */}
              {category && (
                <div className="absolute bottom-4 left-4">
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-md"
                    style={{
                      backgroundColor: `${category.color || "#1a73e8"}CC`,
                    }}
                  >
                    {category.icon && <span>{category.icon}</span>}
                    {category.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "fullwidth":
      return (
        <div className="article-featured-image relative w-full">
          {/* حاوي الصورة بعرض المحتوى */}
          <div className="relative h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px] w-full overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-lg">
            <OptimizedImage
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              priority={true}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1200px"
            />
            {/* تدرج خفيف للتحسين البصري */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            
            {/* عرض التصنيف على الصورة إذا وُجد */}
            {category && (
              <div className="absolute top-4 right-4 z-10">
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg backdrop-blur-sm"
                  style={{
                    backgroundColor: `${category.color || "#1a73e8"}CC`,
                  }}
                >
                  {category.icon && <span className="text-base">{category.icon}</span>}
                  <span>{category.name}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
