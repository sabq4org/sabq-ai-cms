'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Star, Clock, User, Eye, Heart, Share2, 
  CheckCircle2, Award, Calendar, ExternalLink,
  Sparkles
} from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import { formatDateGregorian } from '@/lib/date-utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface FeaturedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  reading_time: number;
  views: number;
  likes: number;
  shares: number;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
  author: {
    id: string;
    name: string;
    reporter: {
      id: string;
      full_name: string;
      slug: string;
      title: string;
      is_verified: boolean;
      verification_badge: string;
    } | null;
  } | null;
}

const FeaturedNewsBlock: React.FC = () => {
  const { darkMode } = useDarkModeContext();
  const [featuredArticle, setFeaturedArticle] = useState<FeaturedArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedNews();
  }, []);

  const fetchFeaturedNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/featured-news');
      const data = await response.json();
      
      if (data.success && data.article) {
        setFeaturedArticle(data.article);
      } else {
        setFeaturedArticle(null);
      }
    } catch (error: any) {
      console.error('خطأ في جلب الخبر المميز:', error);
      setError('فشل في تحميل الخبر المميز');
    } finally {
      setLoading(false);
    }
  };

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
    return `/article/${article.id}`;
  };

  // إذا كان هناك خطأ أو لا يوجد محتوى، لا نعرض شيئاً
  if (loading || error || !featuredArticle) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <Link 
        href={getArticleLink(featuredArticle)}
        className="group block"
      >
        {/* البلوك الرئيسي */}
        <div className={`relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl ${
          darkMode 
            ? 'bg-gray-800/50 hover:bg-gray-800/70' 
            : 'bg-white/80 hover:bg-white'
        } backdrop-blur-sm rounded-3xl`}>
          
          {/* Grid Layout: 3/4 للصورة، 1/4 للنص */}
          <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[300px] lg:min-h-[400px]">
            
            {/* قسم الصورة - 3/4 من العرض */}
            <div className="lg:col-span-3 relative overflow-hidden lg:rounded-r-3xl rounded-t-3xl lg:rounded-t-none">
              {/* الصورة */}
              <div className="relative w-full h-64 lg:h-full">
                <CloudImage
                  src={featuredArticle.featured_image}
                  alt={featuredArticle.title}
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  fallbackType="article"
                  priority={true}
                />
                
                {/* تدرج لوني ناعم فوق الصورة */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-l lg:from-black/30 lg:via-transparent lg:to-transparent"></div>
                
                {/* شارة الخبر المميز */}
                <div className="absolute top-4 right-4 lg:top-6 lg:right-6">
                  <div className={`flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 rounded-full ${
                    darkMode 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                  } shadow-xl backdrop-blur-sm border border-amber-400/30`}>
                    <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="font-bold text-sm lg:text-base">خبر مميز</span>
                  </div>
                </div>

                {/* معلومات التصنيف */}
                {featuredArticle.category && (
                  <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
                      darkMode 
                        ? 'bg-blue-900/80 text-blue-100'
                        : 'bg-blue-600/90 text-white'
                    } backdrop-blur-sm shadow-lg`}>
                      <span className="text-lg">{featuredArticle.category.icon}</span>
                      <span className="font-medium text-sm">{featuredArticle.category.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* قسم النص - 1/4 من العرض */}
            <div className="lg:col-span-1 p-6 lg:p-8 flex flex-col justify-center">
              {/* العنوان الرئيسي */}
              <h2 className={`text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 lg:mb-6 leading-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {featuredArticle.title}
              </h2>

              {/* موجز الخبر */}
              {featuredArticle.excerpt && (
                <p className={`text-base lg:text-lg mb-4 lg:mb-6 leading-relaxed line-clamp-3 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {featuredArticle.excerpt}
                </p>
              )}

              {/* معلومات المراسل */}
              {featuredArticle.author && (
                <div className="mb-4 lg:mb-6">
                  {featuredArticle.author.reporter ? (
                    <Link 
                      href={`/reporter/${featuredArticle.author.reporter.slug}`}
                      className="inline-flex items-center gap-2 group/reporter hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <User className="w-4 h-4" />
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {featuredArticle.author.reporter.full_name}
                      </span>
                      {featuredArticle.author.reporter.title && (
                        <span className={`text-sm opacity-75 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          - {featuredArticle.author.reporter.title}
                        </span>
                      )}
                      {featuredArticle.author.reporter.is_verified && (
                        <div className="flex items-center">
                          {getVerificationIcon(featuredArticle.author.reporter.verification_badge)}
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {featuredArticle.author.name}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* وقت وتاريخ النشر */}
              <div className="mb-4 lg:mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDateGregorian(featuredArticle.published_at)}
                  </span>
                </div>
                {featuredArticle.reading_time && (
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {featuredArticle.reading_time} دقيقة قراءة
                    </span>
                  </div>
                )}
              </div>

              {/* إحصائيات التفاعل */}
              <div className="flex items-center gap-4 lg:gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {featuredArticle.views > 1000 ? `${(featuredArticle.views / 1000).toFixed(1)}ك` : featuredArticle.views}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {featuredArticle.likes}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {featuredArticle.shares}
                  </span>
                </div>
              </div>

              {/* زر قراءة المزيد (اختياري) */}
              <div className="mt-6 lg:mt-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all group-hover:scale-105 ${
                  darkMode 
                    ? 'border-blue-600 text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                    : 'border-blue-500 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'
                }`}>
                  <span className="font-medium">اقرأ التفاصيل</span>
                  <ExternalLink className="w-4 h-4" />
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