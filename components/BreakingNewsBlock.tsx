'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, ArrowLeft, X, AlertTriangle, Zap } from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import CloudImage from '@/components/ui/CloudImage';

interface BreakingNewsArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  lead?: string;
  featuredImage?: string;
  publishedAt: string;
  category?: string;
  readTime?: number;
}

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

export default function BreakingNewsBlock() {
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

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className={`rounded-3xl p-6 lg:p-8 transition-all duration-500 shadow-lg animate-pulse ${
          darkMode ? 'bg-red-900/10 border border-red-800/30' : 'bg-red-50 border border-red-200/50'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-red-300 rounded w-24 mb-2"></div>
              <div className="h-6 bg-red-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!news || dismissed) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
      <div 
        className={`rounded-3xl p-4 sm:p-6 lg:p-8 transition-all duration-500 shadow-lg ${
          darkMode ? 'bg-red-900/10 border border-red-800/30' : 'bg-red-50 border border-red-200/50'
        }`} 
        style={{ 
          backdropFilter: 'blur(10px)',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(185, 28, 28, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(254, 226, 226, 0.5) 0%, rgba(252, 165, 165, 0.3) 100%)'
        }}
      >
        <div className="text-center mb-6 sm:mb-8">
          {/* أيقونة كبيرة وواضحة */}
          <div className="mb-4">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center shadow-xl ${
              darkMode 
                ? 'bg-gradient-to-br from-red-600 to-red-800' 
                : 'bg-gradient-to-br from-red-500 to-red-700'
            }`}>
              <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
            </div>
          </div>
          
          {/* العنوان */}
          <h2 className={`text-xl sm:text-2xl font-bold mb-3 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            🚨 خبر عاجل
          </h2>
          
          {/* الوصف */}
          <p className={`text-sm transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            آخر الأخبار العاجلة والمستجدات المهمة
          </p>
          
          <div className={`text-xs mt-2 transition-colors duration-300 ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <div className="flex items-center gap-1 justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="opacity-75">تحديث مباشر</span>
            </div>
          </div>
        </div>

        {/* محتوى الخبر العاجل */}
        <div className={`rounded-2xl p-6 shadow-lg ${
          darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
        } backdrop-blur-sm relative`}>
          {/* زر الإغلاق */}
          <button
            onClick={() => setDismissed(true)}
            className={`absolute top-4 left-4 p-1 rounded-lg transition-colors ${
              darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="إخفاء الخبر"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* الصورة */}
            {news.featuredImage && (
              <div className="flex-shrink-0">
                <Link href={`/articles/${news.slug}`}>
                  <div className="relative w-full lg:w-48 h-48 lg:h-32 rounded-xl overflow-hidden border-2 border-red-200 hover:border-red-300 transition-colors">
                    <CloudImage
                      src={news.featuredImage}
                      alt={news.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      fallbackType="article"
                    />
                  </div>
                </Link>
              </div>
            )}

            {/* النص */}
            <div className="flex-1 space-y-4">
              {/* الشارات العلوية */}
              <div className="flex flex-wrap items-center gap-3">
                {/* شارة خبر عاجل */}
                <span className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide animate-pulse">
                  <Zap className="w-3 h-3" />
                  خبر عاجل
                </span>
                
                {/* التصنيف */}
                {news.category && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                    darkMode 
                      ? 'bg-red-800/20 text-red-300 border border-red-700/30' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    {news.category}
                  </span>
                )}
              </div>

              {/* العنوان */}
              <Link href={`/articles/${news.slug}`}>
                <h3 className={`text-xl lg:text-2xl font-bold leading-tight hover:text-red-600 transition-colors cursor-pointer ${
                  darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {news.title}
                </h3>
              </Link>
              
              {/* الملخص */}
              {(news.summary || news.lead) && (
                <p className={`text-base leading-relaxed line-clamp-3 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {news.summary || news.lead}
                </p>
              )}

              {/* التفاصيل السفلية */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm">
                  <div className={`flex items-center gap-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(news.publishedAt)}</span>
                  </div>
                  
                  {news.readTime && (
                    <span className={`flex items-center gap-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {news.readTime} دقيقة قراءة
                    </span>
                  )}
                </div>
                
                <Link 
                  href={`/articles/${news.slug}`}
                  className={`group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    darkMode 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  }`}
                >
                  <span>اقرأ التفاصيل</span>
                  <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
