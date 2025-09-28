"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Bot, Mic, Eye, MessageSquare, Heart, Play } from "lucide-react";

type Article = {
  id: string;
  slug?: string;
  title: string;
  views?: number;
  comments_count?: number;
  likes?: number;
  published_at?: string;
  category?: { name?: string } | null;
};

export default function SmartDigest() {
  const [trending, setTrending] = useState<Article | null>(null);
  const [suggested, setSuggested] = useState<Article | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    (async () => {
      try {
        // 1) محتوى تفاعلي الآن (اختيار أعلى مشاهدات من آخر 20 خبر)
        const latestRes = await fetch("/api/news/latest?limit=20", { signal: controller.signal, cache: "no-store" });
        if (latestRes.ok) {
          const data = await latestRes.json();
          const list: Article[] = (data.articles || data.data || []).map((a: any) => ({
            id: String(a.id),
            slug: a.slug,
            title: a.title,
            views: a.views ?? a.views_count ?? 0,
            comments_count: a.comments_count ?? a.comments ?? 0,
            likes: a.likes ?? a.likes_count ?? 0,
            published_at: a.published_at || a.publishedAt,
            category: a.categories ? { name: a.categories.name } : null,
          }));
          const sorted = list.sort((x, y) => (y.views || 0) - (x.views || 0));
          setTrending(sorted[0] || null);
        }
      } catch {}

      try {
        // 2) مقترح ذكي (مستخدم مسجل) وإلا fallback خبر عام
        const personalized = await fetch("/api/articles/personalized?limit=1", { signal: controller.signal, cache: "no-store" });
        if (personalized.ok) {
          const d = await personalized.json();
          const item = (d?.data?.articles || d?.articles || [])[0];
          if (item) {
            setSuggested({ id: String(item.id), slug: item.slug, title: item.title });
          }
        }
        if (!suggested) {
          const anyRes = await fetch("/api/articles?status=published&pageSize=1", { signal: controller.signal, cache: "no-store" });
          if (anyRes.ok) {
            const d = await anyRes.json();
            const it = (d.articles || d.data || [])[0];
            if (it) setSuggested({ id: String(it.id), slug: it.slug, title: it.title });
          }
        }
      } catch {}

      try {
        // 3) ملخص صوتي - محاولة جلب آخر عنصر صوتي إن توفر، وإلا إبقاء الزر معطل
        const audioRes = await fetch("/api/audio/episodes?limit=1", { signal: controller.signal, cache: "no-store" }).catch(() => null);
        if (audioRes?.ok) {
          const d = await audioRes.json();
          const ep = (d?.episodes || d?.data || [])[0];
          if (ep?.audio_url) setAudioUrl(ep.audio_url);
        }
      } catch {}

      clearTimeout(timeout);
    })();

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  const cardClass = "rounded-lg border p-4 h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  const iconBox = "w-8 h-8 rounded-lg flex items-center justify-center";

  return (
    <section className="max-w-6xl mx-auto my-4 px-2 sm:px-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">🧠</span>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">الموجز الذكي</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* البطاقة 1: الأكثر تفاعلاً */}
        <div className={cardClass}>
          <div className="flex items-start gap-3">
            <div className={`${iconBox} bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300`}>
              <Flame className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">الأكثر تفاعلاً الآن</div>
              {trending ? (
                <Link href={`/news/${trending.slug || trending.id}`} className="block">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">{trending.title}</h3>
                </Link>
              ) : (
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{trending?.views || 0}</span>
                <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" />{trending?.comments_count || 0}</span>
                <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" />{trending?.likes || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* البطاقة 2: مقترح ذكي */}
        <div className={cardClass}>
          <div className="flex items-start gap-3">
            <div className={`${iconBox} bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300`}>
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">مقترح ذكي لك</div>
              {suggested ? (
                <Link href={`/news/${suggested.slug || suggested.id}`} className="block">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">{suggested.title}</h3>
                </Link>
              ) : (
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              )}
              <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">تم اختياره بناءً على ما يقرأه القراء الآن</div>
            </div>
          </div>
        </div>

        {/* البطاقة 3: استمع للموجز */}
        <div className={cardClass}>
          <div className="flex items-start gap-3">
            <div className={`${iconBox} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300`}>
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">استمع للموجز</div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">ملخص أبرز الأخبار في دقيقتين</h3>
              <button
                disabled={!audioUrl}
                onClick={() => {
                  try {
                    const audio = new Audio(audioUrl || "");
                    audio.play().catch(() => {});
                  } catch {}
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${
                  audioUrl ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                aria-disabled={!audioUrl}
              >
                <Play className="w-3 h-3" /> تشغيل الآن
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


