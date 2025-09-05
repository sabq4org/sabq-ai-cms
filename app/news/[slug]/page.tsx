import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getSiteUrl } from "@/lib/url-builder";
import ResponsiveArticle from "./parts/ResponsiveArticle";
import prisma from "@/lib/prisma";

export const revalidate = 300;
export const runtime = "nodejs";



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

async function getArticle(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  
  let article = await prisma.articles.findFirst({
    where: {
      slug: decodedSlug,
      status: "published",
    },
    select: {
      id: true,
      title: true,
      content: true,
      summary: true,
      excerpt: true,
      slug: true,
      featured_image: true,
      social_image: true,
      published_at: true,
      updated_at: true,
      views: true,
      likes: true,
      shares: true,
      saves: true,
      tags: true,
      status: true,
      featured: true,
      reading_time: true,
      article_author: {
        select: {
          id: true,
          full_name: true,
          title: true,
          bio: true,
          avatar_url: true,
          specializations: true,
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          avatar: true,
        }
      },
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      }
    }
  });
  
  if (!article) {
    article = await prisma.articles.findFirst({
      where: {
        id: decodedSlug,
        status: "published",
      },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        excerpt: true,
        slug: true,
        featured_image: true,
        social_image: true,
        published_at: true,
        updated_at: true,
        views: true,
        likes: true,
        shares: true,
        saves: true,
        tags: true,
        status: true,
        featured: true,
        reading_time: true,
        article_author: {
          select: {
            id: true,
            full_name: true,
            title: true,
            bio: true,
            avatar_url: true,
            specializations: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });
  }
  
  return article;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  const SITE_URL = getSiteUrl();

  if (!article) {
    return { title: "خبر غير موجود" };
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

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
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


