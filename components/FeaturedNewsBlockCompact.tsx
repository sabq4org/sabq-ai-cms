"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Eye, Clock, Calendar } from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface FeaturedArticle {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  reading_time?: number;
  views?: number;
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
}

interface FeaturedNewsBlockCompactProps {
  articles?: FeaturedArticle[];
  title?: string;
  maxItems?: number;
}

export default function FeaturedNewsBlockCompact({
  articles = [],
  title = "🔥 الأخبار المميزة",
  maxItems = 3
}: FeaturedNewsBlockCompactProps) {
  const { darkMode } = useDarkModeContext();
  const [loading, setLoading] = useState(true);
  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      if (articles.length > 0) {
        setFeaturedArticles(articles.slice(0, maxItems));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/articles/featured?limit=${maxItems}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = (json?.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          featured_image: a.featured_image,
          published_at: a.published_at,
          reading_time: a.reading_time,
          views: a.views,
          category: a.categories
            ? { 
                id: a.categories.id, 
                name: a.categories.name, 
                icon: a.categories.icon,
                color: a.categories.color 
              }
            : null,
        })) as FeaturedArticle[];
        setFeaturedArticles(data.slice(0, maxItems));
      } catch (e) {
        console.error('فشل جلب الأخبار المميزة:', e);
        setFeaturedArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [articles, maxItems]);

  const formatViews = (views?: number) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}م`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}ك`;
    return views.toString();
  };

  const formatDateArabic = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return "الآن";
    } else if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `منذ ${diffDays} يوم`;
    }
  };

  const getArticleLink = (article: FeaturedArticle) => {
    return article.slug ? `/news/${article.slug}` : `/news/${article.id}`;
  };

  // مكون شعلة اللهب للأخبار الشائعة
  const FlameIcon = () => (
    <div 
      className="inline-block w-3 h-3.5 relative ml-1 flame-container"
      style={{
        filter: 'drop-shadow(0 0 3px rgba(255, 69, 0, 0.4))'
      }}
    >
      <div 
        className="absolute w-2 h-3 rounded-full flame-main"
        style={{
          left: '2px',
          top: '1px',
          background: 'radial-gradient(circle at 50% 100%, #ff4500 0%, #ff6b00 30%, #ffaa00 60%, #ffdd00 80%, transparent 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          transformOrigin: '50% 100%'
        }}
      />
      <div 
        className="absolute w-1.5 h-2 rounded-full flame-inner"
        style={{
          left: '3px',
          top: '3px',
          background: 'radial-gradient(circle at 50% 100%, #ff6b00 0%, #ffaa00 40%, #ffdd00 70%, transparent 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          transformOrigin: '50% 100%'
        }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className={`${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-300'
      } rounded-2xl shadow-sm p-5 border max-h-64`}>
                  <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-5 w-32 ${darkMode ? 'bg-gray-800' : 'bg-gray-300'} rounded`}></div>
              <div className={`h-3 w-20 ${darkMode ? 'bg-gray-800' : 'bg-gray-300'} rounded`}></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-300'} rounded`}></div>
              ))}
            </div>
          </div>
      </div>
    );
  }

  if (featuredArticles.length === 0) {
    return (
      <div className={`${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
      } rounded-2xl shadow-sm p-5 border text-center max-h-64`}>
        <h2 className={`text-base font-semibold ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        } mb-2`}>
          {title}
        </h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
          لا توجد أخبار مميزة متاحة حالياً
        </p>
      </div>
    );
  }

  return (
    <div className={`${
      darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-300'
    } rounded-2xl shadow-sm p-5 border relative max-h-64`}>
      {/* Header - مضغوط */}
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-base font-semibold ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        } flex items-center gap-2`}>
          <span className="text-sm">🔥</span>
          الأخبار المميزة
        </h2>
        <div className={`flex items-center gap-1 text-[10px] ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Calendar className="w-2.5 h-2.5" />
          <span>محدث الآن</span>
        </div>
      </div>

      {/* قائمة الأخبار - 3 فقط */}
      <div className="space-y-2.5">
        {featuredArticles.map((article, index) => (
          <div key={article.id} className="relative">
            <Link 
              href={getArticleLink(article)} 
              className="block group"
            >
              <div className="flex items-start gap-3 text-[13px]">
                {/* صورة مصغرة */}
                <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800">
                  {article.featured_image ? (
                    <OptimizedImage
                      src={article.featured_image}
                      alt={article.title}
                      width={48}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      📰
                    </div>
                  )}
                </div>
                
                {/* المحتوى */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  } group-hover:${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  } transition-colors duration-200 line-clamp-2 leading-tight mb-1`}>
                    {article.title}
                  </h3>
                  
                  {/* نبذة من الخبر */}
                  {article.excerpt && (
                    <p className={`text-[11px] leading-relaxed line-clamp-1 mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {article.excerpt}
                    </p>
                  )}
                  
                  {/* معلومات إضافية */}
                  <div className={`flex items-center gap-2 text-[11px] ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {article.category && (
                      <>
                        <span>{article.category.icon || '📰'}</span>
                        <span>{article.category.name}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatDateArabic(article.published_at)}</span>
                    {article.views && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatViews(article.views)}</span>
                          {article.views > 300 && (
                            <FlameIcon />
                          )}
                        </div>
                      </>
                    )}
                    {article.reading_time && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.reading_time} د</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* زر عرض الكل - صغير */}
      <div className="mt-4 text-center">
        <Link 
          href="/featured-news" 
          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium ${
            darkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } transition-colors`}
        >
          عرض الكل
        </Link>
      </div>
    </div>
  );
}
