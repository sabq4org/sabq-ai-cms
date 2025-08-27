"use client";

import { useMemo } from "react";
import HeroGallery from "./HeroGallery";
import Container from "./Container";
import CenteredRow from "./CenteredRow";
import ArticleBody from "./ArticleBody";
import FloatingReadButton from "./FloatingReadButton";
import StickyInsightsPanel from "./StickyInsightsPanel";
import CommentsSection from "./CommentsSection";
import SmartQuestions from "./SmartQuestions";

interface DesktopContentProps {
  article: any;
  insights: any;
  slug: string;
}

export default function DesktopContent({ article, insights, slug }: DesktopContentProps) {
  const heroImages = useMemo(() => article.images || [], [article.images]);
  const contentHtml = article.content || "";
  const hiddenImageUrls = heroImages.map((img: any) => img.url);

  return (
    <div className="bg-[#f8f8f7] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rtl" dir="rtl">
      <div className="pt-4">
        <HeroGallery images={heroImages} />
      </div>
      <main>
        <Container>
          <div className="grid lg:grid-cols-12 gap-8">
            <section id="article-start" className="lg:col-span-8">
              <CenteredRow>
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
                      <span>📅</span>
                      <span>{new Intl.DateTimeFormat('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }).format(new Date(article.published_at))}</span>
                    </div>
                  )}
                  {article.published_at && (
                    <div className="flex items-center gap-1">
                      <span>🕐</span>
                      <span>{new Intl.DateTimeFormat('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
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

                {/* معلومات المراسل */}
                {(article.article_author || article.author) && (
                  <div className="flex items-center gap-4 my-6">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                      {article.article_author?.avatar_url || article.author?.avatar ? (
                        <img 
                          src={article.article_author?.avatar_url || article.author?.avatar || ""} 
                          alt={article.article_author?.full_name || article.author?.name || "المراسل"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-xl font-semibold">
                          {(article.article_author?.full_name || article.author?.name || "م").charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                        {article.article_author?.full_name || article.author?.name || "المراسل"}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {article.article_author?.title || article.article_author?.specializations?.[0] || article.author?.role || "صحفي"}
                      </p>
                      {article.article_author?.bio && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                          {article.article_author.bio}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CenteredRow>

              <ArticleBody html={contentHtml} article={article} hiddenImageUrls={hiddenImageUrls} />
              
              {/* أسئلة ذكية حول الخبر */}
              <SmartQuestions 
                articleId={article.id} 
                articleTitle={article.title}
                content={article.content || ""}
                author={article.article_author || article.author}
              />
              
              {/* قسم التعليقات */}
              <CommentsSection articleId={article.id} articleSlug={slug} />
            </section>
            <aside className="lg:col-span-4">
              <StickyInsightsPanel insights={insights} article={{
                id: article.id,
                summary: article.summary,
                categories: article.categories,
                tags: article.tags,
                likes: article.likes || 0,
                shares: article.shares || 0,
                saves: article.saves || 0,
              }} />
            </aside>
          </div>
        </Container>
      </main>
      <FloatingReadButton targetId="#article-start" />
    </div>
  );
}
