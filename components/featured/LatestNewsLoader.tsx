'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

type Article = {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  featured_image?: string;
  published_at?: string;
  views?: number;
  breaking?: boolean;
  featured?: boolean;
  category?: { id: string; name: string; slug?: string; color?: string; icon?: string } | null;
  author?: { id?: string; name?: string } | null;
};

const FeaturedNewsCarousel = dynamic(() => import('@/components/FeaturedNewsCarousel'), {
  ssr: false,
  loading: () => <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
});

interface LatestNewsLoaderProps {
  limit?: number;
  containerClassName?: string;
  heights?: { mobile: number; mobileLg: number; desktop: number };
  halfWidth?: boolean;
}

export default function LatestNewsLoader({ 
  limit = 6,
  containerClassName = "max-w-6xl mx-auto px-4 sm:px-6 mb-6",
  heights = { mobile: 220, mobileLg: 260, desktop: 360 },
  halfWidth = true
}: LatestNewsLoaderProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // جلب آخر الأخبار بدلاً من المميزة فقط
        const res = await fetch(`/api/articles/latest?limit=${limit}&withCategories=true`, { 
          cache: 'no-store' 
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const json = await res.json();
        const data = (json?.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          featured_image: a.featured_image || a.social_image,
          published_at: a.published_at,
          views: a.views,
          breaking: a.breaking || false,
          featured: a.featured || false,
          category: a.categories
            ? { 
                id: a.categories.id, 
                name: a.categories.name, 
                slug: a.categories.slug, 
                color: a.categories.color 
              }
            : null,
        })) as Article[];
        
        if (mounted) {
          console.log(`✅ تم جلب ${data.length} خبر حديث`);
          setArticles(data);
        }
      } catch (e) {
        console.error('فشل جلب آخر الأخبار:', e);
        if (mounted) setArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    load();
    
    return () => {
      mounted = false;
    };
  }, [limit]);

  if (loading) {
    return <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />;
  }
  
  if (!articles.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>لا توجد أخبار حالياً</p>
      </div>
    );
  }

  return (
    <FeaturedNewsCarousel
      articles={articles as any}
      containerClassName={containerClassName}
      heights={heights}
      titleClassName="text-black dark:text-white"
      halfWidth={halfWidth}
    />
  );
}
