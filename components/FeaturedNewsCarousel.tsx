"use client";

import CloudImage from "@/components/ui/CloudImage";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { formatDateGregorian } from "@/lib/date-utils";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
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
  breaking?: boolean;
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
  containerClassName?: string;
  titleClassName?: string;
  halfWidth?: boolean; // يجعل الصورة نصف عرض البلوك على الديسكتوب
}

const FeaturedNewsCarousel: React.FC<FeaturedNewsCarouselProps> = ({
  articles,
  autoPlayInterval = 5000, // 5 ثواني افتراضياً
  heights = { mobile: 260, mobileLg: 320, desktop: 460 },
  showBadge = false,
  containerClassName,
  titleClassName,
  halfWidth = false,
}) => {
  const { darkMode } = useDarkModeContext();
  
  // تحسين: حساب hasAnyBreaking مرة واحدة فقط باستخدام useMemo
  const hasAnyBreaking = React.useMemo(() => 
    articles.some((a) => (a as any).breaking || (a as any).is_breaking), 
    [articles]
  );
  
  const { index: currentIndex, setIndex: setCurrentIndex, next: handleNext, prev: handlePrevious, isReducedMotion } = useFeaturedCarousel({
    length: articles.length,
    autoPlayInterval,
    paused: hasAnyBreaking,
  });

  // تحسين: إيقاف التحريك التلقائي عند تحريك الماوس فوق المكون
  const [isPaused, setIsPaused] = React.useState(false);
  const handleMouseEnter = React.useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = React.useCallback(() => setIsPaused(false), []);

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

  // تحسين: حفظ روابط المقالات في useMemo لتجنب إعادة الحساب
  const articleLinks = React.useMemo(() => 
    articles.map(article => article.slug ? `/news/${article.slug}` : `/news/${article.id}`),
    [articles]
  );
  
  const getArticleLink = React.useCallback((index: number) => articleLinks[index], [articleLinks]);

  // وظيفة للتحقق من الأخبار الجديدة (آخر 48 ساعة)
  const isRecentNews = (publishedAt: string) => {
    try {
      const publishedDate = new Date(publishedAt);
      const currentDate = new Date();
      const diffInMinutes = (currentDate.getTime() - publishedDate.getTime()) / (1000 * 60);
      return diffInMinutes <= 2880.1; // أقل من أو يساوي 2880 دقيقة (48 ساعة) مع هامش أمان صغير
    } catch (error) {
      return false;
    }
  };

  const mobileH = heights.mobile || 260;
  const mobileLgH = heights.mobileLg || mobileH;
  const desktopH = heights.desktop || mobileLgH;
  const [containerHeight, setContainerHeight] = useState<number>(desktopH);
  const [accentActive, setAccentActive] = useState<boolean>(false);

  useEffect(() => {
    const computeHeight = () => {
      try {
        const w = window.innerWidth;
        const h = w >= 1024 ? desktopH : (w >= 640 ? mobileLgH : mobileH);
        setContainerHeight(h);
      } catch {}
    };
    computeHeight();
    window.addEventListener('resize', computeHeight);
    return () => window.removeEventListener('resize', computeHeight);
  }, [desktopH, mobileLgH, mobileH]);

  // تحديد تفعيل اللون من localStorage: theme-color (غير موجود أو 'default' = بلا لون)
  useEffect(() => {
    try {
      const compute = () => {
        const saved = localStorage.getItem('theme-color');
        setAccentActive(Boolean(saved) && saved !== 'default');
      };
      compute();
      const onStorage = (e: StorageEvent) => {
        if (e.key === 'theme-color') compute();
      };
      const onThemeChange = () => compute();
      window.addEventListener('storage', onStorage);
      window.addEventListener('theme-color-change', onThemeChange as any);
      return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('theme-color-change', onThemeChange as any);
      };
    } catch {}
  }, []);

  // إذا لا توجد أخبار، لا نعرض شيئاً
  if (!articles.length) {
    return null;
  }

  const currentArticle = articles[currentIndex];
  // دعم مصادر متعددة لحقل العاجل (breaking)
  const isBreaking = Boolean(
    (currentArticle as any).breaking ||
    (currentArticle as any).is_breaking ||
    (currentArticle as any)?.metadata?.breaking
  );

  // اشتقاق بيانات التصنيف من صيغ متعددة محتملة
  const rawCategory: any = (currentArticle as any).category ?? (currentArticle as any).categories ?? null;
  const categoryName: string | undefined = (() => {
    if (!rawCategory) return (currentArticle as any).category_name || (currentArticle as any).categoryName;
    if (typeof rawCategory === 'string') return rawCategory;
    if (Array.isArray(rawCategory)) return rawCategory[0]?.name || rawCategory[0];
    if (typeof rawCategory === 'object') return rawCategory.name || (currentArticle as any).category_name || (currentArticle as any).categoryName;
    return undefined;
  })();
  const categoryIcon: string | undefined = (() => {
    if (!rawCategory) return undefined;
    if (Array.isArray(rawCategory)) return rawCategory[0]?.icon;
    if (typeof rawCategory === 'object') return rawCategory.icon;
    return undefined;
  })();

  // اشتقاق العنوان الفرعي من excerpt أو summary أو metadata.summary أو subtitle
  const subtitle: string | undefined = (currentArticle as any).excerpt || (currentArticle as any).summary || (currentArticle as any)?.metadata?.summary || (currentArticle as any).subtitle;
  
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

  return (
    <div
      className={`featured-carousel relative ${
        containerClassName !== undefined
          ? containerClassName
          : "max-w-6xl mx-auto px-4 mb-6"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-roledescription="carousel"
      aria-label="الأخبار المميزة"
    >
      <Link href={getArticleLink(currentIndex)} className="block group" aria-live="polite">
        <div
          className={`relative overflow-hidden border rounded-xl border-[#f0f0ef] dark:border-gray-700 transition-colors hover:border-gray-300 dark:hover:border-gray-600`}
          style={{
            background: isBreaking
              ? (darkMode ? 'hsla(0, 72%, 45%, 0.18)' : 'hsla(0, 84%, 60%, 0.12)')
              : (darkMode 
                  ? 'hsl(var(--bg-elevated))' 
                  : (accentActive ? 'hsl(var(--accent) / 0.06)' : '#ffffff')
                )
          }}
        >
          <div
            className={`grid grid-cols-1 lg:grid-cols-12`}
            style={{ height: `${containerHeight}px` }}
          >
            <div
              className={`col-span-1 ${halfWidth ? 'lg:col-span-6 xl:col-span-6' : 'lg:col-span-7 xl:col-span-8'} relative overflow-hidden rounded-xl lg:rounded-r-2xl lg:rounded-l-none`}
              style={{ height: `${containerHeight}px` }}
            >
              {(currentArticle.featured_image) ? (
                <CloudImage
                  src={currentArticle.featured_image}
                  alt={currentArticle.title}
                  fill
                  priority
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover object-center"
                  fallbackType="article"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ background: darkMode ? '#1f2937' : '#f3f4f6' }}>
                  <span className="text-6xl">📰</span>
                </div>
              )}
              {/* طبقة شفافة وعنوان للهواتف فقط - إخفاء على التابلت/الديسكتوب */}
              <div
                className="md:hidden absolute inset-0 z-10 pointer-events-none"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  transform: 'translateZ(0)'
                }}
              />
              {/* العنوان المتراكب - للموبايل فقط (FORCE UPDATE: 2025-08-15T17:40) */}
              <div
                className="md:hidden absolute left-4 right-4 z-20"
                style={{ bottom: '12px', top: 'auto', transform: 'translateZ(0)' }}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] text-white">
                  {isBreaking ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white">
                      <span className="text-xs">⚡</span>
                      عاجل
                    </span>
                  ) : (
                    <>
                      <span className="text-sm">{categoryIcon || '📰'}</span>
                      <span className="font-medium">{categoryName || 'أخبار'}</span>
                    </>
                  )}
                  {/* ليبل "جديد" للأخبار في آخر 48 ساعة */}
                  {!isBreaking && isRecentNews(currentArticle.published_at) && (
                    <>
                      <span className="opacity-80">•</span>
                      <span className="recent-news-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
                        <span className="text-xs">🔥</span>
                        جديد
                      </span>
                    </>
                  )}
                  <span className="opacity-80">•</span>
                  <span className="opacity-90">
                    {new Date(currentArticle.published_at || new Date()).toLocaleDateString('ar-SA-u-ca-gregory', {
                      month: 'short',
                      day: 'numeric',
                      calendar: 'gregory',
                      numberingSystem: 'latn'
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
            <div className={`hidden lg:flex ${halfWidth ? 'lg:col-span-6 xl:col-span-6' : 'lg:col-span-5 xl:col-span-4'} p-4 lg:p-6 flex-col justify-between overflow-hidden`} style={{ height: `${containerHeight}px` }}>
              {/* عنوان الخبر لنسخة الديسكتوب (يبقى مرئياً في العمود النصي) */}
              {/* ليبل التصنيف فوق العنوان */}
              <div className="mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {isBreaking ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                      <span className="text-sm">⚡</span>
                      عاجل
                    </span>
                  ) : (
                    categoryName && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border"
                        style={{
                          background: darkMode
                            ? (accentActive ? 'hsl(var(--accent) / 0.18)' : 'rgba(148,163,184,0.15)')
                            : (accentActive ? 'hsl(var(--accent) / 0.12)' : 'rgba(148,163,184,0.15)'),
                          color: accentActive ? 'hsl(var(--accent))' : (darkMode ? '#e5e7eb' : '#334155'),
                          borderColor: accentActive ? 'hsl(var(--accent) / 0.25)' : 'rgba(148,163,184,0.35)'
                        }}
                      >
                        <span className="text-sm">{categoryIcon || '📰'}</span>
                        <span>{categoryName}</span>
                      </span>
                    )
                  )}
                  {/* ليبل "جديد" للأخبار في آخر 12 ساعة - نسخة الديسكتوب */}
                  {!isBreaking && isRecentNews(currentArticle.published_at) && (
                    <span className="recent-news-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                      <span className="text-xs">🔥</span>
                      جديد
                    </span>
                  )}
                </div>
              </div>
              <h2
                className={`text-lg lg:text-xl xl:text-2xl font-bold mb-4 leading-tight line-clamp-3 ${
                  isBreaking ? 'text-red-700 dark:text-red-400' : (titleClassName ?? (darkMode ? 'text-white' : 'text-gray-900'))
                }`}
              >
                {currentArticle.title}
              </h2>
              {subtitle && (
                <p
                  className={`text-sm lg:text-base mb-6 leading-relaxed line-clamp-2 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {subtitle}
                </p>
              )}
              {/* معلومات إضافية (أعلى) */}
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                {currentArticle.author && (
                  <div className="flex items-center gap-1.5">
                    <User className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      {currentArticle.author.reporter?.full_name || currentArticle.author.name}
                    </span>
                  </div>
                )}
              </div>
              {/* شريط سفلي: المشاهدات + التاريخ يسار، وزر يمين */}
              <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#f0f0ef] dark:border-gray-800">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Eye className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      {typeof currentArticle.views === 'number' ? currentArticle.views : 0}
                    </span>
                    {((currentArticle as any).views ?? 0) > 300 && <span className="ml-1">🔥</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      {formatDateGregorian(currentArticle.published_at)}
                    </span>
                  </div>
                </div>
                <div className="group/btn inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 soft-read-more-btn transform hover:-translate-y-0.5">
                  <span>اقرأ المزيد</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
      {/* مؤشرات الكاروسيل (صور فقط بدون أزرار يمين/يسار) */}
      <div className="flex mt-4 justify-center items-center px-4 sm:px-6" aria-label="مؤشرات الكاروسيل">
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center gap-3 px-2">
            {articles.map((article, idx) => (
              <button
                key={article.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative overflow-hidden rounded-none border transition-colors duration-200 cursor-pointer w-16 h-10 ${
                  idx === currentIndex 
                    ? "border-gray-300 dark:border-gray-600 opacity-100" 
                    : "border-[#f0f0ef] dark:border-gray-700 opacity-60 hover:opacity-80"
                }`}
                aria-label={`الانتقال إلى الخبر ${idx + 1}: ${article.title}`}
                aria-current={idx === currentIndex}
              >
                {article.featured_image ? (
                  <CloudImage
                    src={article.featured_image}
                    alt={article.title}
                    width={64}
                    height={40}
                    className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800"
                    fallbackType="article"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-xs text-gray-500">لا توجد صورة</span>
                  </div>
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
