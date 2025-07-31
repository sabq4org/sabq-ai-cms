'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, Eye, User, ChevronLeft, ChevronRight } from 'lucide-react';
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
  reading_time?: number;
  views?: number;
  category?: {
    id: string;
    name: string;
  } | null;
  author?: {
    id: string;
    name: string;
  } | null;
}

interface FeaturedCarouselProProps {
  articles: FeaturedArticle[];
}

const FeaturedCarouselPro: React.FC<FeaturedCarouselProProps> = ({ articles }) => {
  const { darkMode } = useDarkModeContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // التنقل التلقائي
  useEffect(() => {
    if (articles.length > 1) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, 5000); // كل 5 ثوانٍ

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [articles.length, currentIndex]);

  const handleNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % articles.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handlePrev = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const getArticleLink = (article: FeaturedArticle) => {
    if (article.slug && /[\u0600-\u06FF]/.test(article.slug)) {
      return `/article/${article.slug}`;
    }
    return `/article/${article.id}`;
  };

  if (!articles || articles.length === 0) {
    return null;
  }

  const currentArticle = articles[currentIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            الأخبار المميزة
          </h2>
        </div>
        
        {/* عداد المقالات */}
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {currentIndex + 1} / {articles.length}
        </div>
      </div>

      {/* الكاروسيل */}
      <div className="relative group">
        <div className="overflow-hidden rounded-2xl shadow-2xl">
          <Link href={getArticleLink(currentArticle)} className="block">
            <div className={`relative ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
              {/* الصورة الرئيسية */}
              <div className="relative h-[500px] overflow-hidden">
                <CloudImage
                  src={currentArticle.featured_image}
                  alt={currentArticle.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  fallbackType="article"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                
                {/* شارة مميز */}
                <div className="absolute top-6 right-6">
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-xl backdrop-blur-sm">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold text-base">خبر مميز</span>
                  </div>
                </div>

                {/* المحتوى */}
                <div className="absolute bottom-0 left-0 right-0 p-10">
                  {/* التصنيف */}
                  {currentArticle.category && (
                    <div className="inline-block px-4 py-2 bg-blue-600/90 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-4">
                      {currentArticle.category.name}
                    </div>
                  )}
                  
                  {/* العنوان */}
                  <h3 className="text-4xl font-bold text-white mb-4 leading-tight">
                    {currentArticle.title}
                  </h3>
                  
                  {/* الموجز */}
                  {currentArticle.excerpt && (
                    <p className="text-gray-200 text-xl mb-6 line-clamp-2 max-w-4xl">
                      {currentArticle.excerpt}
                    </p>
                  )}
                  
                  {/* المعلومات */}
                  <div className="flex items-center gap-8 text-gray-300">
                    {currentArticle.author && (
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <span className="font-medium">{currentArticle.author.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{formatDateGregorian(currentArticle.published_at)}</span>
                    </div>
                    
                    {currentArticle.views && currentArticle.views > 0 && (
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        <span>{currentArticle.views.toLocaleString('ar-SA')} مشاهدة</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* أزرار التنقل */}
        {articles.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
              aria-label="السابق"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
              aria-label="التالي"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* المؤشرات والصور المصغرة */}
      {articles.length > 1 && (
        <div className="mt-6">
          {/* الشرطات */}
          <div className="flex justify-center gap-2 mb-4">
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-16 bg-blue-600'
                    : 'w-16 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`الانتقال إلى الخبر ${index + 1}`}
              />
            ))}
          </div>
          
          {/* الصور المصغرة */}
          <div className="flex justify-center gap-4">
            {articles.map((article, index) => (
              <button
                key={article.id}
                onClick={() => goToSlide(index)}
                className={`relative overflow-hidden rounded-lg transition-all ${
                  index === currentIndex
                    ? 'ring-2 ring-blue-600 scale-110'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div className="relative w-24 h-16">
                  <CloudImage
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    fallbackType="article"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedCarouselPro;