"use client";

import { useState, useEffect } from "react";
import EnhancedArticleCard from "./EnhancedArticleCard";
import { EnhancedButton } from "@/components/ui/EnhancedButton";
import { Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    id: string;
    name: string;
  };
  views?: number;
  published_at?: string;
  created_at?: string;
}

interface EnhancedArticlesListProps {
  initialArticles?: Article[];
  categorySlug?: string;
  limit?: number;
  variant?: "default" | "compact" | "featured";
  showLoadMore?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * مكون قائمة الأخبار المحسّن
 * 
 * يعرض قائمة من المقالات باستخدام EnhancedArticleCard
 * مع دعم التحميل التدريجي والتحديث
 */
export default function EnhancedArticlesList({
  initialArticles = [],
  categorySlug,
  limit = 12,
  variant = "default",
  showLoadMore = true,
  showActions = false,
  className = "",
}: EnhancedArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // جلب المقالات
  const fetchArticles = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        ...(categorySlug && { category: categorySlug }),
      });

      const response = await fetch(`/api/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        if (pageNum === 1) {
          setArticles(data.articles || []);
        } else {
          setArticles(prev => [...prev, ...(data.articles || [])]);
        }
        
        setHasMore(data.hasMore || false);
      }
    } catch (error) {
      console.error("خطأ في جلب المقالات:", error);
    } finally {
      setLoading(false);
    }
  };

  // تحميل المقالات عند التحميل الأولي
  useEffect(() => {
    if (initialArticles.length === 0) {
      fetchArticles(1);
    }
  }, [categorySlug]);

  // تحميل المزيد
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage);
  };

  // تحديث القائمة
  const refresh = () => {
    setPage(1);
    fetchArticles(1);
  };

  // تحديد عدد الأعمدة بناءً على النوع
  const getGridCols = () => {
    if (variant === "featured") return "grid-cols-1";
    if (variant === "compact") return "grid-cols-1";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <div className={`${className}`}>
      {/* زر التحديث */}
      <div className="flex justify-end mb-4">
        <EnhancedButton
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={loading}
          leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
        >
          تحديث
        </EnhancedButton>
      </div>

      {/* قائمة المقالات */}
      <motion.div
        layout
        className={`grid ${getGridCols()} gap-6`}
      >
        <AnimatePresence mode="popLayout">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <EnhancedArticleCard
                article={article}
                variant={variant}
                showActions={showActions}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* زر تحميل المزيد */}
      {showLoadMore && hasMore && (
        <div className="flex justify-center mt-8">
          <EnhancedButton
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={loading}
            loading={loading}
          >
            {loading ? "جاري التحميل..." : "تحميل المزيد"}
          </EnhancedButton>
        </div>
      )}

      {/* رسالة عدم وجود مقالات */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-brand-fgMuted dark:text-gray-400">
            لا توجد مقالات متاحة حالياً
          </p>
        </div>
      )}
    </div>
  );
}

