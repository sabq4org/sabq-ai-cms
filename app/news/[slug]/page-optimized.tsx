import ArticleClientComponent from "@/app/article/[id]/ArticleClientComponent";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

// تفعيل ISR مع إعادة التحقق كل دقيقة
export const revalidate = 60;
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
      title: "الخبر غير موجود",
      description: "عذراً، لم نتمكن من العثور على هذا الخبر",
    };
  }

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || article.summary,
    keywords: article.seo_keywords || article.tags?.join(", "),
    openGraph: {
      title: article.title,
      description: article.excerpt || article.summary,
      images: article.featured_image ? [article.featured_image] : [],
      type: "article",
      publishedTime: article.published_at?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || article.summary,
      images: article.featured_image ? [article.featured_image] : [],
    },
  };
}

export default async function NewsPage({
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

  // إعادة توجيه إذا كان مقال رأي
  if (effectiveContentType !== "NEWS") {
    return redirect(`/article/${decodedSlug}`);
  }

  // تمرير البيانات الأولية لتجنب جلب مكرر
  return (
    <ArticleClientComponent 
      articleId={article.id} 
      initialArticle={article as any}
    />
  );
}
