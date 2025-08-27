"use client";

import { Brain, Clock, Eye, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getArticleLink } from "@/lib/utils";

interface RecommendedArticle {
  id: string;
  title: string;
  slug: string;
  featured_image?: string;
  views?: number;
  readingTime?: number;
  confidence: number;
  reason?: string;
  category?: string;
}

interface PersonalizedForYouProps {
  articleId: string;
  categoryName?: string;
  tags?: string[];
}

export default function PersonalizedForYou({ articleId, categoryName, tags = [] }: PersonalizedForYouProps) {
  const [recommendations, setRecommendations] = useState<RecommendedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة جلب التوصيات - يمكن استبدالها بـ API حقيقي
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // توصيات تجريبية
        setRecommendations([
          {
            id: "1",
            title: "تحليل: كيف ستؤثر القرارات الاقتصادية الجديدة على المواطنين",
            slug: "economic-analysis-2024",
            views: 15420,
            readingTime: 5,
            confidence: 92,
            reason: "مقال تحليلي مرتبط",
            category: "اقتصاد"
          },
          {
            id: "2",
            title: "رأي: الحلول المبتكرة لتحديات القطاع الخاص",
            slug: "private-sector-solutions",
            views: 8930,
            readingTime: 3,
            confidence: 87,
            reason: "رأي في نفس الموضوع",
            category: "آراء"
          },
          {
            id: "3",
            title: "تقرير خاص: إنجازات رؤية 2030 في عامها السابع",
            slug: "vision-2030-report",
            views: 25100,
            readingTime: 7,
            confidence: 95,
            reason: "محتوى مميز",
            category: "تقارير"
          }
        ]);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [articleId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse mb-2" />
          <p className="text-sm text-neutral-500">جاري تحليل اهتماماتك...</p>
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  const averageConfidence = Math.round(
    recommendations.reduce((acc, article) => acc + article.confidence, 0) / recommendations.length
  );

  return (
    <div className="rounded-2xl border p-4 shadow-sm" style={{
      borderColor: 'var(--theme-border, rgb(229 231 235))',
      background: 'var(--theme-bg-secondary, rgb(255 255 255))',
    }}>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="mb-2">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </span>
        </div>
        <h3 className="font-bold" style={{ color: 'var(--theme-text, rgb(17 24 39))' }}>مخصص لك بذكاء</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--theme-primary, rgb(99 102 241))' }}>
          محتوى مختار بناءً على اهتماماتك
        </p>
      </div>

      {/* Recommendations */}
      <div className="space-y-3 mb-4">
        {recommendations.map((article, index) => (
          <Link
            key={article.id}
            href={getArticleLink(article)}
            className="block p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all hover:shadow-md group"
          >
            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-2 mb-2">
              {article.title}
            </h4>
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-3">
                {article.views && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString("ar-SA")}
                  </span>
                )}
                {article.readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readingTime} د
                  </span>
                )}
              </div>
              {article.reason && (
                <span className="text-purple-600 dark:text-purple-400 text-[10px]">
                  {article.reason}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Accuracy */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                دقة التوصيات
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {averageConfidence}%
              </div>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-purple-200 dark:bg-purple-800 mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
              style={{ width: `${averageConfidence}%` }}
            />
          </div>
        </div>

        {/* Smart Mix */}
        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              كوكتيل ذكي
            </span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {["📰", "🧠", "🗣️", "✨"].map((emoji, index) => (
              <span
                key={index}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-3 mt-3 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
          🎯 يتحسن كلما تفاعلت أكثر • يُحدث كل 12 ساعة
        </p>
      </div>
    </div>
  );
}
