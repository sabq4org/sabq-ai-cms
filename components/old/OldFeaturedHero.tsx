'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

type FeaturedArticle = {
  id: string;
  title: string;
  slug?: string;
  featured_image?: string;
  published_at?: string;
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
    const load = async () => {
      try {
        const res = await fetch('/api/articles/featured?limit=3', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = (json?.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          featured_image: a.featured_image,
          published_at: a.published_at,
          category: a.categories
            ? { id: a.categories.id, name: a.categories.name, slug: a.categories.slug, color: a.categories.color }
            : null,
        })) as FeaturedArticle[];
        if (mounted) setArticles(data);
      } catch (e) {
        console.error('فشل جلب الأخبار المميزة:', e);
        if (mounted) setArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />;
  }
  if (!articles.length) return null;

  return (
    <FeaturedNewsCarousel
      articles={articles as any}
      containerClassName="max-w-6xl mx-auto px-2 sm:px-4 mb-6"
    />
  );
}


