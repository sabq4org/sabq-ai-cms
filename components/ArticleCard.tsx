'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Eye, MessageSquare, Zap, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';

interface ArticleCardProps {
  article: any;
  viewMode?: 'grid' | 'list';
}

// دالة لتحسين رابط الصورة من S3
function optimizeS3Url(url: string): string {
  if (!url || !url.includes('amazonaws.com')) return url;
  
  try {
    const urlObj = new URL(url);
    // إزالة معاملات التوقيع المعقدة
    urlObj.search = '';
    return urlObj.toString();
  } catch {
    return url;
  }
}

// دالة لإنشاء blur placeholder
function getBlurDataUrl(): string {
  // SVG blur placeholder أبيض/رمادي
  return `data:image/svg+xml;base64,${Buffer.from(
    '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>'
  ).toString('base64')}`;
}

export default function ArticleCard({ article, viewMode = 'grid' }: ArticleCardProps) {
  // Get article metadata
  const metadata = article.metadata || {};
  const isBreaking = article.breaking || metadata.isBreakingNews || metadata.breaking || false;
  const author = article.author || article.article_authors?.[0]?.authors || {};
  const authorName = author.name || article.author_name || metadata.author || 'كاتب غير محدد';
  const category = article.categories || article.category || metadata.category || { name: 'عام', slug: 'general' };
  
  // تحسين رابط الصورة
  const rawImageUrl = article.featured_image || article.image || metadata.image;
  const imageUrl = rawImageUrl ? optimizeS3Url(getImageUrl(rawImageUrl, {
    width: viewMode === 'list' ? 400 : 800,
    height: viewMode === 'list' ? 300 : 600,
    quality: 85,
    format: 'webp'
  })) : null;

  // Article link
  const getArticleLink = (article: any) => {
    if (article.slug) return `/article/${article.slug}`;
    if (article.id) return `/article/${article.id}`;
    return '#';
  };

  // Publish date
  const publishDate = article.published_at || article.created_at;
  const formattedDate = publishDate ? new Date(publishDate).toLocaleDateString('ar-SA') : '';

  if (viewMode === 'list') {
    // List View - مطابق لتصميم صفحة التصنيف
    return (
      <Link href={getArticleLink(article)} className="group block">
        <article className={cn(
          "bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex gap-6",
          isBreaking ? "border-2 border-red-200 dark:border-red-800" : "border border-gray-100 dark:border-gray-700"
        )}>
          {/* Image محسنة للأداء */}
          <div className="relative w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={article.title || 'صورة المقال'}
                fill
                sizes="(max-width: 768px) 100vw, 192px"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                placeholder="blur"
                blurDataURL={getBlurDataUrl()}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <svg class="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <Newspaper className="w-12 h-12 text-gray-400 dark:text-gray-600" />
              </div>
            )}
            {isBreaking && (
              <div className="absolute top-2 right-2">
                <span className="urgent-badge inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  <Zap className="w-3 h-3" />
                  عاجل
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category */}
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-2 py-0.5",
                  category.color ? `bg-${category.color}-50 dark:bg-${category.color}-950/20 text-${category.color}-700 dark:text-${category.color}-300 border-${category.color}-200 dark:border-${category.color}-800` : ''
                )}
              >
                {category.icon && <span className="ml-1">{category.icon}</span>}
                {category.name}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {article.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.reading_time || '5'} دقائق
              </span>
              {article.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {article.views.toLocaleString('ar-SA')}
                </span>
              )}
              {article.comments_count > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {article.comments_count}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Grid View - محسن ليتطابق مع الواجهة الرئيسية
  return (
    <Link href={getArticleLink(article)} className="group block">
      <article className={cn(
        "h-full rounded-3xl overflow-hidden shadow-xl dark:shadow-gray-900/50 transition-all duration-300 transform group-hover:scale-[1.02]",
        isBreaking 
          ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
          : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
      )}>
        {/* صورة المقال - محسنة للموبايل */}
        <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.title || 'صورة المقال'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              placeholder="blur"
              blurDataURL={getBlurDataUrl()}
              priority={article.priority || false}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                      <svg class="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
              <Newspaper className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600" />
            </div>
          )}
          
          {/* شارة عاجل */}
          {isBreaking && (
            <div className="absolute top-3 right-3">
              <span className="urgent-badge inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                <Zap className="w-3.5 h-3.5" />
                عاجل
              </span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute bottom-3 right-3">
            <Badge 
              className={cn(
                "text-xs px-3 py-1 shadow-md",
                category.color 
                  ? `bg-white/90 dark:bg-gray-900/90 text-${category.color}-700 dark:text-${category.color}-300`
                  : "bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300"
              )}
            >
              {category.icon && <span className="ml-1">{category.icon}</span>}
              {category.name}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Title */}
          <h3 className={cn(
            "font-bold text-base sm:text-lg mb-2 line-clamp-2 transition-colors",
            isBreaking 
              ? "text-red-900 dark:text-red-100 group-hover:text-red-700 dark:group-hover:text-red-300"
              : "text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
          )}>
            {article.title}
          </h3>

          {/* Excerpt - للشاشات الكبيرة فقط */}
          {article.excerpt && (
            <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {article.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.reading_time || '5'} دقائق
            </span>
            {article.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views.toLocaleString('ar-SA')}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
