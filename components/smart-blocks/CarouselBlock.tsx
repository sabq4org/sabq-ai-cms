'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Pause, Clock, Eye, Image as ImageIcon } from 'lucide-react';

interface CarouselBlockProps {
  block: any;
  articles: any[];
}

export function CarouselBlock({ block, articles }: CarouselBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const displayArticles = articles.slice(0, block.config?.itemsCount || 5);

  useEffect(() => {
    if (!isPlaying || displayArticles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayArticles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, displayArticles.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayArticles.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + displayArticles.length) % displayArticles.length);
  };

  if (displayArticles.length === 0) {
    return (
      <div className="smart-block-container">
        <div className="smart-block-header">
          <div className="smart-block-header-content">
            <div className="smart-block-title-wrapper">
              <ImageIcon className="smart-block-icon" />
              <h2 className="smart-block-title">{block.name || 'معرض الصور'}</h2>
            </div>
            {block.keywords && block.keywords.length > 0 && (
              <div className="smart-block-keywords">
                {block.keywords.map((keyword: string, index: number) => (
                  <span key={index} className="keyword-badge">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="empty-block-message">
          <div className="empty-icon">🎠</div>
          <p className="empty-text">لا توجد مقالات مرتبطة بهذه الكلمة المفتاحية حالياً</p>
          <p className="empty-subtext">سيتم تحديث البلوك تلقائياً عند توفر محتوى جديد</p>
        </div>
      </div>
    );
  }

  const currentArticle = displayArticles[currentIndex];

  return (
    <div className="smart-block-container">
      <div className="smart-block-header">
        <div className="smart-block-header-content">
          <div className="smart-block-title-wrapper">
            <ImageIcon className="smart-block-icon" />
            <h2 className="smart-block-title">{block.name || 'معرض الصور'}</h2>
          </div>
          {block.keywords && block.keywords.length > 0 && (
            <div className="smart-block-keywords">
              {block.keywords.map((keyword: string, index: number) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link href="/news" className="view-all-link">
          عرض الكل
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="carousel-container">
        <div className="carousel-content">
          <div className="carousel-image-section">
            {currentArticle.image || currentArticle.featured_image ? (
              <Image
                src={currentArticle.image || currentArticle.featured_image}
                alt={currentArticle.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10">
                <ImageIcon className="w-20 h-20 text-orange-400 dark:text-orange-500" />
              </div>
            )}
            
            <div className="carousel-overlay">
              <div className="carousel-controls">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="carousel-control-btn"
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="carousel-info-section">
            <Link href={`/article/${currentArticle.id}`} className="carousel-article-link">
              <span className="carousel-category">
                {currentArticle.category || 'أخبار'}
              </span>
              <h3 className="carousel-title">
                {currentArticle.title}
              </h3>
              {currentArticle.excerpt && (
                <p className="carousel-excerpt">
                  {currentArticle.excerpt}
                </p>
              )}
              <div className="carousel-meta">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(currentArticle.published_at || currentArticle.created_at).toLocaleDateString('ar-SA')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {currentArticle.views || 0} مشاهدة
                </span>
              </div>
            </Link>

            <div className="carousel-navigation">
              <button
                onClick={goToPrevious}
                className="carousel-nav-btn"
                aria-label="السابق"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="carousel-indicators">
                {displayArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                    aria-label={`الانتقال إلى الشريحة ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="carousel-nav-btn"
                aria-label="التالي"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 