import HeroGallery from "./HeroGallery";
import Container from "./Container";
import ArticleBody from "./ArticleBody";
import FloatingReadButton from "./FloatingReadButton";
import StickyInsightsPanel from "./StickyInsightsPanel";
import CommentsSection from "./CommentsSection";
import SmartQuestions from "./SmartQuestions";
import { useMemo } from "react";

interface ResponsiveArticleProps {
  article: any;
  insights: any;
  slug: string;
}

export default function ResponsiveArticle({ article, insights, slug }: ResponsiveArticleProps) {
  const heroImages = useMemo(() => article.images || [], [article.images]);
  const contentHtml = article.content || "";
  const hiddenImageUrls = heroImages.map((img: any) => img.url);

  // الصور البارزة فقط للموبايل
  const featuredImage = article.featured_image ? [{ 
    url: article.featured_image, 
    alt: article.title || undefined 
  }] : [];
  
  // باقي الصور للألبوم
  const albumImages = article.images?.filter((img: any) => img.url !== article.featured_image) || [];

  return (
    <div className="bg-[#f8f8f7] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rtl" dir="rtl">
      {/* عرض الصور حسب حجم الشاشة */}
      <div className="mb-8 lg:mb-12">
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
        <Container className="py-8 lg:py-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
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
                      <span>📅</span>
                      <span>{new Intl.DateTimeFormat('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }).format(new Date(article.published_at))}</span>
                    </div>
                  )}
                  {/* إخفاء الوقت على الموبايل */}
                  {article.published_at && (
                    <div className="hidden sm:flex items-center gap-1">
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

                {/* خط فاصل للموبايل */}
                <hr className="block md:hidden border-neutral-200 dark:border-neutral-800 mb-6" />

                {/* الموجز الذكي للموبايل */}
                {article.summary && (
                  <div className="block md:hidden bg-white dark:bg-neutral-900 rounded-xl p-4 mb-6 border border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <span className="text-purple-600 dark:text-purple-400">✨</span>
                      الموجز الذكي
                    </h3>
                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {article.summary}
                    </p>
                  </div>
                )}

              <ArticleBody html={contentHtml} article={article} hiddenImageUrls={hiddenImageUrls} />

              {/* ألبوم الصور للموبايل */}
              {albumImages.length > 0 && (
                <div className="block md:hidden mt-8">
                  <h3 className="font-semibold text-lg mb-4">معرض الصور</h3>
                  <HeroGallery images={albumImages} />
                </div>
              )}

              {/* البانل للموبايل - يظهر كامل */}
              <div className="block lg:hidden mt-8">
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
            
            {/* البانل الجانبي للشاشات الكبيرة */}
            <aside className="hidden lg:block lg:col-span-4">
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
