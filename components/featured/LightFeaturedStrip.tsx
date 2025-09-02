"use client";

import React, { useRef, useCallback } from "react";
import Link from "next/link";
import { formatDateNumeric } from "@/lib/date-utils";
import { getArticleLink } from "@/lib/utils";
// replace Next/Image with robust SafeNewsImage for thumbnails
import SafeNewsImage from "@/components/ui/SafeNewsImage";
import { useDarkMode } from "@/hooks/useDarkMode";

interface LightFeaturedStripProps {
  articles: any[];
  heading?: string;
}

/**
 * شريط الأخبار المميزة الخفيف - نسخة مبسطة سريعة التحميل
 * تصميم: تمرير أفقي، صورة (16/9) أعلى، تحتها العنوان (سطران)، ثم سطر صغير للتصنيف + التاريخ
 * بدون أزرار تنقل، بدون مؤشر، بدون "عرض المزيد"
 */
export default function LightFeaturedStrip({ articles, heading }: LightFeaturedStripProps) {
  const { darkMode } = useDarkMode();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // تحديد إذا كان الخبر جديد (آخر 12 ساعة)
  const isNewsNew = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      return diffTime <= 12 * 60 * 60 * 1000; // 12 ساعة
    } catch {
      return false;
    }
  };

  const onKeyScroll = useCallback((e: React.KeyboardEvent) => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const delta = 280; // مقدار التمرير لكل ضغطة
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      el.scrollBy({ left: -delta, behavior: "smooth" });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      el.scrollBy({ left: delta, behavior: "smooth" });
    }
  }, []);

  if (!articles || articles.length === 0) {
    return null; // لا نعرض شيئاً إذا لا توجد مقالات
  }

  // تنسيق المشاهدات
  const formatViews = (views: number = 0) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  // تحويل رابط Cloudinary لإضافة التحويلات المطلوبة: c_fill,w_800,h_450,q_auto,f_auto
  const withCloudinaryTransform = (src: string): string => {
    try {
      if (!src || typeof src !== "string") return src;
      if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
        return src;
      }
      const [prefix, rest] = src.split("/upload/");
      // إذا كانت التحويلات موجودة مسبقاً، نعيد الرابط كما هو
      if (/^(c_|w_|h_|f_|q_)/.test(rest)) {
        return `${prefix}/upload/${rest}`;
      }
      const transformations = "c_fill,w_800,h_450,q_auto,f_auto";
      return `${prefix}/upload/${transformations}/${rest}`;
    } catch {
      return src;
    }
  };

  // تطبيع مسار الصورة للنسخة الخفيفة مع الحماية من base64 وروابط http
  const normalizeImageSrc = (raw?: string | null): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
    // السماح بروابط base64 لعرض الصورة فعلياً بدلاً من placeholder
    if (trimmed.startsWith('data:image/')) return trimmed;
    // إصلاح http إلى https في الإنتاج فقط لتجنب كسر الروابط على البيئة المحلية
    const isProd = process.env.NODE_ENV === 'production';
    const fixed = trimmed.startsWith('http://')
      ? (isProd ? trimmed.replace(/^http:\/\//, 'https://') : trimmed)
      : trimmed;
    // اجعل الروابط النسبية تبدأ بـ '/'
    if (fixed.startsWith('http') || fixed.startsWith('/')) return fixed;
    return `/${fixed.replace(/^\/+/, '')}`;
  };

  return (
    <section aria-label="الأخبار المميزة" className="relative" dir="rtl">
      {/* تمت إزالة عنوان القسم للنسخة الخفيفة */}
      <div
        ref={scrollRef}
        tabIndex={0}
        onKeyDown={onKeyScroll}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory focus:outline-none"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* إخفاء شريط التمرير */}
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        {articles.slice(0, 3).map((article, idx) => {
          const category = article.category?.name || article.category_name || article.category;
          const date = article.published_at || article.created_at;
          // معالجة محسّنة للصورة
          const rawImage = article.featured_image || article.social_image || article.image_url || article.image || article.thumbnail;
          const normalizedImage = normalizeImageSrc(rawImage);
          // تطبيق تحويل Cloudinary أو استخدام placeholder الافتراضي المعروف بوجوده
          const displaySrc = normalizedImage
            ? withCloudinaryTransform(normalizedImage)
            : '/images/news-placeholder-lite.svg';
          const isBreaking = Boolean(article.breaking || article.is_breaking);
          return (
            <Link
              key={article.id || idx}
              href={getArticleLink(article)}
              prefetch={false}
              className="group flex-shrink-0 snap-start w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] select-none"
              aria-label={article.title}
              style={{ contentVisibility: 'auto', containIntrinsicSize: '320px 260px' as any }}
            >
              <article
                className={`relative rounded-2xl overflow-hidden border transition-all duration-200 h-full flex flex-col shadow-sm hover:shadow-md ${
                  isBreaking
                    ? (darkMode
                        ? 'bg-red-950/20 border-red-700/50 hover:border-red-500/60'
                        : 'bg-red-50 border-red-200 hover:border-red-300')
                    : (darkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-blue-400'
                        : 'bg-white border-gray-200 hover:border-blue-300')
                }`}
              >
                <div className={`relative aspect-video w-full overflow-hidden rounded-lg`}>
                  {/* SafeNewsImage handles base64/http/failures and swaps to a local placeholder automatically */}
                  <SafeNewsImage
                    src={displaySrc}
                    alt={article.title || "صورة الخبر"}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    priority={idx === 0}
                    width={400}
                    height={225}
                    decoding="async"
                    fetchPriority={idx === 0 ? 'high' : 'low'}
                  />
                  {/* ليبل عاجل أو جديد أو التصنيف */}
                  <div className="absolute top-2 left-2">
                    {isBreaking ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white">
                        <span className="text-xs">⚡</span>
                        عاجل
                      </span>
                    ) : isNewsNew(article.published_at || article.created_at || '') ? (
                      <span className="recent-news-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-white">
                        <span className="text-xs">🔥</span>
                        جديد
                      </span>
                    ) : category ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          darkMode
                            ? "bg-gray-900/60 text-gray-200 border border-gray-700"
                            : "bg-white/80 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {article.category?.icon && (
                          <span className="text-xs">{article.category.icon}</span>
                        )}
                        {category}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col p-3 pb-4 flex-1">
                  <h3
                    className={`text-sm sm:text-base font-semibold leading-snug line-clamp-2 mb-2 ${
                      isBreaking
                        ? (darkMode ? 'text-red-300' : 'text-red-700')
                        : (darkMode ? 'text-white' : 'text-gray-800')
                    }`}
                  >
                    {article.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      {date && (
                        <time dateTime={date}>{formatDateNumeric(date)}</time>
                      )}
                    </div>
                    {typeof article.views === 'number' && (
                      <div className="flex items-center gap-1">
                        <span>{formatViews(article.views)} مشاهدة</span>
                        {(article.views ?? 0) > 300 && <span className="ml-1">🔥</span>}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
