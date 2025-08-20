"use client";

import React, { useEffect, useState } from "react";
import LightFeaturedStrip from "@/components/featured/LightFeaturedStrip";

interface FeaturedArticleLite {
  id: string;
  title: string;
  slug?: string;
  featured_image?: string;
  published_at?: string;
  breaking?: boolean;
  category?: { id: string; name: string; slug?: string; color?: string; icon?: string } | null;
}

export default function LightFeaturedLoader({ heading = "الأخبار المميزة", limit = 10 }: { heading?: string; limit?: number }) {
  const [articles, setArticles] = useState<FeaturedArticleLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/articles/featured?limit=${limit}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list: FeaturedArticleLite[] = (json?.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          featured_image: a.featured_image,
          published_at: a.published_at,
          breaking: a.breaking || a.is_breaking || false,
          category: a.categories ? { id: a.categories.id, name: a.categories.name, slug: a.categories.slug, color: a.categories.color } : null,
        }));
        if (mounted) setArticles(list);
      } catch (e) {
        console.error("فشل جلب الأخبار المميزة (Light):", e);
        if (mounted) setArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [limit]);

  if (loading) {
    return (
      <div className="w-full px-2 sm:px-4">
        <div className="h-6 mb-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          <div className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!articles.length) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 mb-6">
      <LightFeaturedStrip articles={articles as any} heading={heading} />
    </div>
  );
}


