'use client';

import React, { useState, useEffect } from 'react';
import { errorMonitoringService, ErrorStats, ErrorReport } from '@/lib/services/ErrorMonitoringService';
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Filter,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ErrorDashboard: React.FC = () => {
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // تحديث الإحصائيات كل 30 ثانية
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    setIsLoading(true);
    try {
      const newStats = errorMonitoringService.getErrorStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to load error stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearErrors = () => {
    if (confirm('هل أنت متأكد من حذف جميع الأخطاء؟')) {
      errorMonitoringService.clearErrors();
      loadStats();
    }
  };

  const handleExportErrors = () => {
    if (!stats) return;
    
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600 dark:text-gray-400">جاري تحميل الإحصائيات...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">فشل في تحميل إحصائيات الأخطاء</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            لوحة مراقبة الأخطاء
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            مراقبة وتحليل أخطاء المحررات
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={loadStats}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
          <Button
            onClick={handleExportErrors}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير
          </Button>
          <Button
            onClick={handleClearErrors}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            مسح الكل
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">إجمالي الأخطاء</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {stats.totalErrors}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">أخطاء حرجة</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                {stats.errorsBySeverity.critical || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">أخطاء webpack</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                {stats.errorsByCategory.webpack || 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">الأخطاء الحديثة</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {stats.recentErrors.length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* الفلاتر */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            الفئة
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">جميع الفئات</option>
            {Object.keys(stats.errorsByCategory).map(category => (
              <option key={category} value={category}>
                {category} ({stats.errorsByCategory[category]})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            الخطورة
          </label>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">جميع المستويات</option>
            {Object.keys(stats.errorsBySeverity).map(severity => (
              <option key={severity} value={severity}>
                {severity} ({stats.errorsBySeverity[severity]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* قائمة الأخطاء الحديثة */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          الأخطاء الحديثة
        </h3>
        
        {stats.recentErrors.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">لا توجد أخطاء حديثة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentErrors
              .filter(error => 
                (selectedCategory === 'all' || error.category === selectedCategory) &&
                (selectedSeverity === 'all' || error.severity === selectedSeverity)
              )
              .map(error => (
                <div
                  key={error.id}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getSeverityColor(error.severity)}`}>
                          {getSeverityIcon(error.severity)}
                          {error.severity}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {error.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {error.context.component}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {error.error.message}
                      </p>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {error.timestamp.toLocaleString('ar-SA')}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => errorMonitoringService.markErrorAsResolved(error.id)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      تم الحل
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* أكثر الأخطاء تكراراً */}
      {stats.topErrors.length > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            أكثر الأخطاء تكراراً
          </h3>
          
          <div className="space-y-2">
            {stats.topErrors.slice(0, 5).map((error, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {error.message}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    آخر حدوث: {error.lastOccurred.toLocaleString('ar-SA')}
                  </p>
                </div>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded text-sm font-medium">
                  {error.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorDashboard;