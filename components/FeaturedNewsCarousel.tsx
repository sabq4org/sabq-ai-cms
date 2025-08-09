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
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

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
}

const FeaturedNewsCarousel: React.FC<FeaturedNewsCarouselProps> = ({
  articles,
  autoPlayInterval = 5000, // 5 ثواني افتراضياً
}) => {
  const { darkMode } = useDarkModeContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // التحريك التلقائي
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
      }, autoPlayInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoPlaying, articles.length, autoPlayInterval]);

  // إيقاف التحريك التلقائي عند تحريك الماوس فوق المكون
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

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

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  // إذا لا توجد أخبار، لا نعرض شيئاً
  if (!articles.length) {
    return null;
  }

  const currentArticle = articles[currentIndex];

  return (
    <div
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={getArticleLink(currentArticle)} className="group block">
        {/* البلوك الرئيسي */}
        <div
          className={`relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl ${
            darkMode
              ? "bg-gray-800/50 hover:bg-gray-800/70"
              : "bg-white hover:bg-white"
          } backdrop-blur-sm rounded-3xl`}
        >
          {/* Grid Layout: Mobile = full width image, Desktop = 50% للصورة، 50% للنص */}
          <div className="grid grid-cols-1 lg:grid-cols-12 h-[280px] lg:h-[320px]">
            {/* قسم الصورة - عرض كامل للجوال، 6 أعمدة للديسكتوب */}
            <div className="col-span-1 lg:col-span-6 relative overflow-hidden rounded-xl lg:rounded-r-2xl lg:rounded-l-none h-[280px] lg:h-[320px]">
              {/* الصورة */}
              <div className="relative w-full h-full">
                <CloudImage
                  src={currentArticle.featured_image}
                  alt={currentArticle.title}
                  fill
                  className="w-full h-full object-cover object-center rounded-xl transition-transform duration-700 group-hover:scale-105"
                  fallbackType="article"
                  priority={true}
                />

                {/* تدرج لوني للجوال (من الأسفل) والديسكتوب (من اليسار) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent lg:bg-gradient-to-l lg:from-black/30 lg:via-transparent lg:to-transparent z-10"></div>

                {/* شارة الخبر المميز - الزاوية العلوية اليمنى */}
                <div className="absolute top-3 right-3 z-30">
                  <div className="bg-yellow-500 text-white px-2 py-1 text-xs rounded flex items-center gap-1">
                    مميز ✨
                  </div>
                </div>

                {/* أسهم التنقل للجوال - داخل الصورة فقط */}
                <div className="lg:hidden absolute inset-0 flex items-center justify-between px-3 pointer-events-none z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handlePrevious();
                    }}
                    className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md pointer-events-auto transition-all duration-300 shadow-lg"
                    aria-label="الخبر السابق"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleNext();
                    }}
                    className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md pointer-events-auto transition-all duration-300 shadow-lg"
                    aria-label="الخبر التالي"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                {/* العنوان داخل الصورة - للجوال فقط */}
                <div className="lg:hidden absolute bottom-4 left-4 right-4 z-20">
                  <h2 className="text-white text-lg font-semibold leading-snug">
                    {currentArticle.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* قسم النص - 6 أعمدة (50%) - مخفي في الجوال */}
            <div className="hidden lg:flex lg:col-span-6 p-4 lg:p-6 flex-col justify-between h-[280px] lg:h-[320px] overflow-hidden">
              {/* العنوان الرئيسي */}
              <h2
                className={`text-xl lg:text-2xl xl:text-3xl font-bold mb-4 leading-tight line-clamp-3 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {currentArticle.title}
              </h2>

              {/* النبذة */}
              {currentArticle.excerpt && (
                <p
                  className={`text-sm lg:text-base mb-6 leading-relaxed line-clamp-2 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {currentArticle.excerpt}
                </p>
              )}

              {/* المعلومات الأساسية */}
              <div className="flex flex-wrap gap-4 text-sm mb-6">
                {/* المراسل */}
                {currentArticle.author && (
                  <div className="flex items-center gap-1.5">
                    <User
                      className={`w-4 h-4 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      {currentArticle.author.reporter?.full_name ||
                        currentArticle.author.name}
                    </span>
                  </div>
                )}

                {/* التصنيف */}
                {currentArticle.category && (
                  <div className="flex items-center gap-1.5">
                    {currentArticle.category.icon && (
                      <span className="text-base">
                        {currentArticle.category.icon}
                      </span>
                    )}
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      {currentArticle.category.name}
                    </span>
                  </div>
                )}

                {/* التاريخ */}
                <div className="flex items-center gap-1.5">
                  <Calendar
                    className={`w-4 h-4 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={darkMode ? "text-gray-300" : "text-gray-600"}
                  >
                    {formatDateGregorian(currentArticle.published_at)}
                  </span>
                </div>
              </div>

              {/* زر "اقرأ المزيد" - محاذاة لليسار */}
              <div className="mt-auto flex justify-end">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <span>اقرأ المزيد</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          {/* أزرار التنقل للديسكتوب فقط */}
          <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-4 right-4 justify-between pointer-events-none z-30">
            <button
              onClick={(e) => {
                e.preventDefault();
                handlePrevious();
              }}
              className="p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm pointer-events-auto transition-all duration-300"
              aria-label="الخبر السابق"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm pointer-events-auto transition-all duration-300"
              aria-label="الخبر التالي"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>
      </Link>

      {/* أشرطة التنقل */}
      <div className="mt-6 flex justify-center items-center gap-2">
        {articles.map((article, index) => (
          <button
            key={article.id}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full transition-all duration-500 ease-in-out transform hover:scale-110 ${
              index === currentIndex
                ? "w-12 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 shadow-lg shadow-blue-500/30"
                : "w-8 bg-gray-400 dark:bg-gray-500 hover:bg-gray-500 dark:hover:bg-gray-400"
            }`}
            aria-label={`الانتقال إلى الخبر ${index + 1}: ${article.title}`}
            title={article.title}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedNewsCarousel;
