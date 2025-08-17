import { prisma } from '@/lib/prisma';

// إحصائيات المراقبة
const monitoringStats = {
  totalQueries: 0,
  successfulQueries: 0,
  failedQueries: 0,
  slowQueries: 0,
  lastError: null as string | null,
  lastSuccess: null as Date | null,
  startTime: new Date()
};

// دالة للحصول على إحصائيات المراقبة
export function getConnectionStats() {
  const totalRequests = monitoringStats.totalQueries;
  const successRate = totalRequests > 0 ? 
    (monitoringStats.successfulQueries / totalRequests) * 100 : 0;
  
  return {
    totalRequests,
    successful: monitoringStats.successfulQueries,
    failed: monitoringStats.failedQueries,
    successRate: Math.round(successRate * 100) / 100,
    averageResponseTime: 0, // سنحسبه لاحقاً
    lastSuccess: monitoringStats.lastSuccess,
    lastError: monitoringStats.lastError,
    slowQueries: monitoringStats.slowQueries,
    recentSlowQueries: []
  };
}

// دالة لتنفيذ استعلام مع مراقبة
export async function executeWithMonitoring<T>(
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  monitoringStats.totalQueries++;
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    monitoringStats.successfulQueries++;
    monitoringStats.lastSuccess = new Date();
    
    if (duration > 1000) {
      monitoringStats.slowQueries++;
      console.warn(`🐌 استعلام بطيء: ${duration}ms`);
    }
    
    return result;
    
  } catch (error) {
    monitoringStats.failedQueries++;
    monitoringStats.lastError = error instanceof Error ? error.message : 'خطأ غير معروف';
    
    console.error('❌ خطأ في الاستعلام:', error);
    throw error;
  }
}

export { monitoringStats };
