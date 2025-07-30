'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Sparkles, Brain, MessageSquare, Zap, BarChart3, Clock, Eye, ArrowLeft } from 'lucide-react';
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
  variant?: 'compact' | 'full' | 'desktop';
  position?: number; // لتحديد مكان البطاقة في القائمة
}

// الأيقونات حسب نوع المحتوى
const typeIcons: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  'article': { icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'analysis': { icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  'opinion': { icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-50' },
  'creative': { icon: Sparkles, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  'quick': { icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  'insight': { icon: BarChart3, color: 'text-indigo-600', bgColor: 'bg-indigo-50' }
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

// صور تجريبية للبطاقات المخصصة
const demoImages = [
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517654443271-11c621d19e60?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1478940020726-e9e191651f1a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop'
];

export default function SmartContentNewsCard({ 
  article, 
  darkMode, 
  variant = 'full',
  position = 0 
}: SmartContentNewsCardProps) {
  const typeData = typeIcons[article.type || article.metadata?.type || 'article'] || typeIcons.article;
  const { icon: IconComponent, color, bgColor } = typeData;
  const phrase = motivationalPhrases[position % motivationalPhrases.length];
  
  // اختيار صورة تجريبية إذا لم تكن هناك صورة
  const imageUrl = article.featured_image || article.thumbnail || demoImages[position % demoImages.length];

  // البطاقة للنسخة الكاملة (Desktop)
  if (variant === 'desktop') {
    return (
      <Link href={article.slug ? `/article/${article.slug}` : article.url} className="group block">
        <article className={`
          h-full rounded-3xl overflow-hidden shadow-xl transition-all duration-300 transform
          ${darkMode 
            ? 'bg-gradient-to-br from-gray-800 via-purple-900/20 to-blue-900/20 border border-purple-700/30' 
            : 'bg-gradient-to-br from-white via-purple-50 to-blue-50 border border-purple-200'
          } 
          group-hover:scale-[1.02] group-hover:shadow-2xl relative
        `}>
          {/* شريط "مخصص لك" */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-center py-1 text-xs font-bold">
            <Sparkles className="inline-block w-3 h-3 mr-1" />
            محتوى مخصص لك بذكاء
          </div>

          {/* صورة المقال */}
          <div className="relative h-40 sm:h-48 overflow-hidden mt-6">
            <CloudImage
              src={imageUrl}
              alt={article.title}
              fill
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fallbackType="article"
            />
            {/* تأثير التدرج */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* محتوى البطاقة */}
          <div className="p-4 sm:p-5">
            {/* نوع المحتوى والسبب */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                <IconComponent className={`w-3 h-3 ${color}`} />
                <span className="font-medium">{phrase}</span>
              </div>
              {article.reason && (
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  • {article.reason}
                </span>
              )}
            </div>

            {/* العنوان */}
            <h4 className={`font-semibold text-base sm:text-lg mb-3 line-clamp-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            } transition-colors`}>
              {article.title}
            </h4>

            {/* الملخص - فقط للنسخة الكاملة */}
            {article.excerpt && (
              <p className={`text-sm mb-4 line-clamp-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {article.excerpt}
              </p>
            )}

            {/* التفاصيل السفلية */}
            <div className={`flex items-center justify-between pt-3 sm:pt-4 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3 text-xs">
                {(article.category_name || article.category) && (
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {article.category_name || article.category}
                  </span>
                )}
                {article.readingTime && (
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3 h-3" />
                    {article.readingTime} د
                  </span>
                )}
                {article.engagement && article.engagement > 0.3 && (
                  <span className="text-yellow-500">⭐ مميز</span>
                )}
              </div>
              
              {/* زر القراءة */}
              <div className={`p-2 rounded-xl transition-all ${
                darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
              }`}>
                <ArrowLeft className={`w-4 h-4 transition-transform ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // البطاقة للنسخة المخصصة للهواتف (مع ألوان جذابة)
  return (
    <Link href={article.slug ? `/article/${article.slug}` : article.url} className="block w-full">
      <article className={`
        smart-content-news-card relative overflow-hidden transition-all border
        ${darkMode 
          ? 'bg-gradient-to-r from-gray-800 via-gray-800/95 to-gray-800 border-gray-700/50 active:bg-gray-700/50' 
          : 'bg-gradient-to-r from-white via-gray-50/30 to-white border-gray-200 active:bg-gray-50'
        }
        shadow-sm hover:shadow-md
      `}>
        <div className="flex items-start p-4 gap-4">
          {/* الصورة - مربعة صغيرة مثل البطاقات العادية */}
          <div className={`
            relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700
            ${variant === 'compact' || variant === 'full' ? 'w-24 h-24' : 'w-20 h-20'}
          `}>
            <CloudImage
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="96px"
              fallbackType="article"
            />
            {/* شارة مخصص لك صغيرة في زاوية الصورة */}
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded flex items-center gap-0.5 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              <span className="text-[10px]">مخصص</span>
            </div>
          </div>

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            {/* التصنيف والمؤشرات */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* أيقونة النوع */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                darkMode ? `${bgColor} ${color}` : `${bgColor} ${color}`
              }`}>
                <IconComponent className={`w-3 h-3`} />
                <span className="text-[11px] font-medium">{phrase}</span>
              </div>
              {article.reason && (
                <span className={`text-[10px] ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                } font-medium`}>
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
              <div className="flex items-center gap-3 text-xs">
                {(article.category_name || article.category) && (
                  <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>
                    {article.category_name || article.category}
                  </span>
                )}
                {article.readingTime && (
                  <span className={darkMode ? 'text-green-400' : 'text-green-600'}>
                    {article.readingTime} دقيقة
                  </span>
                )}
              </div>
              
              {/* مؤشر الأداء المبسط */}
              {article.engagement && article.engagement > 0.3 && (
                <span className="text-[10px] text-yellow-500 font-bold">⭐ مميز</span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
} 