"use client";

import { HeroCard } from "@/components/muqtarab/HeroCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Brain, Lightbulb, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import MuqtarabCard from "./MuqtarabCard";

interface MuqtarabArticle {
  id: string;
  title: string;
  summary: string;
  author: {
    name: string;
    avatar?: string;
    emoji?: string;
  };
  category: {
    name: string;
    color: string;
    emoji: string;
  };
  compatibility: number;
  sentiment: "ساخر" | "تأملي" | "عاطفي" | "تحليلي" | "إلهامي";
  readTime: number;
  aiReason?: string;
  slug: string;
}

interface HeroArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  readingTime: number;
  publishDate: string;
  views: number;
  tags: string[];
  aiScore: number;
  angle: {
    title: string;
    slug: string;
    icon?: string;
    themeColor?: string;
  };
  author: {
    name: string;
    avatar?: string;
  };
}

interface MuqtarabBlockProps {
  className?: string;
}

export default function MuqtarabBlock({ className }: MuqtarabBlockProps) {
  const [articles, setArticles] = useState<MuqtarabArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [heroArticle, setHeroArticle] = useState<HeroArticle | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);

  // فئات المحتوى الإبداعي
  const categories = [
    { name: "الكل", value: null, emoji: "🎭" },
    { name: "رأي", value: "opinion", emoji: "💭" },
    { name: "تجربة", value: "experience", emoji: "🌟" },
    { name: "تقنية", value: "tech", emoji: "🤖" },
    { name: "موضة", value: "fashion", emoji: "👗" },
    { name: "فن", value: "art", emoji: "🎨" },
    { name: "سفر", value: "travel", emoji: "✈️" },
  ];

  // جلب البطاقة المميزة (Hero Article)
  const fetchHeroArticle = async () => {
    try {
      console.log("🔍 [MuqtarabBlock] جاري جلب المقال المميز...");

      const response = await fetch("/api/muqtarab/hero-article", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.heroArticle) {
          console.log(
            "✅ [MuqtarabBlock] تم جلب المقال المميز:",
            data.heroArticle.title
          );
          setHeroArticle(data.heroArticle);
        } else {
          console.log("⚠️ [MuqtarabBlock] لا توجد مقالات مميزة");
        }
      } else {
        console.error(
          "❌ [MuqtarabBlock] خطأ في جلب المقال المميز:",
          response.status
        );
      }
    } catch (error) {
      console.error("خطأ في جلب المقال المميز:", error);
    } finally {
      setHeroLoading(false);
    }
  };

  // جلب المقالات الإبداعية
  const fetchArticles = async (refresh = false) => {
    if (refresh) setRefreshing(true);

    try {
      const response = await fetch("/api/muqtarab/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          limit: 6,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error("خطأ في جلب مقالات مقترَب:", error);
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  useEffect(() => {
    fetchHeroArticle();
  }, []);

  const handleRefresh = () => {
    fetchArticles(true);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100",
        "dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-800",
        "rounded-2xl overflow-hidden",
        "border border-gray-300 dark:border-gray-600",
        "shadow-lg",
        className
      )}
    >
      {/* رأس الوحدة */}
      <div className="relative p-6 border-b border-gray-200 dark:border-gray-700/50">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  مقترَب
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  حيث يلتقي الفكر بالتقنية بالأسلوب
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              size="sm"
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20"
            >
              <RefreshCw
                className={cn("w-4 h-4", refreshing && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        {/* فلاتر الفئات */}
        <div className="relative mt-4 flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.value || "all"}
              onClick={() => setSelectedCategory(category.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                selectedCategory === category.value
                  ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-md scale-105"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50"
              )}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* المحتوى */}
      <div className="p-6">
        {/* البطاقة المميزة (Hero Article) */}
        {!heroLoading && heroArticle && (
          <div className="mb-8">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                المقال المميز
              </h3>
            </div>
            <HeroCard heroArticle={heroArticle} />
          </div>
        )}

        {articles.length > 0 ? (
          <>
            <div className="space-y-6 mb-6">
              {/* البطاقات - شبكة متنوعة */}
              {articles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {articles.slice(0, 2).map((article, index) => (
                    <MuqtarabCard
                      key={article.id}
                      article={article}
                      variant="medium"
                      className="lg:col-span-2"
                    />
                  ))}
                  {articles.slice(2).map((article, index) => (
                    <MuqtarabCard
                      key={article.id}
                      article={article}
                      variant="small"
                      className="lg:col-span-1"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* رابط عرض المزيد */}
            <div className="flex justify-center">
              <Link href="/muqtarab">
                <Button
                  variant="outline"
                  className="group bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span>استكشف المزيد من مقترَب</span>
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-800 dark:to-blue-900/20 flex items-center justify-center">
              <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد مقالات إبداعية حالياً
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              نعمل على إنتاج محتوى إبداعي مخصص لك
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
          </div>
        )}
      </div>

      {/* مؤشر الذكاء الاصطناعي */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Sparkles className="w-3 h-3" />
          <span>مدعوم بالذكاء الاصطناعي • مخصص حسب اهتماماتك</span>
        </div>
      </div>
    </div>
  );
}
