import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getSiteUrl } from "@/lib/url-builder";
import ResponsiveArticle from "./parts/ResponsiveArticle";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import ArticleSkeleton from "./components/ArticleSkeleton";

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



const getInsights = async function getInsights(articleId: string): Promise<Insights> {
  try {
    const [articleAgg, sessionsAgg, readsCompletedCount, commentsCount] = await Promise.all([
      prisma.articles.findFirst({
        where: { id: articleId },
        select: { views: true, likes: true, shares: true }
      }),
      prisma.user_reading_sessions.aggregate({
        _avg: { duration_seconds: true },
        where: { article_id: articleId }
      }),
      prisma.user_reading_sessions.count({
        where: {
          article_id: articleId,
          OR: [
            { read_percentage: { gte: 0.9 as any } },
            { duration_seconds: { gte: 60 } }
          ]
        }
      }),
      prisma.comments.count({ where: { article_id: articleId } })
    ]);

    const views = articleAgg?.views || 0;
    const likes = articleAgg?.likes || 0;
    const shares = articleAgg?.shares || 0;
    const avgReadTimeSec = Math.max(0, Math.round((sessionsAgg._avg as any)?.duration_seconds || 0));

    return {
      views,
      readsCompleted: readsCompletedCount || 0,
      avgReadTimeSec: avgReadTimeSec > 0 ? avgReadTimeSec : 60,
      interactions: { likes, comments: commentsCount || 0, shares },
      ai: {
        shortSummary: "",
        sentiment: "محايد",
        topic: "أخبار",
        readerFitScore: 60,
        recommendations: [],
      },
    };
  } catch (e) {
    // في حال أي خطأ، نُرجع قيمًا آمنة بدلاً من التعطّل
    return {
      views: 0,
      readsCompleted: 0,
      avgReadTimeSec: 60,
      interactions: { likes: 0, comments: 0, shares: 0 },
      ai: {
        shortSummary: "",
        sentiment: "محايد",
        topic: "أخبار",
        readerFitScore: 60,
        recommendations: [],
      },
    };
  }
};

const getArticle = async function getArticle(slug: string) {
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
};

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
  // كاش المقال بعلامات تسمح بإعادة التحقق عند النشر
  const getArticleCached = unstable_cache(
    async (s: string) => getArticle(s),
    ["news-article", slug],
    { tags: [
      `article:${slug}`,
      "articles",
      "news",
    ], revalidate: 300 }
  );

  const article = await getArticleCached(slug);
  if (!article) return notFound();

  // كاش الإحصاءات بعلامة مستقلة
  const getInsightsCached = unstable_cache(
    async (id: string) => getInsights(id),
    ["article-insights", article.id],
    { tags: [
      `article-insights:${article.id}`,
      `article:${slug}`,
      "news",
    ], revalidate: 300 }
  );

  const insights = await getInsightsCached(article.id);

  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ResponsiveArticle 
        article={article}
        insights={insights}
        slug={slug}
      />
    </Suspense>
  );
}


