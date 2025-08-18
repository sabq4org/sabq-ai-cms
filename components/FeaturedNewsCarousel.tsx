"use client";

import CloudImage from "@/components/ui/CloudImage";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { formatDateGregorian } from "@/lib/date-utils";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useFeaturedCarousel } from "@/components/featured/hooks/useFeaturedCarousel";

interface FeaturedArticle {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  featured_image: string;
  published_at: string;
  reading_time?: number;
  views?: number;
  likes?: number;
  shares?: number;
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
  author?: {
    id: string;
    name: string;
    reporter?: {
      id: string;
      full_name: string;
      slug: string;
      title?: string;
      is_verified?: boolean;
      verification_badge?: string;
    } | null;
  } | null;
}

interface FeaturedNewsCarouselProps {
  articles: FeaturedArticle[];
  autoPlayInterval?: number; // بالمللي ثانية
  heights?: { mobile?: number; mobileLg?: number; desktop?: number };
  showBadge?: boolean;
}

const FeaturedNewsCarousel: React.FC<FeaturedNewsCarouselProps> = ({
  articles,
  autoPlayInterval = 5000, // 5 ثواني افتراضياً
  heights = { mobile: 220, mobileLg: 260, desktop: 320 },
  showBadge = false,
}) => {
  const { darkMode } = useDarkModeContext();
  const { index: currentIndex, setIndex: setCurrentIndex, next: handleNext, prev: handlePrevious, isReducedMotion } = useFeaturedCarousel({
    length: articles.length,
    autoPlayInterval,
    paused: false,
  });

  // إيقاف التحريك التلقائي عند تحريك الماوس فوق المكون
  const handleMouseEnter = () => {/* يمكن لاحقاً تفعيل الإيقاف */};
  const handleMouseLeave = () => {/* يمكن لاحقاً إعادة التشغيل */};

  const getVerificationIcon = (badge: string) => {
    switch (badge) {
      case "expert":
        return <Star className="w-4 h-4 text-amber-500" />;
      case "senior":
        return <Award className="w-4 h-4 text-purple-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  // استخدام الروابط القصيرة المعتمدة (NEWS → /news/[slug]) مع fallback للـ id
  const getArticleLink = (article: FeaturedArticle) => {
    return article.slug ? `/news/${article.slug}` : `/news/${article.id}`;
  };

  // إذا لا توجد أخبار، لا نعرض شيئاً
  if (!articles.length) {
    return null;
  }

  const currentArticle = articles[currentIndex];
  
  // تسجيل console للتشخيص في النسخة الكاملة
  if (process.env.NODE_ENV === 'development') {
    console.log('🖼️ [FeaturedNewsCarousel] Desktop Mode: Component is rendering for desktop screens');
    console.log('🖼️ [FeaturedNewsCarousel] Current Article:', {
      id: currentArticle.id,
      title: currentArticle.title?.substring(0, 50) + '...',
      featured_image: currentArticle.featured_image,
      hasImage: !!currentArticle.featured_image
    });
  }
  const mobileH = heights.mobile || 220;
  const mobileLgH = heights.mobileLg || mobileH;
  const desktopH = heights.desktop || mobileLgH;

  return (
    <div
      className="featured-carousel relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-roledescription="carousel"
      aria-label="الأخبار المميزة"
    >
      <Link href={getArticleLink(currentArticle)} className="group block" aria-live="polite">
        <div
          className={`relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl ${
            darkMode ? "bg-gray-800 hover:bg-gray-800" : "bg-white hover:bg-white"
          } rounded-3xl`}
        >
          <div
            className={`grid grid-cols-1 lg:grid-cols-12`}
            style={{ height: `${desktopH}px` }}
          >
            <div
              className="col-span-1 lg:col-span-6 relative overflow-hidden rounded-xl lg:rounded-r-2xl lg:rounded-l-none"
              style={{ height: `${desktopH}px` }}
            >
              {(currentArticle.featured_image) ? (
                <OptimizedImage
                  src={currentArticle.featured_image}
                  alt={currentArticle.title}
                  fill
                  priority
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-6xl">📰</span>
                </div>
              )}
              {/* طبقة شفافة وعنوان للهواتف فقط - إخفاء على التابلت/الديسكتوب */}
              <div
                className="md:hidden absolute inset-0 z-10 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 25%, transparent 100%)',
                  transform: 'translateZ(0)'
                }}
              />
              {/* العنوان المتراكب - للموبايل فقط (FORCE UPDATE: 2025-08-15T17:40) */}
              <div
                className="md:hidden absolute left-4 right-4 z-20"
                style={{ bottom: '12px', top: 'auto', transform: 'translateZ(0)' }}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] text-white/90">
                  <span className="text-sm">{currentArticle.category?.icon || '📰'}</span>
                  <span className="font-medium">{currentArticle.category?.name || 'أخبار'}</span>
                  <span className="opacity-80">•</span>
                  <span className="opacity-90">
                    {new Date(currentArticle.published_at || new Date()).toLocaleDateString('ar-SA', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <h3 className="text-white text-base font-bold leading-snug line-clamp-2 drop-shadow-md">
                  {currentArticle.title}
                </h3>
              </div>
              {showBadge && (
                <div className="hidden lg:block absolute top-4 right-4 z-30">
                  <div className="bg-yellow-500 text-white px-3 py-1 text-xs rounded-full flex items-center gap-1 shadow">
                    <span>مميز</span>
                    <Star className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
            <div className="hidden lg:flex lg:col-span-6 p-4 lg:p-6 flex-col justify-between overflow-hidden" style={{ height: `${desktopH}px` }}>
              {/* عنوان الخبر لنسخة الديسكتوب (يبقى مرئياً في العمود النصي) */}
              <h2
                className={`text-xl lg:text-2xl xl:text-3xl font-bold mb-4 leading-tight line-clamp-3 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {currentArticle.title}
              </h2>
              {currentArticle.excerpt && (
                <p
                  className={`text-sm lg:text-base mb-6 leading-relaxed line-clamp-2 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {currentArticle.excerpt}
                </p>
              )}
              {/* المعلومات الإضافية للديسكتوب فقط - التصنيف يظهر فوق الصورة في الهاتف */}
              <div className="flex flex-wrap gap-4 text-sm mb-6">
                {currentArticle.author && (
                  <div className="flex items-center gap-1.5">
                    <User className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      {currentArticle.author.reporter?.full_name || currentArticle.author.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    {formatDateGregorian(currentArticle.published_at)}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex justify-end">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <span>اقرأ المزيد</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
      {/* مؤشرات الكاروسيل (صور فقط بدون أزرار يمين/يسار) */}
      <div className="flex mt-4 justify-center items-center px-4" aria-label="مؤشرات الكاروسيل">
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center gap-3 px-2">
            {articles.map((article, idx) => (
              <button
                key={article.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out cursor-pointer ${
                  idx === currentIndex 
                    ? "w-16 h-9 ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg z-10" 
                    : "w-10 h-9 hover:w-12 hover:h-9 opacity-50 hover:opacity-70 hover:shadow-md"
                }`}
                aria-label={`الانتقال إلى الخبر ${idx + 1}: ${article.title}`}
                aria-current={idx === currentIndex}
              >
                {article.featured_image ? (
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {/* Fallback للصور المفقودة */}
                <div className={`${article.featured_image ? 'hidden' : 'block'} w-full h-full bg-gray-200 dark:bg-gray-700`}></div>
                {/* تدرج لوني ناعم */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${
                  idx === currentIndex 
                    ? "bg-blue-500/15" 
                    : "bg-black/40 hover:bg-black/25"
                }`}></div>
                {/* مؤشر النشاط */}
                {idx === currentIndex && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNewsCarousel;
