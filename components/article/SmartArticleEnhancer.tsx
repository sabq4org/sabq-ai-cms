"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// استيراد المكونات الذكية بشكل ديناميكي لتحسين الأداء
const SabqAICompanion = dynamic(() => import("./SabqAICompanion"), {
  ssr: false,
  loading: () => null
});

const SmartInteractions = dynamic(() => import("./SmartInteractions"), {
  ssr: false,
  loading: () => (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 rtl:space-x-reverse">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  )
});

const NextKnowledgeJourney = dynamic(() => import("./NextKnowledgeJourney"), {
  ssr: false,
  loading: () => (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index}>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  )
});

interface SmartArticleEnhancerProps {
  article: any;
  insights: any;
}

export default function SmartArticleEnhancer({ article, insights }: SmartArticleEnhancerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // استخراج البيانات المطلوبة من المقال
  const getArticleData = () => {
    // الكاتب
    const author = article.article_author || article.author || { id: "unknown", name: "فريق سبق" };
    const authorName = author.full_name || author.name || "فريق سبق";

    // التصنيف
    const category = article.categories && article.categories.length > 0 
      ? article.categories[0].name 
      : "أخبار";

    // التاجات
    let tags: string[] = [];
    if (article.tags && Array.isArray(article.tags)) {
      tags = article.tags.map((tag: any) => typeof tag === 'string' ? tag : (tag?.name || String(tag)));
    } else if (article.keywords && Array.isArray(article.keywords)) {
      tags = article.keywords;
    }

    // المحتوى
    const content = article.content_processed || article.content || "";
    const plainContent = content.replace(/<[^>]*>/g, ' ');

    return {
      id: article.id,
      title: article.title,
      content: plainContent,
      category,
      tags,
      authorName,
      publishedAt: new Date(article.published_at),
      commentsCount: insights.interactions.comments || 0,
      likesCount: article.likes || 0,
      sharesCount: article.shares || 0,
      bookmarksCount: article.saves || 0
    };
  };

  const articleData = getArticleData();

  return (
    <>
      {/* تفاعلات القراء الذكية */}
      <SmartInteractions
        articleId={articleData.id}
        commentsCount={articleData.commentsCount}
        likesCount={articleData.likesCount}
        sharesCount={articleData.sharesCount}
        bookmarksCount={articleData.bookmarksCount}
      />
      
      {/* رحلتك المعرفية التالية */}
      <NextKnowledgeJourney
        articleId={articleData.id}
        articleTitle={articleData.title}
        articleCategory={articleData.category}
        articleTags={articleData.tags}
      />
      
      {/* مساعد سبق الذكي */}
      <SabqAICompanion
        articleId={articleData.id}
        articleTitle={articleData.title}
        articleContent={articleData.content}
        articleCategory={articleData.category}
        articleTags={articleData.tags}
        articleAuthor={articleData.authorName}
        articlePublishedAt={articleData.publishedAt}
      />
    </>
  );
}
