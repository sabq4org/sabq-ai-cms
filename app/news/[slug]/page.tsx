import ArticleClientComponent from "@/app/article/[id]/ArticleClientComponent";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

// ISR: تفاصيل الخبر (NEWS) تعاد التحقق كل 300 ثانية
export const revalidate = 300;
// السماح بالتخزين المؤقت
export const dynamic = "error";
export const runtime = "nodejs";

// جلب البيانات الكاملة من الخادم
async function getCompleteArticle(slug: string) {
  try {
    const article = await prisma.articles.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }, // دعم البحث بالـ ID أيضاً للتوافق
        ],
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
            specializations: true,
            role: true,
            ai_score: true,
            bio: true,
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
        // حقول إضافية للأداء
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
      author_avatar:
        article.article_author?.avatar_url || article.author?.avatar || null,
      author_slug: article.article_author?.slug || null,

      // إحصائيات التفاعل
      stats: {
        views: article.views || 0,
        likes: article.likes || 0,
        saves: article.saves || 0,
        shares: article.shares || 0,
      },

      // التأكد من وجود المحتوى
      content: article.content || "",

      // معلومات الصورة البارزة
      featured_image_caption: null,
      featured_image_metadata: null,

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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getCompleteArticle(slug);

  if (!article) {
    return {
      title: "الخبر غير موجود",
      description: "عذراً، لم نتمكن من العثور على هذا الخبر",
    };
  }

  return {
    title: article.seo.title,
    description: article.seo.description,
    keywords: article.seo.keywords,
    openGraph: {
      title: article.title,
      description: article.seo.description,
      images: article.featured_image ? [article.featured_image] : [],
      type: "article",
      publishedTime: article.published_at?.toISOString(),
      authors: article.author_name ? [article.author_name] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.seo.description,
      images: article.featured_image ? [article.featured_image] : [],
      creator: article.author_name,
    },
    alternates: {
      canonical: `https://sabq.io/news/${slug}`,
    },
  };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  console.log("🚀 [Build: 2025-01-10-v4] Prisma is_verified field removed");

  // جلب البيانات الكاملة من الخادم
  const article = await getCompleteArticle(decodedSlug);

  if (!article) {
    console.error(`❌ لم يتم العثور على المقال: ${decodedSlug}`);
    return notFound();
  }

  // التحقق من نوع المحتوى
  const effectiveContentType =
    article.content_type ||
    (article.article_type === "news" ? "NEWS" : "OPINION");

  // إعادة توجيه إذا كان مقال رأي
  if (effectiveContentType !== "NEWS") {
    return redirect(`/article/${decodedSlug}`);
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
