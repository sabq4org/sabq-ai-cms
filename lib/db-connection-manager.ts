import prisma from '@/lib/prisma';

interface ConnectionPoolStatus {
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  totalConnections: number;
}

class DatabaseConnectionManager {
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private stats = {
    currentStatus: 'connected' as 'connected' | 'disconnected' | 'error',
    lastCheck: new Date().toISOString(),
    lastSuccess: new Date().toISOString(),
    lastError: null as string | null,
    successCount: 0,
    errorCount: 0,
    uptimePercent: 100,
    errorDetails: null as any
  };

  constructor() {
    // بدء مراقبة الاتصالات في development
    if (process.env.NODE_ENV === 'development') {
      this.startConnectionMonitoring();
    }
  }

  // تشغيل query مع إعادة المحاولة
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string = 'database operation'
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 محاولة ${attempt} لـ ${operationName}`);
        const result = await operation();
        if (attempt > 1) {
          console.log(`✅ نجحت المحاولة ${attempt}`);
        }
        this.updateStats(true);
        return result;
      } catch (error: any) {
        lastError = error;
        console.error(`❌ فشلت المحاولة ${attempt} لـ ${operationName}:`, error.message);
        
        // التحقق من نوع الخطأ
        if (error.code === 'P2024') {
          console.log('⚠️ Connection pool timeout - سيتم إعادة المحاولة');
          // إعطاء وقت إضافي للاتصالات لتتحرر
          await this.delay(this.retryDelay * attempt);
        } else if (error.code === 'P2002') {
          // خطأ unique constraint - لا نعيد المحاولة
          throw error;
        } else if (attempt === this.maxRetries) {
          this.updateStats(false, error);
          throw error;
        } else {
          await this.delay(this.retryDelay);
        }
      }
    }
    
    throw lastError;
  }

  // تشغيل عملية مع connection جديد
  async executeWithConnection<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      // محاولة تشغيل العملية
      return await this.executeWithRetry(operation);
    } catch (error) {
      console.error('❌ فشلت جميع المحاولات:', error);
      throw error;
    }
  }

  // تنظيف الاتصالات القديمة
  async cleanupConnections() {
    try {
      console.log('🧹 تنظيف الاتصالات...');
      await prisma.$disconnect();
      await this.delay(100);
      await prisma.$connect();
      console.log('✅ تم تنظيف الاتصالات');
    } catch (error) {
      console.error('❌ فشل تنظيف الاتصالات:', error);
    }
  }

  // بدء مراقبة الاتصالات
  private startConnectionMonitoring() {
    // مراقبة كل 30 ثانية
    this.connectionCheckInterval = setInterval(async () => {
      try {
        // اختبار بسيط للاتصال
        await prisma.$queryRaw`SELECT 1`;
      } catch (error: any) {
        if (error.code === 'P2024') {
          console.log('⚠️ اكتشاف مشكلة في connection pool - سيتم التنظيف');
          await this.cleanupConnections();
        }
      }
    }, 30000);
  }

  // إيقاف المراقبة
  stopConnectionMonitoring() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // جلب الإحصائيات
  getStats() {
    return { ...this.stats };
  }

  // تحديث الإحصائيات
  private updateStats(success: boolean, error?: any) {
    this.stats.lastCheck = new Date().toISOString();
    
    if (success) {
      this.stats.successCount++;
      this.stats.lastSuccess = new Date().toISOString();
      this.stats.currentStatus = 'connected';
      this.stats.lastError = null;
      this.stats.errorDetails = null;
    } else {
      this.stats.errorCount++;
      this.stats.currentStatus = 'error';
      this.stats.lastError = new Date().toISOString();
      this.stats.errorDetails = error;
    }
    
    // حساب نسبة الوقت النشط
    const total = this.stats.successCount + this.stats.errorCount;
    this.stats.uptimePercent = total > 0 
      ? Math.round((this.stats.successCount / total) * 100) 
      : 100;
  }
}

// إنشاء instance واحد
const dbConnectionManager = new DatabaseConnectionManager();

// تنظيف عند إيقاف العملية
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    console.log('🔄 إغلاق اتصالات قاعدة البيانات...');
    dbConnectionManager.stopConnectionMonitoring();
    await prisma.$disconnect();
  });
}

export default dbConnectionManager; 