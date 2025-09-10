"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatDateNumeric } from "@/lib/date-utils";
import { getArticleLink } from "@/lib/utils";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import CloudImage from "@/components/ui/CloudImage";
import { getSafeImageUrl } from "@/lib/image-utils";
import { Clock, Eye, ArrowLeft, Star } from "lucide-react";

interface EnhancedFeaturedArticle {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string; // Pre-loaded content for immediate display
  featured_image?: string;
  social_image?: string;
  metadata?: any;
  published_at?: string;
  breaking?: boolean;
  category?: { 
    id: string; 
    name: string; 
    slug?: string; 
    color?: string; 
    icon?: string;
  } | null;
  views?: number;
  author?: {
    id: string;
    name: string;
  } | null;
  reading_time?: number;
}

interface EnhancedFeaturedLoaderProps {
  heading?: string;
  limit?: number;
  showCarousel?: boolean;
}

export default function EnhancedFeaturedLoader({ 
  heading = "الأخبار المميزة", 
  limit = 3,
  showCarousel = true 
}: EnhancedFeaturedLoaderProps) {
  const { darkMode } = useDarkModeContext();
  const [articles, setArticles] = useState<EnhancedFeaturedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preloadedContent, setPreloadedContent] = useState<Map<string, any>>(new Map());

  // Pre-load article content for immediate display
  const preloadArticleContent = useCallback(async (articleId: string, slug: string) => {
    if (preloadedContent.has(articleId)) return;

    try {
      const response = await fetch(`/api/articles/${slug}/preview`, {
        cache: "no-store", // إزالة الكاش لمحتوى المقال
      });
      
      if (response.ok) {
        const contentData = await response.json();
        setPreloadedContent(prev => new Map(prev).set(articleId, contentData));
      }
    } catch (error) {
      console.warn(`Failed to preload content for ${articleId}:`, error);
    }
  }, [preloadedContent]);

  // Enhanced article fetching with pre-loading
  useEffect(() => {
    let mounted = true;
    
    const fetchEnhancedArticles = async () => {
      try {
        const endpoint = `/api/articles/featured-fast?limit=${limit}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch(endpoint, { 
          signal: controller.signal,
          cache: "no-store", // إزالة الكاش للحصول على أحدث الأخبار
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        
        const enhancedArticles: EnhancedFeaturedArticle[] = (json?.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt || a.summary || '',
          content: a.excerpt || a.summary || '', // Use excerpt instead of full content for faster loading
          // استخدام نظام الصور المُحسَّن مع fallback
          featured_image: a.featured_image || getSafeImageUrl(null, 'featured'),
          social_image: a.social_image || getSafeImageUrl(null, 'article'),
          metadata: a.metadata,
          published_at: a.published_at,
          breaking: a.breaking || a.is_breaking || false,
          category: a.categories ? {
            id: a.categories.id,
            name: a.categories.name,
            slug: a.categories.slug,
            color: a.categories.color,
            icon: a.categories.icon
          } : null,
          views: a.views ?? a.views_count ?? 0,
          author: a.author ? {
            id: a.author.id,
            name: a.author.name
          } : null,
          reading_time: a.reading_time || Math.ceil((a.content?.length || 0) / 200)
        }));

        if (mounted) {
          setArticles(enhancedArticles);
          
          // Skip pre-loading content for faster initial display
          // Content will be loaded when user clicks on article
        }
      } catch (e) {
        console.error("Failed to fetch enhanced featured articles:", e);
        if (mounted) setArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEnhancedArticles();
    
    return () => {
      mounted = false;
    };
  }, [limit, preloadArticleContent]);

  // Auto-advance carousel
  useEffect(() => {
    if (!showCarousel || articles.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % articles.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [articles.length, showCarousel]);

  // Enhanced link click handler for immediate content display
  const handleArticleClick = useCallback((article: EnhancedFeaturedArticle) => {
    // Store pre-loaded content in sessionStorage for immediate display
    const preloadedData = {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      featured_image: article.featured_image,
      published_at: article.published_at,
      category: article.category,
      author: article.author,
      views: article.views,
      reading_time: article.reading_time,
      preloaded: true,
      timestamp: Date.now()
    };
    
    try {
      sessionStorage.setItem(`article_preview_${article.id}`, JSON.stringify(preloadedData));
      sessionStorage.setItem('last_preloaded_article', article.id);
    } catch (error) {
      console.warn('Failed to store preloaded content:', error);
    }
  }, []);

  const isRecentNews = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      return diffTime <= 12 * 60 * 60 * 1000; // 12 hours
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!articles.length) return null;

  if (showCarousel && articles.length > 1) {
    // Carousel mode for desktop
    const currentArticle = articles[currentIndex];
    const isBreaking = Boolean(currentArticle.breaking);
    
    return (
      <div className="max-w-6xl mx-auto mb-6 px-4 sm:px-6">
        <Link 
          href={getArticleLink(currentArticle)} 
          onClick={() => handleArticleClick(currentArticle)}
          className="block group"
        >
          <div className={`relative overflow-hidden border rounded-xl transition-all duration-300 hover:shadow-lg ${
            isBreaking 
              ? 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-950/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 h-80 lg:h-96">
              {/* Image Section - 50% */}
              <div className="col-span-1 relative overflow-hidden">
                                <CloudImage
                  src={currentArticle.featured_image || '/images/news-placeholder.svg'}
                  alt={currentArticle.title}
                  fill
                  className="object-cover"
                  fallbackType="article"
                  priority={false}
                />
                
                {/* Breaking/New Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {isBreaking ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg">
                      <span className="text-sm animate-pulse">⚡</span>
                      عاجل
                    </span>
                  ) : isRecentNews(currentArticle.published_at || '') ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-lg">
                      <span className="text-sm">🔥</span>
                      جديد
                    </span>
                  ) : null}
                </div>
              </div>
              
              {/* Content Section - 50% */}
              <div className="hidden lg:flex col-span-1 p-6 flex-col justify-between">
                {/* Category + New label (beside) */}
                {(currentArticle.category || isRecentNews(currentArticle.published_at || '')) && (
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    {currentArticle.category && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        darkMode 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {currentArticle.category.icon && (
                          <span className="text-sm">{currentArticle.category.icon}</span>
                        )}
                        {currentArticle.category.name}
                      </span>
                    )}
                    {(!isBreaking) && isRecentNews(currentArticle.published_at || '') && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white">
                        <span className="text-sm">🔥</span>
                        جديد
                      </span>
                    )}
                  </div>
                )}
                
                {/* Title */}
                <h2 className={`text-xl lg:text-2xl font-bold mb-4 leading-tight line-clamp-3 ${
                  isBreaking 
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {currentArticle.title}
                </h2>
                
                {/* Excerpt */}
                {currentArticle.excerpt && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                    {currentArticle.excerpt}
                  </p>
                )}
                
                {/* Metadata */}
                <div className="mt-auto">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateNumeric(currentArticle.published_at || '')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{currentArticle.views || 0}</span>
                    </div>
                  </div>
                  
                  {/* Read More Button - aligned left */}
                  <div className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow-sm">
                    <span>اقرأ المزيد</span>
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Carousel Indicators */}
        <div className="flex justify-center items-center gap-3 mt-4">
          {articles.map((article, idx) => (
            <button
              key={article.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer ${
                idx === currentIndex 
                  ? "w-16 h-9 shadow-lg ring-2 ring-blue-500" 
                  : "w-10 h-9 opacity-50 hover:opacity-70"
              }`}
            >
              <CloudImage
                src={article.featured_image || '/images/news-placeholder.svg'}
                alt={article.title}
                width={64}
                height={36}
                className="w-full h-full object-cover"
                fallbackType="article"
              />
              {idx === currentIndex && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Strip mode for mobile
  return (
    <div className="max-w-6xl mx-auto mb-6">
      <div className="flex gap-4 overflow-x-auto pb-2 px-4 sm:px-6 scroll-smooth">
        {articles.map((article, idx) => {
          const isBreaking = Boolean(article.breaking);
          return (
            <Link
              key={article.id}
              href={getArticleLink(article)}
              onClick={() => handleArticleClick(article)}
              className="group flex-shrink-0 w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px]"
            >
              <article className={`relative rounded-2xl overflow-hidden border transition-all duration-200 h-full flex flex-col shadow-sm hover:shadow-md ${
                isBreaking
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-400'
              }`}>
                <div className="relative aspect-video w-full overflow-hidden">
                  <CloudImage
                    src={article.featured_image || '/images/news-placeholder.svg'}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={idx === 0}
                    fallbackType="article"
                  />
                  
                  {/* Badge */}
                  <div className="absolute top-2 left-2">
                    {isBreaking ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                        <span className="text-sm">⚡</span>
                        عاجل
                      </span>
                    ) : isRecentNews(article.published_at || '') ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white">
                        <span className="text-sm">🔥</span>
                        جديد
                      </span>
                    ) : article.category ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        darkMode
                          ? "bg-gray-900/60 text-gray-200 border border-gray-700"
                          : "bg-white/80 text-gray-700 border border-gray-200"
                      }`}>
                        {article.category.icon && (
                          <span className="text-xs">{article.category.icon}</span>
                        )}
                        {article.category.name}
                      </span>
                    ) : null}
                  </div>
                </div>
                
                <div className="flex flex-col p-3 pb-4 flex-1">
                  <h3 className={`text-sm sm:text-base font-semibold leading-snug line-clamp-2 mb-2 ${
                    isBreaking
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-gray-800 dark:text-white'
                  }`}>
                    {article.title}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <time dateTime={article.published_at}>
                        {formatDateNumeric(article.published_at || '')}
                      </time>
                    </div>
                    {typeof article.views === 'number' && (
                      <div className="flex items-center gap-1">
                        <span>{article.views} مشاهدة</span>
                        {article.views > 300 && <span>🔥</span>}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
