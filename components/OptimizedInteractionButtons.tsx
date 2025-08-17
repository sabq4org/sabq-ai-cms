'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useOptimizedInteractions } from '@/hooks/useOptimizedInteractions';

interface OptimizedInteractionButtonsProps {
  articleId: string;
  initialLikes?: number;
  initialSaves?: number;
  initialLiked?: boolean;
  initialSaved?: boolean;
  className?: string;
  showCounts?: boolean;
  compact?: boolean;
}

/**
 * أزرار التفاعل المحسنة مع معالجة شاملة للأخطاء ومزامنة الحالة
 */
export function OptimizedInteractionButtons({
  articleId,
  initialLikes = 0,
  initialSaves = 0,
  initialLiked = false,
  initialSaved = false,
  className = '',
  showCounts = true,
  compact = false
}: OptimizedInteractionButtonsProps) {
  const {
    liked,
    saved,
    likesCount,
    savesCount,
    loading,
    error,
    isProcessing,
    toggleLike,
    toggleSave,
    syncWithServer,
    clearError,
    hasUser
  } = useOptimizedInteractions(articleId);

  // حالة محلية للتحكم في العرض
  const [showError, setShowError] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // إظهار الخطأ عند حدوثه
  useEffect(() => {
    if (error) {
      setShowError(true);
      // إخفاء الخطأ تلقائياً بعد 5 ثواني
      const timeout = setTimeout(() => {
        setShowError(false);
        clearError();
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [error, clearError]);

  // معالج إغلاق الخطأ
  const handleCloseError = useCallback(() => {
    setShowError(false);
    clearError();
  }, [clearError]);

  // معالج إعادة المزامنة
  const handleSync = useCallback(() => {
    syncWithServer();
    setLastSync(new Date());
  }, [syncWithServer]);

  // تحديد الحالة للعرض (استخدام القيم المحلية إذا لم تكن محملة بعد)
  const displayLiked = loading ? initialLiked : liked;
  const displaySaved = loading ? initialSaved : saved;
  const displayLikesCount = loading && likesCount === 0 ? initialLikes : likesCount;
  const displaySavesCount = loading && savesCount === 0 ? initialSaves : savesCount;

  // لا تظهر الأزرار إذا لم يكن المستخدم مسجل دخول
  if (!hasUser) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="text-sm text-gray-500">
          يرجى تسجيل الدخول للتفاعل
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* رسالة الخطأ */}
      {showError && error && (
        <div className="absolute -top-16 left-0 right-0 z-50">
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <span className="text-red-500 ml-2">⚠️</span>
                <div>
                  <p className="font-medium">حدث خطأ</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSync}
                  className="text-red-600 hover:text-red-800 text-sm"
                  title="إعادة المحاولة"
                >
                  🔄
                </button>
                <button
                  onClick={handleCloseError}
                  className="text-red-600 hover:text-red-800"
                  title="إغلاق"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* أزرار التفاعل */}
      <div className={`flex items-center gap-3 ${compact ? 'gap-2' : 'gap-3'}`}>
        {/* زر الإعجاب */}
        <button
          onClick={toggleLike}
          disabled={loading || isProcessing}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
            ${compact ? 'px-2 py-1 text-sm' : 'px-3 py-2'}
            ${displayLiked 
              ? 'bg-red-100 text-red-600 hover:bg-red-200 border-red-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
            }
            border hover:shadow-md
            ${(loading || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            relative overflow-hidden
          `}
          title={displayLiked ? 'إلغاء الإعجاب' : 'أعجبني'}
        >
          {/* تأثير التحميل */}
          {(loading || isProcessing) && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            </div>
          )}
          
          <span className={`transition-transform duration-200 ${displayLiked ? 'scale-110' : 'scale-100'}`}>
            {displayLiked ? '❤️' : '🤍'}
          </span>
          
          {showCounts && (
            <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
              {displayLikesCount.toLocaleString()}
            </span>
          )}
          
          {!compact && (
            <span className="text-sm">
              {displayLiked ? 'معجب' : 'إعجاب'}
            </span>
          )}
        </button>

        {/* زر الحفظ */}
        <button
          onClick={toggleSave}
          disabled={loading || isProcessing}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
            ${compact ? 'px-2 py-1 text-sm' : 'px-3 py-2'}
            ${displaySaved 
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
            }
            border hover:shadow-md
            ${(loading || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            relative overflow-hidden
          `}
          title={displaySaved ? 'إلغاء الحفظ' : 'حفظ المقال'}
        >
          {/* تأثير التحميل */}
          {(loading || isProcessing) && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            </div>
          )}
          
          <span className={`transition-transform duration-200 ${displaySaved ? 'scale-110' : 'scale-100'}`}>
            {displaySaved ? '🔖' : '📑'}
          </span>
          
          {showCounts && (
            <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
              {displaySavesCount.toLocaleString()}
            </span>
          )}
          
          {!compact && (
            <span className="text-sm">
              {displaySaved ? 'محفوظ' : 'حفظ'}
            </span>
          )}
        </button>

        {/* زر إعادة المزامنة (في حالة الخطأ فقط) */}
        {error && (
          <button
            onClick={handleSync}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="إعادة مزامنة الحالة مع الخادم"
          >
            🔄
          </button>
        )}
        
        {/* مؤشر آخر مزامنة (في وضع التطوير فقط) */}
        {process.env.NODE_ENV === 'development' && lastSync && (
          <div className="text-xs text-gray-400" title={`آخر مزامنة: ${lastSync.toLocaleTimeString()}`}>
            🕐
          </div>
        )}
      </div>

      {/* شريط التقدم للتحميل */}
      {loading && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div className="bg-blue-500 h-1 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

export default OptimizedInteractionButtons;
