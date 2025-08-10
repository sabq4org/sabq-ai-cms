import HeaderSpacer from "@/components/layout/HeaderSpacer";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ArticleClientContent from "./ArticleClientContent";

// تفعيل ISR
export const revalidate = 60;
export const runtime = "nodejs";

// Metadata ديناميكية
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleData(params.slug);

  if (!article) {
    return {
      title: "المقال غير موجود | مُقترب",
    };
  }

  return {
    title: `${article.title} | مُقترب`,
    description: article.excerpt || article.title,
    keywords: article.tags || [],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : [],
      type: "article",
      authors: article.author?.name ? [article.author.name] : [],
    },
  };
}

// جلب بيانات المقال
async function getArticleData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io";
    const response = await fetch(`${baseUrl}/api/muqtarab/articles/${slug}`, {
      next: {
        revalidate: 60,
        tags: ["muqtarab", `muqtarab-article-${slug}`],
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.article;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

// جلب المقالات ذات الصلة
async function getRelatedArticles(articleId: string, angleId?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io";
    const params = new URLSearchParams({
      articleId,
      limit: "6",
    });

    if (angleId) {
      params.append("angleId", angleId);
    }

    const response = await fetch(
      `${baseUrl}/api/muqtarab/related-articles?${params}`,
      {
        next: {
          revalidate: 300, // 5 دقائق
          tags: ["muqtarab-related"],
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return [];
  }
}

// Skeleton للصفحة
function ArticlePageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Skeleton للعنوان */}
        <Skeleton className="h-12 w-3/4 mb-4" />

        {/* Skeleton للمعلومات */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Skeleton للصورة */}
        <Skeleton className="w-full h-96 rounded-lg mb-8" />

        {/* Skeleton للمحتوى */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </article>
    </div>
  );
}

export default async function MuqtarabArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const decodedSlug = decodeURIComponent(params.slug);

  // جلب بيانات المقال
  const article = await getArticleData(decodedSlug);

  if (!article) {
    return notFound();
  }

  // جلب المقالات ذات الصلة بالتوازي
  const relatedArticles = await getRelatedArticles(
    article.id,
    article.corner?.id || article.angleId
  );

  return (
    <>
      {/* مساحة ثابتة للهيدر */}
      <HeaderSpacer />

      {/* المحتوى مع Suspense */}
      <Suspense fallback={<ArticlePageSkeleton />}>
        <ArticleClientContent
          article={article}
          relatedArticles={relatedArticles}
        />
      </Suspense>
    </>
  );
}
