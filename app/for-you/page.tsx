"use client";

import CategoryBadge from "@/app/components/CategoryBadge";
import { getSmartArticleLink } from "@/lib/utils";
import { EnhancedButton } from "@/components/ui/EnhancedButton";
import { EnhancedCard, EnhancedCardContent } from "@/components/ui/EnhancedCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ChevronDown,
  Clock,
  Eye,
  Filter,
  Heart,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Star,
  Bookmark,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  summary: string;
  content?: string;
  category_id: any;
  category_name?: string;
  author_name?: string;
  featured_image?: string;
  published_at: string;
  reading_time?: number;
  views_count?: number;
  likes_count?: number;
  shares_count?: number;
  comments_count?: number;
  interaction_count?: number;
  tags?: string[];
  score?: number;
  confidence?: number;
  is_personalized?: boolean;
}

interface AIInsight {
  id: string;
  title: string;
  value: string;
  icon: any;
  color: string;
}

/**
 * صفحة For You المحسّنة
 * 
 * تصميم عصري مع:
 * - تأثيرات حركية متقدمة
 * - بطاقات محسّنة
 * - رؤى AI ذكية
 * - واجهة تفاعلية
 */
export default function EnhancedForYouPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "relevant">("relevant");
  const [showFilter, setShowFilter] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [interestCategoryIds, setInterestCategoryIds] = useState<Set<string>>(new Set());
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    const storedUserId = localStorage.getItem("user_id");
    const userData = localStorage.getItem("user");
    if (storedUserId && storedUserId !== "anonymous" && userData) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
    } else {
      window.location.href = "/login?redirect=/for-you/enhanced";
    }

    fetchCategories();

    fetch('/api/user/preferences', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const ids = new Set<string>((data.interests || []).map((i: any) => String(i.category_id)).filter(Boolean));
        setInterestCategoryIds(ids);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchPersonalizedContent();
      generateAIInsights();
    }
  }, [isLoggedIn, userId, selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const result = await response.json();
      setCategories(result.categories || result.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPersonalizedContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/feed/personalized?limit=20&offset=0`, { cache: 'no-store' });
      if (!response.ok) throw new Error('failed');
      const result = await response.json();
      const items = (result.items || []) as any[];
      setArticles(
        items.map((a: any) => ({
          id: a.id || a.articleId,
          title: a.title || '',
          summary: a.excerpt || a.summary || '',
          featured_image: a.featured_image,
          category_id: a.category_id,
          published_at: a.published_at || new Date().toISOString(),
          reading_time: a.reading_time || 5,
          views_count: a.views || a.views_count || 0,
          likes_count: a.likes || a.likes_count || 0,
          shares_count: a.shares || a.shares_count || 0,
          score: a.score,
          confidence: a.confidence,
          is_personalized: true,
        })) as any
      );
    } catch (error) {
      console.error("Error fetching personalized content:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = () => {
    const totalViews = articles.reduce((sum, a) => sum + (a.views_count || 0), 0);
    const avgConfidence = articles.length > 0 
      ? Math.round(articles.reduce((sum, a) => sum + (a.confidence || 0), 0) / articles.length)
      : 0;

    const aiInsights: AIInsight[] = [
      {
        id: "1",
        title: "مقالات مخصصة",
        value: `${articles.length} مقال`,
        icon: Sparkles,
        color: "from-purple-500 to-pink-500"
      },
      {
        id: "2",
        title: "دقة التخصيص",
        value: `${avgConfidence}%`,
        icon: Target,
        color: "from-blue-500 to-cyan-500"
      },
      {
        id: "3",
        title: "اهتماماتك",
        value: `${interestCategoryIds.size} تصنيف`,
        icon: Heart,
        color: "from-green-500 to-emerald-500"
      }
    ];
    setInsights(aiInsights);
  };

  const handleRefresh = () => {
    fetchPersonalizedContent();
    generateAIInsights();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                  محتوى مخصص لك
                </h1>
              </div>
              <p className="text-lg text-brand-fgMuted dark:text-gray-400">
                مقالات وتحليلات مختارة بعناية بناءً على اهتماماتك بواسطة الذكاء الاصطناعي
              </p>
            </div>
            <EnhancedButton
              variant="ghost"
              size="md"
              onClick={handleRefresh}
              disabled={loading}
              leftIcon={<RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />}
            >
              تحديث
            </EnhancedButton>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <EnhancedCard variant="elevated" padding="md" hoverable>
                  <EnhancedCardContent>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${insight.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-brand-fgMuted dark:text-gray-400 mb-1">
                          {insight.title}
                        </p>
                        <p className="text-2xl font-bold text-brand-fg dark:text-white">
                          {insight.value}
                        </p>
                      </div>
                    </div>
                  </EnhancedCardContent>
                </EnhancedCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <EnhancedCard variant="flat" padding="md" className="mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Sort Options */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-brand-fgMuted dark:text-gray-400">
                  ترتيب حسب:
                </span>
                <EnhancedButton
                  variant={sortBy === "relevant" ? "accent" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("relevant")}
                  leftIcon={<Target className="w-4 h-4" />}
                >
                  الأكثر صلة
                </EnhancedButton>
                <EnhancedButton
                  variant={sortBy === "newest" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("newest")}
                  leftIcon={<Clock className="w-4 h-4" />}
                >
                  الأحدث
                </EnhancedButton>
                <EnhancedButton
                  variant={sortBy === "popular" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("popular")}
                  leftIcon={<TrendingUp className="w-4 h-4" />}
                >
                  الأكثر قراءة
                </EnhancedButton>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilter(!showFilter)}
                  leftIcon={<Filter className="w-4 h-4" />}
                  rightIcon={<ChevronDown className="w-3 h-3" />}
                >
                  {selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name_ar || "التصنيف"
                    : "جميع التصنيفات"}
                </EnhancedButton>
                
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 right-0 w-48 rounded-lg shadow-lg z-10 bg-white dark:bg-gray-800 border border-brand-border dark:border-gray-700"
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setShowFilter(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm transition-colors ${
                        !selectedCategory
                          ? "bg-brand-primary/10 text-brand-primary"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 text-brand-fg dark:text-white"
                      }`}
                    >
                      جميع التصنيفات
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowFilter(false);
                        }}
                        className={`w-full text-right px-4 py-2 text-sm transition-colors ${
                          selectedCategory === category.id
                            ? "bg-brand-primary/10 text-brand-primary"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700 text-brand-fg dark:text-white"
                        }`}
                      >
                        {category.name_ar || category.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </EnhancedCard>
        </motion.div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  <Link href={getSmartArticleLink(article)} className="block h-full">
                    <EnhancedCard variant="elevated" padding="none" hoverable className="h-full overflow-hidden">
                      {/* الصورة */}
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={article.featured_image || "/placeholder.jpg"}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        
                        {/* شارة التصنيف */}
                        <div className="absolute top-3 left-3 space-y-1">
                          {(() => {
                            const categoryData = categories.find(
                              (cat) => String(cat.id) === String(article.category_id)
                            );
                            if (categoryData) {
                              return (
                                <CategoryBadge
                                  category={categoryData}
                                  size="sm"
                                  variant="filled"
                                  showIcon={true}
                                  clickable={false}
                                  className="text-xs backdrop-blur-sm"
                                />
                              );
                            }
                            return null;
                          })()}
                          {interestCategoryIds.has(String(article.category_id)) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-600/90 text-white shadow-sm">
                              <Heart className="w-3 h-3" />
                              ضمن اهتماماتك
                            </span>
                          )}
                        </div>

                        {/* نسبة المطابقة */}
                        {article.confidence && article.confidence > 70 && (
                          <div className="absolute top-3 right-3">
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/90 backdrop-blur-sm text-white text-xs rounded-full">
                              <Sparkles className="w-3 h-3" />
                              {article.confidence}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* المحتوى */}
                      <EnhancedCardContent>
                        <h3 className="font-bold text-lg text-brand-fg dark:text-white mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-brand-fgMuted dark:text-gray-400 line-clamp-2 mb-4">
                          {article.summary}
                        </p>

                        {/* الإحصائيات */}
                        <div className="flex items-center justify-between text-xs text-brand-fgMuted dark:text-gray-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(article.views_count || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {formatNumber(article.likes_count || 0)}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.reading_time || 5} دقائق
                          </span>
                        </div>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <EnhancedCard variant="flat" padding="lg">
              <EnhancedCardContent>
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-brand-fg dark:text-white mb-2">
                  لا توجد مقالات متاحة حالياً
                </h3>
                <p className="text-brand-fgMuted dark:text-gray-400 mb-6">
                  ابدأ بقراءة المقالات لنتمكن من تخصيص المحتوى لك
                </p>
                <EnhancedButton
                  variant="primary"
                  size="lg"
                  onClick={() => window.location.href = "/"}
                >
                  تصفح الأخبار
                </EnhancedButton>
              </EnhancedCardContent>
            </EnhancedCard>
          </motion.div>
        )}
      </main>
    </div>
  );
}

