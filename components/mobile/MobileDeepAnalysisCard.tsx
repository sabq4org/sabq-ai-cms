'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, Clock3, Eye, TrendingUp, Sparkles } from 'lucide-react';

interface MobileDeepAnalysisCardProps {
  insight: {
    id: string;
    article_id: string;
    ai_summary: string;
    key_topics: string[];
    tags: string[];
    sentiment: string;
    readability_score: number;
    engagement_score: number;
    analyzed_at: string;
    updated_at: string;
    article: {
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
  // استخدام البيانات الحقيقية من قاعدة البيانات
  const analysisDate = new Date(insight.analyzed_at).toLocaleDateString('ar-SA');
  const articleTitle = insight.article?.title || 'عنوان المقال غير متوفر';
  const authorName = insight.article?.author?.name || 'مؤلف غير معروف';
  const articleViews = insight.article?.views_count || 0;
  const readTime = insight.article?.read_time || 5;
  
  // تحليل الوسوم
  const tagsArray: string[] = Array.isArray(insight.tags) 
    ? insight.tags 
    : typeof insight.tags === 'string' 
      ? (insight.tags as string).split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : [];

  // رابط المقال
  const articleUrl = `/articles/${insight.article?.id}`;
  
  return (
    <Link href={articleUrl} className="block">
      <article className={`p-4 rounded-2xl transition-all ${
        darkMode 
          ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-800/30' 
          : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200/50'
      }`}>
        {/* رأس البطاقة */}
        <div className="flex items-start gap-3 mb-3">
          {/* أيقونة التحليل */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
            <Brain className="w-5 h-5 text-white" />
          </div>
          
          {/* المحتوى الرئيسي */}
          <div className="flex-1">
            {/* نوع التحليل والتاريخ */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                تحليل عميق
              </span>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {analysisDate}
              </span>
            </div>
            
            {/* عنوان المقال - محسن للرؤية */}
            <h3 className={`
              font-bold mb-2 leading-tight
              ${darkMode ? 'text-white' : 'text-gray-900'}
              line-clamp-2 min-h-[2.5rem] deep-analysis-title arabic-text
            `}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.3',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: darkMode ? '#ffffff' : '#1a202c'
            }}
            >
              {articleTitle}
            </h3>
            
            {/* ملخص التحليل الذكي - سطر واحد فقط */}
            <p className={`text-xs line-clamp-1 mb-2 deep-analysis-summary arabic-text ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
            style={{
              color: darkMode ? '#e2e8f0' : '#4a5568'
            }}>
              {insight.ai_summary || 'ملخص التحليل الذكي غير متوفر'}
            </p>
            
            {/* الوسوم - أول وسمين فقط */}
            {tagsArray.length > 0 && (
              <div className="flex gap-1 mb-2">
                {tagsArray.slice(0, 2).map((tag: string, idx: number) => (
                  <span 
                    key={idx} 
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      darkMode 
                        ? 'bg-purple-900/30 text-purple-300' 
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
                {tagsArray.length > 2 && (
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    +{tagsArray.length - 2}
                  </span>
                )}
              </div>
            )}
            
            {/* المعلومات السفلية */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock3 className="w-3 h-3" />
                  {readTime} د
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {articleViews > 999 ? `${(articleViews / 1000).toFixed(1)}k` : articleViews}
                </span>
              </div>
              
              {/* مؤشر القابلية للقراءة */}
              {insight.readability_score && insight.readability_score >= 70 && (
                <div className="flex items-center gap-1">
                  <Sparkles className={`w-3.5 h-3.5 ${
                    insight.readability_score >= 85 ? 'text-yellow-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-xs font-bold ${
                    insight.readability_score >= 85 
                      ? darkMode ? 'text-yellow-400' : 'text-yellow-600'
                      : darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {Math.round(insight.readability_score)}%
                  </span>
                </div>
              )}
            </div>
            
            {/* اسم المؤلف */}
            <div className="mt-2 pt-2 border-t border-gray-200/30">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                بواسطة: {authorName}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
} 