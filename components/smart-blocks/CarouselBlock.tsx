'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  category?: string;
  publishedAt: string;
}

interface CarouselBlockProps {
  block: {
    id: string;
    name: string;
    theme: {
      primaryColor: string;
      backgroundColor: string;
      textColor: string;
    };
  };
  articles: Article[];
}

export const CarouselBlock: React.FC<CarouselBlockProps> = ({ block, articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // حساب عدد البطاقات المرئية
  const getVisibleCards = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [visibleCards, setVisibleCards] = useState(getVisibleCards());

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // التشغيل التلقائي
  useEffect(() => {
    if (isAutoPlaying && articles.length > visibleCards) {
      autoPlayIntervalRef.current = setInterval(() => {
        handleNext();
      }, 5000);
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, articles.length, visibleCards]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, articles.length - visibleCards) : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev >= articles.length - visibleCards ? 0 : prev + 1
    );
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  return (
    <div 
      className="w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* عنوان البلوك */}
      <div className="mb-6 flex items-center justify-between">
        <h2 
          className="text-2xl font-bold"
          style={{ color: block.theme.textColor }}
        >
          {block.name}
        </h2>
        
        {/* أزرار التحكم */}
        {articles.length > visibleCards && (
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: `${block.theme.primaryColor}20`,
                color: block.theme.primaryColor
              }}
              aria-label="السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: `${block.theme.primaryColor}20`,
                color: block.theme.primaryColor
              }}
              aria-label="التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* حاوية الكاروسيل */}
      <div className="relative overflow-hidden rounded-xl">
        <div 
          ref={scrollContainerRef}
          className="flex transition-transform duration-500 ease-out gap-4"
          style={{
            transform: `translateX(${currentIndex * (100 / visibleCards + 1.33)}%)`
          }}
        >
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group flex-shrink-0"
              style={{ width: `calc(${100 / visibleCards}% - 1rem)` }}
            >
              <div 
                className="h-full rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                style={{ 
                  backgroundColor: block.theme.backgroundColor,
                  borderColor: block.theme.primaryColor,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                {/* صورة المقال */}
                {article.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* شارة التصنيف */}
                    {article.category && (
                      <div 
                        className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: block.theme.primaryColor }}
                      >
                        {article.category}
                      </div>
                    )}
                  </div>
                )}

                {/* محتوى البطاقة */}
                <div className="p-4">
                  <h3 
                    className="font-bold text-lg mb-2 line-clamp-2 group-hover:underline"
                    style={{ color: block.theme.textColor }}
                  >
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p 
                      className="text-sm mb-3 line-clamp-2 opacity-80"
                      style={{ color: block.theme.textColor }}
                    >
                      {article.excerpt}
                    </p>
                  )}

                  {/* التاريخ */}
                  <div 
                    className="flex items-center gap-1 text-xs opacity-60"
                    style={{ color: block.theme.textColor }}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(article.publishedAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* مؤشرات الكاروسيل */}
      {articles.length > visibleCards && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(articles.length - visibleCards + 1) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index === currentIndex 
                  ? block.theme.primaryColor 
                  : `${block.theme.primaryColor}30`
              }}
              aria-label={`الانتقال إلى الشريحة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 