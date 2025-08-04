import { generateMetadata } from './metadata';
import dynamic from 'next/dynamic';

// تحميل المكون الأصلي ديناميكياً
const ArticleClientComponent = dynamic(() => import('./ArticleClientComponent'), { ssr: false });

interface ArticlePageProps {
  params: { id: string };
}

// تصدير generateMetadata للاستخدام من قبل Next.js
export { generateMetadata };

export default function ArticlePage({ params }: ArticlePageProps) {
  return <ArticleClientComponent articleId={params.id} initialArticle={null} />;
}