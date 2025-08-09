import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ArticleClientComponent from "@/app/article/[id]/ArticleClientComponent";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function OpinionArticlePage({ params }: { params: { slug: string } }) {
  const item = await prisma.articles.findFirst({
    where: { slug: params.slug },
    select: { id: true, content_type: true },
  });
  if (!item) return notFound();
  if (item.content_type !== "OPINION") {
    return redirect(`/news/${params.slug}`);
  }
  return <ArticleClientComponent articleId={item.id} initialArticle={null} />;
}


