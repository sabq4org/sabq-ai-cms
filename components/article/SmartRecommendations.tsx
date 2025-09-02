"use client";

import { formatLikesCount, formatViewsCount } from "@/lib/format-utils";
import { getArticleLink } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clock,
  Eye,
  Sparkles,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

interface SmartRecommendationsProps {
  currentArticleId: string;
  recommendations: {
    highly_recommended: Array<{
      id: string;
      title: string;
      excerpt: string;
      featured_image?: string;
      image_url?: string;
      image?: string;
      author_name?: string;
      published_at: string;
      reading_time?: number;
      views_count: number;
      likes_count?: number;
      similarity_score: number; // 0-100
      reason: string;
      category_name?: string;
      ai_match_type:
        | "topic_similarity"
        | "author_style"
        | "reader_interest"
        | "trending_topic"
        | "complementary_content";
    }>;
    trending_now: Array<{
      id: string;
      title: string;
      excerpt: string;
      featured_image?: string;
      image_url?: string;
      image?: string;
      author_name?: string;
      published_at: string;
      reading_time?: number;
      views_count: number;
      trend_score: number;
      category_name?: string;
    }>;
    based_on_reading_pattern: Array<{
      id: string;
      title: string;
      excerpt: string;
      featured_image?: string;
      image_url?: string;
      image?: string;
      author_name?: string;
      published_at: string;
      reading_time?: number;
      views_count: number;
      match_reason: string;
      category_name?: string;
    }>;
  };
}

const matchTypeConfig = {
  topic_similarity: {
    label: "موضوع مشابه",
    icon: Target,
    color: "blue",
    bgClass: "from-blue-500/10 to-blue-600/10",
  },
  author_style: {
    label: "أسلوب الكاتب",
    icon: Users,
    color: "purple",
    bgClass: "from-purple-500/10 to-purple-600/10",
  },
  reader_interest: {
    label: "اهتماماتك",
    icon: Star,
    color: "yellow",
    bgClass: "from-yellow-500/10 to-yellow-600/10",
  },
  trending_topic: {
    label: "موضوع رائج",
    icon: TrendingUp,
    color: "red",
    bgClass: "from-red-500/10 to-red-600/10",
  },
  complementary_content: {
    label: "محتوى مكمل",
    icon: BookOpen,
    color: "green",
    bgClass: "from-green-500/10 to-green-600/10",
  },
};

