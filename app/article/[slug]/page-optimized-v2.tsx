import ArticleClientComponent from "@/app/article/[id]/ArticleClientComponent";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

// تفعيل ISR مع إعادة التحقق كل 5 دقائق للمقالات
export const revalidate = 300;
// السماح بالتخزين المؤقت
export const dynamic = "error";

// جلب البيانات الكاملة من الخادم
async function getCompleteArticle(slug: string) {
  try {
    const article = await prisma.articles.findFirst({
      where: {
        slug,
        status: "published", // فقط المقالات المنشورة
      },
      include: {
        // جلب كل البيانات المطلوبة مرة واحدة
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            role: true,
          },
        },
        article_author: {
          select: {
            id: true,
            full_name: true,
            slug: true,
            title: true,
            avatar_url: true,
            bio: true,
            specializations: true,
            is_verified: true,
            is_opinion_leader: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        // حقول إضافية للمقالات
        _count: {
          select: {
            interactions: true,
          },
        },
      },
    });

    if (!article) return null;

    // تحويل البيانات للشكل المتوقع
    const formattedArticle = {
      ...article,
      // إضافة حقول التوافق
      image: article.featured_image,
      image_url: article.featured_image,

      // معلومات الكاتب المدمجة
      author_name:
        article.article_author?.full_name || article.author?.name || null,
      author_title: article.article_author?.title || null,
      author_bio:
        article.article_author?.bio || article.author?.bio || null,
      author_avatar:
        article.article_author?.avatar_url || article.author?.avatar || null,
      author_slug: article.article_author?.slug || null,
      is_opinion_leader: article.article_author?.is_opinion_leader || false,

      // إحصائيات التفاعل
      stats: {
        views: article.views || 0,
        likes: article.likes || 0,
        saves: article.saves || 0,
        shares: article.shares || 0,
      },

      // التأكد من وجود المحتوى
      content: article.content || "",

      // معلومات SEO
      seo: {
        title: article.seo_title || article.title,
        description:
          article.seo_description || article.excerpt || article.summary,
        keywords: article.seo_keywords || article.tags,
      },
    };

    return formattedArticle;
  } catch (error) {
    console.error("خطأ في جلب المقال:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getCompleteArticle(params.slug);

  if (!article) {
    return {
      title: "المقال غير موجود",
      description: "عذراً، لم نتمكن من العثور على هذا المقال",
    };
  }

  const authorName = article.author_name || "الكاتب";

  return {
    title: article.seo.title || `${article.title} - ${authorName}`,
    description: article.seo.description,
    keywords: article.seo.keywords,
    authors: [{ name: authorName }],
    openGraph: {
      title: article.title,
      description: article.seo.description,
      images: article.featured_image ? [article.featured_image] : [],
      type: "article",
      publishedTime: article.published_at?.toISOString(),
      authors: [authorName],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.seo.description,
      images: article.featured_image ? [article.featured_image] : [],
      creator: authorName,
    },
    alternates: {
      canonical: `https://sabq.io/article/${params.slug}`,
    },
  };
}

export default async function OpinionArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const decodedSlug = decodeURIComponent(params.slug);

  // جلب البيانات الكاملة من الخادم
  const article = await getCompleteArticle(decodedSlug);

  if (!article) {
    return notFound();
  }

  // التحقق من نوع المحتوى
  const effectiveContentType =
    article.content_type ||
    (article.article_type === "news" ? "NEWS" : "OPINION");

  // إعادة توجيه إذا كان خبر
  if (effectiveContentType !== "OPINION") {
    return redirect(`/news/${decodedSlug}`);
  }

  // تحديث المشاهدات بشكل غير متزامن (لا ننتظر)
  prisma.articles
    .update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    })
    .catch((err) => console.log("Failed to update views:", err));

  // تمرير البيانات الكاملة للعميل - لا حاجة لـ fetch إضافي!
  return (
    <ArticleClientComponent
      articleId={article.id}
      initialArticle={article as any} // ✅ البيانات الكاملة
    />
  );
}
