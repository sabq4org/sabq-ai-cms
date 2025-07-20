import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';

interface RelatedArticle {
  id: string;
  title: string;
  featured_image?: string;
  reading_time?: number;
  published_at?: string;
  created_at?: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6">مقالات ذات صلة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.slice(0, 3).map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            className="group hover:shadow-lg transition-shadow duration-300"
          >
            <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* صورة المقال */}
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={article.featured_image || '/placeholder.jpg'}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              
              {/* محتوى المقال */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {String(article.title || '')}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{String(article.reading_time || 5)} دقائق</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      
      {/* رابط عرض المزيد */}
      {articles.length > 3 && (
        <div className="text-center mt-6">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            عرض المزيد من المقالات
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l-5 5 5 5M19 7l-5 5 5 5" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
} 