import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/url-builder";
import HeroGallery from "../parts/HeroGallery";
import ArticleBody from "../parts/ArticleBody";
import StickyInsightsPanel from "../parts/StickyInsightsPanel";
import Container from "../parts/Container";
import CommentsSection from "../parts/CommentsSection";
import SmartQuestions from "../parts/SmartQuestions";

export const revalidate = 300;
export const runtime = "nodejs";

type Article = {
  id: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  content: string | null;
  featured_image: string | null;
  published_at: Date | null;
  updated_at?: Date | null;
  readMinutes?: number | null;
  views?: number;
  images?: { url: string; alt?: string | null; width?: number | null; height?: number | null }[];
  author?: { id: string; name: string | null; email?: string | null; avatar?: string | null; role?: string | null } | null;
  article_author?: { 
    id: string; 
    full_name: string | null; 
    slug: string | null; 
    title?: string | null; 
    avatar_url?: string | null;
    specializations?: any;
    bio?: string | null;
  } | null;
  categories?: { id: string; name: string; slug: string; color?: string | null; icon?: string | null } | null;
};

type Insights = {
  views: number;
  readsCompleted: number;
  avgReadTimeSec: number;
  interactions: { likes: number; comments: number; shares: number };
  ai: {
    shortSummary: string;
    sentiment: "إيجابي" | "سلبي" | "محايد";
    topic: string;
    readerFitScore: number;
    recommendations: { id: string; title: string; url: string }[];
  };
};

async function getArticle(slug: string) {
  const article = await prisma.articles.findFirst({
    where: { OR: [{ slug }, { id: slug }], status: "published" },
    include: {
      author: { select: { id: true, name: true, email: true, avatar: true, role: true } },
      article_author: { 
        select: { 
          id: true, 
          full_name: true, 
          slug: true, 
          title: true, 
          avatar_url: true,
          specializations: true,
          bio: true
        } 
      },
      categories: { select: { id: true, name: true, slug: true, color: true, icon: true } },
    },
  });

  if (!article) return null;

  const images: Article["images"] = [];
  if (article.featured_image) {
    images.push({ url: article.featured_image, alt: article.title || undefined, width: 1600, height: 900 });
  }

  const mapped: Article = {
    id: article.id,
    title: article.title || "",
    subtitle: (article as any)?.metadata?.subtitle || null,
    summary: (article as any).summary || (article as any).excerpt || null,
    content: article.content || null,
    featured_image: article.featured_image,
    published_at: article.published_at,
    updated_at: article.updated_at,
    readMinutes: (article as any).reading_time || null,
    views: article.views || 0,
    images,
    author: article.author,
    article_author: (article as any).article_author,
    categories: article.categories,
  };

  return mapped;
}

async function getInsights(articleId: string): Promise<Insights> {
  return {
    views: 0,
    readsCompleted: 0,
    avgReadTimeSec: Math.max(60, 60 * 3),
    interactions: { likes: 0, comments: 0, shares: 0 },
    ai: {
      shortSummary: "ملخص تجريبي قصير سيتم توليده لاحقاً من خدمة الذكاء الاصطناعي.",
      sentiment: "محايد",
      topic: "أخبار عامة",
      readerFitScore: 60,
      recommendations: [],
    },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(decodeURIComponent(slug));
  const SITE_URL = getSiteUrl();

  if (!article) {
    return { title: "خبر تجريبي غير موجود" };
  }

  const image = article.featured_image ? (article.featured_image.startsWith("http") ? article.featured_image : `${SITE_URL}${article.featured_image}`) : `${SITE_URL}/images/sabq-logo-social.svg`;

  return {
    title: article.title,
    description: article.summary || undefined,
    openGraph: { title: article.title, description: article.summary || undefined, images: [image], type: "article" },
    twitter: { card: "summary_large_image", title: article.title, description: article.summary || undefined, images: [image] },
    alternates: { canonical: `${SITE_URL}/experiment/news/${slug}/lite` },
  };
}

export default async function LiteNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(decodeURIComponent(slug));
  if (!article) return notFound();

  const insights = await getInsights(article.id);
  const contentHtml = article.content || "";

  // استخراج روابط الصور من محتوى المقال
  const extractImageUrls = (html: string): string[] => {
    try {
      const matches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
      const urls = matches.map((m) => m[1]).filter(Boolean);
      return Array.from(new Set(urls));
    } catch {
      return [];
    }
  };

  const contentImageUrls = extractImageUrls(contentHtml);
  const heroImageUrls = (contentImageUrls.length > 0)
    ? contentImageUrls
    : (article.images || []).map((img) => img.url);

  const heroImages: Article["images"] = heroImageUrls.map((url) => ({ url, alt: article.title || undefined, width: 1600, height: 900 }));
  const hiddenImageUrls = heroImageUrls;

  return (
    <div className="bg-[#f8f8f7] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rtl" dir="rtl">
      <main>
        <Container className="py-6 lg:py-10">
          {/* 1. الصورة البارزة */}
          {article.featured_image && (
            <div className="mb-8">
              <HeroGallery images={[{ 
                url: article.featured_image, 
                alt: article.title || undefined, 
                width: 1600, 
                height: 900 
              }]} />
            </div>
          )}

          {/* 2. العنوان الكبير */}
          <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-3">{article.title}</h1>
          
          {/* 3. العنوان الصغير */}
          {article.subtitle && (
            <p className="text-[15px] md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3 line-clamp-2">
              {article.subtitle}
            </p>
          )}

          {/* 4. بيانات النشر */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
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

          {/* 5. المراسل */}
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
                  {article.article_author?.title || article.author?.role || "مراسل صحفي"}
                </p>
              </div>
            </div>
          )}

          {/* 6. خط فاصل */}
          <hr className="border-t border-neutral-200 dark:border-neutral-800 mb-6" />

          {/* 7. الموجز الذكي */}
          {article.summary && (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-3 text-neutral-700 dark:text-neutral-200">
                <span className="text-purple-600 dark:text-purple-400">✨</span>
                <h3 className="font-semibold">الموجز الذكي</h3>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-6">
                {article.summary}
              </p>
            </div>
          )}

          {/* 8. نص المحتوى */}
          <ArticleBody html={contentHtml} article={article} hiddenImageUrls={hiddenImageUrls} />

          {/* 9. بقية الصور (ألبوم) - إذا كان هناك أكثر من صورة */}
          {contentImageUrls.length > 1 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">ألبوم الصور</h3>
              <HeroGallery images={contentImageUrls.slice(1).map(url => ({
                url,
                alt: article.title || undefined,
                width: 1600,
                height: 900
              }))} />
            </div>
          )}

          {/* 10. تحليلات AI */}
          <div className="mt-8">
            <StickyInsightsPanel insights={insights} article={article} />
          </div>

          {/* 11. أسئلة ذكية حول الخبر */}
          <SmartQuestions articleId={article.id} articleTitle={article.title} />

          {/* 12. نظام التعليقات */}
          <div className="mt-12">
            <CommentsSection articleId={article.id} articleSlug={params.slug} />
          </div>
        </Container>
      </main>
    </div>
  );
}