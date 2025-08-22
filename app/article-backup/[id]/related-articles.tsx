import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Eye } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  featured_image?: string;
  category_name?: string;
  author_name?: string;
  published_at?: string;
  created_at?: string;
  views_count?: number;
  reading_time?: number;
}

interface RelatedArticlesProps {
  articles: Article[];
  onArticleClick?: (articleId: string) => void;
}

export default function RelatedArticles({ articles, onArticleClick }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'اليوم';
    } else if (diffDays === 1) {
      return 'أمس';
    } else if (diffDays < 7) {
      return `منذ ${diffDays} أيام`;
    } else {
      return new Intl.DateTimeFormat('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    }
  };

  return (
    <div className="my-12">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        مقالات ذات صلة
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.slice(0, 4).map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            onClick={() => onArticleClick?.(article.id)}
            className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
          >
            {article.featured_image && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {article.category_name && (
                  <span className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {article.category_name}
                  </span>
                )}
              </div>
            )}
            <div className="p-5">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {article.title}
              </h4>
              {article.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.published_at || article.created_at || '')}
                  </span>
                  {article.reading_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.reading_time} دقائق
                    </span>
                  )}
                </div>
                {article.views_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views_count.toLocaleString('ar-SA')}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
