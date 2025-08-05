"use client";

import ArticleViews from "@/components/ui/ArticleViews";
import CloudImage from "@/components/ui/CloudImage";
import type { RecommendedArticle } from "@/lib/ai-recommendations";
import {
  ArrowLeft,
  BarChart3,
  Brain,
  Clock,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React from "react";

// توسيع النوع لإضافة خصائص إضافية
interface ExtendedRecommendedArticle extends RecommendedArticle {
  slug?: string;
  excerpt?: string;
  featured_image?: string;
  category_name?: string;
  image_caption?: string; // وصف الصورة
  views?: number; // عدد المشاهدات
  metadata?: {
    type?: string;
  };
}

interface SmartContentNewsCardProps {
  article: ExtendedRecommendedArticle;
  darkMode: boolean;
  variant?: "compact" | "full" | "desktop";
  position?: number; // لتحديد مكان البطاقة في القائمة
}

// الأيقونات حسب نوع المحتوى
const typeIcons: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  article: { icon: TrendingUp, color: "text-blue-600", bgColor: "bg-blue-50" },
  analysis: { icon: Brain, color: "text-purple-600", bgColor: "bg-purple-50" },
  opinion: {
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  creative: { icon: Sparkles, color: "text-pink-600", bgColor: "bg-pink-50" },
  quick: { icon: Zap, color: "text-yellow-600", bgColor: "bg-yellow-50" },
  insight: {
    icon: BarChart3,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
};

// عبارات تحفيزية متنوعة
const motivationalPhrases = [
  "اخترناه لك بعناية",
  "قد يعجبك هذا",
  "مقترح خاص لك",
  "محتوى يناسب اهتماماتك",
  "ننصحك بقراءته",
  "مُختار بذكاء لك",
  "يتماشى مع ذوقك",
  "محتوى مميز لك",
];

// صور تجريبية للبطاقات المخصصة حسب نوع المحتوى
const demoImagesByType: Record<string, string[]> = {
  article: [
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop", // أخبار عامة
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop", // صحافة
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop", // إعلام
    "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=300&fit=crop", // أخبار عالمية
    "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=400&h=300&fit=crop", // أخبار محلية
  ],
  analysis: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop", // تحليل بيانات
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop", // إحصائيات
    "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?w=400&h=300&fit=crop", // رسوم بيانية
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop", // تحليل مالي
  ],
  opinion: [
    "https://images.unsplash.com/photo-1521790945508-9e0581a3c7f0?w=400&h=300&fit=crop", // رأي
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop", // نقاش
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop", // كاتب
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop", // مقال رأي
  ],
  creative: [
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop", // إبداع
    "https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400&h=300&fit=crop", // فن
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop", // ثقافة
    "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=300&fit=crop", // تصميم
  ],
  quick: [
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6baac?w=400&h=300&fit=crop", // سريع
    "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=400&h=300&fit=crop", // عاجل
    "https://images.unsplash.com/photo-1517654443271-11c621d19e60?w=400&h=300&fit=crop", // خبر سريع
    "https://images.unsplash.com/photo-1585241936939-be4099591252?w=400&h=300&fit=crop", // آخر الأخبار
  ],
  insight: [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop", // رؤية
    "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&h=300&fit=crop", // استراتيجية
    "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&h=300&fit=crop", // أفكار
    "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop", // رؤى مستقبلية
  ],
};

// الصور الافتراضية إذا لم يكن هناك نوع محدد
const defaultDemoImages = [
  "https://images.unsplash.com/photo-1478940020726-e9e191651f1a?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
];

export default function SmartContentNewsCard({
  article,
  darkMode,
  variant = "full",
  position = 0,
}: SmartContentNewsCardProps) {
  const articleType = article.type || article.metadata?.type || "article";
  const typeData = typeIcons[articleType] || typeIcons.article;
  const { icon: IconComponent, color, bgColor } = typeData;
  const phrase = motivationalPhrases[position % motivationalPhrases.length];

  // اختيار صورة تجريبية إذا لم تكن هناك صورة
  const getDemoImage = () => {
    const typeImages = demoImagesByType[articleType] || defaultDemoImages;
    return typeImages[position % typeImages.length];
  };

  const imageUrl =
    article.featured_image || article.thumbnail || getDemoImage();

  // البطاقة للنسخة الكاملة (Desktop)
  if (variant === "desktop") {
    return (
      <Link
        href={article.slug ? `/article/${article.slug}` : article.url}
        className="group block"
      >
        <article
          className={`
          h-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform
          ${
            darkMode
              ? "bg-gradient-to-br from-gray-800 via-gray-800/95 to-gray-800 border border-gray-700"
              : "bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200"
          }
          group-hover:scale-[1.02] group-hover:shadow-xl relative
        `}
        >
          {/* صورة المقال */}
          <div className="relative h-32 sm:h-40 overflow-hidden">
            <CloudImage
              src={imageUrl}
              alt={article.title}
              fill
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fallbackType="article"
            />
            {/* تأثير التدرج */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* شارة مخصص في الزاوية */}
            <div
              className={`absolute top-2 right-2 px-2 py-1 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg ${
                darkMode
                  ? "bg-gradient-to-r from-purple-800/90 to-blue-800/90"
                  : "bg-gradient-to-r from-purple-600 to-blue-600"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>مخصص</span>
            </div>
          </div>

          {/* محتوى البطاقة */}
          <div className="p-3 sm:p-4">
            {/* نوع المحتوى والسبب */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  darkMode
                    ? "bg-gray-700/50 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <IconComponent className={`w-3 h-3 ${color}`} />
                <span className="font-medium">{phrase}</span>
              </div>
              {article.reason && (
                <span
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  • {article.reason}
                </span>
              )}
            </div>

            {/* العنوان */}
            <h4
              className={`font-semibold text-base sm:text-lg mb-2 line-clamp-2 ${
                darkMode ? "text-white" : "text-gray-900"
              } transition-colors`}
            >
              {article.title}
            </h4>

            {/* الملخص - فقط للنسخة الكاملة */}
            {article.excerpt && (
              <p
                className={`text-sm mb-3 line-clamp-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {article.excerpt}
              </p>
            )}

            {/* التفاصيل السفلية */}
            <div
              className={`pt-2 sm:pt-3 border-t ${
                darkMode ? "border-gray-700" : "border-gray-100"
              }`}
            >
              {/* عبارة مخصص لك بذكاء */}
              <div
                className={`text-xs text-center mb-2 ${
                  darkMode ? "text-purple-400" : "text-purple-600"
                }`}
              >
                <Sparkles className="inline-block w-3 h-3 mr-1" />
                محتوى مختار لك بناءً على اهتماماتك
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  {(article.category_name || article.category) && (
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      {article.category_name || article.category}
                    </span>
                  )}
                  {article.readingTime && (
                    <span
                      className={`flex items-center gap-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {article.readingTime} د
                    </span>
                  )}
                  {article.engagement && article.engagement > 0.3 && (
                    <span className="text-yellow-500">⭐ مميز</span>
                  )}
                </div>

                {/* زر القراءة */}
                <div
                  className={`p-2 rounded-xl transition-all ${
                    darkMode ? "bg-purple-900/20" : "bg-purple-50"
                  }`}
                >
                  <ArrowLeft
                    className={`w-4 h-4 transition-transform ${
                      darkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // البطاقة للنسخة المخصصة للهواتف (مع ألوان جذابة)
  return (
    <Link
      href={article.slug ? `/article/${article.slug}` : article.url}
      className="block w-full"
    >
      <article
        className={`
        smart-content-news-card relative overflow-hidden transition-all border
        ${
          darkMode
            ? "bg-gradient-to-r from-gray-800 via-gray-800/95 to-gray-800 border-gray-700/50 active:bg-gray-700/50"
            : "bg-gradient-to-r from-white via-gray-50/30 to-white border-gray-200 active:bg-gray-50"
        }
        shadow-sm hover:shadow-md
      `}
      >
        <div className="flex items-start p-4 gap-4">
          {/* الصورة - مربعة صغيرة مثل البطاقات العادية */}
          <div
            className={`
            relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700
            ${
              variant === "compact" || variant === "full"
                ? "w-24 h-24"
                : "w-20 h-20"
            }
          `}
          >
            <CloudImage
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="96px"
              fallbackType="article"
            />
            {/* شارة مخصص لك صغيرة في زاوية الصورة */}
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded flex items-center gap-0.5 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              <span className="text-[10px]">مخصص</span>
            </div>
          </div>

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            {/* التصنيف والمؤشرات */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* أيقونة النوع */}
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  darkMode ? `${bgColor} ${color}` : `${bgColor} ${color}`
                }`}
              >
                <IconComponent className={`w-3 h-3`} />
                <span className="text-[11px] font-medium">{phrase}</span>
              </div>
              {article.reason && (
                <span
                  className={`text-[10px] ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  } font-medium`}
                >
                  • {article.reason}
                </span>
              )}
            </div>

            {/* العنوان */}
            <h3
              className={`font-semibold text-base leading-tight line-clamp-3 mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {article.title}
            </h3>

            {/* معلومات سريعة */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                {(article.category_name || article.category) && (
                  <span
                    className={darkMode ? "text-blue-400" : "text-blue-600"}
                  >
                    {article.category_name || article.category}
                  </span>
                )}
                {article.readingTime && (
                  <span
                    className={darkMode ? "text-green-400" : "text-green-600"}
                  >
                    {article.readingTime} دقيقة
                  </span>
                )}
                {article.views && article.views > 0 && (
                  <ArticleViews count={article.views} className="text-xs" />
                )}
              </div>

              {/* مؤشر الأداء المبسط */}
              {article.engagement && article.engagement > 0.3 && (
                <span className="text-[10px] text-yellow-500 font-bold">
                  ⭐ مميز
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
