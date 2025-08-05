"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

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

  // تصميم الموبايل الجديد (مع overlay)
  if (isMobile) {
    return (
      <div className={`relative w-full group ${className}`}>
        <Link href={`/muqtarab/${heroArticle.angle.slug}/${heroArticle.slug}`}>
          {/* التصميم الجديد للموبايل - overlay */}
          <div className="relative w-full h-[240px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
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
                    <div className="text-4xl mb-2">🧠</div>
                    <div className="text-lg font-semibold">
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
            <div className="absolute bottom-0 w-full p-4 text-white">
              {/* العنوان */}
              <h2 className="text-lg font-bold leading-tight mb-3 line-clamp-2">
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
                    <span className="text-xs font-medium text-gray-200">
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
                    <span>{heroArticle.author.name.split(" ")[0]}</span>
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

  // تصميم الديسكتوب الأصلي (تخطيط جانبي - صورة يسار + محتوى يمين)
  return (
    <div className={`relative w-full group ${className}`}>
      <Link href={`/muqtarab/${heroArticle.angle.slug}/${heroArticle.slug}`}>
        {/* التصميم الأصلي للديسكتوب - تخطيط جانبي */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex">
            {/* الجانب الأيسر - قسم الصورة (نصف المساحة) */}
            <div className="relative w-1/2 h-64 flex-shrink-0 overflow-hidden">
              {heroArticle.coverImage ? (
                <Image
                  src={heroArticle.coverImage}
                  alt={heroArticle.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
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

              {/* شارة مميز على الصورة */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                  <span className="mr-1">⭐</span>
                  مميز
                </Badge>
              </div>

              {/* مؤشر AI Score على الصورة */}
              <div className="absolute top-3 right-3">
                <AIInsightTag score={heroArticle.aiScore} />
              </div>
            </div>

            {/* الجانب الأيمن - قسم المحتوى (نصف المساحة) */}
            <div className="w-1/2 p-6 flex flex-col justify-between">
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                  {heroArticle.title}
                </h2>

                {/* النبذة/المقتطف */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                  {heroArticle.excerpt}
                </p>
              </div>

              {/* بيانات النشر - في الأسفل */}
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
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{heroArticle.views}</span>
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
