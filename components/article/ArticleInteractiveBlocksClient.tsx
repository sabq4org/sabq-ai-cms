'use client';

import { useMemo } from 'react';
import CommentsPanel from '@/components/article/CommentsPanel';
import ArticleStatsBlock from '@/components/article/ArticleStatsBlock';
import SmartPersonalizedContent from '@/components/article/SmartPersonalizedContent';
import AIQuestions from '@/components/article/AIQuestions';

interface CategoryLite {
  id?: string | number | null;
  name?: string | null;
  slug?: string | null;
  color?: string | null;
  icon?: string | null;
}

interface ArticleInteractiveProps {
  article: {
    id: string;
    content?: string | null;
    views?: number;
    likes?: number;
    saves?: number;
    shares?: number;
    category?: CategoryLite | null;
    category_id?: string | number | null;
    keywords?: string[] | null;
    comments_count?: number;
  };
}

export default function ArticleInteractiveBlocksClient({ article }: ArticleInteractiveProps) {

  const contentHtml = useMemo(() => {
    const raw = article?.content || '';
    if (!raw) return '';
    return raw;
  }, [article?.content]);

  return (
    <div className="max-w-screen-lg lg:max-w-[110ch] mx-auto px-4 sm:px-6 py-0 sm:py-0 lg:py-0">
      {/* أسئلة الذكاء الاصطناعي - اختيارية */}
      {contentHtml && (
        <div className="mb-8" style={{ contentVisibility: 'auto' as any, containIntrinsicSize: '100% 120px' as any }}>
          <AIQuestions content={contentHtml} />
        </div>
      )}

      {/* التعليقات */}
      <div className="mt-4 sm:mt-6" style={{ contentVisibility: 'auto' as any, containIntrinsicSize: '100% 200px' as any }}>
        <CommentsPanel articleId={article.id} initialCount={article.comments_count || 0} />
      </div>

      {/* إحصائيات المقال */}
      <div className="mt-6" style={{ contentVisibility: 'auto' as any, containIntrinsicSize: '100% 120px' as any }}>
        <ArticleStatsBlock
          views={article.views || 0}
          likes={article.likes || 0}
          saves={article.saves || 0}
          shares={article.shares || 0}
          category={article.category ? { name: article.category.name || '', color: article.category.color || undefined, icon: article.category.icon || undefined } : undefined}
        />
      </div>

      {/* مخصص لك */}
      <div className="mt-6 sm:mt-8" style={{ contentVisibility: 'auto' as any, containIntrinsicSize: '100% 320px' as any }}>
        <SmartPersonalizedContent
          articleId={article.id}
          categoryId={(article.category_id as any) || undefined}
          categoryName={article.category?.name || undefined}
          tags={article.keywords || []}
          darkMode={darkMode}
          userId={undefined}
        />
      </div>
    </div>
  );
}


