'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, Clock, ExternalLink, X, AlertTriangle } from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface BreakingNewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  lead?: string;
  featuredImage?: string;
  publishedAt: string;
  category?: string;
}

interface VersionedBreakingNewsProps {
  version: 'full' | 'light';
  isMobile?: boolean;
  className?: string;
}

export default function VersionedBreakingNews({ 
  version = 'full', 
  isMobile = false,
  className = ''
}: VersionedBreakingNewsProps) {
  const { darkMode } = useDarkModeContext();
  const [news, setNews] = useState<BreakingNewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const response = await fetch('/api/breaking-news');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setNews(data.data);
          }
        }
      } catch (error) {
        console.error('خطأ في جلب الأخبار العاجلة:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakingNews();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `منذ ${diffMinutes} دقيقة`;
    } else if (diffMinutes < 1440) {
      return `منذ ${Math.floor(diffMinutes / 60)} ساعة`;
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${version === 'full' ? 'h-16' : 'h-20'} ${
        darkMode ? 'bg-gray-800' : 'bg-gray-100'
      } ${className}`}>
        <div className="flex items-center gap-3 h-full px-4">
          <div className="w-6 h-6 bg-red-300 rounded-full"></div>
          <div className="h-4 bg-red-300 rounded w-32"></div>
          <div className="h-3 bg-gray-300 rounded w-48 flex-1"></div>
        </div>
      </div>
    );
  }

  if (!news || dismissed) {
    return null;
  }

  // النسخة الكاملة - شريط ملصق بالهيدر
  if (version === 'full') {
    return (
      <div className={`
        w-full bg-gradient-to-r from-red-600 to-red-700 
        dark:from-red-700 dark:to-red-800
        text-white shadow-lg border-b border-red-800
        breaking-news-banner
        ${className}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* أيقونة العاجل */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm">
                  <Flame className="w-4 h-4 text-white breaking-icon-pulse" />
                </div>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                  عاجل
                </span>
              </div>

              {/* المحتوى */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm sm:text-base truncate flex-1">
                  {news.title}
                </h3>
                
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(news.publishedAt)}</span>
                  </div>

                  <Link
                    href={`/articles/${news.slug}`}
                    className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 
                               text-white text-xs font-medium px-3 py-1.5 rounded-full 
                               transition-all duration-200 backdrop-blur-sm breaking-link"
                  >
                    <span>التفاصيل</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* زر الإغلاق */}
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-white/60 hover:text-white/80 transition-colors ml-2"
              title="إخفاء الخبر"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // النسخة الخفيفة - مستطيل ناعم بحدود حمراء
  if (version === 'light') {
    return (
      <div className={`
        max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6
        ${className}
      `}>
        <div className={`
          rounded-lg border-2 border-red-300 dark:border-red-400
          ${darkMode ? 'bg-red-50/10 backdrop-blur-sm' : 'bg-red-50'}
          shadow-sm hover:shadow-md transition-all duration-300
          overflow-hidden breaking-news-light breaking-news-shadow
        `}>
          {/* هيدر الخبر العاجل */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 breaking-icon-pulse" />
                <span className="font-bold text-sm uppercase tracking-wide">
                  ⚡ خبر عاجل
                </span>
                {news.category && (
                  <span className="text-red-100 text-xs bg-red-700/50 px-2 py-0.5 rounded-full">
                    {news.category}
                  </span>
                )}
              </div>
              
              <button
                onClick={() => setDismissed(true)}
                className="text-red-100 hover:text-white transition-colors p-1 rounded text-sm"
                title="إخفاء الخبر"
              >
                ✕
              </button>
            </div>
          </div>

          {/* محتوى الخبر */}
          <div className="p-4">
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
              {/* الصورة */}
              {news.featuredImage && (
                <div className="flex-shrink-0">
                  <Link href={`/articles/${news.slug}`}>
                    <Image
                      src={news.featuredImage}
                      alt={news.title}
                      width={isMobile ? 300 : 120}
                      height={isMobile ? 200 : 80}
                      className={`
                        ${isMobile ? 'w-full h-40' : 'w-28 h-20'} 
                        object-cover rounded-lg border-2 border-red-200 
                        hover:border-red-300 transition-colors
                      `}
                    />
                  </Link>
                </div>
              )}

              {/* النص */}
              <div className="flex-1 space-y-3">
                <Link href={`/articles/${news.slug}`}>
                  <h3 className={`
                    font-bold leading-tight hover:text-red-600 transition-colors breaking-link
                    ${isMobile ? 'text-lg' : 'text-base'}
                    ${darkMode ? 'text-gray-100' : 'text-gray-900'}
                  `}>
                    {news.title}
                  </h3>
                </Link>
                
                {(news.excerpt || news.summary || news.lead) && (
                  <p className={`
                    text-sm leading-relaxed
                    ${isMobile ? 'line-clamp-3' : 'line-clamp-2'}
                    ${darkMode ? 'text-gray-300' : 'text-gray-600'}
                  `}>
                    {news.excerpt || news.summary || news.lead}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className={`flex items-center gap-1 text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(news.publishedAt)}</span>
                  </div>
                  
                  <Link 
                    href={`/articles/${news.slug}`}
                    className="group inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors breaking-link"
                  >
                    <span>اقرأ التفاصيل</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-[-2px] transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
