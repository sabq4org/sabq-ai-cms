'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Star, Clock, User, Eye, Heart, Share2, 
  CheckCircle2, Award, Calendar, ExternalLink,
  Sparkles, Headphones, Sliders
} from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import { formatDateGregorian } from '@/lib/date-utils';
import { processArticleImage } from '@/lib/image-utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

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
  is_breaking?: boolean;
  is_custom?: boolean;
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
  className?: string;
  showCompact?: boolean;
}

const FeaturedNewsBlock: React.FC<FeaturedNewsBlockProps> = ({ 
  article, 
  className = "",
  showCompact = false 
}) => {
  const { darkMode } = useDarkModeContext();

  const getVerificationIcon = (badge: string) => {
    switch (badge) {
      case 'expert':
        return <Star className="w-4 h-4 text-amber-500" />;
      case 'senior':
        return <Award className="w-4 h-4 text-purple-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getArticleLink = (article: FeaturedArticle) => {
    if (article.slug) {
      return `/news/${article.slug}`;
    }
    return `/news/${article.id}`;
  };

  // تحديد إذا كان الخبر جديد (آخر 12 ساعة)
  const isNewsNew = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return diffTime <= 12 * 60 * 60 * 1000; // 12 ساعة
  };

  // تنسيق التاريخ الميلادي (dd/MM/yyyy)
  const formatGregorianDate = (dateString: string) => {
    const date = new Date(dateString);
    try {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    }
  };

  // تنسيق الصورة بنظام معالجة محسن
  const getImageUrl = (article: FeaturedArticle) => {
    return processArticleImage(
      article.featured_image, 
      article.title, 
      'featured'
    );
  };

  // تنسيق المشاهدات
  const formatViews = (views: number = 0) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  // إذا لا يوجد محتوى، لا نعرض شيئاً
  if (!article) {
    return null;
  }

  // النسخة المضغوطة تستخدم تصميم النسخة الخفيفة
  if (showCompact) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 ${className}`}>
        <Link href={getArticleLink(article)} className="old-style-news-card block">
          {/* صورة المقال */}
          <div className="old-style-news-image-container">
            <CloudImage
              src={getImageUrl(article)}
              alt={article.title}
              className="old-style-news-image"
              priority={true}
              width={400}
              height={250}
              fallbackType="article"
            />
          </div>

          {/* محتوى المقال */}
          <div className="old-style-news-content">
            {/* الشريط العلوي: شارات + التاريخ */}
            <div className="old-style-news-top-bar">
              <div className="old-style-news-badges">
                {/* شارة عاجل */}
                {(article.breaking || article.is_breaking) && (
                  <div className="old-style-news-breaking-badge">
                    <span className="old-style-lightning-emoji" aria-hidden>⚡</span>
                    <span>عاجل</span>
                  </div>
                )}
                {/* شارة مميز */}
                <div className="old-style-news-featured-badge">
                  <Sparkles className="w-3 h-3" />
                  <span>مميز</span>
                </div>
                {/* شارة جديد */}
                {isNewsNew(article.published_at) && !(article.breaking || article.is_breaking) && (
                  <div className="old-style-news-new-badge">
                    <span className="old-style-fire-emoji" aria-hidden>🔥</span>
                    <span>جديد</span>
                  </div>
                )}
                {/* التاريخ */}
                <span className="old-style-news-date-inline">{formatGregorianDate(article.published_at)}</span>
              </div>
            </div>

            {/* العنوان */}
            <h3 className="old-style-news-card-title">
              {article.title}
            </h3>

            {/* المؤلف والتصنيف */}
            {(article.author || article.category) && (
              <div className="flex items-center gap-3 text-sm mb-3">
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {article.author.reporter?.full_name || article.author.name}
                    </span>
                    {article.author.reporter?.is_verified && (
                      <div className="flex items-center">
                        {getVerificationIcon(article.author.reporter.verification_badge || 'verified')}
                      </div>
                    )}
                  </div>
                )}
                {article.category && (
                  <div className="flex items-center gap-1">
                    {article.category.icon && (
                      <span className="text-sm">{article.category.icon}</span>
                    )}
                    <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {article.category.name}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* شريط المعلومات السفلي */}
            <div className="old-style-news-bottom-bar">
              {article.views && (
                <div className="old-style-news-meta-item">
                  <Eye className="old-style-icon" />
                  <span>{formatViews(article.views)} مشاهدة</span>
                  {article.views > 300 && <span className="ml-1">🔥</span>}
                </div>
              )}
              
              {article.reading_time && (
                <div className="old-style-news-meta-item">
                  <Clock className="old-style-icon" />
                  <span>{article.reading_time} د قراءة</span>
                </div>
              )}

              {article.likes && (
                <div className="old-style-news-meta-item">
                  <Heart className="old-style-icon" />
                  <span>{article.likes}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // النسخة الكاملة مع التحسينات الجديدة
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 ${className}`}>
      <Link href={getArticleLink(article)} className="group block">
        {/* البلوك الرئيسي مع تصميم النسخة الخفيفة المطور */}
        <div className={`relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl ${
          darkMode 
            ? 'bg-gray-800/40 hover:bg-gray-800/60' 
            : 'bg-white/60 hover:bg-white/90'
        } backdrop-blur-md rounded-3xl border border-white/20 dark:border-gray-700/30`}>
          
          {/* Grid Layout محسن: 40% للصورة، 60% للنص */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[280px] lg:min-h-[320px]">
            
            {/* قسم الصورة - 5 أعمدة (40%) */}
            <div className="lg:col-span-5 relative overflow-hidden lg:rounded-r-2xl rounded-t-2xl lg:rounded-t-none">
              <div className="relative w-full h-56 lg:h-full overflow-hidden">
                <CloudImage
                  src={getImageUrl(article)}
                  alt={article.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  priority={true}
                  width={500}
                  height={400}
                  fallbackType="article"
                />
                
                {/* تدرج لوني ناعم */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-l lg:from-black/30 lg:via-transparent lg:to-transparent"></div>
                
                {/* الشارات في الركن العلوي الأيمن */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {/* شارة عاجل - أولوية أعلى */}
                  {(article.breaking || article.is_breaking) && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-600 text-white shadow-lg backdrop-blur-sm text-sm font-bold">
                      <span className="text-xs">⚡</span>
                      <span>عاجل</span>
                    </div>
                  )}
                  
                  {/* شارة مميز */}
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    darkMode 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                  } shadow-lg backdrop-blur-sm text-sm font-bold`}>
                    <Sparkles className="w-3 h-3" />
                    <span>مميز</span>
                  </div>

                  {/* شارة جديد */}
                  {isNewsNew(article.published_at) && !(article.breaking || article.is_breaking) && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-600 text-white shadow-lg backdrop-blur-sm text-sm font-bold">
                      <span className="text-xs">🔥</span>
                      <span>جديد</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* قسم النص - 7 أعمدة (60%) */}
            <div className={`lg:col-span-7 p-6 lg:p-8 flex flex-col justify-center relative ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800/80 via-gray-800/70 to-gray-900/60' 
                : 'bg-gradient-to-br from-white/95 via-white/90 to-slate-50/80'
            } lg:rounded-l-2xl rounded-b-2xl lg:rounded-b-none backdrop-blur-sm`}>
              
              {/* التاريخ والمعلومات الأساسية */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {formatGregorianDate(article.published_at)}
                  </span>
                </div>
                {article.reading_time && (
                  <div className="flex items-center gap-1">
                    <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {article.reading_time} د
                    </span>
                  </div>
                )}
              </div>

              {/* العنوان الرئيسي */}
              <h2 className={`text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 leading-tight line-clamp-3 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                darkMode ? 'text-white drop-shadow-sm' : 'text-gray-900'
              }`}>
                {article.title}
              </h2>

              {/* موجز الخبر */}
              {article.excerpt && (
                <div className={`mb-6 p-4 rounded-lg border-r-4 ${
                  darkMode 
                    ? 'bg-gray-700/30 border-blue-400 backdrop-blur-sm' 
                    : 'bg-blue-50/60 border-blue-500 backdrop-blur-sm'
                }`}>
                  <p className={`text-base lg:text-lg font-normal leading-relaxed line-clamp-3 ${
                    darkMode ? 'text-gray-100 drop-shadow-sm' : 'text-gray-800'
                  }`}>
                    {article.excerpt}
                  </p>
                  <div className={`mt-2 text-xs font-medium ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    نبذة من الخبر
                  </div>
                </div>
              )}

              {/* معلومات المراسل والتصنيف */}
              <div className="mb-6 space-y-3">
                {article.author && (
                  <div className="flex items-center gap-2">
                    {article.author.reporter ? (
                      <Link 
                        href={`/reporter/${article.author.reporter.slug}`}
                        className="inline-flex items-center gap-2 text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <User className="w-4 h-4" />
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {article.author.reporter.full_name}
                        </span>
                        {article.author.reporter.is_verified && (
                          <div className="flex items-center">
                            {getVerificationIcon(article.author.reporter.verification_badge || 'verified')}
                          </div>
                        )}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 text-base">
                        <User className="w-4 h-4" />
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {article.author.name}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {article.category && (
                  <div className="flex items-center gap-2 text-base">
                    {article.category.icon && (
                      <span className="text-lg">{article.category.icon}</span>
                    )}
                    <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {article.category.name}
                    </span>
                  </div>
                )}
              </div>

              {/* إحصائيات التفاعل */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 text-sm">
                  {article.views && (
                    <div className="flex items-center gap-2">
                      <Eye className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {formatViews(article.views)} مشاهدة
                      </span>
                      {article.views > 300 && <span className="ml-1">🔥</span>}
                    </div>
                  )}
                  
                  {article.likes && (
                    <div className="flex items-center gap-2">
                      <Heart className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {article.likes}
                      </span>
                    </div>
                  )}
                  
                  {article.shares && (
                    <div className="flex items-center gap-2">
                      <Share2 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {article.shares}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Headphones className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                  <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    استمع
                  </span>
                </div>
              </div>

              {/* زر "اقرأ المزيد" */}
              <div className="mt-auto flex justify-start">
                <div className="group/btn inline-flex items-center gap-3 px-6 py-3 rounded-full text-base font-medium transition-all duration-300 soft-read-more-btn bg-blue-600 hover:bg-blue-700 text-white">
                  <span>اقرأ المزيد</span>
                  <ExternalLink className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
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
