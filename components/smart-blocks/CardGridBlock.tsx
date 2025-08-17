"use client";

import { UIUtils } from "@/lib/ai/classifier-utils";
import { formatDateShort } from "@/lib/date-utils";
import { linkTo } from "@/lib/url-builder";
import { Clock, Coffee, Eye } from "lucide-react";
import Link from "next/link";

interface CardGridBlockProps {
  block: any;
  articles: any[];
}

export function CardGridBlock({ block, articles }: CardGridBlockProps) {
  const displayArticles = articles.slice(0, block.articlesCount || 1);

  // دالة لتنسيق التاريخ
  const formatDate = (date: string) => {
    if (!date) return "";
    return formatDateShort(date);
  };

  // إذا لم تكن هناك مقالات، لا نعرض البلوك
  if (displayArticles.length === 0) {
    return null;
  }

  const article = displayArticles[0]; // نعرض مقال واحد فقط

  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
        style={{
          borderBottom: `4px solid ${UIUtils.getCategoryColor(
            article.category_name || article.category || "عام"
          )}`,
        }}
      >
        {/* Header مدمج داخل البلوك */}
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-3">
          <Coffee className="w-4 h-4" />
          <span className="font-bold">يوم القهوة العالمي</span>
        </div>

        {/* محتوى المقال */}
        <Link
          href={linkTo({
            slug: article.slug,
            contentType: article.content_type || "NEWS",
          })}
          className="block group"
        >
          <div className="flex flex-col md:flex-row gap-5">
            {/* الصورة */}
            <div className="relative w-full md:w-48 h-40 flex-shrink-0">
              <img
                src={article.image_url || article.image}
                alt={article.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium leading-snug line-clamp-3 text-gray-900 dark:text-white">
                {article.title}
              </h3>

              {article.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {/* معلومات إضافية (سطر موحد: التاريخ + المشاهدات) */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(
                    article.publishedAt ||
                      article.published_at ||
                      article.created_at
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {article.views || 0} مشاهدة
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
