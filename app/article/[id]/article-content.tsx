'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatFullDate, formatRelativeDate } from '@/lib/date-utils';
import { Share2, Eye, Clock, Calendar, User, MessageCircle, Heart, Bookmark } from 'lucide-react';

// تحميل المكونات الثقيلة بشكل lazy
const AudioSummaryPlayer = dynamic(() => import('@/components/AudioSummaryPlayer'), {
  loading: () => <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
});

const RelatedArticles = dynamic(() => import('./related-articles'), {
  loading: () => <div className="h-40 bg-gray-100 animate-pulse rounded-lg" />
});

const CommentsSection = dynamic(() => import('./comments-section'), {
  loading: () => <div className="h-60 bg-gray-100 animate-pulse rounded-lg" />
});

interface ArticleContentProps {
  article: any;
  relatedArticles?: any[];
}

export default function ArticleContent({ article, relatedArticles }: ArticleContentProps) {
  const [interaction, setInteraction] = useState({
    liked: false,
    saved: false,
    likesCount: article.likes_count || 0,
    savesCount: article.stats?.saves || 0
  });

  const handleLike = async () => {
    // منطق الإعجاب
    setInteraction(prev => ({
      ...prev,
      liked: !prev.liked,
      likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount + 1
    }));
  };

  const handleSave = async () => {
    // منطق الحفظ
    setInteraction(prev => ({
      ...prev,
      saved: !prev.saved,
      savesCount: prev.saved ? prev.savesCount - 1 : prev.savesCount + 1
    }));
  };

  return (
    <article className="bg-white dark:bg-gray-900">
      {/* Hero Image - محسّن بـ priority */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        <Image
          src={article.featured_image || '/placeholder.jpg'}
          alt={article.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* العنوان والمعلومات */}
        <header className="mb-8">
          {article.category && (
            <Link
              href={`/categories/${article.category.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white mb-4"
              style={{ backgroundColor: article.category.color || '#1a73e8' }}
            >
              {article.category.icon && <span>{article.category.icon}</span>}
              <span>{article.category.name}</span>
            </Link>
          )}

          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          {article.subtitle && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              {article.subtitle}
            </p>
          )}

          {/* معلومات المقال */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {article.author?.name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatFullDate(article.published_at || article.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{article.views_count} مشاهدة</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.reading_time || 5} دقائق</span>
            </div>
          </div>
        </header>

        {/* ملخص AI */}
        {article.ai_summary && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h3 className="text-sm font-semibold mb-2">📎 ملخص AI</h3>
            <p className="text-gray-700 dark:text-gray-300">{article.ai_summary}</p>
          </div>
        )}

        {/* مشغل الصوت */}
        {article.audio_summary_url && (
          <AudioSummaryPlayer
            articleId={article.id}
            excerpt={article.excerpt}
            audioUrl={article.audio_summary_url}
          />
        )}

        {/* أزرار التفاعل */}
        <div className="flex items-center gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700 my-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              interaction.liked
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${interaction.liked ? 'fill-current' : ''}`} />
            <span>{interaction.likesCount}</span>
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              interaction.saved
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${interaction.saved ? 'fill-current' : ''}`} />
            <span>{interaction.savesCount}</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <Share2 className="w-4 h-4" />
            <span>مشاركة</span>
          </button>
        </div>

        {/* محتوى المقال */}
        <div 
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* المقالات ذات الصلة */}
        {relatedArticles && relatedArticles.length > 0 && (
          <RelatedArticles articles={relatedArticles} />
        )}

        {/* قسم التعليقات */}
        <CommentsSection articleId={article.id} />
      </div>
    </article>
  );
} 