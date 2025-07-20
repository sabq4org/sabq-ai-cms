'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';

export default function DirectBreakingNews() {
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // استخدام setTimeout بدلاً من useEffect المعقد
  React.useLayoutEffect(() => {
    console.log('🔥 DirectBreakingNews: بدء تحميل فوري');
    
    setTimeout(async () => {
      try {
        console.log('🔍 DirectBreakingNews: جلب البيانات...');
        const response = await fetch('/api/breaking-news');
        console.log('📡 DirectBreakingNews: الاستجابة:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📰 DirectBreakingNews: البيانات:', data);
          
          if (data.success && data.data) {
            setNews(data.data);
            console.log('✅ DirectBreakingNews: تم تحديد الخبر:', data.data.title);
          }
        }
      } catch (error) {
        console.error('❌ DirectBreakingNews: خطأ:', error);
      }
      
      setLoading(false);
      console.log('🏁 DirectBreakingNews: انتهاء التحميل');
    }, 100);
  }, []);

  console.log('🔍 DirectBreakingNews: render - loading:', loading, 'news:', !!news);

  if (loading) {
    return (
      <div className="w-full mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2">
          <Flame className="w-5 h-5 text-red-600 animate-pulse" />
          <span className="text-red-800 font-bold">جاري تحميل الأخبار العاجلة...</span>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="w-full mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center text-gray-600">
        لا توجد أخبار عاجلة حالياً
      </div>
    );
  }

  return (
    <div className="w-full border-l-4 border-red-500 shadow-lg rounded-lg overflow-hidden mb-6 bg-white">
      {/* هيدر بسيط */}
      <div className="bg-red-600 text-white px-4 py-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm">⚡ خبر عاجل</span>
        </div>
      </div>

      {/* محتوى بسيط */}
      <div className="p-4">
        <Link href={`/article/${news.id}`}>
          <h3 className="font-bold text-lg text-gray-900 hover:text-red-600 mb-2">
            {news.title}
          </h3>
        </Link>
        
        {news.summary && (
          <p className="text-gray-600 text-sm mb-3">
            {news.summary}
          </p>
        )}
        
        <Link 
          href={`/article/${news.id}`}
          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          اقرأ التفاصيل ←
        </Link>
      </div>
    </div>
  );
}
