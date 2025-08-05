'use client';

import React from 'react';
import Link from 'next/link';
import { Brain } from 'lucide-react';

interface MobileDeepAnalysisCardProps {
  insight: {
    id: string;
    title?: string;
    slug?: string;
    summary?: string;
    article_id?: string;
    ai_summary: string;
    key_topics?: string[];
    tags: string[] | string;
    sentiment?: string;
    readability_score?: number;
    engagement_score?: number;
    analyzed_at: string;
    updated_at: string;
    authorName?: string;
    qualityScore?: number;
    metadata?: {
      title?: string;
      summary?: string;
      authorName?: string;
      categories?: string[];
      readingTime?: number;
      views?: number;
      featuredImage?: string;
      qualityScore?: number;
      analysisType?: string;
      creationType?: string;
      tags?: string[];
      status?: string;
      sourceType?: string;
    };
    article?: {
      id: string;
      title: string;
      summary: string;
      slug: string;
      featured_image_url?: string;
      published_at: string;
      read_time?: number;
      views_count: number;
      author: {
        id: string;
        name: string;
        avatar?: string;
      };
      categories: Array<{
        id: string;
        name: string;
        slug: string;
        color?: string;
      }>;
    };
  };
  darkMode: boolean;
}

export default function MobileDeepAnalysisCard({ insight, darkMode }: MobileDeepAnalysisCardProps) {
  // استخدام البيانات المبسطة - التركيز على العنوان فقط
  const metadata = insight.metadata || {};
  const articleTitle = metadata.title || insight.title || 'تحليل عميق';
  const articleUrl = `/insights/deep/${insight.id}`;
  
  const handleClick = () => {
    // إضافة تأثير تفاعلي للضغط
    if (typeof window !== 'undefined') {
      // يمكن إضافة منطق تتبع هنا
    }
  };
  
  return (
    <Link href={articleUrl} className="block">
      <div
        onClick={handleClick}
        className={`
          rounded-xl border bg-white dark:bg-zinc-900 p-3 space-y-2 min-h-[80px] h-fit
          hover:shadow-md active:scale-[.98] transition-all cursor-pointer
          ${darkMode 
            ? 'border-zinc-800 shadow-sm' 
            : 'border-zinc-200 shadow-sm'
          }
        `}
      >
        {/* رأس البطاقة - أيقونة ونوع التحليل */}
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
            تحليل عميق
          </span>
        </div>

        {/* عنوان التحليل - التركيز الرئيسي */}
        <h2 className="text-sm font-bold leading-tight line-clamp-2 text-zinc-800 dark:text-white">
          {articleTitle}
        </h2>
      </div>
    </Link>
  );
} 