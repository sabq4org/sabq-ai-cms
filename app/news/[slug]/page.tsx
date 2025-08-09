import ArticleClientComponent from "@/app/article/[id]/ArticleClientComponent";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

// تقليل النفقات: استخدم ISR لتحديث كل دقيقة بدلاً من no-cache
export const revalidate = 60;
export const dynamic = "force-static";
export const runtime = "nodejs";

export default async function NewsPage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const decodedSlug = decodeURIComponent(params.slug);
    // جلب الحد الأدنى أولاً لتحديد النوع والمعرّف
    const item = await prisma.articles.findFirst({
      where: { slug: decodedSlug },
      select: { id: true, content_type: true, article_type: true }, // Select article_type for fallback
    });
    if (!item) return notFound();
    // توافق خلفي: لو لم تتوفر content_type بعد الهجرة، استخدم article_type
    const effectiveContentType =
      item.content_type || (item.article_type === "news" ? "NEWS" : "OPINION");

    if (effectiveContentType !== "NEWS") {
      return redirect(`/article/${decodedSlug}`);
    }
    // تمرير البيانات جاهزة لتقليل نداءات العميل
    const full = await prisma.articles.findUnique({
      where: { id: item.id },
      include: {
        categories: true,
        author: { select: { id: true, name: true, email: true, avatar: true } },
        article_author: {
          select: {
            id: true,
            full_name: true,
            slug: true,
            title: true,
            avatar_url: true,
            specializations: true,
          },
        },
      },
    });

    const authorName =
      full?.article_author?.full_name || full?.author?.name || null;
    const authorAvatar =
      full?.article_author?.avatar_url || full?.author?.avatar || null;

    const initialArticle = full
      ? {
          ...full,
          image: full.featured_image,
          image_url: full.featured_image,
          category: full.categories,
          author: {
            ...full.author,
            name: authorName,
            avatar: authorAvatar,
            reporter: full.article_author
              ? {
                  id: full.article_author.id,
                  full_name: full.article_author.full_name,
                  slug: full.article_author.slug,
                  is_verified: true,
                  verification_badge: "verified",
                }
              : null,
          },
          views: full.views || 0,
          comments_count: 0,
        }
      : null;

    return (
      <ArticleClientComponent articleId={item.id} initialArticle={initialArticle} />
    );
  } catch (error) {
    // في حال فشل استعلام السيرفر، لا نفشل RSC
    return notFound();
  }
}
