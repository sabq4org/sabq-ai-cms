'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ScheduledArticle {
  id: string;
  title: string;
  author_name?: string;
  publish_at: string;
  category_name?: string;
  category_color?: string;
}

export default function ScheduledArticles({ darkMode }: { darkMode: boolean }) {
  const [articles, setArticles] = useState<ScheduledArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledArticles();
    
    // تحديث كل دقيقة
    const interval = setInterval(fetchScheduledArticles, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchScheduledArticles = async () => {
    try {
      const response = await fetch('/api/articles?status=scheduled&limit=5');
      const data = await response.json();
      
      if (data.success && data.articles) {
        setArticles(data.articles.sort((a: ScheduledArticle, b: ScheduledArticle) => 
          new Date(a.publish_at).getTime() - new Date(b.publish_at).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching scheduled articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (publishAt: string) => {
    const now = new Date();
    const publishDate = new Date(publishAt);
    const diff = publishDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'جاري النشر...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `بعد ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    } else if (hours > 0) {
      return `بعد ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    } else {
      return `بعد ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
    }
  };

  if (loading) {
    return (
      <div className={`rounded-2xl p-6 shadow-sm border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <Clock className="w-5 h-5 text-purple-600" />
          المقالات المجدولة القادمة
        </h3>
        <Link 
          href="/dashboard/news?status=scheduled"
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          عرض الكل
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {articles.slice(0, 5).map((article) => (
          <div 
            key={article.id}
            className={`p-4 rounded-xl border transition-all hover:shadow-md ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                : 'bg-gray-50 border-gray-200 hover:bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Link 
                  href={`/dashboard/article/edit/${article.id}`}
                  className={`font-medium hover:underline line-clamp-1 ${
                    darkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}
                >
                  {article.title}
                </Link>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  {article.author_name && (
                    <span className={`flex items-center gap-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <User className="w-3 h-3" />
                      {article.author_name}
                    </span>
                  )}
                  <span className={`flex items-center gap-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    {new Date(article.publish_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
              <div className="text-left">
                <div className="text-purple-600 font-medium text-sm">
                  {getTimeRemaining(article.publish_at)}
                </div>
                <div className={`text-xs mt-1 ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {new Date(article.publish_at).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 