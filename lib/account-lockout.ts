import prisma from '@/lib/prisma';

interface LockoutConfig {
  maxAttempts: number; // عدد المحاولات المسموح بها
  lockoutDuration: number; // مدة الحظر بالدقائق
  resetWindow: number; // نافذة إعادة التعيين بالدقائق
}

const DEFAULT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  lockoutDuration: 30, // 30 دقيقة
  resetWindow: 15 // 15 دقيقة
};

export class AccountLockoutService {
  private static config = DEFAULT_CONFIG;
  
  /**
   * تسجيل محاولة فاشلة
   */
  static async recordFailedAttempt(email: string, ipAddress?: string): Promise<void> {
    try {
      const now = new Date();
      const resetTime = new Date(now.getTime() - this.config.resetWindow * 60 * 1000);
      
      // البحث عن سجل المحاولات الفاشلة
      const existingRecord = await prisma.failed_login_attempts.findFirst({
        where: { 
          email,
          created_at: { gte: resetTime }
        },
        orderBy: { created_at: 'desc' }
      });
      
      if (existingRecord) {
        // تحديث عدد المحاولات
        await prisma.failed_login_attempts.update({
          where: { id: existingRecord.id },
          data: {
            attempts: existingRecord.attempts + 1,
            last_attempt: now,
            ip_address: ipAddress || existingRecord.ip_address
          }
        });
        
        // إذا تجاوز عدد المحاولات المسموح، قفل الحساب
        if (existingRecord.attempts + 1 >= this.config.maxAttempts) {
          await this.lockAccount(email);
        }
      } else {
        // إنشاء سجل جديد
        await prisma.failed_login_attempts.create({
          data: {
            email,
            attempts: 1,
            ip_address: ipAddress,
            last_attempt: now,
            created_at: now
          }
        });
      }
    } catch (error) {
      console.error('خطأ في تسجيل المحاولة الفاشلة:', error);
    }
  }
  
  /**
   * مسح المحاولات الفاشلة بعد تسجيل دخول ناجح
   */
  static async clearFailedAttempts(email: string): Promise<void> {
    try {
      await prisma.failed_login_attempts.deleteMany({
        where: { email }
      });
    } catch (error) {
      console.error('خطأ في مسح المحاولات الفاشلة:', error);
    }
  }
  
  /**
   * التحقق من حالة قفل الحساب
   */
  static async isAccountLocked(email: string): Promise<boolean> {
    try {
      const lockRecord = await prisma.account_lockouts.findFirst({
        where: {
          email,
          locked_until: { gt: new Date() }
        }
      });
      
      return !!lockRecord;
    } catch (error) {
      console.error('خطأ في التحقق من حالة القفل:', error);
      return false;
    }
  }
  
  /**
   * قفل الحساب
   */
  private static async lockAccount(email: string): Promise<void> {
    try {
      const lockedUntil = new Date(Date.now() + this.config.lockoutDuration * 60 * 1000);
      
      await prisma.account_lockouts.upsert({
        where: { email },
        update: {
          locked_until: lockedUntil,
          updated_at: new Date()
        },
        create: {
          email,
          locked_until: lockedUntil,
          reason: 'محاولات تسجيل دخول فاشلة متعددة',
          created_at: new Date()
        }
      });
      
      // إرسال تنبيه للمستخدم (اختياري)
      // await sendAccountLockNotification(email);
    } catch (error) {
      console.error('خطأ في قفل الحساب:', error);
    }
  }
  
  /**
   * الحصول على معلومات المحاولات الفاشلة
   */
  static async getFailedAttemptsInfo(email: string): Promise<{
    attempts: number;
    remainingAttempts: number;
    isLocked: boolean;
    lockedUntil?: Date;
  }> {
    try {
      const resetTime = new Date(Date.now() - this.config.resetWindow * 60 * 1000);
      
      // البحث عن المحاولات الفاشلة
      const failedAttempts = await prisma.failed_login_attempts.findFirst({
        where: {
          email,
          created_at: { gte: resetTime }
        },
        orderBy: { created_at: 'desc' }
      });
      
      // التحقق من حالة القفل
      const lockRecord = await prisma.account_lockouts.findFirst({
        where: {
          email,
          locked_until: { gt: new Date() }
        }
      });
      
      const attempts = failedAttempts?.attempts || 0;
      
      return {
        attempts,
        remainingAttempts: Math.max(0, this.config.maxAttempts - attempts),
        isLocked: !!lockRecord,
        lockedUntil: lockRecord?.locked_until
      };
    } catch (error) {
      console.error('خطأ في الحصول على معلومات المحاولات:', error);
      return {
        attempts: 0,
        remainingAttempts: this.config.maxAttempts,
        isLocked: false
      };
    }
  }
}
