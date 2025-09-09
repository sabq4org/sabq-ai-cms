"use client";

import React, { useEffect, useState } from "react";
import LightFeaturedStrip from "@/components/featured/LightFeaturedStrip";

interface FeaturedArticleLite {
  id: string;
  title: string;
  slug?: string;
  featured_image?: string;
  social_image?: string;
  metadata?: any;
  published_at?: string;
  breaking?: boolean;
  category?: { id: string; name: string; slug?: string; color?: string; icon?: string } | null;
  views?: number;
}

export default function LightFeaturedLoader({ heading = "الأخبار المميزة", limit = 3 }: { heading?: string; limit?: number }) {
  const [articles, setArticles] = useState<FeaturedArticleLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // استخدام API الموحد الجديد بدلاً من featured-fast
        const endpoint = `/api/unified-featured?limit=${limit}&format=lite`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // timeout 5 ثواني
        
        console.log('🔄 [LightFeaturedLoader] Fetching from unified API');
        
        const res = await fetch(endpoint, { 
          signal: controller.signal,
          cache: "no-store", // إزالة الكاش تماماً للحصول على أحدث الأخبار
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        
        // التعامل مع البيانات من API الموحد
        const articles: FeaturedArticleLite[] = (json?.data || json?.articles || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          // الصورة معالجة بالفعل في API الموحد
          featured_image: a.featured_image,
          social_image: a.social_image,
          metadata: a.metadata,
          published_at: a.published_at,
          breaking: a.breaking || false,
          category: a.categories || a.category,
          views: a.views ?? 0,
        }));
        
        console.log(`✅ [LightFeaturedLoader] Got ${articles.length} articles from unified API, source: ${json.source}`);
        
        if (mounted) setArticles(articles.slice(0, Math.max(1, Math.min(6, limit || 3))));
      } catch (e) {
        console.error("❌ [LightFeaturedLoader] Failed to fetch from unified API:", e);
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
      <div className="w-full px-4 sm:px-6">
        {/* تمت إزالة هيكل عنوان القسم */}
        <div className="flex gap-4 overflow-hidden">
          <div className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!articles.length) return null;

  return (
    <div className="max-w-6xl mx-auto mb-6">
      <LightFeaturedStrip articles={articles as any} />
    </div>
  );
}


