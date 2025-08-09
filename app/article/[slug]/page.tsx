import ArticleClientComponent from "@/app/article/[id]/ArticleClientComponent";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

// تفعيل ISR مع إعادة التحقق كل 5 دقائق للمقالات
export const revalidate = 300;
// السماح بالتخزين المؤقت والعرض الثابت
export const dynamic = "error";
export const runtime = "nodejs";

export default async function OpinionArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const decodedSlug = decodeURIComponent(params.slug);
    const item = await prisma.articles.findFirst({
      where: { slug: decodedSlug },
      select: { id: true, content_type: true, article_type: true }, // Select article_type for fallback
    });
    if (!item) return notFound();
    const effectiveContentType =
      item.content_type || (item.article_type === "news" ? "NEWS" : "OPINION");

    if (effectiveContentType !== "OPINION") {
      return redirect(`/news/${decodedSlug}`);
    }
    return <ArticleClientComponent articleId={item.id} initialArticle={null} />;
  } catch (error) {
    return notFound();
  }
}
