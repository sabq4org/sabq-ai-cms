'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  RefreshCw, Trash2, Database, CheckCircle, AlertCircle, 
  Loader2, Server, Info, Zap, Shield, Clock
} from 'lucide-react';

interface CacheStats {
  cacheReady: boolean;
  message: string;
}

export default function CacheManagementPage() {
  const [loading, setLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [clearingType, setClearingType] = useState<string | null>(null);

  // جلب حالة الكاش
  const fetchCacheStatus = async () => {
    try {
      const response = await fetch('/api/cache/clear');
      const data = await response.json();
      setCacheStats(data);
    } catch (error) {
      console.error('Error fetching cache status:', error);
      toast.error('فشل في جلب حالة الكاش');
    }
  };

  useEffect(() => {
    fetchCacheStatus();
  }, []);

  // مسح الكاش
  const clearCache = async (type: string) => {
    if (loading) return;

    const confirmMessage = type === 'all' 
      ? 'هل أنت متأكد من مسح جميع الكاش؟ قد يؤثر هذا على أداء الموقع مؤقتاً.'
      : 'هل أنت متأكد من متابعة العملية؟';

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    setClearingType(type);

    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchCacheStatus(); // تحديث الحالة
      } else {
        toast.error(data.error || 'فشل في مسح الكاش');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('حدث خطأ في مسح الكاش');
    } finally {
      setLoading(false);
      setClearingType(null);
    }
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            إدارة الكاش (Cache)
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            إدارة وتحسين أداء التخزين المؤقت للموقع
          </p>
        </div>

        {/* حالة الكاش */}
        <div className={`rounded-lg p-6 mb-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              حالة Redis Cache
            </h2>
            <button
              onClick={fetchCacheStatus}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {cacheStats && (
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className={`p-3 rounded-full ${
                cacheStats.cacheReady 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                {cacheStats.cacheReady ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {cacheStats.message}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  حالة الاتصال: {cacheStats.cacheReady ? 'متصل' : 'غير متصل'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* أزرار مسح الكاش */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* مسح كل الكاش */}
          <button
            onClick={() => clearCache('all')}
            disabled={loading}
            className={`p-6 rounded-lg border-2 transition-all ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-red-600 hover:bg-red-900/20' 
                : 'bg-white border-gray-200 hover:border-red-500 hover:bg-red-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col items-center space-y-3">
              {clearingType === 'all' && loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              ) : (
                <Database className="w-8 h-8 text-red-600" />
              )}
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                مسح جميع الكاش
              </h3>
              <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                مسح كامل للتخزين المؤقت (المقالات، التصنيفات، المستخدمين)
              </p>
            </div>
          </button>

          {/* مسح كاش المقالات */}
          <button
            onClick={() => clearCache('articles')}
            disabled={loading}
            className={`p-6 rounded-lg border-2 transition-all ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-blue-600 hover:bg-blue-900/20' 
                : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col items-center space-y-3">
              {clearingType === 'articles' && loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              ) : (
                <Trash2 className="w-8 h-8 text-blue-600" />
              )}
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                مسح كاش المقالات
              </h3>
              <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                مسح التخزين المؤقت للمقالات فقط
              </p>
            </div>
          </button>
        </div>

        {/* معلومات إضافية */}
        <div className={`rounded-lg p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            معلومات مهمة
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3 space-x-reverse">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ما هو الكاش؟
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  الكاش هو تخزين مؤقت للبيانات لتسريع الوصول إليها وتحسين أداء الموقع
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-x-reverse">
              <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  متى يجب مسح الكاش؟
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  عند عدم ظهور التحديثات الجديدة، أو وجود بيانات قديمة في الصفحات
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-x-reverse">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  التأثير على الأداء
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  قد يؤدي مسح الكاش إلى بطء مؤقت في التحميل حتى يتم إعادة بناء الكاش
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-x-reverse">
              <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  مدة التخزين المؤقت
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  المقالات: 30 دقيقة | التصنيفات: 24 ساعة | الإحصائيات: 5 دقائق
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 