"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <Card
      className={`overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <Link href={`/muqtarab/${heroArticle.angle.slug}/${heroArticle.slug}`}>
        <div className="grid md:grid-cols-2 gap-0">
          {/* القسم البصري */}
          <div className="relative h-64 md:h-80 overflow-hidden order-2 md:order-1">
            {heroArticle.coverImage ? (
              <Image
                src={heroArticle.coverImage}
                alt={heroArticle.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">🧠</div>
                  <div className="text-lg font-semibold">
                    {heroArticle.angle.title}
                  </div>
                </div>
              </div>
            )}

            {/* شارة الزاوية */}
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-gray-800 font-medium shadow-lg">
              <span className="mr-1">🧠</span>
              {heroArticle.angle.title}
            </div>

            {/* مؤشر AI Score */}
            <div className="absolute top-3 right-3">
              <AIInsightTag score={heroArticle.aiScore} />
            </div>
          </div>

          {/* القسم النصي */}
          <div className="flex flex-col justify-center space-y-4 p-6 md:p-8 order-1 md:order-2">
            {/* العنوان */}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {heroArticle.title}
            </h2>

            {/* المقطع التعريفي */}
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base line-clamp-3 leading-relaxed">
              {heroArticle.excerpt}
            </p>

            {/* معلومات المقال */}
            <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{heroArticle.readingTime} دقائق قراءة</span>
              </div>

              <span>•</span>

              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{heroArticle.author.name}</span>
              </div>

              <span>•</span>

              <span>{formatDate(heroArticle.publishDate)}</span>
            </div>

            {/* العلامات (Tags) */}
            {heroArticle.tags && heroArticle.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {heroArticle.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                  </Badge>
                ))}
                {heroArticle.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    +{heroArticle.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* مؤشر "مقال مميز" */}
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                <span className="mr-1">⭐</span>
                مقال مميز
              </Badge>

              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200"
              >
                <span className="mr-1">👁</span>
                {heroArticle.views} مشاهدة
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
