'use client';

import React, { useState } from 'react';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import { Activity, Zap, MemoryStick, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PerformanceMonitorProps {
  pageName: string;
  isVisible?: boolean;
  onClose?: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  pageName,
  isVisible = false,
  onClose
}) => {
  const { metrics, optimizePerformance } = usePagePerformance(pageName);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) return null;

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatMemory = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              مراقب الأداء
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setIsMinimized(!isMinimized)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              {isMinimized ? '▲' : '▼'}
            </Button>
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4 space-y-3 min-w-[280px]">
            {/* Page Name */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {pageName}
            </div>

            {/* Metrics */}
            <div className="space-y-2">
              {/* Load Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    وقت التحميل
                  </span>
                </div>
                <span className={`text-sm font-medium ${getPerformanceColor(metrics.loadTime, { good: 1000, warning: 3000 })}`}>
                  {formatTime(metrics.loadTime)}
                </span>
              </div>

              {/* Render Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    وقت الرندر
                  </span>
                </div>
                <span className={`text-sm font-medium ${getPerformanceColor(metrics.renderTime, { good: 100, warning: 500 })}`}>
                  {formatTime(metrics.renderTime)}
                </span>
              </div>

              {/* Memory Usage */}
              {metrics.memoryUsage > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      استهلاك الذاكرة
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 100 })}`}>
                    {formatMemory(metrics.memoryUsage)}
                  </span>
                </div>
              )}
            </div>

            {/* Performance Status */}
            <div className={`p-2 rounded text-center text-xs font-medium ${
              metrics.isSlowPage
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              {metrics.isSlowPage ? '🐌 أداء بطيء' : '⚡ أداء جيد'}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <Button
                onClick={optimizePerformance}
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
              >
                تحسين الأداء
              </Button>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
              >
                إعادة تحميل
              </Button>
            </div>

            {/* Tips */}
            {metrics.isSlowPage && (
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                💡 نصائح: تحقق من اتصال الإنترنت، أغلق التبويبات غير المستخدمة، أو جرب إعادة تحميل الصفحة
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;