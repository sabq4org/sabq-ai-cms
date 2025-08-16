// معايير الأمان المتقدمة - نظام سبق الذكية
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// إعدادات الأمان
const SECURITY_CONFIG = {
  // كلمات المرور
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
    MAX_AGE_DAYS: 90, // انتهاء صلاحية كلمة المرور بعد 90 يوم
    HISTORY_COUNT: 5, // عدم السماح بإعادة استخدام آخر 5 كلمات مرور
  },

  // الجلسات
  SESSION: {
    MAX_CONCURRENT: 5, // حد أقصى للجلسات المتزامنة
    TIMEOUT_MINUTES: 30, // انتهاء الجلسة بعد عدم النشاط
    REMEMBER_ME_DAYS: 30, // مدة "تذكرني"
  },

  // معدل الطلبات
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: 5, // محاولات تسجيل الدخول خلال النافذة الزمنية
    LOGIN_WINDOW_MINUTES: 15,
    API_REQUESTS_PER_MINUTE: 100,
    PASSWORD_RESET_PER_HOUR: 3,
  },

  // الحماية من البرمجة الخبيثة
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 10, // حظر الحساب بعد عدد من المحاولات الفاشلة
    LOCKOUT_DURATION_MINUTES: 30,
    SUSPICIOUS_ACTIVITY_THRESHOLD: 20, // عدد الأنشطة المشبوهة قبل التحقق الإضافي
  }
};

// فئة إدارة كلمات المرور المتقدمة
export class AdvancedPasswordManager {
  /**
   * التحقق من قوة كلمة المرور
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;

    // الطول
    if (password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) {
      issues.push(`كلمة المرور يجب أن تكون ${SECURITY_CONFIG.PASSWORD.MIN_LENGTH} أحرف على الأقل`);
    } else {
      score += 2;
    }

    // الأحرف الكبيرة
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      issues.push('يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل');
    } else {
      score += 1;
    }

    // الأحرف الصغيرة
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      issues.push('يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل');
    } else {
      score += 1;
    }

    // الأرقام
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
      issues.push('يجب أن تحتوي كلمة المرور على رقم واحد على الأقل');
    } else {
      score += 1;
    }

    // الرموز الخاصة
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_SYMBOLS && !/[@$!%*?&]/.test(password)) {
      issues.push('يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (@$!%*?&)');
    } else {
      score += 1;
    }

    // التعقيد الإضافي
    if (password.length >= 12) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    if (password.length >= 16) score += 1;

    return {
      isValid: issues.length === 0,
      score: Math.min(score, 10),
      issues
    };
  }

  /**
   * التحقق من كلمات المرور المتكررة
   */
  static async checkPasswordHistory(
    userId: string, 
    newPasswordHash: string
  ): Promise<boolean> {
    try {
      // جلب تاريخ كلمات المرور (يمكن إنشاء جدول منفصل لهذا)
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { password_hash: true }
      });

      if (!user) return true;

      // للبساطة، نتحقق فقط من كلمة المرور الحالية
      // في التطبيق الحقيقي، يجب حفظ تاريخ كلمات المرور
      const bcrypt = await import('bcryptjs');
      const isSameAsCurrentPassword = await bcrypt.compare(newPasswordHash, user.password_hash || '');
      
      return !isSameAsCurrentPassword;
    } catch (error) {
      console.error('Error checking password history:', error);
      return true; // في حالة الخطأ، نسمح بالتغيير
    }
  }

  /**
   * توليد كلمة مرور قوية
   */
  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '@$!%*?&';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';

    // ضمان وجود نوع واحد من كل فئة على الأقل
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // ملء الباقي عشوائياً
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // خلط الأحرف
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// فئة إدارة الجلسات المتقدمة
export class SessionManager {
  /**
   * التحقق من عدد الجلسات المتزامنة
   */
  static async checkConcurrentSessions(userId: string): Promise<boolean> {
    try {
      const activeSessions = await prisma.userSessions.count({
        where: {
          user_id: userId,
          is_active: true,
          ended_at: null
        }
      });

      return activeSessions < SECURITY_CONFIG.SESSION.MAX_CONCURRENT;
    } catch (error) {
      console.error('Error checking concurrent sessions:', error);
      return true;
    }
  }

