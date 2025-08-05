import ArticleClientComponent from "./ArticleClientComponent";
import { generateMetadata } from "./metadata";

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

// تصدير generateMetadata للاستخدام من قبل Next.js
export { generateMetadata };

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  return <ArticleClientComponent articleId={id} initialArticle={null} />;
}
