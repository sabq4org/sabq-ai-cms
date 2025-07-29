'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Sparkles, Brain, MessageSquare, Zap, BarChart3 } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import type { RecommendedArticle } from '@/lib/ai-recommendations';

// توسيع النوع لإضافة خصائص إضافية
interface ExtendedRecommendedArticle extends RecommendedArticle {
  slug?: string;
  excerpt?: string;
  featured_image?: string;
  category_name?: string;
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
    <Link href={article.slug ? `/article/${article.slug}` : article.url} className="block">
      <div className={`
        smart-content-news-card relative overflow-hidden rounded-xl transition-all duration-300
        ${darkMode 
          ? 'bg-gradient-to-br from-gray-800 to-gray-850 hover:from-gray-750 hover:to-gray-800' 
          : 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100'
        }
        border-2 ${darkMode ? 'border-gray-700' : 'border-blue-200'}
        shadow-lg hover:shadow-xl transform hover:-translate-y-1
      `}>
        {/* شارة "مخصص لك" */}
        <div className={`
          absolute top-2 left-2 z-10 px-3 py-1 rounded-full text-xs font-bold
          ${darkMode 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
          }
          shadow-md
        `}>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            مخصص لك بذكاء
          </span>
        </div>

        <div className={`p-4 ${variant === 'compact' ? 'flex gap-4' : ''}`}>
          {/* الصورة */}
                     <div className={`
             relative overflow-hidden rounded-lg
             ${variant === 'compact' ? 'w-24 h-24 flex-shrink-0' : 'w-full h-48 mb-4'}
           `}>
             <SafeImage
               src={article.featured_image || article.thumbnail}
               alt={article.title}
               fill
               className="object-cover"
               fallbackType="article"
             />
            {/* تأثير التدرج */}
            <div className={`
              absolute inset-0 bg-gradient-to-t from-black/50 to-transparent
              ${variant === 'compact' ? 'hidden' : ''}
            `} />
          </div>

          <div className="flex-1">
            {/* أيقونة النوع والعبارة التحفيزية */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}>
                  <IconComponent className={`w-4 h-4 ${color}`} />
                </div>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {phrase}
                </span>
              </div>
                             {article.reason && (
                 <span className={`
                   text-xs px-2 py-1 rounded-full
                   ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
                 `}>
                   {article.reason}
                 </span>
               )}
            </div>

            {/* العنوان */}
            <h3 className={`
              font-bold line-clamp-2 mb-2
              ${variant === 'compact' ? 'text-sm' : 'text-lg'}
              ${darkMode ? 'text-white' : 'text-gray-900'}
            `}>
              {article.title}
            </h3>

            {/* المقتطف - للعرض الكامل فقط */}
            {variant === 'full' && article.excerpt && (
              <p className={`
                text-sm line-clamp-2 mb-3
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {article.excerpt}
              </p>
            )}

            {/* المعلومات الإضافية */}
                         <div className="flex items-center justify-between">
               <div className="flex items-center gap-3 text-xs">
                 {(article.category_name || article.category) && (
                   <span className={`
                     px-2 py-1 rounded-full font-medium
                     ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
                   `}>
                     {article.category_name || article.category}
                   </span>
                 )}
                 {article.readingTime && (
                   <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                     {article.readingTime} دقيقة قراءة
                   </span>
                 )}
               </div>
               
               {/* مؤشر الأداء */}
               {article.engagement && article.engagement > 0.1 && (
                 <div className="flex items-center gap-1">
                   <div className="flex -space-x-1">
                     {[...Array(Math.min(5, Math.floor(article.engagement * 10)))].map((_, i) => (
                      <div 
                        key={i} 
                        className={`
                          w-1.5 h-1.5 rounded-full
                          ${darkMode ? 'bg-yellow-400' : 'bg-yellow-500'}
                        `} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* تأثيرات بصرية إضافية */}
        <div className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full blur-2xl opacity-30 bg-gradient-to-br from-blue-500 to-purple-500" />
        <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full blur-2xl opacity-20 bg-gradient-to-br from-pink-500 to-orange-500" />
      </div>
    </Link>
  );
} 