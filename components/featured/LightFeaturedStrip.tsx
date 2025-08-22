"use client";

import React, { useRef, useCallback } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { formatDateNumeric } from "@/lib/date-utils";
import { getArticleLink } from "@/lib/utils";
import { useDarkModeContext } from "@/contexts/DarkModeContext";

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
  const { darkMode } = useDarkModeContext();
  const scrollRef = useRef<HTMLDivElement | null>(null);

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
        {articles.map((article, idx) => {
          const category = article.category?.name || article.category_name || article.category || "عام";
          const date = article.published_at || article.created_at;
          // معالجة محسّنة للصورة - التحقق من عدة حقول وتوفير fallback
          const image = article.featured_image || article.image_url || article.image || article.thumbnail;
          const hasImage = image && image !== '' && image !== 'null';
          const isBreaking = Boolean(article.breaking || article.is_breaking);
          return (
            <Link
              key={article.id || idx}
              href={getArticleLink(article)}
              className="group flex-shrink-0 snap-start w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] select-none"
              aria-label={article.title}
            >
              <article
                className={`relative rounded-2xl overflow-hidden border transition-all duration-300 h-full flex flex-col shadow-sm hover:shadow-lg ${
                  isBreaking
                    ? (darkMode
                        ? 'bg-[rgba(255,255,255,0.04)] border-red-700/60 hover:border-red-500/70'
                        : 'bg-red-50 border-red-200 hover:border-red-300')
                    : (darkMode
                        ? 'bg-[rgba(255,255,255,0.04)] border-gray-700 hover:border-gray-500/70'
                        : 'bg-[#f8f8f7] border-gray-200 hover:border-blue-300 hover:shadow-blue-100')
                }`}
              >
                <div className={`relative aspect-video w-full overflow-hidden rounded-lg ${!hasImage ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                  {hasImage ? (
                    <OptimizedImage
                      src={image}
                      alt={article.title || "صورة"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      priority={idx === 0}
                    />
                  ) : (
                    // صورة افتراضية أو placeholder عندما لا توجد صورة
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <div className="text-gray-400 dark:text-gray-500 text-center">
                        <svg
                          className="w-12 h-12 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs">لا توجد صورة</p>
                      </div>
                    </div>
                  )}
                  {/* تمت إزالة شارة عاجل العلوية اليمنى لعدم التكرار */}
                  {/* ليبل عاجل يحل مكان ليبل التصنيف */}
                  <div className="absolute top-2 left-2">
                    {isBreaking ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white">
                        <span className="text-xs">⚡</span>
                        عاجل
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium backdrop-blur-sm ${
                          darkMode
                            ? "bg-gray-900/60 text-gray-200 border border-gray-700"
                            : "bg-[#f8f8f7]/70 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {article.category?.icon && (
                          <span className="text-xs">{article.category.icon}</span>
                        )}
                        {category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col p-3 pb-4 flex-1">
                  <h3
                    className={`text-sm sm:text-base font-semibold leading-snug line-clamp-2 mb-2 transition-colors ${
                      isBreaking
                        ? (darkMode ? 'text-red-300' : 'text-red-700')
                        : (darkMode ? 'text-white group-hover:text-blue-300' : 'text-gray-800 group-hover:text-blue-600')
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
                        <span className="inline-block align-middle">👁️</span>
                        <span>{article.views}</span>
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