export default function SmartRecommendations({
  currentArticleId,
  recommendations,
}: SmartRecommendationsProps) {
  const { darkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<
    "highly_recommended" | "trending_now" | "reading_pattern"
  >("highly_recommended");
  const [displayedArticles, setDisplayedArticles] = useState<any[]>([]);

  useEffect(() => {
    switch (activeTab) {
      case "highly_recommended":
        setDisplayedArticles(recommendations.highly_recommended || []);
        break;
      case "trending_now":
        setDisplayedArticles(recommendations.trending_now || []);
        break;
      case "reading_pattern":
        setDisplayedArticles(recommendations.based_on_reading_pattern || []);
        break;
    }
  }, [activeTab, recommendations]);

  const RecommendationCard = ({
    article,
    type,
  }: {
    article: any;
    type: string;
  }) => {
    const matchType = article.ai_match_type
      ? matchTypeConfig[article.ai_match_type]
      : null;

    return (
      <Link href={getArticleLink(article)} className="group block">
        <article
          className={`
          h-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300
          transform group-hover:scale-105 group-hover:shadow-xl
          ${
            darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-100"
          }
        `}
        >
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={
                article.image_url ||
                article.image ||
                article.featured_image ||
                "/images/default-article.jpg"
              }
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />

            {/* Match type badge for highly recommended */}
            {type === "highly_recommended" && matchType && (
              <div
                className={`
                absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium
                backdrop-blur-md bg-white/20 text-white border border-white/30
              `}
              >
                <div className="flex items-center gap-1">
                  <matchType.icon className="w-3 h-3" />
                  <span>{matchType.label}</span>
                </div>
              </div>
            )}

            {/* Similarity score for highly recommended */}
            {type === "highly_recommended" && article.similarity_score && (
              <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold bg-green-500/80 text-white">
                {article.similarity_score}% تطابق
              </div>
            )}

            {/* Trend score for trending */}
            {type === "trending_now" && article.trend_score && (
              <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold bg-red-500/80 text-white flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {article.trend_score}%
              </div>
            )}

            {/* Category */}
            {article.category_name && (
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white">
                {article.category_name}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title */}
            <h3
              className={`
              font-bold text-lg mb-2 line-clamp-2 leading-tight
              group-hover:text-blue-600 transition-colors
              ${darkMode ? "text-white" : "text-gray-900"}
            `}
            >
              {article.title}
            </h3>

            {/* Excerpt */}
            <p
              className={`
              text-sm line-clamp-3 mb-4 leading-relaxed
              ${darkMode ? "text-gray-300" : "text-gray-600"}
            `}
            >
              {article.excerpt}
            </p>

            {/* Reason/Match reason */}
            {(article.reason || article.match_reason) && (
              <div
                className={`
                text-xs p-2 rounded-lg mb-3 italic
                ${
                  matchType
                    ? `bg-gradient-to-r ${matchType.bgClass}`
                    : darkMode
                    ? "bg-gray-700/30"
                    : "bg-gray-50"
                }
                ${darkMode ? "text-gray-300" : "text-gray-600"}
              `}
              >
                "لماذا: {article.reason || article.match_reason}"
              </div>
            )}

            {/* Meta info */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {article.author_name && (
                  <span
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {article.author_name}
                  </span>
                )}

                {article.reading_time && (
                  <span
                    className={`flex items-center gap-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {article.reading_time} د
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  {formatViewsCount(article.views_count)}
                </span>

                {article.likes_count && (
                  <span
                    className={`flex items-center gap-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {formatLikesCount(article.likes_count)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  };

  const tabs = [
    {
      id: "highly_recommended",
      label: "مُوصى بذكاء",
      icon: Brain,
      description: "مقالات مختارة بعناية لك",
      count: recommendations.highly_recommended?.length || 0,
    },
    {
      id: "trending_now",
      label: "الأكثر رواجًا",
      icon: TrendingUp,
      description: "ما يقرأه الجميع الآن",
      count: recommendations.trending_now?.length || 0,
    },
    {
      id: "reading_pattern",
      label: "حسب اهتماماتك",
      icon: Target,
      description: "بناءً على تاريخ قراءتك",
      count: recommendations.based_on_reading_pattern?.length || 0,
    },
  ];

  return (
    <div
      className={`
      mt-16 rounded-3xl overflow-hidden
      ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }
    `}
    >
      {/* Header */}
      <div
        className={`
        px-6 py-8 text-center border-b
        ${darkMode ? "border-gray-700" : "border-blue-200"}
      `}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className={`
            p-3 rounded-2xl
            ${darkMode ? "bg-blue-900/30" : "bg-blue-500/10"}
          `}
          >
            <Sparkles
              className={`w-6 h-6 ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            />
          </div>
          <h2
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            توصيات ذكية لك
          </h2>
        </div>
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          مقالات مختارة بعناية بواسطة الذكاء الاصطناعي حسب اهتماماتك وأسلوب
          قراءتك
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm
                transition-all duration-300 hover:scale-105
                ${
                  activeTab === tab.id
                    ? darkMode
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-blue-600 text-white shadow-lg"
                    : darkMode
                    ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                    : "bg-white/50 text-gray-600 hover:bg-white"
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`
                px-2 py-0.5 rounded-full text-xs
                ${
                  activeTab === tab.id
                    ? "bg-white/20"
                    : darkMode
                    ? "bg-gray-600"
                    : "bg-gray-200"
                }
              `}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab description */}
        <div className="mb-6">
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {tabs.find((tab) => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="px-6 pb-8">
        {displayedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedArticles.slice(0, 6).map((article, index) => (
              <RecommendationCard
                key={`${activeTab}-${article.id}-${index}`}
                article={article}
                type={activeTab}
              />
            ))}
          </div>
        ) : (
          <div
            className={`
            text-center py-12
            ${darkMode ? "text-gray-400" : "text-gray-500"}
          `}
          >
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد توصيات متاحة في هذا القسم حاليًا</p>
          </div>
        )}

        {/* Show more button */}
        {displayedArticles.length > 6 && (
          <div className="text-center mt-8">
            <button
              className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium
              transition-all duration-300 hover:scale-105
              ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
            >
              <span>عرض المزيد</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
