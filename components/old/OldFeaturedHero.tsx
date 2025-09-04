'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

type FeaturedArticle = {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  featured_image?: string;
  published_at?: string;
  views?: number;
  breaking?: boolean;
  category?: { id: string; name: string; slug?: string; color?: string; icon?: string } | null;
  author?: { id?: string; name?: string } | null;
};

const FeaturedNewsCarousel = dynamic(() => import('@/components/FeaturedNewsCarousel'), {
  ssr: false,
  loading: () => <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
});

export default function OldFeaturedHero() {
  const [articles, setArticles] = useState<FeaturedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    
    const load = async () => {
      try {
        // استخدام API المحسن مع timeout
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 ثانية timeout
        
        const res = await fetch('/api/articles/featured-fast?limit=3', { 
          signal: controller.signal,
          cache: 'force-cache',
          next: { revalidate: 60 } // إعادة التحقق كل دقيقة
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        
        const data = (json?.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt || '', // fallback للـ excerpt
          featured_image: a.featured_image,
          published_at: a.published_at,
          views: a.views || 0,
          breaking: a.breaking || false,
          category: a.categories
            ? { id: a.categories.id, name: a.categories.name, slug: a.categories.slug, color: a.categories.color }
            : null,
        })) as FeaturedArticle[];
        
        if (mounted) setArticles(data);
      } catch (e: any) {
        if (e.name === 'AbortError') {
          console.warn('تم إلغاء طلب الأخبار المميزة بسبب انتهاء المهلة');
        } else {
          console.error('فشل جلب الأخبار المميزة:', e);
        }
        if (mounted) setArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    load();
    
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  if (loading) {
    return <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />;
  }
  if (!articles.length) return null;

  return (
    <FeaturedNewsCarousel
      articles={articles as any}
      containerClassName="max-w-6xl mx-auto px-4 sm:px-6 mb-6"
      heights={{ mobile: 220, mobileLg: 260, desktop: 360 }}
      titleClassName="text-black dark:text-white"
      halfWidth={true}
    />
  );
}


