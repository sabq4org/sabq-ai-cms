"use client";
import HeroGallery from "./HeroGallery";
import Container from "./Container";
import ArticleBody from "./ArticleBody";
import FloatingReadButton from "./FloatingReadButton";
import SmartArticleWrapper from "./SmartArticleWrapper";
import dynamic from "next/dynamic";
import { Calendar, Clock, BookOpen, Eye, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";

interface ResponsiveArticleProps {
  article: any;
  insights: any;
  slug: string;
}

export default function ResponsiveArticle({ article, insights, slug }: ResponsiveArticleProps) {
  const heroImages = useMemo(() => {
    // Create images array from featured_image and social_image
    const images = [];
    if (article.featured_image) {
      images.push({
        url: article.featured_image,
        alt: article.title || "صورة الخبر"
      });
    }
    if (article.social_image && article.social_image !== article.featured_image) {
      images.push({
        url: article.social_image,
        alt: article.title || "صورة الخبر"
      });
    }
    return images;
  }, [article.featured_image, article.social_image, article.title]);
  
  const contentHtml = article.content_processed || article.content || "";
  const hiddenImageUrls = heroImages.map((img: any) => img.url);
  
  // Progressive loading states
  const [mounted, setMounted] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check if this article was pre-loaded from homepage
    const checkPreloadedContent = () => {
      try {
        const preloadedKey = sessionStorage.getItem('last_preloaded_article');
        if (preloadedKey === article.id) {
          const preloadedData = sessionStorage.getItem(`article_preview_${article.id}`);
          if (preloadedData) {
            const parsed = JSON.parse(preloadedData);
            if (parsed.preloaded && Date.now() - parsed.timestamp < 300000) { // 5 minutes
              // Load enhanced content in background
              loadEnhancedContent();
            }
          }
        }
      } catch (error) {
        console.warn('Failed to check preloaded content:', error);
      }
    };

    checkPreloadedContent();
  }, [article.id]);

  const loadEnhancedContent = async () => {
    try {
      // Load comments, related articles, and other enhanced features
      const [commentsRes, relatedRes] = await Promise.all([
        fetch(`/api/articles/${article.id}/comments?limit=5`).catch(() => null),
        fetch(`/api/articles/${article.id}/related?limit=3`).catch(() => null)
      ]);

      const enhanced: any = {};
      if (commentsRes?.ok) {
        enhanced.comments = await commentsRes.json();
      }
      if (relatedRes?.ok) {
        enhanced.related = await relatedRes.json();
      }

      setEnhancedContent(enhanced);
    } catch (error) {
      console.warn('Failed to load enhanced content:', error);
    }
  };

  const StickyInsightsPanel = useMemo(() => dynamic(() => import("./StickyInsightsPanel"), {
    ssr: false,
    loading: () => <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 h-64 animate-pulse" />
  }), []);

  const SmartQuestions = useMemo(() => dynamic(() => import("./SmartQuestions"), {
    ssr: false,
    loading: () => <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 h-40 animate-pulse" />
  }), []);

  // تحميل قسم التعليقات بشكل كسول لتقليل زمن العرض الأولي
  const LazyCommentsSection = useMemo(() => dynamic(() => import("./CommentsSection"), {
    ssr: false,
    loading: () => (
      <div className="mt-8">
        <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-800 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          <div className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        </div>
      </div>
    )
  }), []);

  // الصور البارزة فقط للموبايل
  const featuredImage = article.featured_image ? [{ 
    url: article.featured_image, 
    alt: article.title || undefined 
  }] : [];
  
  // باقي الصور للألبوم
  const albumImages = article.images?.filter((img: any) => img.url !== article.featured_image) || [];

  return (
    <SmartArticleWrapper article={article} insights={insights}>
      <div className="bg-[#f8f8f7] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rtl" dir="rtl">
        
        {/* عرض الصور حسب حجم الشاشة */}
        <div className="pt-4 lg:pt-6 mb-4 lg:mb-6">
          {/* للشاشات الكبيرة: جميع الصور */}
          <div className="hidden md:block">
            <HeroGallery images={heroImages} />
          </div>
          {/* للموبايل: الصورة البارزة فقط */}
          <div className="block md:hidden">
            {featuredImage.length > 0 && <HeroGallery images={featuredImage} />}
          </div>
        </div>
        
        <main>
          <Container className="py-4 lg:py-6">
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
              <section id="article-start" className="lg:col-span-8">
                {/* العنوان الرئيسي */}
                <h1 className="text-2xl md:text-4xl font-bold mb-4">
                  {article.title}
                </h1>

                {/* العنوان الفرعي */}
                {article.subtitle && (
                  <h2 className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-6">
                    {article.subtitle}
                  </h2>
                )}

                {/* معلومات النشر */}
                <div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                    {article.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.published_at).toLocaleDateString('ar-SA-u-ca-gregory', { year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory', numberingSystem: 'latn' })}</span>
                      </div>
                    )}
                    {/* إخفاء الوقت على الموبايل */}
                    {article.published_at && (
                      <div className="hidden sm:flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Intl.DateTimeFormat('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }).format(new Date(article.published_at))}</span>
                      </div>
                    )}
                    {article.reading_time && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{article.reading_time} دقيقة قراءة</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{(article.views || 0).toLocaleString("en-US")} مشاهدة</span>
                    </div>
                  </div>

                  {/* معلومات المراسل */}
                  {(article.article_author || article.author) && (
                    <div className="flex items-center gap-4 my-6">
                      <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                        {article.article_author?.avatar_url || article.author?.avatar ? (
                          <img 
                            src={article.article_author?.avatar_url || article.author?.avatar || ""} 
                            alt={article.article_author?.full_name || article.author?.name || "المراسل"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-lg md:text-xl font-semibold">
                            {(article.article_author?.full_name || article.author?.name || "م").charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm md:text-base text-neutral-900 dark:text-neutral-100">
                          {article.article_author?.full_name || article.author?.name || "المراسل"}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {article.article_author?.title || article.article_author?.specializations?.[0] || article.author?.role || "صحفي"}
                        </p>
                        {/* إخفاء السيرة الذاتية على الموبايل */}
                        {article.article_author?.bio && (
                          <p className="hidden md:block text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                            {article.article_author.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* خط فاصل */}
                  <hr className="border-neutral-200 dark:border-neutral-800 my-6" />

                <ArticleBody html={contentHtml} article={article} hiddenImageUrls={hiddenImageUrls} skipProcessing={!!article.content_processed} />

                {/* الكلمات المفتاحية تحت المحتوى */}
                {(Array.isArray(article.tags) && article.tags.length > 0) || (Array.isArray(article.keywords) && article.keywords.length > 0) ? (
                  <div className="mt-6">
                    <h3 className="font-semibold text-base mb-3">الكلمات المفتاحية</h3>
                    <div className="flex flex-wrap gap-2">
                      {(article.tags?.length ? article.tags : article.keywords).map((tag: any, index: number) => {
                        const label = (typeof tag === 'string') ? tag : (tag?.name || String(tag));
                        const href = `/tags/${encodeURIComponent(label)}`;
                        return (
                          <Link
                            key={`${label}-${index}`}
                            href={href}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 hover:underline"
                          >
                            #{label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* ألبوم الصور للموبايل */}
                {albumImages.length > 0 && (
                  <div className="block md:hidden mt-8">
                    <h3 className="font-semibold text-lg mb-4">معرض الصور</h3>
                    <HeroGallery images={albumImages} />
                  </div>
                )}

                {/* البانل للموبايل - يظهر كامل */}
                <div className="block lg:hidden mt-8">
                  {mounted && (
                    <StickyInsightsPanel insights={insights} article={{
                      id: article.id,
                      summary: article.summary,
                      categories: article.categories,
                      tags: article.tags,
                      keywords: article.keywords,
                      likes: article.likes || 0,
                      shares: article.shares || 0,
                      saves: article.saves || 0,
                    }} />
                  )}
                </div>
                
                {/* أسئلة ذكية حول الخبر */}
                {mounted && (
                  <SmartQuestions 
                    articleId={article.id} 
                    articleTitle={article.title}
                    content={article.content || ""}
                    author={article.article_author || article.author}
                  />
                )}
                
                {/* قسم التعليقات (تحميل كسول) */}
                <LazyCommentsSection articleId={article.id} articleSlug={slug} />
              </section>
              
              {/* البانل الجانبي للشاشات الكبيرة */}
              <aside className="hidden lg:block lg:col-span-4">
                {mounted && (
                  <StickyInsightsPanel insights={insights} article={{
                    id: article.id,
                    summary: article.summary,
                    categories: article.categories,
                    tags: article.tags,
                    keywords: article.keywords,
                    likes: article.likes || 0,
                    shares: article.shares || 0,
                    saves: article.saves || 0,
                  }} />
                )}
              </aside>
            </div>
          </Container>
        </main>
        <FloatingReadButton targetId="#article-start" />
      </div>
    </SmartArticleWrapper>
  );
}
