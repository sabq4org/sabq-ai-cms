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
      className="featured-carousel relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={getArticleLink(currentArticle)} className="group block">
        {/* البلوك الرئيسي - تم تحسين الخلفية لضمان الرؤية */}
        <div
          className={`relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl ${
            darkMode
              ? "bg-gray-800 hover:bg-gray-800"
              : "bg-white hover:bg-white"
          } backdrop-blur-none rounded-3xl`}
        >
          {/* Grid Layout: Mobile = full width image, Desktop = 50% للصورة، 50% للنص */}
          <div className="grid grid-cols-1 lg:grid-cols-12 h-[220px] sm:h-[260px] lg:h-[320px]">
            {/* قسم الصورة - عرض كامل للجوال، 6 أعمدة للديسكتوب */}
            <div className="col-span-1 lg:col-span-6 relative overflow-hidden rounded-xl lg:rounded-r-2xl lg:rounded-l-none h-[220px] sm:h-[260px] lg:h-[320px]">
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

                {/* تدرج لوني للجوال والديسكتوب - من الأسفل إلى الأعلى مع ظل قوي */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none shadow-inner"></div>

                {/* تم إزالة شارة "مميز" حسب الطلب */}

                {/* أسهم التنقل تم نقلها من على الصورة */}

                {/* العنوان داخل الصورة - للجوال فقط */}
                <div className="lg:hidden absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/90 to-black/20">
                  <h2 className="text-white text-lg font-bold leading-snug drop-shadow-md">
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
          {/* أزرار التنقل - تم نقلها خارج الصورة */}
        </div>
      </Link>

      {/* منطقة التنقل الجديدة مع الأسهم والأشرطة */}
      <div className="mt-4 flex justify-center items-center">
        <div className="flex items-center gap-3 px-4">
          {/* زر السابق */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handlePrevious();
            }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 shadow-sm"
            aria-label="الخبر السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* أشرطة التنقل */}
          <div className="flex justify-center items-center gap-1.5">
            {articles.map((article, index) => (
              <button
                key={article.id}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
                  index === currentIndex
                    ? "w-8 bg-blue-500 dark:bg-blue-400"
                    : "w-4 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`الانتقال إلى الخبر ${index + 1}: ${article.title}`}
                title={article.title}
              />
            ))}
          </div>
          
          {/* زر التالي */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-300 shadow-sm"
            aria-label="الخبر التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNewsCarousel;
