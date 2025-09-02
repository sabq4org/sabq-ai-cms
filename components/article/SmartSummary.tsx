'use client';

import React, { useState } from 'react';
import { useDarkMode } from "@/hooks/useDarkMode";
import { 
  Brain, Lightbulb, TrendingUp, Target, CheckCircle, 
  ChevronDown, ChevronUp, Clock, BookOpen, Zap,
  BarChart3, Users, Award, Sparkles
} from 'lucide-react';

interface SmartSummaryProps {
  summary: {
    id: string;
    brief_summary: string;
    key_points: string[];
    main_insights: string[];
    action_items?: string[];
    conclusion: string;
    reading_time_saved: number; // minutes saved by reading summary
    comprehension_score: number; // 0-100
    relevance_topics: string[];
    next_steps?: string[];
    related_concepts: string[];
  };
  articleTitle: string;
  originalReadingTime: number;
}

export default function SmartSummary({ summary, articleTitle, originalReadingTime }: SmartSummaryProps) {
  const { darkMode } = useDarkMode();
  const [expanded, setExpanded] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);

  const timeSavedPercentage = Math.round((summary.reading_time_saved / originalReadingTime) * 100);

  return (
    <div className={`
      my-12 rounded-3xl overflow-hidden max-w-full w-full
      ${darkMode 
        ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-800/50 shadow-2xl' 
        : 'bg-gray-50/80 border border-gray-200'
      }
    `}>
      {/* Header */}
      <div className={`
        px-6 py-6 border-b
        ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-blue-200 bg-white/50'}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              p-3 rounded-2xl
              ${darkMode ? 'bg-blue-900/50' : 'bg-blue-500/10'}
            `}>
              <Brain className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                خلاصة التحرير الذكي
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                مُولّدة بواسطة الذكاء الاصطناعي
              </p>
            </div>
          </div>

          {/* Time saved indicator */}
          <div className={`
            px-4 py-2 rounded-xl text-center
            ${darkMode ? 'bg-green-900/30 border border-green-800/70' : 'bg-green-50 border border-green-200'}
          `}>
            <div className="flex items-center justify-center gap-1">
              <Clock className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {summary.reading_time_saved} دقائق
              </div>
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              توفير {timeSavedPercentage}% من الوقت
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Brief Summary */}
        <div className="mb-6">
          <div className={`
            text-lg leading-relaxed p-5 rounded-xl
            ${darkMode ? 'bg-indigo-900/20' : 'bg-white/70'}
            border ${darkMode ? 'border-indigo-800/50' : 'border-blue-200'}
          `}>
            <p className={`${darkMode ? 'text-gray-100' : 'text-gray-800'} text-lg`}>
              {summary.brief_summary}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className={`
            text-center p-3 rounded-xl
            ${darkMode ? 'bg-blue-900/20' : 'bg-white/50'}
          `}>
            <BarChart3 className={`w-7 h-7 mx-auto mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {summary.comprehension_score}%
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              مستوى الفهم
            </div>
          </div>

          <div className={`
            text-center p-3 rounded-xl
            ${darkMode ? 'bg-amber-900/20' : 'bg-white/50'}
          `}>
            <Lightbulb className={`w-7 h-7 mx-auto mb-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {summary.key_points.length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              نقاط رئيسية
            </div>
          </div>

          <div className={`
            text-center p-3 rounded-xl
            ${darkMode ? 'bg-purple-900/20' : 'bg-white/50'}
          `}>
            <Sparkles className={`w-7 h-7 mx-auto mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {summary.main_insights.length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              رؤى ثاقبة
            </div>
          </div>

          <div className={`
            text-center p-3 rounded-xl
            ${darkMode ? 'bg-green-900/20' : 'bg-white/50'}
          `}>
            <Target className={`w-7 h-7 mx-auto mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {summary.relevance_topics.length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              مواضيع ذات صلة
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="mb-6">
          <h4 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <CheckCircle className="w-6 h-6 text-green-500" />
            النقاط الرئيسية
          </h4>
          <div className="space-y-2">
            {summary.key_points.map((point, index) => (
              <div 
                key={index}
                className={`
                  flex items-start gap-3 p-4 rounded-lg
                  ${darkMode ? 'bg-blue-900/20' : 'bg-white/70'}
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}
                `}>
                  {index + 1}
                </div>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable Detailed Analysis */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`
              w-full flex items-center justify-between p-4 rounded-lg
              transition-colors hover:bg-blue-100/30 dark:hover:bg-blue-800/30
              ${darkMode ? 'text-white' : 'text-gray-900'}
            `}
          >
            <span className="font-medium">تحليل مفصل ورؤى إضافية</span>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {expanded && (
            <div className="mt-4 space-y-6">
              {/* Main Insights */}
              <div>
                <h5 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  الرؤى الثاقبة
                </h5>
                <div className="space-y-2">
                  {summary.main_insights.map((insight, index) => (
                    <div 
                      key={index}
                      className={`
                        p-4 rounded-lg border-r-4 border-purple-400
                        ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}
                      `}
                    >
                      <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              {summary.action_items && summary.action_items.length > 0 && (
                <div>
                  <h5 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Zap className="w-6 h-6 text-orange-500" />
                    خطوات عملية
                  </h5>
                  <div className="space-y-2">
                    {summary.action_items.map((action, index) => (
                      <div 
                        key={index}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg
                          ${darkMode ? 'bg-orange-900/10' : 'bg-orange-50'}
                        `}
                      >
                        <Zap className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Concepts */}
              <div>
                <h5 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <BookOpen className="w-6 h-6 text-blue-500" />
                  مفاهيم ذات صلة
                </h5>
                <div className="flex flex-wrap gap-2">
                  {summary.related_concepts.map((concept, index) => (
                    <span 
                      key={index}
                      className={`
                        px-3 py-1 rounded-full text-sm
                        ${darkMode 
                          ? 'bg-blue-900/20 text-blue-400 border border-blue-800' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }
                      `}
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        {summary.next_steps && summary.next_steps.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setShowNextSteps(!showNextSteps)}
              className={`
                w-full flex items-center justify-between p-4 rounded-lg
                transition-colors hover:bg-green-100/30 dark:hover:bg-green-800/30
                ${darkMode ? 'text-white' : 'text-gray-900'}
              `}
            >
              <span className="font-medium flex items-center gap-2">
                <Target className="w-6 h-6 text-green-500" />
                الخطوات التالية المقترحة
              </span>
              {showNextSteps ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showNextSteps && (
              <div className="mt-4">
                <div className="space-y-2">
                  {summary.next_steps.map((step, index) => (
                    <div 
                      key={index}
                      className={`
                        flex items-start gap-3 p-3 rounded-lg
                        ${darkMode ? 'bg-green-900/10' : 'bg-green-50'}
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${darkMode ? 'bg-green-800 text-green-200' : 'bg-green-200 text-green-800'}
                      `}>
                        {index + 1}
                      </div>
                      <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conclusion */}
        <div className={`
          mt-6 p-4 rounded-xl
          ${darkMode 
            ? 'bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-800' 
            : 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'
          }
        `}>
          <h5 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Award className="w-6 h-6 text-indigo-500" />
            خلاصة القول
          </h5>
          <p className={`leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {summary.conclusion}
          </p>
        </div>
      </div>
    </div>
  );
}