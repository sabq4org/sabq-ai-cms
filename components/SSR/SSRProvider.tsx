'use client';

import React, { useEffect, useState } from 'react';
import { SSRFallbackSystem } from '@/lib/recovery/SSRFallbackSystem';
import { useSSRFallback } from '@/hooks/useSSRFallback';
import HydrationStatus from './HydrationStatus';

interface SSRProviderProps {
  children: React.ReactNode;
  config?: {
    enableAutoFallback?: boolean;
    hydrationTimeout?: number;
    maxRetries?: number;
    preserveUserState?: boolean;
  };
  showHydrationStatus?: boolean;
  fallbackComponent?: React.ComponentType<{ error?: any; retry?: () => void }>;
}

const SSRProvider: React.FC<SSRProviderProps> = ({
  children,
  config = {},
  showHydrationStatus = process.env.NODE_ENV === 'development',
  fallbackComponent: FallbackComponent
}) => {
  const [mounted, setMounted] = useState(false);
  const [shouldSkipSSR, setShouldSkipSSR] = useState(false);

  const {
    isHydrated,
    fallbackMode,
    hasErrors,
    isLoading,
    isReady,
    forceCSRMode,
    resetSystem,
    restoreUserState
  } = useSSRFallback({
    enableAutoFallback: config.enableAutoFallback ?? true,
    hydrationTimeout: config.hydrationTimeout ?? 10000,
    maxRetries: config.maxRetries ?? 2,
    preserveUserState: config.preserveUserState ?? true,
    
    onHydrationComplete: () => {
      console.log('✅ SSR Hydration completed successfully');
      
      // استعادة حالة المستخدم إذا كانت محفوظة
      restoreUserState();
    },
    
    onSSRError: (error) => {
      console.error('🚨 SSR Error in provider:', error);
    },
    
    onFallbackActivated: () => {
      console.log('🔄 SSR Fallback activated in provider');
    }
  });

  useEffect(() => {
    setMounted(true);
    
    // فحص إذا كان يجب تجنب SSR
    setShouldSkipSSR(SSRFallbackSystem.shouldSkipSSR());
    
    // استعادة حالة المستخدم عند التحميل
    const fallbackData = sessionStorage.getItem('sabq_ssr_fallback');
    if (fallbackData) {
      try {
        const data = JSON.parse(fallbackData);
        console.log('📦 استعادة بيانات SSR fallback:', data);
        
        // استعادة حالة المستخدم
        if (data.userState) {
          Object.keys(data.userState).forEach(key => {
            if (key.startsWith('localStorage_')) {
              const originalKey = key.replace('localStorage_', '');
              localStorage.setItem(originalKey, data.userState[key]);
            }
          });
        }
        
        // مسح البيانات المحفوظة
        sessionStorage.removeItem('sabq_ssr_fallback');
      } catch (error) {
        console.warn('فشل في استعادة بيانات SSR fallback:', error);
      }
    }
  }, []);

  // عدم عرض أي شيء حتى يتم التحميل
  if (!mounted) {
    return null;
  }

  // إذا كان في وضع CSR القسري، عرض محتوى بسيط
  if (shouldSkipSSR) {
    return (
      <div>
        {showHydrationStatus && (
          <div className="fixed top-4 right-4 z-50">
            <HydrationStatus showDetails={true} />
          </div>
        )}
        {children}
      </div>
    );
  }

  // إذا كان هناك أخطاء وتم توفير مكون fallback
  if (hasErrors && FallbackComponent && !isReady) {
    return (
      <div>
        {showHydrationStatus && (
          <div className="fixed top-4 right-4 z-50">
            <HydrationStatus showDetails={true} />
          </div>
        )}
        <FallbackComponent 
          error={hasErrors}
          retry={resetSystem}
        />
      </div>
    );
  }

  // العرض العادي
  return (
    <div>
      {/* مؤشر حالة الـ hydration */}
      {showHydrationStatus && (
        <div className="fixed top-4 right-4 z-50">
          <HydrationStatus showDetails={true} />
        </div>
      )}

      {/* شاشة تحميل أثناء الـ hydration */}
      {isLoading && !isReady && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جارٍ تحميل التطبيق...</p>
            
            {/* زر الطوارئ */}
            <button
              onClick={forceCSRMode}
              className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              تحميل مباشر (تجاوز SSR)
            </button>
          </div>
        </div>
      )}

      {/* تحذير وضع الاحتياط */}
      {fallbackMode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                يعمل التطبيق في وضع العميل فقط بسبب مشكلة في التحميل الأولي
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 underline"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className={isReady ? 'opacity-100' : 'opacity-0 transition-opacity duration-300'}>
        {children}
      </div>
    </div>
  );
};

export default SSRProvider;