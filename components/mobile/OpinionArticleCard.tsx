"use client";

import Image from "next/image";
import Link from "next/link";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import {
  Clock,
  Eye,
  Heart,
  MessageSquare,
  BookmarkIcon,
  User,
  Award,
  PenTool,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string;
  views: number;
  reading_time: number;
  article_type: string;
  author_name: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    specialty?: string;
  } | null;
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
  likes: number;
  comments_count: number;
  saves: number;
}

interface OpinionArticleCardProps {
  article: Article;
}

export default function OpinionArticleCard({ article }: OpinionArticleCardProps) {
  const { darkMode } = useDarkModeContext();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAuthorInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <article
      className={cn(
        "group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl border",
        darkMode
          ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70"
          : "bg-white border-gray-200/50 hover:shadow-xl"
      )}
    >
      {/* صورة المقال */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {article.featured_image ? (
          <Link href={`/article/${article.id}`}>
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </Link>
        ) : (
          <Link href={`/article/${article.id}`}>
            <div
              className={cn(
                "w-full h-full flex items-center justify-center transition-colors",
                darkMode
                  ? "bg-gray-700/50 text-gray-400"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              <PenTool className="w-12 h-12" />
            </div>
          </Link>
        )}

        {/* شارة نوع المقال */}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm",
              article.category?.color
                ? `bg-purple-600/90 text-white`
                : "bg-purple-600/90 text-white"
            )}
          >
            مقال رأي
          </span>
        </div>

        {/* التصنيف */}
        {article.category && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm text-white"
              style={{ backgroundColor: article.category.color + "CC" }}
            >
              {article.category.name}
            </span>
          </div>
        )}
      </div>

      {/* معلومات الكاتب - بارزة */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          {/* صورة الكاتب */}
          <div className="relative">
            {article.author?.avatar ? (
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-200 dark:ring-purple-700">
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-purple-200 dark:ring-purple-700">
                {article.author?.name
                  ? getAuthorInitials(article.author.name)
                  : getAuthorInitials(article.author_name)}
              </div>
            )}
            {/* شارة التحقق للخبراء */}
            {article.author?.specialty && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Award className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* معلومات الكاتب */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "font-semibold text-sm truncate",
                  darkMode ? "text-white" : "text-gray-900"
                )}
              >
                {article.author?.name || article.author_name}
              </h3>
              {article.author?.specialty && (
                <PenTool className="w-3 h-3 text-purple-500 flex-shrink-0" />
              )}
            </div>
            {article.author?.specialty && (
              <p
                className={cn(
                  "text-xs truncate",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}
              >
                {article.author.specialty}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* محتوى المقال */}
      <div className="p-4 space-y-3">
        {/* العنوان */}
        <Link href={`/article/${article.id}`}>
          <h2
            className={cn(
              "font-bold text-lg leading-tight line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            {article.title}
          </h2>
        </Link>

        {/* المقتطف */}
        <p
          className={cn(
            "text-sm line-clamp-2 leading-relaxed",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}
        >
          {article.excerpt}
        </p>

        {/* معلومات إضافية */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-xs">
            <div
              className={cn(
                "flex items-center gap-1",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}
            >
              <Clock className="w-3 h-3" />
              <span>{article.reading_time} دقائق</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}
            >
              <Eye className="w-3 h-3" />
              <span>{article.views}</span>
            </div>
          </div>

          <div
            className={cn(
              "text-xs",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}
          >
            {formatDate(article.published_at)}
          </div>
        </div>

        {/* إحصائيات التفاعل */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-4">
            <button
              className={cn(
                "flex items-center gap-1 text-xs transition-colors hover:text-red-500",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}
            >
              <Heart className="w-4 h-4" />
              <span>{article.likes}</span>
            </button>
            <button
              className={cn(
                "flex items-center gap-1 text-xs transition-colors hover:text-blue-500",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{article.comments_count}</span>
            </button>
            <button
              className={cn(
                "flex items-center gap-1 text-xs transition-colors hover:text-purple-500",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}
            >
              <BookmarkIcon className="w-4 h-4" />
              <span>{article.saves}</span>
            </button>
          </div>

          <Link
            href={`/article/${article.id}`}
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-full transition-colors",
              darkMode
                ? "text-purple-400 hover:bg-purple-900/30"
                : "text-purple-600 hover:bg-purple-50"
            )}
          >
            اقرأ المقال
          </Link>
        </div>
      </div>
    </article>
  );
}