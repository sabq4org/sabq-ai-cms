'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, Clock3, Eye, TrendingUp, Sparkles } from 'lucide-react';

interface MobileDeepAnalysisCardProps {
  insight: {
    id: string;
    title: string;
    summary: string;
    author: string;
    createdAt: string;
    readTime: number;
    views: number;
    aiConfidence: number;
    tags: string[];
    type: 'AI' | 'تحليل عميق';
    analysisType?: 'manual' | 'ai' | 'mixed';
    url: string;
    isNew?: boolean;
    qualityScore?: number;
    category?: string;
  };
  darkMode: boolean;
}

export default function MobileDeepAnalysisCard({ insight, darkMode }: MobileDeepAnalysisCardProps) {
  const isAI = insight.type === 'AI';
  
  return (
    <Link href={insight.url} className="block">
      <article className={`p-4 rounded-2xl transition-all ${
        darkMode 
          ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-800/30' 
          : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200/50'
      }`}>
        {/* رأس البطاقة */}
        <div className="flex items-start gap-3 mb-3">
          {/* أيقونة التحليل */}
          <div className={`p-2.5 rounded-xl ${
            isAI 
              ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
          }`}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          
          {/* المحتوى الرئيسي */}
          <div className="flex-1">
            {/* نوع التحليل والتصنيف */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold ${
                isAI 
                  ? darkMode ? 'text-purple-400' : 'text-purple-600'
                  : darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {isAI ? 'تحليل AI' : 'تحليل عميق'}
              </span>
              {insight.category && (
                <>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {insight.category}
                  </span>
                </>
              )}
            </div>
            
            {/* العنوان - محسن للرؤية */}
            <h3 className={`
              font-bold mb-2 leading-tight
              ${darkMode ? 'text-white' : 'text-gray-900'}
              line-clamp-2 min-h-[2.5rem]
            `}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.3',
              fontSize: '0.95rem',
              fontWeight: '700'
            }}
            >
              {insight.title}
            </h3>
            
            {/* الملخص - سطر واحد فقط */}
            <p className={`text-xs line-clamp-1 mb-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {insight.summary}
            </p>
            
            {/* الوسوم - أول وسمين فقط */}
            <div className="flex gap-1 mb-2">
              {insight.tags.slice(0, 2).map((tag, idx) => (
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
              {insight.tags.length > 2 && (
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  +{insight.tags.length - 2}
                </span>
              )}
            </div>
            
            {/* المعلومات السفلية */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock3 className="w-3 h-3" />
                  {insight.readTime} د
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {insight.views > 999 ? `${(insight.views / 1000).toFixed(1)}k` : insight.views}
                </span>
              </div>
              
              {/* مؤشر الجودة */}
              {insight.qualityScore && insight.qualityScore >= 85 && (
                <div className="flex items-center gap-1">
                  <Sparkles className={`w-3.5 h-3.5 ${
                    insight.qualityScore >= 90 ? 'text-yellow-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-xs font-bold ${
                    insight.qualityScore >= 90 
                      ? darkMode ? 'text-yellow-400' : 'text-yellow-600'
                      : darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {insight.qualityScore}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
} 