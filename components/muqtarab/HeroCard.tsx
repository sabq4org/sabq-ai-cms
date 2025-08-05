"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AIInsightTag } from "./AIInsightTag";

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

interface HeroCardProps {
  heroArticle: HeroArticle;
  className?: string;
}

export function HeroCard({ heroArticle, className = "" }: HeroCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={`relative w-full group ${className}`}>
      <Link href={`/muqtarab/${heroArticle.angle.slug}/${heroArticle.slug}`}>
        {/* الحاوي الرئيسي - التصميم الجديد */}
        <div className="relative w-full h-[240px] md:h-[280px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          {/* الصورة الخلفية */}
          <div className="absolute inset-0">
            {heroArticle.coverImage ? (
              <Image
                src={heroArticle.coverImage}
                alt={heroArticle.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                  <div className="text-4xl md:text-5xl mb-2">🧠</div>
                  <div className="text-lg md:text-xl font-semibold">
                    {heroArticle.angle.title}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* شارة "مقال مميز" - الزاوية العلوية اليسرى */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg backdrop-blur-sm">
              <span className="mr-1">⭐</span>
              مميز
            </Badge>
          </div>

          {/* مؤشر AI Score - الزاوية العلوية اليمنى */}
          <div className="absolute top-3 right-3">
            <AIInsightTag score={heroArticle.aiScore} />
          </div>

          {/* الطبقة الشفافة التدريجية */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* المحتوى النصي في الأسفل */}
          <div className="absolute bottom-0 w-full p-4 md:p-6 text-white">
            {/* العنوان */}
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-3 line-clamp-2">
              {heroArticle.title}
            </h2>

            {/* المعلومات السفلية */}
            <div className="flex items-center justify-between">
              {/* تصنيف المقال */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-sm">
                    {heroArticle.angle.icon || "🧠"}
                  </span>
                  <span className="text-xs md:text-sm font-medium text-gray-200">
                    {heroArticle.angle.title}
                  </span>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{heroArticle.readingTime}د</span>
                </div>

                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="hidden sm:inline">
                    {heroArticle.author.name}
                  </span>
                  <span className="sm:hidden">
                    {heroArticle.author.name.split(" ")[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* مؤشر المشاهدات - صغير ومتميز */}
            <div className="absolute bottom-2 left-4">
              <div className="flex items-center gap-1 text-xs text-gray-300">
                <span>👁</span>
                <span>{heroArticle.views}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
