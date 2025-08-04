import ArticleClientComponent from "./ArticleClientComponent";
import { generateMetadata } from "./metadata";

interface ArticlePageProps {
  params: { id: string };
}

// تصدير generateMetadata للاستخدام من قبل Next.js
export { generateMetadata };

export default function ArticlePage({ params }: ArticlePageProps) {
  return <ArticleClientComponent articleId={params.id} initialArticle={null} />;
}
