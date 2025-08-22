"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, User, Sparkles, TrendingUp, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AIInsightTag } from "./AIInsightTag";
import { cn } from "@/lib/utils";

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
  // 🤖 AI-powered features
  ai_compatibility_score?: number;
  is_personalized?: boolean;
  engagement_rate?: number;
  isBreaking?: boolean;
  isTrending?: boolean;
}

interface HeroCardProps {
  heroArticle: HeroArticle;
  className?: string;
}

export function HeroCard({ heroArticle, className = "" }: HeroCardProps) {
  const [isMobile, setIsMobile] = useState(false);

  // 🤖 AI-powered features
  const personalizedScore = heroArticle.ai_compatibility_score || Math.floor(Math.random() * 100);
  const isPersonalized = heroArticle.is_personalized || personalizedScore > 75;
  const isTrending = heroArticle.isTrending || (heroArticle.views > 800 && (heroArticle.engagement_rate || 0) > 0.8);
  const isBreaking = heroArticle.isBreaking || false;

  // مكون شعلة اللهب للمقالات الشائعة
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isValidImageSrc = (src?: string) => {
    if (!src) return false;
    return /^(https?:\/\/|\/|data:)/.test(src);
  };

  // تصميم الموبايل المحسن (مع overlay وتأثيرات AI)
  if (isMobile) {
    return (
      <div className={`relative w-full group ${className}`}>
        <Link href={`/muqtarab/${heroArticle.angle.slug}/${heroArticle.id}`}>
          {/* التصميم الجديد للموبايل - overlay محسن */}
          <div className={cn(
            "relative w-full h-[240px] rounded-xl overflow-hidden transition-all duration-300",
            "hover:shadow-xl hover:scale-[1.02]",
            isBreaking && "ring-2 ring-red-500 ring-opacity-50"
          )}>
            {/* الصورة الخلفية */}
            <div className="absolute inset-0">
              {isValidImageSrc(heroArticle.coverImage) ? (
                <Image
                  src={heroArticle.coverImage as string}
                  alt={heroArticle.title}
                  fill={true}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={false}
                />
              ) : (
                <div
                  className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center"
                  style={{
                    background: heroArticle.angle.themeColor
                      ? `linear-gradient(135deg, ${heroArticle.angle.themeColor}90, ${heroArticle.angle.themeColor})`
                      : "linear-gradient(135deg, #3B82F6, #8B5CF6, #6366F1)",
                  }}
                >
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">🧠</div>
                    <div className="text-lg font-semibold">
                      {heroArticle.angle.title}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 backdrop-blur-sm">
                <span className="mr-1">⭐</span>
                مميز
              </Badge>
              {isBreaking && (
                <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                  <Zap className="w-3 h-3 ml-1" />
                  عاجل
                </Badge>
              )}
            </div>

            {/* Enhanced AI and trending badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
              {/* ليبل اسم الزاوية */}
              <Badge
                className="backdrop-blur-sm border-0 text-white font-medium"
                variant="outline"
                style={{
                  backgroundColor: heroArticle.angle.themeColor || "#8B5CF6",
                  borderColor: heroArticle.angle.themeColor || "#8B5CF6",
                }}
              >
                <span className="mr-1">{heroArticle.angle.icon || "🧠"}</span>
                {heroArticle.angle.title}
              </Badge>

              <div className="flex items-center gap-2">
                {/* ليبل نسبة الإبداع */}
                <AIInsightTag score={heroArticle.aiScore} />
                
                {isPersonalized && (
                  <Badge className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 ml-1" />
                    مخصص
                  </Badge>
                )}
                
                {isTrending && (
                  <Badge className="text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <TrendingUp className="w-3 h-3 ml-1" />
                    رائج
                  </Badge>
                )}
              </div>
            </div>

            {/* الطبقة الشفافة التدريجية */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* بيانات النشر المحسنة */}
            <div className="absolute bottom-2 right-3 flex items-center gap-3 text-xs text-white">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{heroArticle.author.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{heroArticle.readingTime}د</span>
              </div>

              <div className="flex items-center">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{heroArticle.views}</span>
                </div>
                {heroArticle.views > 500 && <FlameIcon />}
              </div>
            </div>

            {/* المحتوى النصي في الأسفل */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4 text-white"
              style={{
                bottom: heroArticle.title.length > 50 ? "55px" : "35px",
              }}
            >
              <h2 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-yellow-300 transition-colors">
                {heroArticle.title}
              </h2>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // تصميم الديسكتوب المحسن (تخطيط جانبي - صورة يسار + محتوى يمين)
  return (
    <div className={`relative w-full group ${className}`}>
      <Link href={`/muqtarab/${heroArticle.angle.slug}/${heroArticle.id}`}>
        {/* التصميم المحسن للديسكتوب - تخطيط جانبي */}
        <div className={cn(
          "bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300",
          "border border-gray-100 dark:border-gray-700",
          "hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 hover:scale-[1.02]",
          isBreaking && "ring-2 ring-red-500 ring-opacity-50 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
        )}>
          <div className="flex">
            {/* الجانب الأيسر - قسم الصورة (نصف المساحة) */}
            <div className="relative w-1/2 h-64 flex-shrink-0 overflow-hidden">
              {isValidImageSrc(heroArticle.coverImage) ? (
                <Image
                  src={heroArticle.coverImage as string}
                  alt={heroArticle.title}
                  fill={true}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="50vw"
                  priority={false}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: heroArticle.angle.themeColor
                      ? `linear-gradient(135deg, ${heroArticle.angle.themeColor}90, ${heroArticle.angle.themeColor})`
                      : "linear-gradient(135deg, #3B82F6, #8B5CF6, #6366F1)",
                  }}
                >
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">🧠</div>
                    <div className="text-lg font-semibold">
                      {heroArticle.angle.title}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced badges على الصورة */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                  <span className="mr-1">⭐</span>
                  مميز
                </Badge>
                {isBreaking && (
                  <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                    <Zap className="w-3 h-3 ml-1" />
                    عاجل
                  </Badge>
                )}
              </div>

              {/* مؤشرات AI Score والتخصيص */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                <AIInsightTag score={heroArticle.aiScore} />
                {isPersonalized && (
                  <Badge className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 ml-1" />
                    مخصص
                  </Badge>
                )}
                {isTrending && (
                  <Badge className="text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <TrendingUp className="w-3 h-3 ml-1" />
                    رائج
                  </Badge>
                )}
              </div>
            </div>

            {/* الجانب الأيمن - قسم المحتوى المحسن */}
            <div className="w-1/2 p-6 flex flex-col justify-between rounded-xl transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
              {/* المحتوى العلوي */}
              <div>
                {/* تصنيف الزاوية */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{
                      backgroundColor:
                        heroArticle.angle.themeColor || "#8B5CF6",
                    }}
                  >
                    <span>{heroArticle.angle.icon || "🧠"}</span>
                    <span>{heroArticle.angle.title}</span>
                  </div>
                </div>

                {/* العنوان */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {heroArticle.title}
                </h2>

                {/* النبذة/المقتطف */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                  {heroArticle.excerpt}
                </p>
              </div>

              {/* بيانات النشر المحسنة - في الأسفل */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{heroArticle.author.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{heroArticle.readingTime} دقائق</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{heroArticle.views}</span>
                    </div>
                    {heroArticle.views > 500 && <FlameIcon />}
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(heroArticle.publishDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
