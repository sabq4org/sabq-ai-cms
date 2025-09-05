"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SafeNewsImage from "@/components/ui/SafeNewsImage";
import { formatDateNumeric } from "@/lib/date-utils";
import { Clock, Eye, User, ArrowRight, Loader2 } from "lucide-react";

interface ProgressiveArticleData {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  published_at?: string;
  category?: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  } | null;
  author?: {
    id: string;
    name: string;
  } | null;
  views?: number;
  reading_time?: number;
  preloaded?: boolean;
  timestamp?: number;
}

interface ProgressiveArticleLoaderProps {
  slug: string;
  fallbackTitle?: string;
}

export default function ProgressiveArticleLoader({ 
  slug, 
  fallbackTitle = "جاري التحميل..." 
}: ProgressiveArticleLoaderProps) {
  const router = useRouter();
  const [articleData, setArticleData] = useState<ProgressiveArticleData | null>(null);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        // Step 1: Check for pre-loaded content in sessionStorage
        const preloadedKey = sessionStorage.getItem('last_preloaded_article');
        if (preloadedKey) {
          const preloadedData = sessionStorage.getItem(`article_preview_${preloadedKey}`);
          if (preloadedData) {
            try {
              const parsed = JSON.parse(preloadedData);
              // Check if this matches our current slug
              if (parsed.slug === slug || parsed.id === slug) {
                setArticleData(parsed);
                setLoadingProgress(30);
                
                // Clear the preloaded data to prevent stale content
                sessionStorage.removeItem(`article_preview_${preloadedKey}`);
                sessionStorage.removeItem('last_preloaded_article');
              }
            } catch (e) {
              console.warn('Failed to parse preloaded data:', e);
            }
          }
        }

        // Step 2: Load complete article data in background
        setLoadingProgress(50);
        
        const response = await fetch(`/api/articles/${slug}`, {
          cache: "force-cache",
          next: { revalidate: 300 }
        });

        if (!response.ok) {
          throw new Error(`Failed to load article: ${response.status}`);
        }

        setLoadingProgress(80);
        const fullArticleData = await response.json();
        
        // Step 3: Update with complete data
        setArticleData(fullArticleData);
        setLoadingProgress(100);
        setIsLoadingComplete(true);

      } catch (error) {
        console.error('Error loading article:', error);
        
        // Fallback: try to load from preview API
        try {
          const previewResponse = await fetch(`/api/articles/${slug}/preview`);
          if (previewResponse.ok) {
            const previewData = await previewResponse.json();
            setArticleData(previewData);
            setLoadingProgress(100);
          }
        } catch (previewError) {
          console.error('Preview fallback failed:', previewError);
          // Show error state or redirect
          router.push('/news');
        }
      }
    };

    loadArticle();
  }, [slug, router]);

  if (!articleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">{fallbackTitle}</p>
        </div>
      </div>
    );
  }

  const isBreaking = Boolean((articleData as any).breaking);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Progress indicator for background loading */}
      {!isLoadingComplete && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div 
            className="h-1 bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="mb-8">
          {/* Category Badge */}
          {articleData.category && (
            <div className="mb-4">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                isBreaking
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {articleData.category.icon && (
                  <span>{articleData.category.icon}</span>
                )}
                {articleData.category.name}
              </span>
            </div>
          )}

          {/* Breaking News Badge */}
          {isBreaking && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-red-600 text-white animate-pulse">
                <span className="text-lg">⚡</span>
                خبر عاجل
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className={`text-3xl md:text-4xl font-bold mb-6 leading-tight ${
            isBreaking 
              ? 'text-red-700 dark:text-red-400'
              : 'text-gray-900 dark:text-white'
          }`}>
            {articleData.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {articleData.published_at && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <time dateTime={articleData.published_at}>
                  {formatDateNumeric(articleData.published_at)}
                </time>
              </div>
            )}
            
            {articleData.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{articleData.author.name}</span>
              </div>
            )}
            
            {typeof articleData.views === 'number' && (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{articleData.views} مشاهدة</span>
              </div>
            )}
            
            {articleData.reading_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{articleData.reading_time} دقائق قراءة</span>
              </div>
            )}
          </div>

          {/* Excerpt */}
          {articleData.excerpt && (
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-medium">
              {articleData.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {articleData.featured_image && (
          <div className="mb-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <SafeNewsImage
                src={articleData.featured_image}
                alt={articleData.title}
                className="absolute inset-0 w-full h-full object-cover"
                width={800}
                height={450}
                priority
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {articleData.content ? (
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: articleData.content }}
            />
          ) : (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                جاري تحميل المحتوى الكامل...
              </p>
            </div>
          )}
        </div>

        {/* Loading indicator for content */}
        {articleData.preloaded && !isLoadingComplete && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-blue-700 dark:text-blue-300 text-sm">
                جاري تحميل المحتوى الإضافي والتعليقات...
              </span>
            </div>
          </div>
        )}

        {/* Back to News Button */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push('/news')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى الأخبار</span>
          </button>
        </div>
      </article>
    </div>
  );
}
