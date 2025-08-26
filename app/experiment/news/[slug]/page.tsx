import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/url-builder";
import HeaderInline from "./parts/HeaderInline";
import HeroGallery from "./parts/HeroGallery";
import ArticleBody from "./parts/ArticleBody";
import StickyInsightsPanel from "./parts/StickyInsightsPanel";
import FloatingReadButton from "./parts/FloatingReadButton";

export const revalidate = 300;
export const runtime = "nodejs";

type Article = {
  id: string;
  title: string;
  summary?: string | null;
  content: string | null;
  featured_image: string | null;
  published_at: Date | null;
  updated_at?: Date | null;
  readMinutes?: number | null;
  images?: { url: string; alt?: string | null; width?: number | null; height?: number | null }[];
  author?: { id: string; name: string | null; role?: string | null } | null;
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
      author: { select: { id: true, name: true, role: true } },
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
    summary: (article as any).summary || (article as any).excerpt || null,
    content: article.content || null,
    featured_image: article.featured_image,
    published_at: article.published_at,
    updated_at: article.updated_at,
    readMinutes: (article as any).reading_time || null,
    images,
    author: article.author,
    categories: article.categories,
  };

  return mapped;
}

async function getInsights(articleId: string): Promise<Insights> {
  // بيانات افتراضية أولية - يمكن استبدالها لاحقاً بمصدر فعلي
  return {
    views: 0,
    readsCompleted: 0,
    avgReadTimeSec: Math.max(60, 60 *  (3)),
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
    alternates: { canonical: `${SITE_URL}/experiment/news/${slug}` },
  };
}

export default async function ExperimentalNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(decodeURIComponent(slug));
  if (!article) return notFound();

  const insights = await getInsights(article.id);

  const images = article.images || [];
  const contentHtml = article.content || "";

  return (
    <div className="bg-[#f8f8f7] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rtl" dir="rtl">
      <HeaderInline article={article} />
      <div className="border-b border-neutral-200/80 dark:border-neutral-800/60" />
      <HeroGallery images={images} />
      <main className="mx-auto max-w-[1360px] px-4 md:px-6 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <section className="lg:col-span-8" id="article-start">
            <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-2">{article.title}</h1>
            {article.summary && (
              <p className="text-neutral-600 dark:text-neutral-300 text-sm md:text-base leading-relaxed mb-4 line-clamp-2">{article.summary}</p>
            )}
            <ArticleBody html={contentHtml} article={article} />
          </section>
          <aside className="lg:col-span-4">
            <StickyInsightsPanel insights={insights} article={article} />
          </aside>
        </div>
      </main>
      <FloatingReadButton targetId="#article-start" />
    </div>
  );
}


