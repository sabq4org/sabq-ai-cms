"use client";

import { Brain, Calendar, Check, Clock, Eye, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AnalysisData {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  categories?: string[];
  tags?: string[];
  authorName?: string;
  sourceType?: string;
  analysisType?: string;
  readingTime?: number;
  views?: number;
  likes?: number;
  qualityScore?: number;
  status?: string;
  createdAt?: string;
  publishedAt?: string;
  featuredImage?: string;
}

interface DeepAnalysisCardProps {
  analysis: AnalysisData;
  viewMode?: "grid" | "list";
  onClick?: () => void;
  className?: string;
}

// وظيفة منفصلة لتهيئة التاريخ
const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    calendar: "gregory",
    numberingSystem: "latn",
  });
};

/**
 * مكون بطاقة التحليل العميق المبسط - محسن للموبايل والديسكتوب
 */
const DeepAnalysisCard = ({
  analysis,
  viewMode = "grid",
  onClick,
  className = "",
}: DeepAnalysisCardProps) => {
  const handleClick = () => {
    onClick?.();
    // يمكن إضافة منطق تتبع هنا
  };

  // توليد رابط ديناميكي
  const href = analysis.slug
    ? `/insights/deep/${analysis.slug}`
    : `/insights/deep/${analysis.id}`;

  // توليد صورة بديلة إذا لم تكن الصورة الرئيسية متوفرة
  const generatePlaceholderImage = (title: string) => {
    const colors = ["#8B5CF6", "#10B981", "#3B82F6", "#EF4444", "#F59E0B"];
    const colorIndex = title.charCodeAt(0) % colors.length;
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${
              colors[colorIndex]
            };stop-opacity:1" />
            <stop offset="100%" style="stop-color:${
              colors[(colorIndex + 1) % colors.length]
            };stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <g opacity="0.2">
          <circle cx="100" cy="100" r="40" fill="white"/>
          <circle cx="300" cy="200" r="60" fill="white"/>
          <circle cx="200" cy="250" r="30" fill="white"/>
        </g>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
          ${title.substring(0, 20)}
        </text>
      </svg>
    `)}`;
  };

  const getQualityColor = (score?: number) => {
    if (!score) return "text-gray-400 bg-gray-500/20 border-gray-400/30";
    if (score >= 80)
      return "text-emerald-400 bg-emerald-500/20 border-emerald-400/30";
    if (score >= 60)
      return "text-amber-400 bg-amber-500/20 border-amber-400/30";
    return "text-red-400 bg-red-500/20 border-red-400/30";
  };

  const cardContent =
    viewMode === "grid" ? (
      // Grid View - بطاقة عمودية
      <div className="h-full flex flex-col">
        {/* صورة التحليل */}
        <div className="relative h-44 w-full overflow-hidden">
          {analysis.featuredImage ? (
            <Image
              src={analysis.featuredImage}
              alt={analysis.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-12 h-12 text-white/70" />
            </div>
          )}

          {/* درجة الجودة */}
          {analysis.qualityScore && (
            <div
              className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md border ${getQualityColor(
                analysis.qualityScore
              )}`}
            >
              <Check className="w-3 h-3" />
              <span className="text-xs font-bold">
                {analysis.qualityScore}%
              </span>
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div className="p-4 flex flex-col flex-grow">
          {/* العنوان */}
          <h3 className="text-lg font-bold line-clamp-2 mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {analysis.title}
          </h3>

          {/* الملخص */}
          {analysis.summary && (
            <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 mb-3">
              {analysis.summary}
            </p>
          )}

          {/* التصنيفات */}
          {analysis.categories && analysis.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3 mt-auto">
              {analysis.categories.map((category, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* الإحصائيات */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {formatDate(analysis.publishedAt || analysis.createdAt)}
                </span>
              </div>

              {analysis.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{analysis.readingTime} د</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {analysis.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{analysis.views}</span>
                </div>
              )}

              {analysis.likes !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{analysis.likes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : (
      // List View - بطاقة أفقية
      <div className="flex">
        {/* صورة التحليل */}
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden">
          {analysis.featuredImage ? (
            <Image
              src={analysis.featuredImage}
              alt={analysis.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white/70" />
            </div>
          )}

          {/* درجة الجودة */}
          {analysis.qualityScore && (
            <div
              className={`absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${getQualityColor(
                analysis.qualityScore
              )}`}
            >
              <Check className="w-2.5 h-2.5" />
              <span className="text-[10px] font-bold">
                {analysis.qualityScore}%
              </span>
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div className="p-4 flex flex-col flex-grow">
          {/* العنوان */}
          <h3 className="text-base font-bold line-clamp-1 mb-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {analysis.title}
          </h3>

          {/* الملخص */}
          {analysis.summary && (
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
              {analysis.summary}
            </p>
          )}

          {/* التصنيفات */}
          {analysis.categories && analysis.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {analysis.categories.slice(0, 1).map((category, index) => (
                <span
                  key={index}
                  className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded-full"
                >
                  {category}
                </span>
              ))}
              {analysis.categories.length > 1 && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  +{analysis.categories.length - 1}
                </span>
              )}
            </div>
          )}

          {/* الإحصائيات */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                <span>
                  {formatDate(analysis.publishedAt || analysis.createdAt)}
                </span>
              </div>

              {analysis.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{analysis.readingTime} د</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {analysis.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" />
                  <span>{analysis.views}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <Link href={href} className="block h-full">
      <div
        onClick={handleClick}
        className={`
          rounded-xl border border-gray-100 dark:border-gray-800
          bg-white dark:bg-gray-900 overflow-hidden
          hover:shadow-lg transition-all cursor-pointer group relative
          h-full ${viewMode === "list" ? "flex" : "flex flex-col"}
          ${className}
        `}
      >
        {cardContent}
      </div>
    </Link>
  );
};

export default DeepAnalysisCard;
