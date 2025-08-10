"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MuqtarabCard from "@/components/home/MuqtarabCard";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Home,
  Map,
  Search,
  User,
  Filter,
  Share2,
  Eye,
  MessageCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SortOption = "latest" | "oldest";
type PublishFilter = "all" | "published" | "draft";

interface AngleSummary {
  id: string;
  title: string;
  slug: string;
  themeColor?: string;
  coverImage?: string | null;
}

interface RawArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  readingTime?: number;
  publishDate?: string | Date | null;
  createdAt?: string | Date;
  views?: number;
  comments?: number;
  tags?: string[];
  isFeatured?: boolean;
  isRecent?: boolean;
  author?: { id?: string; name: string; avatar?: string } | null;
}

export default function MasarPage() {
  const [angle, setAngle] = useState<AngleSummary | null>(null);
  const [articles, setArticles] = useState<RawArticle[]>([]);
  const [displayed, setDisplayed] = useState<RawArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");
  const [query, setQuery] = useState("");

  // Load angle "masar" then fetch its articles
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // 1) زاوية مسار
        const ar = await fetch(`/api/muqtarab/angles/by-slug/masar`, {
          cache: "force-cache",
          next: { revalidate: 300 },
        });
        if (!ar.ok) {
          setLoading(false);
          return;
        }
        const aj = await ar.json();
        const a: AngleSummary = {
          id: aj.angle?.id,
          title: aj.angle?.title || "مسار",
          slug: aj.angle?.slug || "masar",
          themeColor: aj.angle?.themeColor || "#2563EB",
          coverImage: aj.angle?.coverImage || null,
        };
        setAngle(a);

        // 2) مقالات الزاوية - الصفحة الأولى
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "12");
        params.set("sortBy", "newest");
        if (publishFilter !== "all") {
          params.set("published", publishFilter === "published" ? "true" : "false");
        }
        const r = await fetch(`/api/muqtarab/angles/${a.id}/articles?${params.toString()}`, {
          cache: "force-cache",
          next: { revalidate: 180 },
        });
        if (!r.ok) {
          setLoading(false);
          return;
        }
        const j = await r.json();
        const list = (j.articles || []) as RawArticle[];
        setArticles(list);
        setDisplayed(list);
        setHasMore(j?.pagination?.hasNext ?? list.length >= 12);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply client filters: search + sort + publish
  const filtered = useMemo(() => {
    let arr = [...articles];
    if (publishFilter !== "all") {
      const isPublished = publishFilter === "published";
      arr = arr.filter((a) => (isPublished ? true : true)); // API طبق الفلتر عند الجلب عند الضغط على عرض المزيد
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      arr = arr.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          (a.excerpt || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "oldest") {
      arr.sort(
        (a, b) =>
          new Date(a.createdAt || a.publishDate || 0).getTime() -
          new Date(b.createdAt || b.publishDate || 0).getTime()
      );
    } else {
      arr.sort(
        (a, b) =>
          new Date(b.createdAt || b.publishDate || 0).getTime() -
          new Date(a.createdAt || a.publishDate || 0).getTime()
      );
    }
    return arr;
  }, [articles, publishFilter, query, sortBy]);

  useEffect(() => {
    setDisplayed(filtered);
  }, [filtered]);

  const loadMore = async () => {
    if (!angle) return;
    const nextPage = page + 1;
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "12");
    params.set("sortBy", sortBy === "latest" ? "newest" : "newest");
    if (publishFilter !== "all") {
      params.set("published", publishFilter === "published" ? "true" : "false");
    }
    const r = await fetch(`/api/muqtarab/angles/${angle.id}/articles?${params.toString()}`, {
      cache: "force-cache",
      next: { revalidate: 180 },
    });
    if (!r.ok) return;
    const j = await r.json();
    const list = (j.articles || []) as RawArticle[];
    setArticles((prev) => [...prev, ...list]);
    setPage(nextPage);
    setHasMore(j?.pagination?.hasNext ?? list.length >= 12);
  };

  const theme = {
    bg: "bg-white",
    text: "text-gray-900",
    muted: "text-gray-600",
    blue: "#2563EB",
  } as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80 bg-white/90 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-bold">مُقترب</span>
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
              <Link href="/muqtarab" className="hover:text-blue-600 flex items-center gap-1">
                <Home className="w-4 h-4" /> الرئيسية
              </Link>
              <Link href="/muqtarab/masar" className="text-blue-600 font-medium flex items-center gap-1">
                <Map className="w-4 h-4" /> مسار
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن مقال"
                className="pl-3 pr-9 py-2 rounded-lg border bg-white text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-white to-white" />
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30" />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <Badge className="px-3 py-1 text-white" style={{ backgroundColor: angle?.themeColor || theme.blue }}>
            مسار
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black mt-4 leading-tight">
            اكتشف مقالات الرحلات والاستكشاف
          </h1>
          <p className="text-gray-600 mt-3">
            حكايات طرق، جبال، ووديان. إلهام للانطلاق في مسارات جديدة.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-y bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={sortBy === "latest" ? "default" : "outline"}
              onClick={() => setSortBy("latest")}
            >
              الأحدث
            </Button>
            <Button
              size="sm"
              variant={sortBy === "oldest" ? "default" : "outline"}
              onClick={() => setSortBy("oldest")}
            >
              الأقدم
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={publishFilter}
              onChange={async (e) => {
                const v = e.target.value as PublishFilter;
                setPublishFilter(v);
                // إعادة الجلب من الصفحة الأولى لفلتر النشر
                if (!angle) return;
                setLoading(true);
                try {
                  const params = new URLSearchParams();
                  params.set("page", "1");
                  params.set("limit", "12");
                  params.set("sortBy", sortBy === "latest" ? "newest" : "newest");
                  if (v !== "all") params.set("published", v === "published" ? "true" : "false");
                  const r = await fetch(`/api/muqtarab/angles/${angle.id}/articles?${params.toString()}`, {
                    cache: "force-cache",
                    next: { revalidate: 180 },
                  });
                  if (r.ok) {
                    const j = await r.json();
                    const list = (j.articles || []) as RawArticle[];
                    setArticles(list);
                    setPage(1);
                    setHasMore(j?.pagination?.hasNext ?? list.length >= 12);
                  }
                } finally {
                  setLoading(false);
                }
              }}
            >
              <option value="all">كل الحالات</option>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
            </select>

            <div className="relative md:hidden">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث"
                className="pl-2 pr-9 py-2 rounded-lg border bg-white text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-72 animate-pulse bg-gray-100 border-0" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center text-gray-600 py-16">لا توجد مقالات مطابقة</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((article) => {
              const cardData = {
                id: article.id,
                title: article.title,
                excerpt: article.excerpt || "",
                slug: article.slug,
                coverImage: article.coverImage,
                readingTime: article.readingTime || 5,
                publishDate: (article.publishDate || article.createdAt) as any,
                views: article.views || 0,
                tags: article.tags || [],
                isFeatured: article.isFeatured,
                isRecent: article.isRecent,
                link: `/muqtarab/articles/${article.slug}`,
                angle: {
                  id: angle?.id,
                  title: angle?.title || "مسار",
                  slug: angle?.slug || "masar",
                  themeColor: angle?.themeColor,
                },
                author: {
                  name: article.author?.name || "فريق مُقترب",
                  avatar: article.author?.avatar,
                },
              };
              return (
                <div key={article.id} className="group">
                  <MuqtarabCard article={cardData} variant="medium" />
                  {/* Footer meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(article.views || 0).toLocaleString()}
                      </span>
                      {typeof article.comments === "number" && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {article.comments}
                        </span>
                      )}
                    </div>
                    <button
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      onClick={async () => {
                        try {
                          if (navigator.share) {
                            await navigator.share({
                              title: article.title,
                              url: `/muqtarab/articles/${article.slug}`,
                            });
                          } else {
                            await navigator.clipboard.writeText(
                              `${location.origin}/muqtarab/articles/${article.slug}`
                            );
                            alert("تم نسخ الرابط");
                          }
                        } catch {}
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center mt-8">
            <Button onClick={loadMore} size="lg" className="px-8">
              عرض المزيد
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


