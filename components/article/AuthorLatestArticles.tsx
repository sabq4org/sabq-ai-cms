"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import { Calendar, Eye, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { linkTo } from "@/lib/url-builder";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  featured_image?: string;
  image_url?: string;
  published_at: string;
  views?: number;
  reading_time?: number;
  category?: {
    name: string;
    color?: string;
  };
}

interface AuthorLatestArticlesProps {
  authorId: string;
  authorName: string;
  currentArticleId?: string;
  limit?: number;
}

export default function AuthorLatestArticles({
  authorId,
  authorName,
  currentArticleId,
  limit = 5,
}: AuthorLatestArticlesProps) {
  const { darkMode } = useDarkModeContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/articles/by-author/${authorId}?limit=${limit}&exclude=${currentArticleId}`
        );
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error("Error fetching author articles:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authorId) {
      fetchAuthorArticles();
    }
  }, [authorId, currentArticleId, limit]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "sticky top-24 p-6 rounded-2xl border",
        darkMode
          ? "bg-gray-800/50 border-gray-700 backdrop-blur-sm"
          : "bg-white/70 border-gray-200 backdrop-blur-sm"
      )}
    >
      {/* عنوان القسم */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            darkMode ? "bg-blue-900/30" : "bg-blue-100"
          )}
        >
          <User
            className={cn(
              "w-5 h-5",
              darkMode ? "text-blue-400" : "text-blue-600"
            )}
          />
        </div>
        <div>
          <h3
            className={cn(
              "text-lg font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            آخر مقالات الكاتب
          </h3>
          <p
            className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            {authorName}
          </p>
        </div>
      </div>

      {/* المحتوى */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div
                className={cn(
                  "h-4 rounded mb-2",
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                )}
              />
              <div
                className={cn(
                  "h-3 rounded w-3/4",
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                )}
              />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p
          className={cn(
            "text-center py-8 text-sm",
            darkMode ? "text-gray-400" : "text-gray-500"
          )}
        >
          لا توجد مقالات أخرى للكاتب
        </p>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={linkTo({ slug: (article as any).slug || article.id, contentType: 'OPINION' })}
              className={cn(
                "block p-4 rounded-xl transition-all duration-200 hover:shadow-md",
                darkMode
                  ? "hover:bg-gray-700/50 border border-gray-700/50"
                  : "hover:bg-gray-50 border border-gray-200/50"
              )}
            >
              <div className="flex gap-3">
                {/* صورة المقال */}
                {(article.image_url || article.featured_image) && (
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={article.image_url || article.featured_image || ""}
                        alt={article.title}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {/* محتوى المقال */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={cn(
                      "text-sm font-semibold line-clamp-2 mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}
                  >
                    {article.title}
                  </h4>

                  {article.excerpt && (
                    <p
                      className={cn(
                        "text-xs line-clamp-2 mb-2",
                        darkMode ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      {article.excerpt}
                    </p>
                  )}

                  {/* معلومات إضافية */}
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.published_at)}
                    </span>

                    {article.views && (
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}
                      >
                        <Eye className="w-3 h-3" />
                        {article.views}
                      </span>
                    )}
                  </div>

                  {/* التصنيف */}
                  {article.category && (
                    <div className="mt-2">
                      <span
                        className={cn(
                          "inline-block px-2 py-1 rounded-full text-xs",
                          darkMode
                            ? "bg-purple-900/30 text-purple-300"
                            : "bg-purple-100 text-purple-700"
                        )}
                        style={
                          article.category.color
                            ? {
                                backgroundColor: darkMode
                                  ? `${article.category.color}20`
                                  : `${article.category.color}10`,
                                color: article.category.color,
                              }
                            : undefined
                        }
                      >
                        {article.category.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* رابط عرض المزيد */}
      {articles.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/reporter/${authorId}`}
            className={cn(
              "block text-center py-2 px-4 rounded-lg font-medium text-sm transition-colors",
              darkMode
                ? "text-blue-400 hover:bg-blue-900/20"
                : "text-blue-600 hover:bg-blue-50"
            )}
          >
            عرض جميع مقالات {authorName}
          </Link>
        </div>
      )}
    </div>
  );
}
