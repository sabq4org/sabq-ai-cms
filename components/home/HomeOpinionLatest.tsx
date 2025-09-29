"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Clock, Eye } from "lucide-react";
import { getArticleLink } from "@/lib/utils";

interface ApiArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  views?: number | null;
  reading_time?: number | null;
  author?: { id: string; name: string; avatar?: string | null } | null;
}

export default function HomeOpinionLatest() {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        const url = 
          "/api/articles?article_type=opinion&status=published&limit=8&sort=published_at&order=desc" +
          "&fields=id,title,slug,excerpt,featured_image,published_at,views,reading_time,author";
        const res = await fetch(url, { cache: "no-store", signal: controller.signal });
        const data = await res.json();
        const list: ApiArticle[] = Array.isArray(data)
          ? data
          : (data?.articles as ApiArticle[]) || [];
        setArticles(list);
      } catch (_) {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-7 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border" style={{ borderColor: "hsl(var(--line))", background: "white" }}>
                <div className="h-40 bg-gray-100 rounded-t-xl animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "hsl(var(--fg))" }}>
            آخر مقالات الرأي
          </h2>
          <Link href="/opinion" className="text-sm font-medium" style={{ color: "hsl(var(--accent))" }}>
            المزيد ←
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((a) => {
            const link = getArticleLink(a as any);
            return (
              <Link key={a.id} href={link} style={{ textDecoration: "none" }}>
                <div
                  className="rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
                  style={{ background: "white", border: "1px solid hsl(var(--line))" }}
                >
                  <div className="relative h-40 w-full bg-gray-100">
                    {a.featured_image && (
                      <Image
                        src={a.featured_image}
                        alt={a.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-base leading-tight mb-2 line-clamp-2" style={{ color: "hsl(var(--fg))" }}>
                      {a.title}
                    </h3>
                    {a.excerpt && (
                      <p className="text-sm line-clamp-2 mb-3" style={{ color: "hsl(var(--muted))" }}>
                        {a.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs" style={{ color: "hsl(var(--muted))" }}>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {a.reading_time || 5} د
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(a.views || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


