'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Eye, MessageSquare, Zap, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getImageUrl, cleanS3Url } from '@/lib/image-utils';

interface ArticleCardProps {
  article: any;
  viewMode?: 'grid' | 'list';
}

// دالة لإنشاء blur placeholder
function getBlurDataUrl(): string {
  // SVG blur placeholder أبيض/رمادي
  return `data:image/svg+xml;base64,${Buffer.from(
    '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>'
  ).toString('base64')}`;
}

// مكون الصورة مع معالجة أفضل للأخطاء
function ArticleImage({ 
  src, 
  alt, 
  sizes, 
  className,
  priority = false 
}: { 
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // معالجة الخطأ في تحميل الصورة
  const handleImageError = () => {
    console.log(`❌ فشل تحميل الصورة: ${src}`);
    setImageError(true);
    
    // محاولة تنظيف رابط S3 إذا كان يحتوي على توقيع منتهي
    if (src && src.includes('X-Amz-Signature')) {
      const cleanUrl = cleanS3Url(src);
      if (cleanUrl !== src) {
        console.log('🔄 محاولة تحميل الصورة بدون توقيع...');
        setImageSrc(cleanUrl);
        setImageError(false);
        return;
      }
    }
  };

  // إذا فشلت الصورة نهائياً، عرض placeholder
  if (imageError || !imageSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
        <Newspaper className="w-12 h-12 text-gray-400 dark:text-gray-600" />
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      loading={priority ? "eager" : "lazy"}
      placeholder="blur"
      blurDataURL={getBlurDataUrl()}
      onError={handleImageError}
      quality={85}
    />
  );
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
  const imageUrl = rawImageUrl ? getImageUrl(rawImageUrl, {
    width: viewMode === 'list' ? 400 : 800,
    height: viewMode === 'list' ? 300 : 600,
    quality: 85,
    format: 'webp',
    fallbackType: 'article'
  }) : null;

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
            <ArticleImage
              src={imageUrl}
              alt={article.title || 'صورة المقال'}
              sizes="(max-width: 768px) 100vw, 192px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category & Breaking Badge */}
            <div className="flex items-center gap-2 mb-3">
              {category && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full",
                    category.color 
                      ? `bg-${category.color}-100 text-${category.color}-800 dark:bg-${category.color}-900/30 dark:text-${category.color}-300`
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  )}
                >
                  {category.name}
                </Badge>
              )}
              {isBreaking && (
                <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                  <Zap className="w-3 h-3 ml-1" />
                  عاجل
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                {article.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.reading_time || Math.ceil((article.content?.length || 0) / 1000)} دقائق
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.views || 0}
              </span>
              {article.comments_count > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {article.comments_count}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Grid View - البطاقة الافتراضية
  return (
    <Link href={getArticleLink(article)} className="group block h-full">
      <article className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col",
        isBreaking ? "ring-2 ring-red-500 ring-opacity-50" : ""
      )}>
        {/* Image Container */}
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <ArticleImage
            src={imageUrl}
            alt={article.title || 'صورة المقال'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            priority={article.featured || isBreaking}
          />
          
          {/* Breaking Badge Overlay */}
          {isBreaking && (
            <div className="absolute top-3 right-3">
              <Badge variant="destructive" className="text-xs font-bold animate-pulse shadow-lg">
                <Zap className="w-3 h-3 ml-1" />
                عاجل
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          {category && (
            <Badge 
              variant="outline" 
              className={cn(
                "self-start mb-2 text-xs",
                category.color ? `border-${category.color}-500 text-${category.color}-700` : ""
              )}
            >
              {category.name}
            </Badge>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3 flex-1">
              {article.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.views || 0}
              </span>
              {article.comments_count > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {article.comments_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
