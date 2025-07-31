'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Star, Clock, User, Eye, Heart, Share2, 
  CheckCircle2, Award, Calendar, ExternalLink,
  Sparkles, ChevronLeft, ChevronRight
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

interface FeaturedCarouselProps {
  articles: FeaturedArticle[];
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ articles }) => {
  const { darkMode } = useDarkModeContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  


  // التنقل التلقائي
  useEffect(() => {
    if (isAutoPlaying && articles.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
      }, 3000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [articles.length, isAutoPlaying, currentIndex]);

  // إيقاف التشغيل التلقائي عند التفاعل
  const handleUserInteraction = () => {
    setIsAutoPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // إعادة التشغيل التلقائي بعد 10 ثوان
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    handleUserInteraction();
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    handleUserInteraction();
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const goToNext = () => {
    handleUserInteraction();
    setCurrentIndex((prev) => (prev + 1) % articles.length);
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

  if (!articles || articles.length === 0) {
    return null;
  }

  const currentArticle = articles[currentIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="relative">
        {/* العنوان */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Sparkles className="w-6 h-6 text-amber-500" />
            الأخبار المميزة
          </h2>
          

        </div>

        {/* الكاروسيل */}
        <div className="relative overflow-hidden rounded-3xl">
          {/* الشرائح */}
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(${currentIndex * -100}%)` }}
          >
            {articles.map((article, index) => (
              <div
                key={article.id}
                className="w-full flex-shrink-0"
                style={{ minWidth: '100%' }}
              >
                <Link 
                  href={getArticleLink(article)}
                  className="group block"
                >
                  <div className={`relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl ${
                    darkMode 
                      ? 'bg-gray-800/50 hover:bg-gray-800/70' 
                      : 'bg-white/80 hover:bg-white'
                  } backdrop-blur-sm`}>
                    
                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[240px] lg:min-h-[320px]">
                      
                      {/* قسم الصورة */}
                      <div className="lg:col-span-6 relative overflow-hidden">
                        <div className="relative w-full h-48 lg:h-full">
                          <CloudImage
                            src={article.featured_image}
                            alt={article.title}
                            fill
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            fallbackType="article"
                            priority={index === 0}
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-l lg:from-black/30 lg:via-transparent lg:to-transparent"></div>
                          
                          {/* شارة الخبر المميز */}
                          <div className="absolute top-3 right-3">
                            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                              darkMode 
                                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                            } shadow-lg backdrop-blur-sm border border-amber-400/30`}>
                              <Sparkles className="w-4 h-4" />
                              <span className="font-bold text-sm">مميز</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* قسم النص */}
                      <div className="lg:col-span-6 p-6 lg:p-8 flex flex-col justify-center">
                        {/* العنوان */}
                        <h3 className={`text-xl lg:text-2xl xl:text-3xl font-bold mb-4 leading-tight line-clamp-3 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {article.title}
                        </h3>

                        {/* الموجز */}
                        {article.excerpt && (
                          <p className={`text-sm lg:text-base mb-4 leading-relaxed line-clamp-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {article.excerpt}
                          </p>
                        )}

                        {/* المعلومات */}
                        <div className="space-y-3">
                          {/* المراسل والتصنيف */}
                          <div className="flex flex-wrap items-center gap-4">
                            {article.author && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className={`font-medium text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {article.author.reporter?.full_name || article.author.name}
                                </span>
                                {article.author.reporter?.is_verified && (
                                  getVerificationIcon(article.author.reporter.verification_badge)
                                )}
                              </div>
                            )}
                            
                            {article.category && (
                              <div className="flex items-center gap-1 text-sm">
                                <span className="text-base">{article.category.icon}</span>
                                <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                  {article.category.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* الإحصائيات */}
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                {formatDateGregorian(article.published_at)}
                              </span>
                            </div>
                            {article.reading_time && (
                              <div className="flex items-center gap-1">
                                <Clock className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                  {article.reading_time} د
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Eye className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                {article.views > 1000 ? `${(article.views / 1000).toFixed(1)}ك` : article.views}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* زر اقرأ المزيد */}
                        <div className="mt-6">
                          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:translate-x-[-0.25rem] ${
                            darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}>
                            <span>اقرأ المزيد</span>
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>


        </div>

        {/* المؤشرات - شرطات في الأسفل */}
        {articles.length > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 h-1 ${
                  index === currentIndex
                    ? 'w-12 bg-blue-600 dark:bg-blue-400'
                    : 'w-12 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`الانتقال إلى الخبر ${index + 1}`}
              />
            ))}
          </div>
        )}


      </div>
    </div>
  );
};

export default FeaturedCarousel;