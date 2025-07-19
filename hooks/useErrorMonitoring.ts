'use client';

import { useEffect, useState, useCallback } from 'react';
import { errorMonitoringService, ErrorReport, ErrorStats } from '@/lib/services/ErrorMonitoringService';

/**
 * Hook لاستخدام خدمة مراقبة الأخطاء
 */
export const useErrorMonitoring = () => {
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<ErrorReport[]>([]);

  // تحديث الإحصائيات
  const updateStats = useCallback(() => {
    const stats = errorMonitoringService.getErrorStats();
    setErrorStats(stats);
    setRecentErrors(errorMonitoringService.getRecentErrors(10));
  }, []);

  // تسجيل خطأ جديد
  const reportError = useCallback((
    error: Error,
    context?: Partial<ErrorReport['context']>,
    severity?: ErrorReport['severity']
  ) => {
    errorMonitoringService.reportError(error, context, severity);
    updateStats(); // تحديث الإحصائيات بعد تسجيل الخطأ
  }, [updateStats]);

  // مسح الأخطاء
  const clearErrors = useCallback(() => {
    errorMonitoringService.clearErrors();
    updateStats();
  }, [updateStats]);

  // تحديد خطأ كمحلول
  const markAsResolved = useCallback((errorId: string) => {
    errorMonitoringService.markErrorAsResolved(errorId);
    updateStats();
  }, [updateStats]);

  // الاستماع للأخطاء الجديدة
  useEffect(() => {
    const unsubscribe = errorMonitoringService.addListener((error) => {
      updateStats();
    });

    // تحديث أولي
    updateStats();

    return unsubscribe;
  }, [updateStats]);

  return {
    errorStats,
    recentErrors,
    reportError,
    clearErrors,
    markAsResolved,
    updateStats
  };
};

export default useErrorMonitoring;