'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, Clock, ArrowLeft } from 'lucide-react';

interface SimpleBreakingNewsProps {
  darkMode?: boolean;
}

export default function SimpleBreakingNews({ darkMode = false }: SimpleBreakingNewsProps) {
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    console.log('🔥 SimpleBreakingNews: بدء تحميل الأخبار العاجلة');
    
    const fetchNews = async () => {
      try {
        console.log('🔍 SimpleBreakingNews: جلب البيانات...');
        const response = await fetch('/api/breaking-news');
        const data = await response.json();
        
        console.log('📡 SimpleBreakingNews: الاستجابة:', data);
        
        if (data.success && data.data) {
          setNews(data.data);
          console.log('✅ SimpleBreakingNews: تم العثور على خبر عاجل:', data.data.title);
        } else {
          console.log('⚠️ SimpleBreakingNews: لا توجد أخبار عاجلة');
        }
      } catch (error) {
        console.error('❌ SimpleBreakingNews: خطأ:', error);
      } finally {
        setLoading(false);
        console.log('🏁 SimpleBreakingNews: انتهاء التحميل');
      }
    };

    fetchNews();
  }, []);

  console.log('🔍 SimpleBreakingNews render: loading=', loading, 'news=', !!news, 'dismissed=', dismissed);

  if (loading) {
    return (
      <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 bg-red-300 rounded-full"></div>
          <div className="w-20 h-4 bg-red-300 rounded"></div>
        </div>
        <div className="w-3/4 h-6 bg-red-300 rounded mb-2"></div>
        <div className="w-1/2 h-4 bg-red-300 rounded"></div>
      </div>
    );
  }

  if (!news || dismissed) {
    return null;
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  };

  return (
    <div className={`w-full border-l-4 border-red-500 shadow-lg rounded-lg overflow-hidden mb-6 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* هيدر الخبر العاجل */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-sm uppercase tracking-wide">
              ⚡ خبر عاجل
            </span>
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
          {news.featuredImage && (
            <div className="flex-shrink-0">
              <Link href={`/article/${news.id}`}>
                <Image
                  src={news.featuredImage}
                  alt={news.title}
                  width={120}
                  height={80}
                  className="w-full sm:w-30 h-20 object-cover rounded-lg border-2 border-red-200"
                />
              </Link>
            </div>
          )}

          {/* النص */}
          <div className="flex-1 space-y-2">
            <Link href={`/article/${news.id}`}>
              <h3 className={`font-bold text-lg leading-tight hover:text-red-600 transition-colors ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {news.title}
              </h3>
            </Link>

            {news.summary && (
              <p className={`text-sm leading-relaxed ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {news.summary}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className={`text-xs flex items-center gap-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Clock className="w-3 h-3" />
                {formatTime(news.publishedAt)}
              </span>

              <Link 
                href={`/article/${news.id}`}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                <span>اقرأ التفاصيل</span>
                <ArrowLeft className="w-4 h-4" />
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
