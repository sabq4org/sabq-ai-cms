'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, Eye, User } from 'lucide-react';
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
  category: {
    id: string;
    name: string;
  } | null;
  author: {
    id: string;
    name: string;
  } | null;
}

interface FeaturedCarouselProps {
  articles: FeaturedArticle[];
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ articles }) => {
  const { darkMode } = useDarkModeContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // التنقل التلقائي كل 3 ثوانٍ
  useEffect(() => {
    if (articles.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
      }, 3000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [articles.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // إعادة تشغيل المؤقت
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
      }, 3000);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      {/* العنوان */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-amber-500" />
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          الأخبار المميزة
        </h2>
      </div>

      {/* الكاروسيل */}
      <div className="relative">
        <div className="overflow-hidden rounded-2xl shadow-xl">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {articles.map((article, index) => (
              <div
                key={article.id}
                className="w-full flex-shrink-0"
                style={{ width: '100%' }}
              >
                <Link href={getArticleLink(article)} className="block">
                  <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* الصورة */}
                    <div className="relative h-[400px] overflow-hidden">
                      <CloudImage
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        fallbackType="article"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      {/* شارة مميز */}
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-bold">مميز</span>
                        </div>
                      </div>

                      {/* المحتوى */}
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        {/* التصنيف */}
                        {article.category && (
                          <div className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full mb-3">
                            {article.category.name}
                          </div>
                        )}
                        
                        {/* العنوان */}
                        <h3 className="text-3xl font-bold text-white mb-3 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        {/* الموجز */}
                        {article.excerpt && (
                          <p className="text-gray-200 text-lg mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        
                        {/* المعلومات */}
                        <div className="flex items-center gap-6 text-gray-300 text-sm">
                          {article.author && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{article.author.name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatDateGregorian(article.published_at)}</span>
                          </div>
                          
                          {article.views > 0 && (
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              <span>{article.views.toLocaleString('ar-SA')} مشاهدة</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* المؤشرات */}
        {articles.length > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-12 bg-blue-600'
                    : 'w-12 bg-gray-300 hover:bg-gray-400'
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