'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

type RecentArticle = {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  featured_image?: string;
  published_at?: string;
  views?: number;
  breaking?: boolean;
  category?: { id: string; name: string; slug?: string; color?: string } | null;
};

interface RecentNewsBlockProps {
  limit?: number;
  className?: string;
  title?: string;
  showCategory?: boolean;
}

export default function RecentNewsBlock({ 
  limit = 6, 
  className = '',
  title = 'أحدث الأخبار',
  showCategory = true 
}: RecentNewsBlockProps) {
  const [articles, setArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/articles/recent?limit=${limit}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = (json?.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          featured_image: a.featured_image,
          published_at: a.published_at,
          views: a.views,
          breaking: a.breaking || a.is_breaking || false,
          category: a.categories
            ? { id: a.categories.id, name: a.categories.name, slug: a.categories.slug, color: a.categories.color }
            : null,
        })) as RecentArticle[];
        if (mounted) setArticles(data);
      } catch (e) {
        console.error('فشل جلب الأخبار الحديثة:', e);
        if (mounted) setArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [limit]);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ar });
    } catch {
      return 'منذ وقت قريب';
    }
  };

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(limit).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <Link 
            href="/news" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            مشاهدة المزيد ←
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
              <Link href={`/news/${article.slug}`}>
                <div className="relative">
                  {article.featured_image ? (
                    <img 
                      src={article.featured_image} 
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-4xl">📰</span>
                    </div>
                  )}
                  
                  {article.breaking && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      عاجل
                    </div>
                  )}
                  
                  {showCategory && article.category && (
                    <div className="absolute bottom-2 right-2">
                      <span 
                        className="text-xs font-medium px-2 py-1 rounded text-white"
                        style={{ backgroundColor: article.category.color || '#6B7280' }}
                      >
                        {article.category.name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  
                  {article.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(article.published_at || '')}</span>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {article.views && (
                        <span className="flex items-center">
                          <span className="ml-1">👁</span>
                          {article.views.toLocaleString('ar')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
