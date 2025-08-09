import ArticleClientComponent from "@/app/article/[id]/ArticleClientComponent";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function NewsPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await prisma.articles.findFirst({
    where: { slug: params.slug },
    select: { id: true, article_type: true, content_type: true },
  });
  if (!item) return notFound();
  // توافق خلفي: لو لم تتوفر content_type بعد الهجرة، استخدم article_type
  const contentType = (item as any).content_type;
  const articleType = (item as any).article_type;
  const isOpinionLegacy = [
    "opinion",
    "analysis",
    "interview",
    "editorial",
    "commentary",
  ].includes((articleType || "").toLowerCase());
  const isOpinion = contentType === "OPINION" || isOpinionLegacy;
  if (isOpinion) {
    return redirect(`/article/${params.slug}`);
  }
  return <ArticleClientComponent articleId={item.id} initialArticle={null} />;
}
