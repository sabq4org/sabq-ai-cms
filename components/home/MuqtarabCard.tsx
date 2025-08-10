"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock, Eye, Star, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MuqtarabCardProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    coverImage?: string;
    readingTime: number;
    publishDate: string;
    views: number;
    tags?: string[];
    isFeatured?: boolean;
    isRecent?: boolean;
    link?: string;

    angle: {
      id?: string;
      title: string;
      slug: string;
      icon?: string;
      themeColor?: string;
    };

    author: {
      id?: string;
      name: string;
      avatar?: string;
    };
  };
  variant?: "large" | "medium" | "small";
  className?: string;
}

export default function MuqtarabCard({
  article,
  variant = "medium",
  className,
}: MuqtarabCardProps) {
  const themeColor = article.angle?.themeColor || "#6366f1";
  const articleLink = article.link || `/muqtarab/articles/${article.slug}`;

  const isValidImageSrc = (src?: string) => {
    if (!src) return false;
    return /^(https?:\/\/|\/|data:)/.test(src);
  };

  const displaySrc = isValidImageSrc(article.coverImage)
    ? (article.coverImage as string)
    : "/images/default-article.jpg";

  // تحديد أحجام الصور حسب النوع
  const getImageHeight = () => {
    switch (variant) {
      case "large":
        return "h-64 md:h-80";
      case "small":
        return "h-32";
      default:
        return "h-36 sm:h-48";
    }
  };

  // مكون بطاقة المقال المميز الكبير
  if (variant === "large") {
    return (
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm dark:bg-gray-800/50 dark:hover:bg-gray-800/80 relative">
        {/* خط ملامس بلون الزاوية في الأسفل */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
          style={{ backgroundColor: themeColor }}
        />

        {/* تصميم الديسكتوب - نصف صورة ونصف محتوى */}
        <div className="hidden md:grid md:grid-cols-2 gap-0">
          {/* صورة المقال */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <Image
              src={displaySrc}
              alt={article.title}
              fill={true}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="50vw"
              priority={false}
            />

            {/* تدرج للنص */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* شارة مميز كبيرة - يسار */}
            {article.isFeatured && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1.5 text-sm font-bold shadow-lg">
                  <Star className="w-4 h-4 mr-1.5" />
                  مقال مميز
                </Badge>
              </div>
            )}

            {/* ليبل الزاوية بلونها - فوق يمين */}
            <div
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white font-bold text-sm shadow-lg"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 4px 15px ${themeColor}40`,
              }}
            >
              {article.angle.icon && (
                <span className="mr-1.5">{article.angle.icon}</span>
              )}
              {article.angle.title}
            </div>
          </div>

          {/* محتوى البطاقة للديسكتوب */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            {/* عنوان المقال */}
            <Link
              href={articleLink}
              className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              <h3 className="font-bold text-2xl leading-tight line-clamp-2 mb-4">
                {article.title}
              </h3>
            </Link>

            {/* مقتطف المقال */}
            <p className="text-gray-600 dark:text-gray-300 text-base line-clamp-3 mb-6 leading-relaxed">
              {article.excerpt}
            </p>

            {/* معلومات إضافية */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readingTime} دقائق قراءة
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views.toLocaleString()} مشاهدة
                </span>
              </div>

              <time className="text-sm">
                {new Date(article.publishDate).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            {/* معلومات المؤلف */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {article.author.avatar ? (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{article.author.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">كاتب</p>
              </div>
            </div>
          </div>
        </div>

        {/* تصميم الهواتف - صورة كاملة مع overlay */}
        <div className="md:hidden">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={displaySrc}
              alt={article.title}
              fill={true}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="100vw"
              priority={false}
            />

            {/* تدرج للنص */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* شارة مميز - يسار */}
            {article.isFeatured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-2 py-1 text-xs font-bold shadow-md">
                  <Star className="w-3 h-3 mr-1" />
                  مميز
                </Badge>
              </div>
            )}

            {/* ليبل الزاوية - يمين */}
            <div
              className="absolute top-3 right-3 px-2 py-1 rounded-full text-white text-xs font-medium shadow-md"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 2px 8px ${themeColor}40`,
              }}
            >
              {article.angle.icon && (
                <span className="mr-1">{article.angle.icon}</span>
              )}
              {article.angle.title}
            </div>
          </div>

          {/* محتوى البطاقة للهواتف */}
          <CardContent className="p-4 space-y-3">
            {/* عنوان المقال */}
            <Link
              href={articleLink}
              className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-2">
                {article.title}
              </h3>
            </Link>

            {/* مقتطف المقال */}
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>

            {/* معلومات إضافية */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readingTime} دقائق
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views.toLocaleString()}
                </span>
              </div>

              <time className="text-xs">
                {new Date(article.publishDate).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>

            {/* معلومات المؤلف */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {article.author.avatar ? (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-3 h-3 text-gray-500" />
                )}
              </div>
              <span className="text-xs font-medium">{article.author.name}</span>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // مكون بطاقة المقال العادية (medium و small)
  return (
    <Card
      className={cn(
        "group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-sm dark:bg-gray-800/50 dark:hover:bg-gray-800/80 relative",
        className
      )}
    >
      {/* خط ملامس بلون الزاوية في الأسفل */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
        style={{ backgroundColor: themeColor }}
      />

      {/* صورة المقال */}
      <div
        className={cn("relative overflow-hidden rounded-xl", getImageHeight())}
      >
        <Image
          src={displaySrc}
          alt={article.title}
          fill={true}
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />

        {/* شارات الحالة */}
        <div className="absolute top-3 left-3 flex gap-2">
          {article.isFeatured && (
            <Badge className="bg-yellow-500/90 text-white text-xs px-2 py-1">
              <Star className="w-3 h-3 mr-1" />
              مميز
            </Badge>
          )}
          {article.isRecent && (
            <Badge className="bg-green-500/90 text-white text-xs px-2 py-1">
              جديد
            </Badge>
          )}
        </div>

        {/* ليبل الزاوية بلونها */}
        <div
          className="absolute top-3 right-3 px-2 py-1 rounded-full text-white text-xs font-medium shadow-md"
          style={{
            backgroundColor: themeColor,
            boxShadow: `0 2px 8px ${themeColor}40`,
          }}
        >
          {article.angle.icon && (
            <span className="mr-1">{article.angle.icon}</span>
          )}
          {article.angle.title}
        </div>
      </div>

      {/* محتوى البطاقة */}
      <CardContent
        className={cn("p-4 space-y-3", variant === "small" && "p-3 space-y-2")}
      >
        {/* عنوان المقال */}
        <Link
          href={articleLink}
          className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        >
          <h3
            className={cn(
              "font-bold leading-tight line-clamp-2 mb-2",
              variant === "small" ? "text-sm" : "text-lg"
            )}
          >
            {article.title}
          </h3>
        </Link>

        {/* مقتطف المقال - فقط للأحجام المتوسطة */}
        {variant !== "small" && (
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* معلومات إضافية */}
        <div
          className={cn(
            "flex items-center justify-between text-gray-500 dark:text-gray-400",
            variant === "small" ? "text-xs" : "text-xs"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTime} دقائق
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.views.toLocaleString()}
            </span>
          </div>

          {variant !== "small" && (
            <time className="text-xs">
              {new Date(article.publishDate).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          )}
        </div>

        {/* معلومات المؤلف - فقط للأحجام المتوسطة */}
        {variant !== "small" && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {article.author.avatar ? (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <User className="w-3 h-3 text-gray-500" />
              )}
            </div>
            <span className="text-xs font-medium">{article.author.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
