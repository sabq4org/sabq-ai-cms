import { PrismaClient } from '@prisma/client';

// نظام مراقبة شامل لقاعدة البيانات
class DatabaseMonitor {
  private static instance: DatabaseMonitor;
  private prisma: PrismaClient;
  private connectionStats = {
    successful: 0,
    failed: 0,
    totalTime: 0,
    lastError: null as string | null,
    lastSuccess: null as Date | null,
    slowQueries: [] as Array<{ query: string; time: number; timestamp: Date }>
  };

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'info' }
      ],
      errorFormat: 'pretty'
    });

    this.setupEventListeners();
    this.startHealthCheck();
  }

  public static getInstance(): DatabaseMonitor {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor();
    }
    return DatabaseMonitor.instance;
  }

  private setupEventListeners() {
    // مراقبة الاستعلامات
    this.prisma.$on('query', (e: any) => {
      const duration = parseInt(e.duration);
      
      // تسجيل الاستعلامات البطيئة (أكثر من 1 ثانية)
      if (duration > 1000) {
        this.connectionStats.slowQueries.push({
          query: e.query,
          time: duration,
          timestamp: new Date()
        });
        
        console.warn(`🐌 استعلام بطيء: ${duration}ms`);
        console.warn(`Query: ${e.query.substring(0, 100)}...`);
      }
    });

    // مراقبة الأخطاء
    this.prisma.$on('error', (e: any) => {
      this.connectionStats.failed++;
      this.connectionStats.lastError = e.message;
      
      console.error('❌ خطأ في قاعدة البيانات:', e.message);
      this.logError(e.message);
    });

    // مراقبة التحذيرات
    this.prisma.$on('warn', (e: any) => {
      console.warn('⚠️ تحذير من قاعدة البيانات:', e.message);
    });
  }

  private async startHealthCheck() {
    // فحص دوري كل 30 ثانية
    setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);

    // فحص أولي
    await this.performHealthCheck();
  }

  private async performHealthCheck() {
    try {
      const startTime = Date.now();
      
      // اختبار اتصال بسيط
      await this.prisma.$queryRaw`SELECT 1`;
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.connectionStats.successful++;
      this.connectionStats.totalTime += duration;
      this.connectionStats.lastSuccess = new Date();
      
      // تحذير إذا كان الاتصال بطيء
      if (duration > 2000) {
        console.warn(`⚠️ اتصال بطيء بقاعدة البيانات: ${duration}ms`);
      }
      
    } catch (error) {
      this.connectionStats.failed++;
      this.connectionStats.lastError = error instanceof Error ? error.message : 'خطأ غير معروف';
      
      console.error('❌ فشل في فحص حالة قاعدة البيانات:', error);
      await this.handleConnectionFailure();
    }
  }

  private async handleConnectionFailure() {
    console.log('🔄 محاولة إعادة الاتصال...');
    
    try {
      await this.prisma.$disconnect();
      await this.prisma.$connect();
      console.log('✅ تم إعادة الاتصال بنجاح');
    } catch (error) {
      console.error('❌ فشل في إعادة الاتصال:', error);
    }
  }

  private logError(error: string) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: error,
      stats: this.getStats()
    };
    
    // يمكن حفظ هذا في ملف أو قاعدة بيانات منفصلة
    console.log('📝 تسجيل الخطأ:', JSON.stringify(logEntry, null, 2));
  }

  public getStats() {
    const totalRequests = this.connectionStats.successful + this.connectionStats.failed;
    const averageTime = totalRequests > 0 ? this.connectionStats.totalTime / this.connectionStats.successful : 0;
    const successRate = totalRequests > 0 ? (this.connectionStats.successful / totalRequests) * 100 : 0;
    
    return {
      totalRequests,
      successful: this.connectionStats.successful,
      failed: this.connectionStats.failed,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(averageTime),
      lastSuccess: this.connectionStats.lastSuccess,
      lastError: this.connectionStats.lastError,
      slowQueries: this.connectionStats.slowQueries.length,
      recentSlowQueries: this.connectionStats.slowQueries.slice(-5)
    };
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        console.warn(`⚠️ محاولة ${attempt} فشلت، إعادة المحاولة في ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // تضاعف التأخير مع كل محاولة
      }
    }
    
    throw lastError!;
  }

  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }
}

// إنشاء مثيل واحد
export const dbMonitor = DatabaseMonitor.getInstance();
export const prisma = dbMonitor.getPrismaClient();
