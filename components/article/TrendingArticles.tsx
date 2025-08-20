"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import { Calendar, Eye, TrendingUp, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { linkTo } from "@/lib/url-builder";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  featured_image?: string;
  image_url?: string;
  published_at: string;
  views?: number;
  reading_time?: number;
  author_name?: string;
  category?: {
    name: string;
    color?: string;
  };
}

interface TrendingArticlesProps {
  currentArticleId?: string;
  limit?: number;
  timeframe?: "24h" | "day" | "week" | "month" | "all";
  title?: string;
  sticky?: boolean;
  refreshMs?: number;
  className?: string;
}

export default function TrendingArticles({
  currentArticleId,
  limit = 5,
  timeframe = "24h",
  title = "الأكثر قراءة",
  sticky = false,
  refreshMs = 60000,
  className,
}: TrendingArticlesProps) {
  const { darkMode } = useDarkModeContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const fetchTrendingArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/articles/trending?limit=${limit}&timeframe=${timeframe}&exclude=${currentArticleId}`,
          { cache: "no-store" }
        );
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error("Error fetching trending articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingArticles();
    // تحديث دوري كـ real-time بسيط
    timer = setInterval(fetchTrendingArticles, Math.max(15000, refreshMs));
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentArticleId, limit, timeframe]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}م`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}ك`;
    }
    return views.toString();
  };

  // مكون شعلة اللهب للأخبار الشائعة
  const FlameIcon = () => (
    <div 
      className="inline-block w-3 h-3.5 relative ml-1"
      style={{
        filter: 'drop-shadow(0 0 3px rgba(255, 69, 0, 0.4))'
      }}
    >
      <div 
        className="absolute w-2 h-3 rounded-full"
        style={{
          left: '2px',
          top: '1px',
          background: 'radial-gradient(circle at 50% 100%, #ff4500 0%, #ff6b00 30%, #ffaa00 60%, #ffdd00 80%, transparent 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          animation: 'flameFlicker 1.5s ease-in-out infinite alternate',
          transformOrigin: '50% 100%'
        }}
      />
      <div 
        className="absolute w-1.5 h-2 rounded-full"
        style={{
          left: '3px',
          top: '3px',
          background: 'radial-gradient(circle at 50% 100%, #ff6b00 0%, #ffaa00 40%, #ffdd00 70%, transparent 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          animation: 'flameFlicker 1.2s ease-in-out infinite alternate-reverse',
          transformOrigin: '50% 100%'
        }}
      />
      <style jsx>{`
        @keyframes flameFlicker {
          0% {
            transform: scale(1) rotate(-1deg);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.1) rotate(1deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.95) rotate(-0.5deg);
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  );

  return (
    <div
      className={cn(
        "p-6 rounded-2xl border h-full flex flex-col",
        sticky && "sticky top-24",
        darkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200",
        className
      )}
    >
      {/* عنوان القسم */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            darkMode ? "bg-orange-900/30" : "bg-orange-100"
          )}
        >
          <TrendingUp
            className={cn(
              "w-5 h-5",
              darkMode ? "text-orange-400" : "text-orange-600"
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
            {title}
          </h3>
          <p
            className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            {timeframe === "24h" || timeframe === "day"
              ? "آخر 24 ساعة"
              : timeframe === "week"
              ? "هذا الأسبوع"
              : timeframe === "month"
              ? "هذا الشهر"
              : "الأكثر شعبية"}
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
          لا توجد مقالات متاحة
        </p>
      ) : (
        <div className="space-y-4 flex-1">
          <AnimatePresence initial={false}>
          {articles.map((article, index) => (
            <motion.div key={article.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <Link
              href={linkTo({ slug: (article as any).slug || article.id, contentType: 'NEWS' })}
              className={cn(
                "block p-4 rounded-xl transition-all duration-200 hover:shadow-md relative border",
                darkMode
                  ? "hover:bg-gray-700/50 border-gray-700/50"
                  : "hover:bg-gray-50 border-gray-200/50"
              )}
            >
              {/* رقم الترتيب */}
              <div className="absolute top-2 left-2">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    index === 0
                      ? "bg-yellow-500 text-white"
                      : index === 1
                      ? "bg-gray-500 text-white"
                      : index === 2
                      ? "bg-amber-700 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {index + 1}
                </span>
              </div>

              <div className="flex gap-3 pr-8">
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

                  {/* معلومات المقال */}
                  <div className="flex items-center gap-3 text-xs mb-2">
                    {article.author_name && (
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}
                      >
                        <User className="w-3 h-3" />
                        {article.author_name}
                      </span>
                    )}

                    <span
                      className={cn(
                        "flex items-center gap-1",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.published_at)}
                    </span>
                  </div>

                  {/* المشاهدات */}
                  {article.views && (
                    <div className="flex items-center gap-1">
                      <Eye
                        className={cn(
                          "w-3 h-3",
                          darkMode ? "text-green-400" : "text-green-600"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          darkMode ? "text-green-400" : "text-green-600"
                        )}
                      >
                        {formatViews(article.views)} مشاهدة
                      </span>
                      {article.views > 300 && (
                        <FlameIcon />
                      )}
                    </div>
                  )}

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
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}

      {/* رابط عرض المزيد */}
      {articles.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/news?sort=views"
            className={cn(
              "block text-center py-2 px-4 rounded-lg font-medium text-sm transition-colors",
              darkMode
                ? "text-orange-400 hover:bg-orange-900/20"
                : "text-orange-600 hover:bg-orange-50"
            )}
          >
            عرض المزيد من المقالات الشائعة
          </Link>
        </div>
      )}
    </div>
  );
}
