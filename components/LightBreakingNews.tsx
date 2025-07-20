'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, Flame, Clock, ArrowLeft } from 'lucide-react';

interface BreakingNewsData {
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

interface LightBreakingNewsProps {
  darkMode?: boolean;
}

export default function LightBreakingNews({ darkMode = false }: LightBreakingNewsProps) {
  const [breakingNews, setBreakingNews] = useState<BreakingNewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    console.log('🔥 LightBreakingNews: تم تحميل مكون الأخبار العاجلة الخفيفة');
    
    const fetchBreakingNews = async () => {
      try {
        console.log('🔍 LightBreakingNews: بدء جلب الأخبار العاجلة...');
        setLoading(true);
        const response = await fetch('/api/breaking-news');
        
        if (response.ok) {
          const data = await response.json();
          console.log('📡 LightBreakingNews: استجابة API:', data);
          if (data.success && data.data) {
            setBreakingNews(data.data);
            console.log('✅ LightBreakingNews: تم تحديث الأخبار العاجلة:', data.data.title);
          } else {
            console.log('⚠️ LightBreakingNews: لا توجد أخبار عاجلة حالياً');
          }
        } else {
          console.error('❌ LightBreakingNews: فشل في الاستجابة:', response.status);
        }
      } catch (error) {
        console.error('❌ LightBreakingNews: خطأ في جلب الأخبار العاجلة:', error);
      } finally {
        setLoading(false);
        console.log('🏁 LightBreakingNews: انتهاء جلب الأخبار العاجلة');
      }
    };

    fetchBreakingNews();
    
    // إعادة التحقق كل 5 دقائق
    const interval = setInterval(fetchBreakingNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading || !breakingNews || dismissed) {
    console.log('🔍 LightBreakingNews: شروط العدم - loading:', loading, 'breakingNews:', !!breakingNews, 'dismissed:', dismissed);
    return null;
  }

  console.log('✅ LightBreakingNews: سيتم عرض الخبر العاجل:', breakingNews.title);

  const articleUrl = `/article/${breakingNews.id}`;
  const summary = breakingNews.summary || breakingNews.lead || '';

  return (
    <div className={`w-full border-l-4 border-red-500 shadow-lg rounded-lg overflow-hidden mb-6 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* هيدر الخبر العاجل */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-sm uppercase tracking-wide">
              ⚡ خبر عاجل
            </span>
            {breakingNews.category && (
              <span className="text-red-100 text-xs bg-red-800/50 px-2 py-1 rounded-full">
                {breakingNews.category}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setDismissed(true)}
            className="text-red-100 hover:text-white transition-colors p-1 rounded"
            title="إخفاء الخبر"
          >
            ✕
          </button>
        </div>
      </div>

      {/* محتوى الخبر */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* الصورة */}
          {breakingNews.featuredImage && (
            <div className="flex-shrink-0">
              <Link href={articleUrl}>
                <Image
                  src={breakingNews.featuredImage}
                  alt={breakingNews.title}
                  width={120}
                  height={80}
                  className="w-full sm:w-30 h-20 object-cover rounded-lg border-2 border-red-200 hover:border-red-300 transition-colors"
                />
              </Link>
            </div>
          )}

          {/* النص */}
          <div className="flex-1 space-y-2">
            {/* العنوان */}
            <Link href={articleUrl}>
              <h3 className={`font-bold text-lg leading-tight hover:text-red-600 transition-colors line-clamp-2 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {breakingNews.title}
              </h3>
            </Link>

            {/* الملخص */}
            {summary && (
              <p className={`text-sm leading-relaxed line-clamp-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {summary}
              </p>
            )}

            {/* معلومات إضافية */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <span className={`flex items-center gap-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  {formatDate(breakingNews.publishedAt)}
                </span>
                
                {breakingNews.readTime && (
                  <span className={`flex items-center gap-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    📖 {breakingNews.readTime} دقائق
                  </span>
                )}
              </div>

              {/* زر القراءة */}
              <Link 
                href={articleUrl}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors group"
              >
                <span>اقرأ التفاصيل</span>
                <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* خط متحرك أسفل الخبر */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 animate-pulse"></div>
    </div>
  );
}
