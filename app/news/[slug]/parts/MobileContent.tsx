"use client";

import HeroGallery from "./HeroGallery";
import ArticleBody from "./ArticleBody";
import StickyInsightsPanel from "./StickyInsightsPanel";
import CommentsSection from "./CommentsSection";
import Container from "./Container";
import SmartQuestions from "./SmartQuestions";

interface MobileContentProps {
  article: any;
  insights: any;
  slug: string;
}

export default function MobileContent({ article, insights, slug }: MobileContentProps) {
  // الصور البارزة فقط
  const featuredImage = article.featured_image ? [{ 
    url: article.featured_image, 
    alt: article.title || undefined 
  }] : [];
  
  // باقي الصور للألبوم
  const albumImages = article.images?.filter((img: any) => img.url !== article.featured_image) || [];
  
  // المحتوى HTML
  const contentHtml = article.content || "";
  
  // إخفاء الصور من المحتوى إذا كانت موجودة في الألبوم
  const hiddenImageUrls = article.images?.map((img: any) => img.url) || [];

  return (
    <div className="bg-[#f8f8f7] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rtl" dir="rtl">
      {/* 1. الصورة البارزة */}
      {featuredImage.length > 0 && (
        <div className="mb-6">
          <HeroGallery images={featuredImage} />
        </div>
      )}

      <Container>
        <div className="max-w-4xl mx-auto">
          {/* 2. العنوان الكبير */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>

          {/* 3. العنوان الصغير */}
          {article.subtitle && (
            <h2 className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              {article.subtitle}
            </h2>
          )}

          {/* 4. بيانات النشر */}
          <div className="flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            {article.published_at && (
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>{new Intl.DateTimeFormat('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }).format(new Date(article.published_at))}</span>
              </div>
            )}
            {article.readMinutes && (
              <div className="flex items-center gap-1">
                <span>📖</span>
                <span>{article.readMinutes} دقيقة قراءة</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>👁️</span>
              <span>{(article.views || 0).toLocaleString("en-US")} مشاهدة</span>
            </div>
          </div>

          {/* 5. المراسل */}
          {(article.article_author || article.author) && (
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                {article.article_author?.avatar_url || article.author?.avatar ? (
                  <img 
                    src={article.article_author?.avatar_url || article.author?.avatar || ""} 
                    alt={article.article_author?.full_name || article.author?.name || "المراسل"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-sm font-semibold">
                    {(article.article_author?.full_name || article.author?.name || "م").charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                  {article.article_author?.full_name || article.author?.name || "المراسل"}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {article.article_author?.title || article.article_author?.specializations?.[0] || article.author?.role || "صحفي"}
                </p>
              </div>
            </div>
          )}

          {/* 6. خط فاصل */}
          <hr className="border-neutral-200 dark:border-neutral-800 mb-6" />

          {/* 7. الموجز الذكي */}
          {article.summary && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 mb-6 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span className="text-purple-600 dark:text-purple-400">✨</span>
                الموجز الذكي
              </h3>
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {article.summary}
              </p>
            </div>
          )}

          {/* 8. نص المحتوى */}
          <ArticleBody html={contentHtml} article={article} hiddenImageUrls={hiddenImageUrls} />

          {/* 9. بقية الصور (لو ألبوم) */}
          {albumImages.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">معرض الصور</h3>
              <HeroGallery images={albumImages} />
            </div>
          )}

          {/* 10. تحليلات AI */}
          <div className="mt-8">
            <StickyInsightsPanel insights={insights} article={{
              id: article.id,
              summary: article.summary,
              categories: article.categories,
              tags: article.tags,
              likes: article.likes || 0,
              shares: article.shares || 0,
              saves: article.saves || 0,
            }} />
          </div>

          {/* 11. أسئلة ذكية حول الخبر */}
          <SmartQuestions 
            articleId={article.id} 
            articleTitle={article.title}
            content={article.content || ""}
            author={article.article_author || article.author}
          />

          {/* 12. نظام التعليقات */}
          <div className="mt-12">
            <CommentsSection articleId={article.id} articleSlug={slug} />
          </div>
        </div>
      </Container>
    </div>
  );
}
