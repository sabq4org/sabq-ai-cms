"use client";

import OptimizedImage from "@/components/ui/OptimizedImage";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { formatDateGregorian } from "@/lib/date-utils";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Headphones,
  Heart,
  Share2,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

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

interface FeaturedNewsBlockProps {
  article: FeaturedArticle | null;
}

const FeaturedNewsBlock: React.FC<FeaturedNewsBlockProps> = ({ article }) => {
  const { darkMode } = useDarkModeContext();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // تحديد ما إذا كنا على جهاز سطح مكتب
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateIsDesktop = () => {
        setIsDesktop(window.innerWidth >= 1024);
      };
      
      updateIsDesktop();
      window.addEventListener('resize', updateIsDesktop);
      
      return () => {
        window.removeEventListener('resize', updateIsDesktop);
      };
    }
  }, []);

  // تسجيل تفاصيل الصورة في وحدة التحكم للتشخيص
  useEffect(() => {
    if (article && article.featured_image) {
      console.log('🖼️ FeaturedNewsBlock Image URL:', article.featured_image);
      console.log('🖼️ Screen type:', isDesktop ? 'Desktop' : 'Mobile');
      console.log('🖼️ Image status:', { loaded: imageLoaded, error: imageError });
    }
  }, [article, imageLoaded, imageError, isDesktop]);

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

  const getArticleLink = (article: FeaturedArticle) => {
    return `/article/${article.id}`;
  };

  // إذا لا يوجد محتوى، لا نعرض شيئاً
  if (!article) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <Link href={getArticleLink(article)} className="group block">
        {/* البلوك الرئيسي */}
        <div
          className={`relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl ${
            darkMode
              ? "bg-gray-800/50 hover:bg-gray-800/70"
              : "bg-white/80 hover:bg-white"
          } backdrop-blur-sm rounded-3xl`}
        >
          {/* Grid Layout: 50% للصورة، 50% للنص */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[240px] lg:min-h-[280px]">
            {/* قسم الصورة - 6 أعمدة (50%) */}
            <div className="lg:col-span-6 relative overflow-hidden lg:rounded-r-2xl rounded-t-2xl lg:rounded-t-none">
              {/* الصورة */}
              <div className="relative w-full h-48 lg:h-full" style={{ minHeight: '280px' }}>
                {/* تم تغيير CloudImage إلى OptimizedImage لتحسين الأداء وتصحيح المشاكل */}
                <OptimizedImage
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="w-full h-full object-cover object-center rounded-xl transition-transform duration-700 group-hover:scale-105"
                  priority={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={90}
                />

                {/* تدرج لوني ناعم فوق الصورة */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-l lg:from-black/30 lg:via-transparent lg:to-transparent"></div>

                {/* شارة الخبر المميز - مكثفة */}
                <div className="absolute top-3 right-3">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      darkMode
                        ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                    } shadow-lg backdrop-blur-sm border border-amber-400/30`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="font-bold text-xs">مميز</span>
                  </div>
                </div>
              </div>
            </div>

            {/* قسم النص - 6 أعمدة (50%) */}
            <div className="lg:col-span-6 p-4 lg:p-6 flex flex-col justify-center">
              {/* العنوان الرئيسي - مقصور على 2-3 سطور */}
              <h2
                className={`text-xl lg:text-2xl xl:text-3xl font-bold mb-3 leading-tight line-clamp-3 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {article.title}
              </h2>

              {/* موجز الخبر - مكثف */}
              {article.excerpt && (
                <p
                  className={`text-xs lg:text-base font-normal mb-4 leading-relaxed line-clamp-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {article.excerpt}
                </p>
              )}

              {/* معلومات المراسل والتصنيف - مكثفة */}
              <div className="mb-4 space-y-2">
                {/* المراسل */}
                {article.author && (
                  <div className="flex items-center gap-2">
                    {article.author.reporter ? (
                      <Link
                        href={`/reporter/${article.author.reporter.slug}`}
                        className="inline-flex items-center gap-1 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <User className="w-3 h-3" />
                        <span
                          className={`font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {article.author.reporter.full_name}
                        </span>
                        {article.author.reporter.is_verified && (
                          <div className="flex items-center">
                            {getVerificationIcon(
                              article.author.reporter.verification_badge ||
                                "verified"
                            )}
                          </div>
                        )}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-1 text-sm">
                        <User className="w-3 h-3" />
                        <span
                          className={`font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {article.author.name}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* التصنيف */}
                {article.category && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                    {article.category.icon && (
                      <span className="text-base">{article.category.icon}</span>
                    )}
                    <span className="font-medium">{article.category.name}</span>
                  </div>
                )}
              </div>

              {/* أيقونات صفية مضغوطة */}
              <div className="flex items-center justify-between mb-4">
                {/* المعلومات الأساسية */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar
                      className={`w-3 h-3 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      {formatDateGregorian(article.published_at)}
                    </span>
                  </div>
                  {article.reading_time && (
                    <div className="flex items-center gap-1">
                      <Clock
                        className={`w-3 h-3 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={darkMode ? "text-gray-400" : "text-gray-600"}
                      >
                        {article.reading_time} د
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Headphones
                      className={`w-3 h-3 ${
                        darkMode ? "text-green-400" : "text-green-500"
                      }`}
                    />
                    <span
                      className={darkMode ? "text-green-400" : "text-green-600"}
                    >
                      استمع
                    </span>
                  </div>
                </div>

                {/* إحصائيات التفاعل */}
                <div className="flex items-center gap-3 text-xs">
                  {article.views && (
                    <div className="flex items-center gap-1">
                      <Eye
                        className={`w-3 h-3 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={darkMode ? "text-gray-400" : "text-gray-600"}
                      >
                        {article.views > 1000
                          ? `${(article.views / 1000).toFixed(1)}ك`
                          : article.views}
                      </span>
                    </div>
                  )}
                  {article.likes !== undefined && (
                    <div className="flex items-center gap-1">
                      <Heart
                        className={`w-3 h-3 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={darkMode ? "text-gray-400" : "text-gray-600"}
                      >
                        {article.likes}
                      </span>
                    </div>
                  )}
                  {article.shares !== undefined && (
                    <div className="flex items-center gap-1">
                      <Share2
                        className={`w-3 h-3 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={darkMode ? "text-gray-400" : "text-gray-600"}
                      >
                        {article.shares}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* زر "اقرأ المزيد" - محاذاة لليسار */}
              <div className="mt-auto flex justify-start">
                <div
                  className={`group/btn inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-300 ${
                    darkMode
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
                  } transform hover:-translate-y-0.5`}
                >
                  <span>اقرأ المزيد</span>
                  <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FeaturedNewsBlock;
