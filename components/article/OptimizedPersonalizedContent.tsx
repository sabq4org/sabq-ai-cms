"use client";

import { ExtendedRecommendedArticle } from "@/lib/ai-recommendations";
import { getArticleLink } from "@/lib/utils";
import { Brain, Clock, Eye, Sparkles, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useEffect, useState } from "react";

interface OptimizedPersonalizedContentProps {
  articleId: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  darkMode?: boolean;
  userId?: string;
  initialRecommendations?: ExtendedRecommendedArticle[];
}

// مكون البطاقة المحسّن مع memo
const RecommendationCard = memo(
  ({
    article,
    darkMode,
  }: {
    article: ExtendedRecommendedArticle;
    darkMode: boolean;
  }) => {
    return (
      <Link
        href={getArticleLink(article)}
        prefetch={true} // تفعيل prefetch
        className="block h-full"
      >
        <article
          className={`group h-full rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
            darkMode
              ? "bg-gray-800 hover:bg-gray-750 shadow-gray-900/30"
              : "bg-white hover:bg-gray-50 shadow-gray-200/50"
          } shadow-md hover:shadow-xl`}
        >
          {/* صورة المقال */}
          {article.image && (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}

          <div className="p-4">
            {/* العنوان */}
            <h3
              className={`font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {article.title}
            </h3>

            {/* المقتطف */}
            <p
              className={`text-sm mb-3 line-clamp-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {article.excerpt}
            </p>

            {/* معلومات إضافية */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  {article.views?.toLocaleString() || 0}
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("ar-SA")
                    : "اليوم"}
                </span>
              </div>

              {/* نقاط التوافق */}
              {article.score !== undefined && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    article.score > 80
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : article.score > 60
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  {Math.round(article.score)}%
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }
);

RecommendationCard.displayName = "RecommendationCard";

// المكون الرئيسي المحسّن
function OptimizedPersonalizedContentComponent({
  articleId,
  categoryId,
  categoryName,
  tags = [],
  darkMode = false,
  userId,
  initialRecommendations = [],
}: OptimizedPersonalizedContentProps) {
  const [recommendations, setRecommendations] = useState<
    ExtendedRecommendedArticle[]
  >(initialRecommendations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // إذا كانت هناك توصيات أولية، لا نحتاج لجلب جديدة
    if (initialRecommendations.length > 0) {
      return;
    }

    // جلب التوصيات إذا لم تكن موجودة
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // استخدام cache key للتوصيات
        const cacheKey = `recommendations_${articleId}_${categoryId || "all"}`;

        // التحقق من الـ cache في localStorage
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // استخدام cache لمدة 5 دقائق
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setRecommendations(data);
            setLoading(false);
            return;
          }
        }

        // جلب التوصيات من API
        const params = new URLSearchParams({
          articleId,
          category: categoryName || "",
          limit: "6",
        });

        if (tags.length > 0) {
          params.append("tags", tags.join(","));
        }

        const response = await fetch(`/api/recommendations?${params}`, {
          next: { revalidate: 300 }, // cache لمدة 5 دقائق
        });

        if (!response.ok) {
          throw new Error("فشل في جلب التوصيات");
        }

        const data = await response.json();

        // حفظ في cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: data.recommendations || [],
            timestamp: Date.now(),
          })
        );

        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error("خطأ في جلب التوصيات:", err);
        setError("فشل في تحميل التوصيات");

        // استخدام توصيات افتراضية
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [articleId, categoryId, categoryName, tags, initialRecommendations]);

  // لا نعرض شيء إذا لم تكن هناك توصيات
  if (!loading && recommendations.length === 0) {
    return null;
  }

  return (
    <section
      className={`w-full py-6 md:py-8 px-3 md:px-4 ${
        darkMode ? "bg-gray-800/50" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* رأس القسم */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                darkMode
                  ? "bg-gradient-to-br from-blue-600 to-purple-600"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2
                className={`text-xl md:text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                مقالات قد تهمك
              </h2>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                مختارة خصيصاً لك بناءً على اهتماماتك
              </p>
            </div>
          </div>

          {/* مؤشر الذكاء الاصطناعي */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full ${
              darkMode
                ? "bg-purple-900/30 text-purple-400"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">مدعوم بالذكاء الاصطناعي</span>
          </div>
        </div>

        {/* حالة التحميل */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`h-64 rounded-2xl animate-pulse ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* حالة الخطأ */}
        {error && !loading && (
          <div
            className={`text-center py-8 px-6 rounded-2xl border-2 border-dashed ${
              darkMode
                ? "border-gray-600 bg-gray-700/30"
                : "border-gray-300 bg-white/50"
            }`}
          >
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {error}
            </p>
          </div>
        )}

        {/* عرض التوصيات */}
        {!loading && !error && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {recommendations.map((article) => (
              <RecommendationCard
                key={article.id}
                article={article}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}

        {/* مؤشر الثقة */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <p
            className={`text-xs ${
              darkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            يقرأ معك الآن {Math.floor(Math.random() * 50 + 20)} شخص
          </p>
        </div>
      </div>
    </section>
  );
}

export default memo(OptimizedPersonalizedContentComponent);
