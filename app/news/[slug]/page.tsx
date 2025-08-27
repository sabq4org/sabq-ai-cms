import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/url-builder";
import ResponsiveArticle from "./parts/ResponsiveArticle";

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
  tags?: { id: string; name: string; slug: string }[];
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
      article_tags: {
        include: {
          tags: {
            select: { id: true, name: true, slug: true }
          }
        }
      },
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
    tags: (article as any).article_tags?.map((at: any) => at.tags) || [],
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
    alternates: { canonical: `${SITE_URL}/news/${slug}` },
  };
}

export default async function ExperimentalNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(decodeURIComponent(slug));
  if (!article) return notFound();

  const insights = await getInsights(article.id);

  return (
    <ResponsiveArticle 
      article={article}
      insights={insights}
      slug={slug}
    />
  );
}


