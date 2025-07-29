'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Sparkles, Brain, MessageSquare, Zap, BarChart3 } from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import type { RecommendedArticle } from '@/lib/ai-recommendations';

// توسيع النوع لإضافة خصائص إضافية
interface ExtendedRecommendedArticle extends RecommendedArticle {
  slug?: string;
  excerpt?: string;
  featured_image?: string;
  category_name?: string;
  image_caption?: string; // وصف الصورة
  metadata?: {
    type?: string;
  };
}

interface SmartContentNewsCardProps {
  article: ExtendedRecommendedArticle;
  darkMode: boolean;
  variant?: 'compact' | 'full';
  position?: number; // لتحديد مكان البطاقة في القائمة
}

// الأيقونات حسب نوع المحتوى
const typeIcons: Record<string, { icon: React.ElementType; color: string }> = {
  'article': { icon: TrendingUp, color: 'text-blue-500' },
  'analysis': { icon: Brain, color: 'text-purple-500' },
  'opinion': { icon: MessageSquare, color: 'text-green-500' },
  'creative': { icon: Sparkles, color: 'text-pink-500' },
  'quick': { icon: Zap, color: 'text-yellow-500' },
  'insight': { icon: BarChart3, color: 'text-indigo-500' }
};

// عبارات تحفيزية متنوعة
const motivationalPhrases = [
  'اخترناه لك بعناية',
  'قد يعجبك هذا',
  'مقترح خاص لك',
  'محتوى يناسب اهتماماتك',
  'ننصحك بقراءته',
  'مُختار بذكاء لك',
  'يتماشى مع ذوقك',
  'محتوى مميز لك'
];

export default function SmartContentNewsCard({ 
  article, 
  darkMode, 
  variant = 'full',
  position = 0 
}: SmartContentNewsCardProps) {
  const { icon: IconComponent, color } = typeIcons[article.type || article.metadata?.type || 'article'] || typeIcons.article;
  const phrase = motivationalPhrases[position % motivationalPhrases.length];

  return (
    <Link href={article.slug ? `/article/${article.slug}` : article.url} className="block w-full">
      <article className={`
        smart-content-news-card relative overflow-hidden transition-all
        ${darkMode 
          ? 'bg-gray-800/50 active:bg-gray-700/50' 
          : 'bg-white active:bg-gray-50'
        }
      `}>
        <div className="flex items-start p-4 gap-4">
          {/* الصورة - مربعة صغيرة مثل البطاقات العادية */}
          <div className={`
            relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700
            ${variant === 'compact' || variant === 'full' ? 'w-24 h-24' : 'w-20 h-20'}
          `}>
            <CloudImage
              src={article.featured_image || article.thumbnail}
              alt={article.title}
              fill
              className="object-cover"
              sizes="96px"
              fallbackType="article"
            />
            {/* شارة مخصص لك صغيرة في زاوية الصورة */}
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              <span className="text-[10px]">مخصص</span>
            </div>
          </div>

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            {/* التصنيف والمؤشرات */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* أيقونة النوع */}
              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                <IconComponent className={`w-3 h-3 ${color}`} />
                <span className="text-[11px] font-medium">{phrase}</span>
              </div>
              {article.reason && (
                <span className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  • {article.reason}
                </span>
              )}
            </div>

            {/* العنوان */}
            <h3 className={`font-semibold text-base leading-tight line-clamp-3 mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {article.title}
            </h3>

            {/* معلومات سريعة */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                {(article.category_name || article.category) && (
                  <span>{article.category_name || article.category}</span>
                )}
                {article.readingTime && (
                  <span>{article.readingTime} د</span>
                )}
              </div>
              
              {/* مؤشر الأداء المبسط */}
              {article.engagement && article.engagement > 0.3 && (
                <span className="text-[10px] text-yellow-500">⭐ مميز</span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
} 