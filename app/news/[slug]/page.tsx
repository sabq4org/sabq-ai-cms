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
    select: { id: true, content_type: true },
  });
  if (!item) return notFound();
  if (item.content_type !== "NEWS") {
    return redirect(`/article/${params.slug}`);
  }
  return <ArticleClientComponent articleId={item.id} initialArticle={null} />;
}
