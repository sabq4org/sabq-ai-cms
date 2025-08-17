'use client';

import React, { useState } from 'react';
import { useErrorMonitoring } from '@/hooks/useErrorMonitoring';
import { AlertTriangle, Bug, TrendingUp, Clock, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ErrorStatsPanel: React.FC<ErrorStatsPanelProps> = ({ isOpen, onClose }) => {
  const { errorStats, recentErrors, clearErrors, markAsResolved } = useErrorMonitoring();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'recent' | 'trends'>('overview');

  if (!isOpen || !errorStats) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'webpack': return '📦';
      case 'runtime': return '⚡';
      case 'network': return '🌐';
      case 'validation': return '✅';
      default: return '❓';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Bug className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              إحصائيات الأخطاء
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: AlertTriangle },
            { id: 'recent', label: 'الأخطاء الحديثة', icon: Clock },
            { id: 'trends', label: 'الاتجاهات', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {errorStats.totalErrors}
                      </div>
                      <div className="text-sm text-red-500">إجمالي الأخطاء</div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {errorStats.recentErrors.length}
                      </div>
                      <div className="text-sm text-orange-500">آخر 24 ساعة</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bug className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {errorStats.topErrors.length}
                      </div>
                      <div className="text-sm text-blue-500">أنواع مختلفة</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* الأخطاء حسب الفئة */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  الأخطاء حسب الفئة
                </h3>
                <div className="space-y-2">
                  {Object.entries(errorStats.errorsByCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoryIcon(category)}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {category}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* الأخطاء حسب الخطورة */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  الأخطاء حسب الخطورة
                </h3>
                <div className="space-y-2">
                  {Object.entries(errorStats.errorsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(severity)}`}>
                        {severity}
                      </span>
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'recent' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  الأخطاء الحديثة
                </h3>
                <Button
                  onClick={clearErrors}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  مسح الكل
                </Button>
              </div>

              {recentErrors.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  لا توجد أخطاء حديثة
                </div>
              ) : (
                <div className="space-y-3">
                  {recentErrors.map((error) => (
                    <div key={error.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(error.severity)}`}>
                              {error.severity}
                            </span>
                            <span className="text-xs text-gray-500">
                              {error.timestamp.toLocaleString('ar')}
                            </span>
                          </div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {error.error.message}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            المكون: {error.context.component}
                          </div>
                        </div>
                        <Button
                          onClick={() => markAsResolved(error.id)}
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'trends' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                اتجاهات الأخطاء (آخر 7 أيام)
              </h3>
              
              <div className="space-y-2">
                {errorStats.errorTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-gray-100">
                      {new Date(trend.date).toLocaleDateString('ar')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((trend.count / Math.max(...errorStats.errorTrends.map(t => t.count))) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-400 min-w-[2rem]">
                        {trend.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* أكثر الأخطاء تكراراً */}
              <div>
                <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  أكثر الأخطاء تكراراً
                </h4>
                <div className="space-y-2">
                  {errorStats.topErrors.slice(0, 5).map((topError, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {topError.message}
                        </div>
                        <div className="text-xs text-gray-500">
                          آخر حدوث: {topError.lastOccurred.toLocaleString('ar')}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-red-600 ml-4">
                        {topError.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorStatsPanel;