'use client';

import React from 'react';
import { Newspaper, Tag, Users, Clock, TrendingUp } from 'lucide-react';

interface MobileStatsBarProps {
  stats: {
    articlesCount: number | null;
    categoriesCount: number | null;
    todayArticles?: number | null;
    activeUsers?: number | null;
    coveragePercentage?: number | null;
    loading?: boolean;
  };
  darkMode: boolean;
}

export default function MobileStatsBar({ stats, darkMode }: MobileStatsBarProps) {
  return (
    <div className={`w-full py-3 px-4 ${
      darkMode 
        ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700' 
        : 'bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200'
    }`}>
      <div className="flex items-center justify-around">
        {/* عدد المقالات */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <Newspaper className={`w-4 h-4 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              المقالات
            </p>
            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.loading || stats.articlesCount === null ? (
                <span className="inline-block w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                stats.articlesCount.toLocaleString()
              )}
            </p>
          </div>
        </div>

        {/* عدد التصنيفات */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
          }`}>
            <Tag className={`w-4 h-4 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              التصنيفات
            </p>
            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.loading || stats.categoriesCount === null ? (
                <span className="inline-block w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                stats.categoriesCount
              )}
            </p>
          </div>
        </div>

        {/* مقالات اليوم */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            darkMode ? 'bg-green-900/30' : 'bg-green-100'
          }`}>
            <Clock className={`w-4 h-4 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              اليوم
            </p>
            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.loading || stats.todayArticles === null ? (
                <span className="inline-block w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                stats.todayArticles || 0
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 