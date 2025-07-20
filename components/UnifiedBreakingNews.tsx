'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, ExternalLink, X } from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface BreakingNewsArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  publishedAt: string;
  category?: string;
  readTime?: number;
  isUrgent?: boolean;
}

interface UnifiedBreakingNewsProps {
  variant?: 'desktop' | 'mobile';
  showDismiss?: boolean;
  className?: string;
}

export default function UnifiedBreakingNews({ 
  variant = 'desktop', 
  showDismiss = false,
  className = ''
}: UnifiedBreakingNewsProps) {
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
      <div className={`
        animate-pulse
        ${variant === 'mobile' 
          ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4' 
          : 'bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800 py-2'
        }
        ${className}
      `}>
        <div className="flex items-center gap-2 max-w-7xl mx-auto px-4">
          <div className="w-6 h-6 bg-red-300 dark:bg-red-700 rounded-full"></div>
          <div className="h-4 bg-red-300 dark:bg-red-700 rounded flex-1 max-w-md"></div>
        </div>
      </div>
    );
  }

  if (!news || dismissed) {
    return null;
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

  // التصميم للموبايل
  if (variant === 'mobile') {
    return (
      <div className={`
        bg-gradient-to-r from-red-500 to-red-600 
        dark:from-red-600 dark:to-red-700
        text-white rounded-lg p-4 mb-4 shadow-lg
        border border-red-400 dark:border-red-500
        ${className}
      `}>
        <div className="flex items-start gap-3">
          {/* أيقونة العاجل */}
          <div className="flex-shrink-0 mt-1">
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm">
              <Flame className="w-4 h-4 text-white animate-pulse" />
            </div>
          </div>

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                عاجل
              </span>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Clock className="w-3 h-3" />
                <span>{formatTime(news.publishedAt)}</span>
              </div>
            </div>

            <h3 className="text-white font-bold text-sm leading-tight mb-2 line-clamp-2">
              {news.title}
            </h3>

            <Link
              href={`/articles/${news.slug}`}
              className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 
                         text-white text-xs font-medium px-3 py-1.5 rounded-full 
                         transition-all duration-200 backdrop-blur-sm"
            >
              <span>قراءة التفاصيل</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* زر الإغلاق */}
          {showDismiss && (
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full 
                         transition-colors duration-200"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // التصميم للديسكتوب (النموذج الصحيح - المربع الأحمر الصغير)
  return (
    <div className={`
      w-full bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800
      ${className}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* أيقونة العاجل */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-6 h-6 bg-red-600 rounded-full">
                <Flame className="w-3 h-3 text-white animate-pulse" />
              </div>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                عاجل
              </span>
            </div>

            {/* العنوان والوقت */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <h3 className="text-red-800 dark:text-red-200 font-bold text-sm truncate flex-1">
                {news.title}
              </h3>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(news.publishedAt)}</span>
                </div>

                <Link
                  href={`/articles/${news.slug}`}
                  className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 
                             text-white text-xs font-medium px-3 py-1 rounded
                             transition-colors duration-200"
                >
                  <span>التفاصيل</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* زر الإغلاق */}
          {showDismiss && (
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 hover:bg-red-200 dark:hover:bg-red-800/50 
                         rounded-full transition-colors duration-200 ml-2"
            >
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
