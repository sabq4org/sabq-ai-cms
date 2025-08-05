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

          {/* ليبل "مميز" - الزاوية العلوية اليسرى */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg backdrop-blur-sm">
              <span className="mr-1">⭐</span>
              مميز
            </Badge>
          </div>

          {/* ليبل "إبداعي" + اسم الزاوية - الزاوية العلوية اليمنى */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-lg backdrop-blur-sm">
              <span className="mr-1">✨</span>
              إبداعي
            </Badge>
            <div 
              className="flex items-center gap-1 px-3 py-1 rounded-full backdrop-blur-sm shadow-lg"
              style={{
                backgroundColor: heroArticle.angle.themeColor ? `${heroArticle.angle.themeColor}E6` : 'rgba(59, 130, 246, 0.9)',
                color: 'white'
              }}
            >
              <span className="text-sm">
                {heroArticle.angle.icon || "🧠"}
              </span>
              <span className="text-sm font-bold">
                {heroArticle.angle.title}
              </span>
            </div>
          </div>

          {/* الطبقة الشفافة التدريجية */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* المحتوى النصي في الأسفل */}
          <div className="absolute bottom-0 w-full p-4 md:p-6 text-white">
            {/* العنوان */}
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-4 line-clamp-2">
              {heroArticle.title}
            </h2>

            {/* بيانات تحت العنوان: الاسم ووقت القراءة والمشاهدة */}
            <div className="flex items-center justify-between text-sm">
              {/* معلومات المؤلف */}
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <User className="w-4 h-4" />
                <span className="font-medium">
                  {heroArticle.author.name}
                </span>
              </div>

              {/* وقت القراءة والمشاهدات */}
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{heroArticle.readingTime} دقائق</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>👁</span>
                  <span>{heroArticle.views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
