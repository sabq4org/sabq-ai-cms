'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const ServerErrorFallback: React.FC = () => {
  const handleReload = () => {
    // مسح جميع البيانات المحفوظة
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.warn('فشل في مسح التخزين:', error);
    }
    
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          خطأ في الخادم
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          حدث خطأ داخلي في الخادم. نعمل على إصلاح المشكلة.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleReload}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </button>
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          إذا استمرت المشكلة، يرجى المحاولة لاحقاً أو الاتصال بالدعم الفني.
        </div>
      </div>
    </div>
  );
};

export default ServerErrorFallback;