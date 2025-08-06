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
}

export default function ArticleFeaturedImage({
  imageUrl,
  title,
  category,
}: ArticleFeaturedImageProps) {
  // الحصول على إعدادات الارتفاعات المتجاوبة
  const { RESPONSIVE_HEIGHTS, INTERACTION, MOBILE_OPTIMIZATIONS } = IMAGE_CONFIG;
  
  // فئات CSS للارتفاعات المتجاوبة - استخدام فئات ثابتة للتوافق مع Tailwind JIT
  const responsiveHeightClasses = "h-[280px] sm:h-[500px] lg:h-[600px]";

  // فئات التفاعل المحسنة
  const interactionClasses = `
    transition-all duration-300 
    hover:scale-[1.02]
    ${MOBILE_OPTIMIZATIONS.TOUCH_FRIENDLY ? 'active:scale-[0.98] touch-manipulation' : ''}
  `;

  // عرض بناءً على الوضع المحدد في الإعدادات
  switch (IMAGE_CONFIG.DISPLAY_MODE) {
    case "default":
      return (
        <div className="relative w-full">
          {/* الصورة الرئيسية محسنة للموبايل والديسكتوب */}
          <div className={`relative overflow-hidden rounded-lg shadow-lg ${interactionClasses}`}>
            <OptimizedImage
              src={imageUrl}
              alt={title}
              className={`w-full object-cover ${responsiveHeightClasses} bg-gray-100 dark:bg-gray-800`}
              priority={INTERACTION.PRIORITY_LOADING}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            />
            
            {/* تراكب التصنيف المحسن */}
            {category && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="flex justify-end">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-md backdrop-saturate-180 border border-white/20 shadow-lg ${interactionClasses}`}
                    style={{
                      backgroundColor: `${category.color || "#1a73e8"}CC`,
                    }}
                  >
                    {category.icon && <span className="text-base">{category.icon}</span>}
                    <span>{category.name}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case "blur-overlay":
      return (
        <div className={`article-featured-image relative ${responsiveHeightClasses} w-full overflow-hidden bg-gray-900 dark:bg-black`}>
          {/* صورة الخلفية المموهة محسنة */}
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60 dark:opacity-40"
            loading={INTERACTION.PRIORITY_LOADING ? "eager" : "lazy"}
          />

          {/* الطبقة الداكنة فوق الخلفية المموهة - محسنة للوضع المظلم */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 dark:from-black/90 dark:via-black/50 dark:to-black/70" />

          {/* حاوي الصورة الرئيسية محسن للموبايل */}
          <div className="relative z-10 h-full flex items-center justify-center p-2 sm:p-4 lg:p-8">
            <div className="max-w-4xl w-full h-full flex items-center justify-center">
              <OptimizedImage
                src={imageUrl}
                alt={title}
                className={`max-w-full max-h-full shadow-2xl rounded-lg ${interactionClasses}`}
                aspectRatio="auto"
                priority={INTERACTION.PRIORITY_LOADING}
                sizes="(max-width: 640px) 95vw, (max-width: 1024px) 85vw, 1000px"
              />
            </div>
          </div>

          {/* معلومات إضافية اختيارية على الصورة محسنة */}
          {category && (
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20">
              <div className="max-w-4xl mx-auto">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-md backdrop-saturate-180 border border-white/30 shadow-xl ${interactionClasses}`}
                  style={{
                    backgroundColor: `${category.color || "#1a73e8"}BB`,
                  }}
                >
                  {category.icon && <span className="text-base">{category.icon}</span>}
                  <span>{category.name}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      );

    case "aspect-ratio":
      return (
        <div className="article-featured-image w-full bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
            <div className={`relative overflow-hidden shadow-xl rounded-lg ${interactionClasses}`}>
              <OptimizedImage
                src={imageUrl}
                alt={title}
                className="w-full"
                aspectRatio={IMAGE_CONFIG.ASPECT_RATIO as any}
                priority={INTERACTION.PRIORITY_LOADING}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              />

              {/* تراكب التصنيف محسن للموبايل */}
              {category && (
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4">
                  <span
                    className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-white backdrop-blur-md backdrop-saturate-180 border border-white/20 shadow-lg ${interactionClasses}`}
                    style={{
                      backgroundColor: `${category.color || "#1a73e8"}CC`,
                    }}
                  >
                    {category.icon && <span className="text-sm sm:text-base">{category.icon}</span>}
                    <span>{category.name}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "fullwidth":
      return (
        <div className={`article-featured-image relative ${responsiveHeightClasses} w-full bg-gray-200 dark:bg-gray-800 overflow-hidden`}>
          <OptimizedImage
            src={imageUrl}
            alt={title}
            className={`w-full h-full object-cover ${interactionClasses}`}
            priority={INTERACTION.PRIORITY_LOADING}
            sizes="100vw"
          />
          
          {/* تراكب محسن للوضع المظلم */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 dark:from-black/80 dark:to-black/40 z-10" />
          
          {/* تراكب التصنيف في الـ fullwidth */}
          {category && (
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <div className="flex justify-end">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-md backdrop-saturate-180 border border-white/30 shadow-xl ${interactionClasses}`}
                  style={{
                    backgroundColor: `${category.color || "#1a73e8"}CC`,
                  }}
                >
                  {category.icon && <span className="text-base">{category.icon}</span>}
                  <span>{category.name}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
