'use client';

import React, { useState } from 'react';
import { Quote, Copy, Share2, CheckCircle, Sparkles, Brain, Zap } from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface SmartQuoteCardProps {
  quote: {
    id: string;
    text: string;
    context?: string;
    importance_score: number; // 0-100
    emotional_impact: 'high' | 'medium' | 'low';
    quote_type: 'key_insight' | 'call_to_action' | 'expert_opinion' | 'data_point' | 'conclusion';
    position_in_article: number; // percentage through article
  };
  articleTitle: string;
  authorName?: string;
}

const quoteTypeConfig = {
  key_insight: { 
    label: 'نظرة ثاقبة', 
    icon: Brain, 
    color: 'blue',
    bgClass: 'from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800'
  },
  call_to_action: { 
    label: 'دعوة للعمل', 
    icon: Zap, 
    color: 'orange',
    bgClass: 'from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-800'
  },
  expert_opinion: { 
    label: 'رأي خبير', 
    icon: Sparkles, 
    color: 'purple',
    bgClass: 'from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800'
  },
  data_point: { 
    label: 'إحصائية مهمة', 
    icon: () => <span className="text-lg">📊</span>, 
    color: 'green',
    bgClass: 'from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800'
  },
  conclusion: { 
    label: 'خلاصة', 
    icon: () => <span className="text-lg">✨</span>, 
    color: 'indigo',
    bgClass: 'from-indigo-500/10 to-indigo-600/10 border-indigo-200 dark:border-indigo-800'
  }
};

export default function SmartQuoteCard({ quote, articleTitle, authorName }: SmartQuoteCardProps) {
  const { darkMode } = useDarkModeContext();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const config = quoteTypeConfig[quote.quote_type];
  const IconComponent = config.icon;

  const handleCopy = async () => {
    const textToCopy = `"${quote.text}"\n\n— من مقال: ${articleTitle}${authorName ? `\nبقلم: ${authorName}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('فشل في النسخ:', error);
    }
  };

  const handleShare = async () => {
    const shareText = `"${quote.text}"\n\n— من مقال: ${articleTitle}${authorName ? `\nبقلم: ${authorName}` : ''}`;
    
    try {
      await navigator.share({
        title: 'اقتباس من سبق',
        text: shareText,
        url: window.location.href
      });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (error) {
      // Fallback to copy
      handleCopy();
    }
  };

  const getImportanceIndicator = () => {
    if (quote.importance_score >= 80) return { color: 'text-red-500', label: 'عالي الأهمية' };
    if (quote.importance_score >= 60) return { color: 'text-yellow-500', label: 'مهم' };
    return { color: 'text-green-500', label: 'مفيد' };
  };

  const importance = getImportanceIndicator();

  return (
    <div className={`
      my-8 mx-auto max-w-2xl
      bg-gradient-to-br ${config.bgClass}
      border-2 rounded-2xl p-6
      transform transition-all duration-300 hover:scale-105 hover:shadow-xl
      ${darkMode ? 'shadow-gray-900/50' : 'shadow-gray-200/50'}
    `}>
      {/* Header with type and importance */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`
            p-2 rounded-full 
            ${darkMode ? 'bg-gray-700' : 'bg-white'} 
            shadow-md
          `}>
            {typeof IconComponent === 'function' ? <IconComponent /> : <IconComponent className="w-4 h-4" />}
          </div>
          <div>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {config.label}
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${importance.color.replace('text-', 'bg-')}`} />
              <span className={`text-xs ${importance.color}`}>
                {importance.label}
              </span>
            </div>
          </div>
        </div>

        {/* Progress indicator showing position in article */}
        <div className="flex items-center gap-2">
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {Math.round(quote.position_in_article)}% من المقال
          </div>
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current transition-all duration-300"
              style={{ 
                width: `${quote.position_in_article}%`,
                color: config.color === 'blue' ? '#3B82F6' : 
                       config.color === 'orange' ? '#F97316' :
                       config.color === 'purple' ? '#8B5CF6' :
                       config.color === 'green' ? '#10B981' : '#6366F1'
              }}
            />
          </div>
        </div>
      </div>

      {/* Quote content */}
      <div className="relative">
        <Quote className={`absolute -top-2 -left-2 w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
        <blockquote className={`
          text-lg sm:text-xl leading-relaxed font-medium pr-6
          ${darkMode ? 'text-white' : 'text-gray-900'}
        `}>
          {quote.text}
        </blockquote>
      </div>

      {/* Context if available */}
      {quote.context && (
        <div className={`
          mt-4 text-sm italic 
          ${darkMode ? 'text-gray-400' : 'text-gray-600'}
          border-r-2 pr-4
          ${config.color === 'blue' ? 'border-blue-300 dark:border-blue-700' : 
            config.color === 'orange' ? 'border-orange-300 dark:border-orange-700' :
            config.color === 'purple' ? 'border-purple-300 dark:border-purple-700' :
            config.color === 'green' ? 'border-green-300 dark:border-green-700' : 'border-indigo-300 dark:border-indigo-700'}
        `}>
          السياق: {quote.context}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {/* Emotional impact indicator */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">التأثير:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`w-1.5 h-1.5 rounded-full ${
                    (quote.emotional_impact === 'high' && level <= 3) ||
                    (quote.emotional_impact === 'medium' && level <= 2) ||
                    (quote.emotional_impact === 'low' && level <= 1)
                      ? 'bg-red-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm
              transition-all hover:scale-105
              ${darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>

          <button
            onClick={handleShare}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm
              transition-all hover:scale-105
              ${darkMode 
                ? 'bg-blue-900/20 hover:bg-blue-900/30 text-blue-400' 
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
              }
            `}
          >
            {shared ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{shared ? 'تم المشاركة' : 'مشاركة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}