  /**
   * إنهاء الجلسات القديمة
   */
  static async cleanupExpiredSessions(userId?: string): Promise<void> {
    try {
      const expiredTime = new Date(Date.now() - SECURITY_CONFIG.SESSION.TIMEOUT_MINUTES * 60 * 1000);
      
      const whereClause: any = {
        last_activity_at: { lt: expiredTime },
        is_active: true
      };

      if (userId) {
        whereClause.user_id = userId;
      }

      await prisma.userSessions.updateMany({
        where: whereClause,
        data: {
          is_active: false,
          ended_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }

  /**
   * إنهاء أقدم الجلسات عند تجاوز الحد الأقصى
   */
  static async enforceSessionLimit(userId: string): Promise<void> {
    try {
      const sessions = await prisma.userSessions.findMany({
        where: {
          user_id: userId,
          is_active: true
        },
        orderBy: {
          last_activity_at: 'asc'
        }
      });

      if (sessions.length >= SECURITY_CONFIG.SESSION.MAX_CONCURRENT) {
        const sessionsToEnd = sessions.slice(0, sessions.length - SECURITY_CONFIG.SESSION.MAX_CONCURRENT + 1);
        
        await prisma.userSessions.updateMany({
          where: {
            id: { in: sessionsToEnd.map(s => s.id) }
          },
          data: {
            is_active: false,
            ended_at: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error enforcing session limit:', error);
    }
  }

  /**
   * تسجيل نشاط الجلسة
   */
  static async updateSessionActivity(sessionToken: string): Promise<void> {
    try {
      const bcrypt = await import('bcryptjs');
      const sessions = await prisma.userSessions.findMany({
        where: { is_active: true }
      });

      for (const session of sessions) {
        const isMatch = await bcrypt.compare(sessionToken, session.session_token);
        if (isMatch) {
          await prisma.userSessions.update({
            where: { id: session.id },
            data: { last_activity_at: new Date() }
          });
          break;
        }
      }
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }
}

// فئة الحماية من الهجمات
export class SecurityProtection {
  private static loginAttempts = new Map<string, { count: number; lastAttempt: Date; blockedUntil?: Date }>();
  private static suspiciousActivities = new Map<string, { count: number; activities: string[] }>();

  /**
   * التحقق من محاولات تسجيل الدخول
   */
  static checkLoginAttempts(identifier: string): { allowed: boolean; remainingAttempts: number; blockedUntil?: Date } {
    const now = new Date();
    const attempts = this.loginAttempts.get(identifier);

    if (!attempts) {
      return { allowed: true, remainingAttempts: SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS };
    }

    // التحقق من انتهاء فترة الحظر
    if (attempts.blockedUntil && now < attempts.blockedUntil) {
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        blockedUntil: attempts.blockedUntil 
      };
    }

    // إعادة تعيين العداد إذا انتهت النافذة الزمنية
    const windowStart = new Date(now.getTime() - SECURITY_CONFIG.RATE_LIMIT.LOGIN_WINDOW_MINUTES * 60 * 1000);
    if (attempts.lastAttempt < windowStart) {
      this.loginAttempts.set(identifier, { count: 0, lastAttempt: now });
      return { allowed: true, remainingAttempts: SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS };
    }

    const remainingAttempts = SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS - attempts.count;
    return { 
      allowed: remainingAttempts > 0, 
      remainingAttempts: Math.max(0, remainingAttempts) 
    };
  }

  /**
   * تسجيل محاولة تسجيل دخول فاشلة
   */
  static recordFailedLogin(identifier: string): void {
    const now = new Date();
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: now };

    attempts.count++;
    attempts.lastAttempt = now;

    // حظر مؤقت بعد تجاوز الحد المسموح
    if (attempts.count >= SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS) {
      attempts.blockedUntil = new Date(now.getTime() + SECURITY_CONFIG.SECURITY.LOCKOUT_DURATION_MINUTES * 60 * 1000);
    }

    this.loginAttempts.set(identifier, attempts);
  }

  /**
   * إعادة تعيين محاولات تسجيل الدخول بعد النجاح
   */
  static resetLoginAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }

  /**
   * تسجيل نشاط مشبوه
   */
  static recordSuspiciousActivity(identifier: string, activity: string): boolean {
    const activities = this.suspiciousActivities.get(identifier) || { count: 0, activities: [] };
    
    activities.count++;
    activities.activities.push(`${new Date().toISOString()}: ${activity}`);

    // الاحتفاظ بآخر 50 نشاط فقط
    if (activities.activities.length > 50) {
      activities.activities = activities.activities.slice(-50);
    }

    this.suspiciousActivities.set(identifier, activities);

    // إرجاع true إذا تجاوز النشاط المشبوه الحد المسموح
    return activities.count >= SECURITY_CONFIG.SECURITY.SUSPICIOUS_ACTIVITY_THRESHOLD;
  }

  /**
   * فحص البيانات المدخلة ضد حقن SQL وXSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // إزالة HTML tags
      .replace(/['"]/g, '') // إزالة علامات التنصيص
      .replace(/[;\\]/g, '') // إزالة أحرف خاصة خطيرة
      .trim();
  }

  /**
   * التحقق من صحة IP address
   */
  static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * التحقق من User-Agent المشبوه
   */
  static isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /curl/i,
      /wget/i,
      /python/i,
      /script/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }
}

// فئة التشفير المتقدم
export class AdvancedEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  /**
   * تشفير البيانات الحساسة
   */
  static encrypt(text: string, secretKey: string): string {
    try {
      const key = crypto.scryptSync(secretKey, 'salt', this.KEY_LENGTH);
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      const cipher = crypto.createCipher(this.ALGORITHM, key);
      cipher.setAAD(Buffer.from('additional-data'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('فشل في تشفير البيانات');
    }
  }

  /**
   * فك تشفير البيانات
   */
  static decrypt(encryptedData: string, secretKey: string): string {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('تنسيق البيانات المشفرة غير صحيح');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const key = crypto.scryptSync(secretKey, 'salt', this.KEY_LENGTH);
      
      const decipher = crypto.createDecipher(this.ALGORITHM, key);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from('additional-data'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('فشل في فك تشفير البيانات');
    }
  }

  /**
   * تشفير متقدم للبيانات الشخصية (PII)
   */
  static encryptPII(data: any): string {
    const secretKey = process.env.PII_ENCRYPTION_KEY || 'default-pii-key-change-in-production';
    return this.encrypt(JSON.stringify(data), secretKey);
  }

  /**
   * فك تشفير البيانات الشخصية
   */
  static decryptPII(encryptedData: string): any {
    const secretKey = process.env.PII_ENCRYPTION_KEY || 'default-pii-key-change-in-production';
    const decryptedString = this.decrypt(encryptedData, secretKey);
    return JSON.parse(decryptedString);
  }
}

// فئة التحليل الأمني والمراقبة
export class SecurityMonitoring {
  /**
   * تسجيل حدث أمني
   */
  static async logSecurityEvent(
    userId: string | null,
    eventType: string,
    description: string,
    request?: NextRequest,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    try {
      const metadata = {
        severity,
        ip_address: request ? SecurityManager.cleanIpAddress(request as any) : null,
        user_agent: request?.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
        description
      };

      await prisma.activity_logs.create({
        data: {
          id: crypto.randomBytes(16).toString('hex'),
          user_id: userId,
          action: eventType,
          entity_type: 'security_event',
          metadata,
          ip_address: metadata.ip_address,
          user_agent: metadata.user_agent,
        }
      });

      // إرسال تنبيه للأحداث الخطيرة
      if (severity === 'critical' || severity === 'high') {
        console.warn(`🔒 Security Alert [${severity.toUpperCase()}]: ${eventType} - ${description}`);
        // هنا يمكن إضافة إرسال تنبيهات عبر البريد الإلكتروني أو Slack
      }

    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * تحليل أنماط الوصول المشبوهة
   */
  static async analyzeAccessPatterns(userId: string): Promise<{
    riskScore: number;
    suspiciousActivities: string[];
    recommendations: string[];
  }> {
    try {
      let riskScore = 0;
      const suspiciousActivities: string[] = [];
      const recommendations: string[] = [];

      // تحليل الجلسات المتعددة
      const activeSessions = await prisma.userSessions.count({
        where: { user_id: userId, is_active: true }
      });

      if (activeSessions > 3) {
        riskScore += 2;
        suspiciousActivities.push(`عدد كبير من الجلسات النشطة: ${activeSessions}`);
        recommendations.push('مراجعة الأجهزة المتصلة');
      }

      // تحليل أحداث الأمان الأخيرة
      const recentSecurityEvents = await prisma.activity_logs.count({
        where: {
          user_id: userId,
          entity_type: 'security_event',
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
          }
        }
      });

      if (recentSecurityEvents > 5) {
        riskScore += 3;
        suspiciousActivities.push(`أحداث أمنية متكررة: ${recentSecurityEvents}`);
        recommendations.push('مراجعة كلمة المرور وتفعيل المصادقة الثنائية');
      }

      // تحليل أوقات الوصول
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { last_login_at: true }
      });

      if (user?.last_login_at) {
        const loginHour = user.last_login_at.getHours();
        if (loginHour < 6 || loginHour > 23) {
          riskScore += 1;
          suspiciousActivities.push('تسجيل دخول في أوقات غير عادية');
          recommendations.push('تفعيل تنبيهات تسجيل الدخول');
        }
      }

      return {
        riskScore: Math.min(riskScore, 10),
        suspiciousActivities,
        recommendations
      };

    } catch (error) {
      console.error('Error analyzing access patterns:', error);
      return {
        riskScore: 0,
        suspiciousActivities: [],
        recommendations: []
      };
    }
  }
}

// Import SecurityManager from the main file
import { SecurityManager } from './user-management';

export {
  SECURITY_CONFIG,
  AdvancedPasswordManager,
  SessionManager,
  SecurityProtection,
  AdvancedEncryption,
  SecurityMonitoring
};
