/**
 * Hook لاستخدام نظام الاحتياط لـ SSR
 */

import { SSRFallbackSystem } from "@/lib/recovery/SSRFallbackSystem";
import { useEffect, useRef, useState } from "react";

export interface UseSSRFallbackOptions {
  enableAutoFallback?: boolean;
  hydrationTimeout?: number;
  maxRetries?: number;
  preserveUserState?: boolean;
  onHydrationComplete?: () => void;
  onSSRError?: (error: any) => void;
  onFallbackActivated?: () => void;
}

export interface SSRFallbackState {
  isHydrated: boolean;
  fallbackMode: boolean;
  hasErrors: boolean;
  errorsCount: number;
  isLoading: boolean;
}

export function useSSRFallback(options: UseSSRFallbackOptions = {}) {
  const [state, setState] = useState<SSRFallbackState>({
    isHydrated: false,
    fallbackMode: false,
    hasErrors: false,
    errorsCount: 0,
    isLoading: true,
  });

  const ssrSystemRef = useRef<SSRFallbackSystem | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    // تهيئة نظام SSR Fallback
    ssrSystemRef.current = SSRFallbackSystem.getInstance({
      enableAutoFallback: options.enableAutoFallback ?? true,
      hydrationTimeout: options.hydrationTimeout ?? 10000,
      maxRetries: options.maxRetries ?? 2,
      preserveUserState: options.preserveUserState ?? true,
      enableDiagnostics: process.env.NODE_ENV === "development",
    });

    // مراقبة حالة النظام
    const checkSystemState = () => {
      if (!mountedRef.current || !ssrSystemRef.current) return;

      const stats = ssrSystemRef.current.getSSRStats();

      setState((prevState) => {
        const newState = {
          isHydrated: stats.isHydrated,
          fallbackMode: stats.fallbackMode,
          hasErrors: stats.errorsCount > 0,
          errorsCount: stats.errorsCount,
          isLoading: !stats.isHydrated && !stats.fallbackMode,
        };

        // استدعاء callbacks عند تغيير الحالة
        if (!prevState.isHydrated && newState.isHydrated) {
          options.onHydrationComplete?.();
        }

        if (!prevState.fallbackMode && newState.fallbackMode) {
          options.onFallbackActivated?.();
        }

        if (prevState.errorsCount < newState.errorsCount) {
          const latestError = stats.errors[stats.errors.length - 1];
          options.onSSRError?.(latestError);
        }

        return newState;
      });
    };

    // فحص أولي فقط
    checkSystemState();

    // فحص واحد بعد التحميل
    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        checkSystemState();
      }
    }, 1000);

    // تنظيف عند إلغاء التحميل
    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [
    options.enableAutoFallback,
    options.hydrationTimeout,
    options.maxRetries,
    options.preserveUserState,
  ]);

  // وظائف التحكم
  const forceCSRMode = () => {
    if (ssrSystemRef.current) {
      // تفعيل وضع CSR القسري
      sessionStorage.setItem("sabq_force_csr", "true");
      window.location.reload();
    }
  };

  const resetSystem = () => {
    if (ssrSystemRef.current) {
      ssrSystemRef.current.reset();
      setState({
        isHydrated: false,
        fallbackMode: false,
        hasErrors: false,
        errorsCount: 0,
        isLoading: true,
      });
    }
  };

  const getDetailedStats = () => {
    return ssrSystemRef.current?.getSSRStats() || null;
  };

  const restoreUserState = () => {
    if (ssrSystemRef.current) {
      ssrSystemRef.current.restoreUserState();
    }
  };

  return {
    // الحالة
    ...state,

    // وظائف التحكم
    forceCSRMode,
    resetSystem,
    getDetailedStats,
    restoreUserState,

    // معلومات إضافية
    shouldSkipSSR: SSRFallbackSystem.shouldSkipSSR(),

    // مساعدات
    isReady: state.isHydrated || state.fallbackMode,
    hasIssues: state.hasErrors || state.fallbackMode,
  };
}

/**
 * Hook مبسط للتحقق من حالة الـ hydration
 */
export function useHydrationStatus() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // تحديد اكتمال الـ hydration
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook للتحقق من وضع CSR القسري
 */
export function useCSRMode() {
  const [isCSRMode, setIsCSRMode] = useState(false);

  useEffect(() => {
    setIsCSRMode(SSRFallbackSystem.shouldSkipSSR());
  }, []);

  const enableCSRMode = () => {
    sessionStorage.setItem("sabq_force_csr", "true");
    setIsCSRMode(true);
  };

  const disableCSRMode = () => {
    SSRFallbackSystem.clearSSRSkip();
    setIsCSRMode(false);
  };

  return {
    isCSRMode,
    enableCSRMode,
    disableCSRMode,
  };
}
