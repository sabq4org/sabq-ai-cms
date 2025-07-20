'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, Clock3, Eye, TrendingUp, Sparkles, Bot, User, Users } from 'lucide-react';

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
    metadata?: {
      title?: string;
      summary?: string;
      authorName?: string;
      categories?: string[];
      readingTime?: number;
      views?: number;
      featuredImage?: string;
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
  // استخدام البيانات الحقيقية من قاعدة البيانات
  const analysisDate = new Date(insight.analyzed_at).toLocaleDateString('ar-SA');
  const articleTitle = insight.metadata?.title || insight.article?.title || 'عنوان المقال غير متوفر';
  const authorName = insight.metadata?.authorName || insight.article?.author?.name || 'مؤلف غير معروف';
  const articleViews = insight.metadata?.views || insight.article?.views_count || 0;
  const readTime = insight.metadata?.readingTime || insight.article?.read_time || 5;
  const categoryName = insight.metadata?.categories?.[0] || insight.article?.categories?.[0]?.name || 'عام';
  const hasAI = insight.ai_summary;
  const analysisScore = insight.readability_score ? Math.round(Number(insight.readability_score) * 100) : null;
  
  // تحديد نوع التحليل
  const getAnalysisType = () => {
    if (hasAI && insight.updated_at !== insight.analyzed_at) {
      return { type: 'mixed', label: 'تحليل مشترك', icon: 'users' };
    } else if (hasAI) {
      return { type: 'ai', label: 'تحليل AI', icon: 'bot' };
    } else {
      return { type: 'human', label: 'تحليل بشري', icon: 'user' };
    }
  };
  
  const analysisType = getAnalysisType();
  
  // تحليل الوسوم
  const tagsArray: string[] = Array.isArray(insight.tags) 
    ? insight.tags 
    : typeof insight.tags === 'string' 
      ? (insight.tags as string).split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : [];

  // رابط المقال
  const articleUrl = `/insights/deep/${insight.id}`;
  
  return (
    <Link href={articleUrl} className="block">
      <article className={`p-4 rounded-2xl transition-all ${
        darkMode 
          ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-800/30' 
          : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200/50'
      }`}>
        {/* رأس البطاقة */}
        <div className="flex items-start gap-3 mb-3">
          {/* أيقونة نوع التحليل */}
          <div className={`p-2 rounded-lg ${
            analysisType.type === 'ai' 
              ? 'bg-gradient-to-br from-purple-500 to-purple-600'
              : analysisType.type === 'mixed'
              ? 'bg-gradient-to-br from-blue-500 to-blue-600'  
              : 'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            {analysisType.type === 'ai' && <Bot className="w-4 h-4 text-white" />}
            {analysisType.type === 'mixed' && <Users className="w-4 h-4 text-white" />}
            {analysisType.type === 'human' && <User className="w-4 h-4 text-white" />}
          </div>
          
          {/* المحتوى الرئيسي */}
          <div className="flex-1">
            {/* نوع التحليل والتصنيف */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold ${
                analysisType.type === 'ai' 
                  ? darkMode ? 'text-purple-400' : 'text-purple-600'
                  : analysisType.type === 'mixed'
                  ? darkMode ? 'text-blue-400' : 'text-blue-600'
                  : darkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                {analysisType.label}
              </span>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
              <span className={`text-xs ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                📁 {categoryName}
              </span>
            </div>
            
            {/* عنوان المقال - محسن ومضغوط */}
            <h3 className={`
              font-bold mb-2 leading-tight
              ${darkMode ? 'text-white' : 'text-gray-900'}
              line-clamp-2 min-h-[2.2rem]
            `}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.25',
              fontSize: '0.9rem',
              fontWeight: '700'
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
            
            {/* المعلومات السفلية محسنة */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3 text-xs">
                <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock3 className="w-3 h-3" />
                  {readTime} د
                </span>
                <span className={`flex items-center gap-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  <Eye className="w-3 h-3" />
                  {articleViews > 999 ? `${(articleViews / 1000).toFixed(1)}k` : articleViews}
                </span>
                {analysisScore && (
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    <TrendingUp className="w-3 h-3" />
                    {analysisScore}%
                  </span>
                )}
              </div>
              
              {/* التاريخ */}
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {analysisDate}
              </span>
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