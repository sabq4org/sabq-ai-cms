import { generateMetadata } from './metadata';
import ArticleClientWrapper from './ArticleClientWrapper';

interface ArticlePageProps {
  params: { id: string };
}

// تصدير generateMetadata للاستخدام من قبل Next.js
export { generateMetadata };

export default function ArticlePage({ params }: ArticlePageProps) {
  return <ArticleClientWrapper articleId={params.id} />;
}