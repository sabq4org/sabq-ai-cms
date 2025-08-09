import ArticleClientComponent from "@/app/article/[id]/ArticleClientComponent";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

// تفعيل ISR مع إعادة التحقق كل 5 دقائق للمقالات
export const revalidate = 300;
// السماح بالتخزين المؤقت والعرض الثابت
export const dynamic = "error";

// جلب المقال مع تحسينات الأداء
async function getArticleBySlug(slug: string) {
  try {
    const article = await prisma.articles.findFirst({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        featured_image: true,
        published_at: true,
        content_type: true,
        article_type: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            bio: true,
          }
        },
        article_author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            title: true,
            is_verified: true,
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          }
        },
        views: true,
        reading_time: true,
        seo_title: true,
        seo_description: true,
        seo_keywords: true,
        metadata: true,
        audio_summary_url: true,
        likes: true,
        saves: true,
        shares: true,
        ai_quotes: true,
        summary: true,
        tags: true,
        is_opinion_leader: true,
      }
    });

    return article;
  } catch (error) {
    console.error("خطأ في جلب المقال:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  
  if (!article) {
    return {
      title: "المقال غير موجود",
      description: "عذراً، لم نتمكن من العثور على هذا المقال",
    };
  }

  const authorName = article.article_author?.name || article.author?.name || "الكاتب";

  return {
    title: article.seo_title || `${article.title} - ${authorName}`,
    description: article.seo_description || article.excerpt || article.summary,
    keywords: article.seo_keywords || article.tags?.join(", "),
    authors: [{ name: authorName }],
    openGraph: {
      title: article.title,
      description: article.excerpt || article.summary,
      images: article.featured_image ? [article.featured_image] : [],
      type: "article",
      publishedTime: article.published_at?.toISOString(),
      authors: [authorName],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || article.summary,
      images: article.featured_image ? [article.featured_image] : [],
      creator: authorName,
    },
  };
}

export default async function OpinionArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const decodedSlug = decodeURIComponent(params.slug);
  const article = await getArticleBySlug(decodedSlug);
  
  if (!article) {
    return notFound();
  }

  // التحقق من نوع المحتوى
  const effectiveContentType =
    article.content_type || (article.article_type === "news" ? "NEWS" : "OPINION");

  // إعادة توجيه إذا كان خبر
  if (effectiveContentType !== "OPINION") {
    return redirect(`/news/${decodedSlug}`);
  }

  // تمرير البيانات الأولية لتجنب جلب مكرر
  return (
    <ArticleClientComponent 
      articleId={article.id} 
      initialArticle={article as any}
    />
  );
}
