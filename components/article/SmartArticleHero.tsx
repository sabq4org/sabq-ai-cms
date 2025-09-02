"use client";

import { formatDateArabic } from "@/lib/date-utils";
import {
  formatCommentsCount,
  formatLikesCount,
  formatViewsCount,
} from "@/lib/format-utils";
import {
  BarChart3,
  Bookmark,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  Share2,
  Target,
  ThumbsUp,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

interface SmartArticleHeroProps {
  article: {
    id: string;
    title: string;
    excerpt?: string;
    featured_image?: string;
    image_url?: string;
    image?: string;
    published_at: string;
    reading_time?: number;
    views_count: number;
    likes_count?: number;
    comments_count?: number;
    category_name?: string;
    category_color?: string;
    author_name?: string;
    author_avatar?: string;
    author_slug?: string;
    ai_analysis?: {
      tone:
        | "analytical"
        | "emotional"
        | "satirical"
        | "educational"
        | "investigative";
      depth_score: number; // 0-100
      recommendation:
        | "highly_recommended"
        | "recommended"
        | "neutral"
        | "not_recommended";
      complexity_level: "beginner" | "intermediate" | "advanced";
      reading_goal:
        | "daily_read"
        | "deep_analysis"
        | "quick_insight"
        | "entertainment";
      key_themes: string[];
    };
  };
}

const toneLabels = {
  analytical: { label: "تحليلي", icon: "🧠", color: "blue" },
  emotional: { label: "إنساني", icon: "❤️", color: "red" },
  satirical: { label: "ساخر", icon: "😄", color: "yellow" },
  educational: { label: "توعوي", icon: "📚", color: "green" },
  investigative: { label: "استقصائي", icon: "🔍", color: "purple" },
};

const recommendationLabels = {
  highly_recommended: { label: "مُوصى بقوة", icon: "🌟", color: "green" },
  recommended: { label: "مُوصى به", icon: "👍", color: "blue" },
  neutral: { label: "قراءة عادية", icon: "📖", color: "gray" },
  not_recommended: { label: "غير مُوصى", icon: "⚠️", color: "red" },
};

export default function SmartArticleHero({ article }: SmartArticleHeroProps) {
  const { darkMode } = useDarkMode();
  const [bookmarked, setBookmarked] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const tone = article.ai_analysis
    ? toneLabels[article.ai_analysis.tone]
    : null;
  const recommendation = article.ai_analysis
    ? recommendationLabels[article.ai_analysis.recommendation]
    : null;

  return (
    <div className="relative">
      {/* صورة الغلاف البانورامية */}
      <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
        <Image
          src={
            article.image_url ||
            article.image ||
            article.featured_image ||
            "/images/default-article.jpg"
          }
          alt={article.title}
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* مؤشرات الذكاء الاصطناعي - أعلى الصورة */}
        {article.ai_analysis && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="flex flex-wrap gap-2 justify-between items-start">
              {/* النبرة والتوصية */}
              <div className="flex gap-2">
                {tone && (
                  <div
                    className={`
                    backdrop-blur-md bg-white/20 dark:bg-black/20
                    px-3 py-1.5 rounded-full text-white text-sm font-medium
                    flex items-center gap-1 border border-white/30
                  `}
                  >
                    <span>{tone.icon}</span>
                    <span>{tone.label}</span>
                  </div>
                )}

                {recommendation && (
                  <div
                    className={`
                    backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-medium
                    flex items-center gap-1 border border-white/30
                    ${
                      recommendation.color === "green"
                        ? "bg-green-500/30"
                        : recommendation.color === "blue"
                        ? "bg-blue-500/30"
                        : recommendation.color === "red"
                        ? "bg-red-500/30"
                        : "bg-gray-500/30"
                    }
                  `}
                  >
                    <span>{recommendation.icon}</span>
                    <span>{recommendation.label}</span>
                  </div>
                )}
              </div>

              {/* مستوى التحليل */}
              <div className="backdrop-blur-md bg-white/20 dark:bg-black/20 px-3 py-2 rounded-xl border border-white/30">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Brain className="w-4 h-4" />
                  <span>عمق التحليل</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">
                      {article.ai_analysis.depth_score}%
                    </span>
                    <div className="w-12 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${article.ai_analysis.depth_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* التصنيف */}
        {article.category_name && (
          <div className="absolute top-4 right-4 z-10">
            <div
              className="backdrop-blur-md px-4 py-2 rounded-full text-white font-medium border border-white/30"
              style={{
                backgroundColor: `${article.category_color || "#3B82F6"}40`,
              }}
            >
              {article.category_name}
            </div>
          </div>
        )}

        {/* محتوى النص فوق الصورة */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
          <div className="max-w-4xl mx-auto">
            {/* العنوان */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>

            {/* المقتطف */}
            {article.excerpt && (
              <p className="text-lg sm:text-xl opacity-90 mb-6 leading-relaxed max-w-3xl">
                {article.excerpt}
              </p>
            )}

            {/* معلومات المقال والمؤلف */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* معلومات المؤلف */}
              {article.author_name && (
                <Link
                  href={`/author/${article.author_slug || "unknown"}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                    {article.author_avatar ? (
                      <Image
                        src={article.author_avatar}
                        alt={article.author_name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{article.author_name}</div>
                    <div className="text-sm opacity-75">الكاتب</div>
                  </div>
                </Link>
              )}

              {/* تاريخ النشر */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{formatDateArabic(article.published_at)}</span>
              </div>

              {/* وقت القراءة */}
              {article.reading_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{article.reading_time} دقائق</span>
                </div>
              )}

              {/* المشاهدات */}
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4" />
                <span>{formatViewsCount(article.views_count)} مشاهدة</span>
              </div>

              {/* أزرار التفاعل */}
              <div className="flex items-center gap-2 mr-auto">
                <button
                  onClick={handleShare}
                  className="p-2 backdrop-blur-md bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  {shared ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`p-2 backdrop-blur-md rounded-full transition-colors ${
                    bookmarked
                      ? "bg-yellow-500/30 text-yellow-200"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* شريط إحصائيات ذكية أسفل الصورة */}
      {article.ai_analysis && (
        <div
          className={`border-b ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {/* مستوى التعقيد */}
              <div
                className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs">مستوى التعقيد</span>
                </div>
                <div
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {article.ai_analysis.complexity_level === "beginner"
                    ? "مبتدئ"
                    : article.ai_analysis.complexity_level === "intermediate"
                    ? "متوسط"
                    : "متقدم"}
                </div>
              </div>

              {/* هدف القراءة */}
              <div
                className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs">هدف القراءة</span>
                </div>
                <div
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {article.ai_analysis.reading_goal === "daily_read"
                    ? "قراءة يومية"
                    : article.ai_analysis.reading_goal === "deep_analysis"
                    ? "تحليل عميق"
                    : article.ai_analysis.reading_goal === "quick_insight"
                    ? "فهم سريع"
                    : "ترفيه"}
                </div>
              </div>

              {/* الإعجابات */}
              <div
                className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xs">الإعجابات</span>
                </div>
                <div
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {formatLikesCount(article.likes_count || 0)}
                </div>
              </div>

              {/* التعليقات */}
              <div
                className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs">التعليقات</span>
                </div>
                <div
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {formatCommentsCount(article.comments_count || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
