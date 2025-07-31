'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { User, Brain, Heart, Sparkles, TrendingUp } from 'lucide-react';

interface MuqtarabCardProps {
  article: {
    id: string;
    title: string;
    summary: string;
    author: {
      name: string;
      avatar?: string;
      emoji?: string;
    };
    category: {
      name: string;
      color: string;
      emoji: string;
    };
    compatibility: number; // نسبة الملاءمة (0-100)
    sentiment: 'ساخر' | 'تأملي' | 'عاطفي' | 'تحليلي' | 'إلهامي';
    readTime: number;
    aiReason?: string; // سبب الاقتراح من الذكاء الاصطناعي
    slug: string;
  };
  variant?: 'large' | 'medium' | 'small';
  className?: string;
}

const sentimentIcons = {
  'ساخر': '😏',
  'تأملي': '🤔',
  'عاطفي': '💙',
  'تحليلي': '🧠',
  'إلهامي': '✨'
};

const sentimentColors = {
  'ساخر': 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
  'تأملي': 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
  'عاطفي': 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
  'تحليلي': 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
  'إلهامي': 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
};

export default function MuqtarabCard({ article, variant = 'medium', className }: MuqtarabCardProps) {
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
    if (score >= 60) return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
  };

  const getCompatibilityIcon = (score: number) => {
    if (score >= 80) return '🎯';
    if (score >= 60) return '💡';
    if (score >= 40) return '🌟';
    return '🤷';
  };

  // تحديد التخطيط حسب الحجم
  const getLayoutStyles = () => {
    switch (variant) {
      case 'large':
        return {
          container: 'md:grid md:grid-cols-2 md:gap-6 md:min-h-[400px]',
          imageSize: 'h-48 md:h-full',
          titleSize: 'text-2xl lg:text-3xl',
          showFullContent: true
        };
      case 'small':
        return {
          container: '',
          imageSize: 'h-32',
          titleSize: 'text-sm lg:text-base',
          showFullContent: false
        };
      default: // medium
        return {
          container: '',
          imageSize: 'h-48',
          titleSize: 'text-lg lg:text-xl',
          showFullContent: true
        };
    }
  };

  const layout = getLayoutStyles();

  return (
    <Link href={`/article/${article.slug}`}>
      <div className={cn(
        'group relative overflow-hidden',
        'bg-white dark:bg-gray-700/50 backdrop-blur-sm',
        'rounded-xl border border-gray-300 dark:border-gray-600',
        'shadow-md hover:shadow-xl transition-all duration-300',
        'hover:scale-[1.01] hover:-translate-y-0.5',
        'cursor-pointer min-h-0',
        layout.container,
        className
      )}>
        {/* صورة تعبيرية للبطاقة الكبيرة */}
        {variant === 'large' && (
          <div className={cn('bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white', layout.imageSize)}>
            <div className="text-center">
              <div className="text-6xl mb-2">{article.category.emoji}</div>
              <div className="text-sm opacity-90">{article.category.name}</div>
            </div>
          </div>
        )}

        {/* محتوى البطاقة */}
        <div className={cn('p-4', variant === 'large' && 'flex flex-col justify-between h-full')}>
          {/* رأس المحتوى */}
          <div className="mb-4">
            {/* معلومات أساسية */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* أيقونة الكاتب للأحجام الصغيرة */}
                {variant !== 'large' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm">
                    {article.author.emoji ? (
                      <span>{article.author.emoji}</span>
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                )}
                <div>
                  <p className={cn('font-medium text-gray-900 dark:text-white', variant === 'small' ? 'text-xs' : 'text-sm')}>
                    {article.author.name}
                  </p>
                  {variant !== 'small' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {article.readTime} دقائق قراءة
                    </p>
                  )}
                </div>
              </div>

              {/* نسبة الملاءمة */}
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                getCompatibilityColor(article.compatibility)
              )}>
                <span>{getCompatibilityIcon(article.compatibility)}</span>
                <span>{article.compatibility}%</span>
              </div>
            </div>

            {/* العنوان */}
            <h3 className={cn(
              'font-bold leading-tight mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors',
              layout.titleSize,
              variant === 'small' ? 'line-clamp-2' : 'line-clamp-3'
            )}>
              {article.title}
            </h3>

            {/* الملخص - فقط للأحجام المتوسطة والكبيرة */}
            {layout.showFullContent && (
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
                {article.summary}
              </p>
            )}
          </div>

          {/* أسفل البطاقة */}
          <div className="mt-auto">
            {/* التصنيفات */}
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <span>{article.category.emoji}</span>
                <span>{article.category.name}</span>
              </div>

              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                sentimentColors[article.sentiment]
              )}>
                <span>{sentimentIcons[article.sentiment]}</span>
                <span>{article.sentiment}</span>
              </span>
            </div>

            {/* سبب الاقتراح - فقط للبطاقة الكبيرة */}
            {variant === 'large' && article.aiReason && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    <span className="font-medium text-blue-600 dark:text-blue-400">لماذا اقترحناه؟</span> {article.aiReason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* مؤشر التفاعل */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1">
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-xs text-white font-medium">اقرأ الآن</span>
          </div>
        </div>

        {/* خلفية متدرجة للتأثير البصري */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </Link>
  );
}