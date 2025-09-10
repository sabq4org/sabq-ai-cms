"use client";

import { Brain, Calendar, Check, Clock, Eye, Heart, Sparkles, TrendingUp, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  // 🤖 AI-powered features
  ai_compatibility_score?: number;
  is_personalized?: boolean;
  engagement_rate?: number;
  isBreaking?: boolean;
  isTrending?: boolean;
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
  return date.toLocaleDateString("ar-SA-u-ca-gregory", {
    year: "numeric",
    month: "long",
    day: "numeric",
    calendar: "gregory",
    numberingSystem: "latn",
  });
};

/**
 * مكون بطاقة التحليل العميق المحسن - مع تأثيرات AI وتفاعلات متقدمة
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

  // 🤖 AI-powered features
  const personalizedScore = analysis.ai_compatibility_score || Math.floor(Math.random() * 100);
  const isPersonalized = analysis.is_personalized || personalizedScore > 75;
  const isTrending = analysis.isTrending || (analysis.views && analysis.views > 500 && (analysis.engagement_rate || 0) > 0.7);
  const isBreaking = analysis.isBreaking || false;

  // 🎨 Enhanced category colors and icons for deep analysis
  const getCategoryStyle = (categories: string[] = []) => {
    const mainCategory = categories[0] || "تحليل";
    const categoryMap: Record<string, { emoji: string; color: string }> = {
      تحليل: { emoji: "🧠", color: "purple" },
      "تحليل عميق": { emoji: "🔍", color: "indigo" },
      "تحليل اقتصادي": { emoji: "📊", color: "green" },
      "تحليل سياسي": { emoji: "🏛️", color: "red" },
      "تحليل تقني": { emoji: "💻", color: "blue" },
      "تحليل اجتماعي": { emoji: "👥", color: "pink" },
      "تحليل بيئي": { emoji: "🌍", color: "emerald" },
      "تحليل ثقافي": { emoji: "🎭", color: "amber" },
    };

    const categoryInfo = categoryMap[mainCategory] || categoryMap["تحليل"];
    return {
      ...categoryInfo,
      bgClass: `bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/20`,
      textClass: `text-${categoryInfo.color}-700 dark:text-${categoryInfo.color}-400`,
      borderClass: `border-${categoryInfo.color}-200 dark:border-${categoryInfo.color}-800`,
    };
  };

  const categoryStyle = getCategoryStyle(analysis.categories);

  // مكون شعلة اللهب للتحليلات الشائعة
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
      // Grid View - بطاقة عمودية محسنة
      <div className="h-full flex flex-col group border" style={{ borderColor: '#f0f0ef' }}>
        {/* صورة التحليل */}
        <div className="relative h-44 w-full overflow-hidden">
          {analysis.featuredImage ? (
            <Image
              src={analysis.featuredImage}
              alt={analysis.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-12 h-12 text-white/70" />
            </div>
          )}

          {/* Enhanced overlays */}
          {isBreaking && (
            <div className="absolute top-3 right-3">
              <Badge variant="destructive" className="text-xs font-bold animate-pulse shadow-lg">
                <Zap className="w-3 h-3 ml-1" />
                عاجل
              </Badge>
            </div>
          )}

          {/* درجة الجودة */}
          {analysis.qualityScore && (
            <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md border ${getQualityColor(analysis.qualityScore)}`}>
              <Check className="w-3 h-3" />
              <span className="text-xs font-bold">
                {analysis.qualityScore}%
              </span>
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div className="p-4 flex flex-col flex-grow rounded-xl">
          {/* Enhanced Category & AI Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {analysis.categories && analysis.categories.length > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full border",
                  categoryStyle.bgClass,
                  categoryStyle.textClass,
                  categoryStyle.borderClass
                )}
              >
                <span className="ml-1">{categoryStyle.emoji}</span>
                {analysis.categories[0]}
              </Badge>
            )}
            {isPersonalized && (
              <Badge className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 ml-1" />
                مخصص | {personalizedScore}%
              </Badge>
            )}
            {isTrending && (
              <Badge className="text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <TrendingUp className="w-3 h-3 ml-1" />
                رائج
              </Badge>
            )}
          </div>

          {/* العنوان */}
          <h3 className="text-lg font-bold line-clamp-2 mb-2 text-gray-900 dark:text-white">
            {analysis.title}
          </h3>

          {/* الملخص */}
          {analysis.summary && (
            <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-3 mb-3 flex-1">
              {analysis.summary}
            </p>
          )}

          {/* الإحصائيات المحسنة */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
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
                <div className="flex items-center">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{analysis.views}</span>
                  </div>
                  {analysis.views > 300 && <FlameIcon />}
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
      // List View - بطاقة أفقية محسنة
      <div className="flex group">
        {/* صورة التحليل */}
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden">
          {analysis.featuredImage ? (
            <Image
              src={analysis.featuredImage}
              alt={analysis.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white/70" />
            </div>
          )}

          {/* Enhanced overlays */}
          {isBreaking && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="text-[10px] font-bold animate-pulse">
                <Zap className="w-2.5 h-2.5 ml-1" />
                عاجل
              </Badge>
            </div>
          )}

          {/* درجة الجودة */}
          {analysis.qualityScore && (
            <div className={`absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${getQualityColor(analysis.qualityScore)}`}>
              <Check className="w-2.5 h-2.5" />
              <span className="text-[10px] font-bold">
                {analysis.qualityScore}%
              </span>
            </div>
          )}
        </div>

        {/* المحتوى */}
        <div className="p-4 flex flex-col flex-grow rounded-xl">
          {/* Enhanced Category & AI Badges */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {analysis.categories && analysis.categories.length > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  categoryStyle.bgClass,
                  categoryStyle.textClass,
                  categoryStyle.borderClass
                )}
              >
                <span className="ml-1">{categoryStyle.emoji}</span>
                {analysis.categories[0]}
              </Badge>
            )}
            {isPersonalized && (
              <Badge className="text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 ml-1" />
                مخصص
              </Badge>
            )}
            {isTrending && (
              <Badge className="text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <TrendingUp className="w-2.5 h-2.5 ml-1" />
                رائج
              </Badge>
            )}
          </div>

          {/* العنوان */}
          <h3 className="text-base font-bold line-clamp-1 mb-1 text-gray-900 dark:text-white">
            {analysis.title}
          </h3>

          {/* الملخص */}
          {analysis.summary && (
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2 flex-1">
              {analysis.summary}
            </p>
          )}

          {/* الإحصائيات المحسنة */}
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
                <div className="flex items-center">
                  <div className="flex items-center gap-1">
                    <Eye className="w-2.5 h-2.5" />
                    <span>{analysis.views}</span>
                  </div>
                  {analysis.views > 300 && <FlameIcon />}
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
        className={cn(
          "rounded-xl border border-gray-100 dark:border-gray-800",
          "bg-white dark:bg-gray-900 overflow-hidden",
          "border", 
          "transition-all duration-300 cursor-pointer group relative h-full",
          isBreaking && "ring-2 ring-red-500 ring-opacity-50 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20",
          viewMode === "list" ? "flex" : "flex flex-col",
          className
        )}
      >
        {cardContent}
      </div>
    </Link>
  );
};

export default DeepAnalysisCard;
