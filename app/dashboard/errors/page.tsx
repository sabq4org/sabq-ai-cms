'use client';

import React, { useState, useEffect } from 'react';
import { getRecentErrors, clearErrorLogs, downloadErrorReport } from '@/lib/services/error-logger';
import { Trash2, Download, RefreshCcw, Filter } from 'lucide-react';

export default function ErrorManagementPage() {
  const [errors, setErrors] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'ignored' | 'actionable'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = () => {
    setLoading(true);
    try {
      const recentErrors = getRecentErrors(50);
      setErrors(recentErrors);
    } catch (error) {
      console.error('فشل في تحميل الأخطاء:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = () => {
    if (confirm('هل أنت متأكد من حذف جميع سجلات الأخطاء؟')) {
      clearErrorLogs();
      loadErrors();
    }
  };

  const handleDownloadReport = () => {
    downloadErrorReport();
  };

  const filteredErrors = errors.filter(error => {
    if (filter === 'ignored') return error.ignored;
    if (filter === 'actionable') return error.userActionable;
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">إدارة الأخطاء</h1>
        <p className="text-gray-600 dark:text-gray-400">
          مراقبة وإدارة الأخطاء في النظام
        </p>
      </div>

      {/* شريط الأدوات */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={loadErrors}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              تحديث
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              تحميل التقرير
            </button>
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              مسح السجلات
            </button>
          </div>

          {/* الفلاتر */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="all">جميع الأخطاء ({errors.length})</option>
              <option value="ignored">المتجاهلة ({errors.filter(e => e.ignored).length})</option>
              <option value="actionable">تحتاج تدخل ({errors.filter(e => e.userActionable).length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* قائمة الأخطاء */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            جاري تحميل الأخطاء...
          </div>
        ) : filteredErrors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا توجد أخطاء مسجلة
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredErrors.map((error, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        error.ignored 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          : error.userActionable
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}>
                        {error.ignored ? 'متجاهل' : error.userActionable ? 'يحتاج تدخل' : 'خطأ تقني'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {error.error.message}
                    </p>
                    {error.url && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        الصفحة: {error.url}
                      </p>
                    )}
                    {error.metadata && Object.keys(error.metadata).length > 0 && (
                      <details className="mt-2 text-sm">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                          تفاصيل إضافية
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto">
                          {JSON.stringify(error.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 