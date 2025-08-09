import ArticleClientComponent from "@/app/article/[id]/ArticleClientComponent";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

// تفعيل ISR مع إعادة التحقق كل دقيقة
export const revalidate = 60;
// السماح بالتخزين المؤقت والعرض الثابت
export const dynamic = "error";
export const runtime = "nodejs";

export default async function NewsPage({
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
    // توافق خلفي: لو لم تتوفر content_type بعد الهجرة، استخدم article_type
    const effectiveContentType =
      item.content_type || (item.article_type === "news" ? "NEWS" : "OPINION");

    if (effectiveContentType !== "NEWS") {
      return redirect(`/article/${decodedSlug}`);
    }
    return <ArticleClientComponent articleId={item.id} initialArticle={null} />;
  } catch (error) {
    // في حال فشل استعلام السيرفر، لا نفشل RSC
    return notFound();
  }
}
