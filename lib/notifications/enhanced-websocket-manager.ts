/**
 * إدارة محسّنة للإشعارات الفورية - نظام سبق الذكية
 * تجنب التسبب في تسجيل الخروج عند فشل التوثيق
 */

interface NotificationUserData {
  userId: string;
  userName: string;
  connectedAt: Date;
}

interface NotificationData {
  id?: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read?: boolean;
  created_at: Date;
  data?: any;
}

export class EnhancedNotificationManager {
  private static instance: EnhancedNotificationManager;
  private connectedUsers: Map<string, NotificationUserData> = new Map();
  private subscribers: Map<string, (notification: any) => void> = new Map();
  private pendingNotifications: NotificationData[] = [];
  private authTokenCache: string | null = null;
  private lastAuthCheck: number = 0;
  private readonly AUTH_CHECK_INTERVAL = 10000; // 10 ثوان
  private readonly MAX_RETRY_ATTEMPTS = 3;

  static getInstance(): EnhancedNotificationManager {
    if (!EnhancedNotificationManager.instance) {
      EnhancedNotificationManager.instance = new EnhancedNotificationManager();
    }
    return EnhancedNotificationManager.instance;
  }

  /**
   * مصادقة محسّنة للمستخدم مع منع التسبب في تسجيل الخروج
   */
  authenticateUser(
    tokenOrUndefined: string | undefined, 
    callback: (notification: any) => void,
    options: {
      silentMode?: boolean; // عدم إظهار أخطاء التوثيق
      skipValidation?: boolean; // تخطي التحقق من صحة التوكن
    } = {}
  ): { success: boolean; error?: string; userId?: string } {
    try {
      const { silentMode = false, skipValidation = false } = options;
      let decoded: any = null;
      let token = tokenOrUndefined;

      // محاولة استخراج التوكن من مصادر متعددة
      if (!token && typeof window !== 'undefined') {
        const extractedToken = this.extractTokenFromStorage();
        if (extractedToken) {
          token = extractedToken;
        }
      }

      // إذا لم نجد توكن، لا نعتبر هذا خطأ في المصادقة
      if (!token) {
        if (!silentMode) {
          console.log('📝 لم يتم العثور على توكن للإشعارات، سيتم تشغيل الوضع الصامت');
        }
        return { success: false, error: 'لا يوجد توكن' };
      }

      // التحقق من التوكن المخزن مؤقتاً لتجنب الطلبات المتكررة
      if (token === this.authTokenCache && Date.now() - this.lastAuthCheck < this.AUTH_CHECK_INTERVAL) {
        const existingUserId = Array.from(this.connectedUsers.keys())[0];
        if (existingUserId) {
          this.subscribers.set(existingUserId, callback);
          return { success: true, userId: existingUserId };
        }
      }

      // فك تشفير التوكن بحذر
      try {
        decoded = skipValidation ? this.parseTokenSafely(token) : this.verifyTokenSecurely(token);
      } catch (error) {
        // لا نعتبر فشل فك التوكن سبباً لتسجيل الخروج
        if (!silentMode) {
          console.warn('⚠️ فشل في فك تشفير توكن الإشعارات (لن يؤثر على الجلسة الأساسية)');
        }
        return { success: false, error: 'فشل فك التوكن' };
      }

      if (!decoded) {
        if (!silentMode) {
          console.warn('⚠️ توكن الإشعارات غير صالح (لن يؤثر على الجلسة الأساسية)');
        }
        return { success: false, error: 'توكن غير صالح' };
      }

      // استخراج بيانات المستخدم
      const userId = decoded.userId || decoded.id || decoded.sub || decoded.uid || decoded.user_id;
      const userName = decoded.name || decoded.username || 'مجهول';

      if (!userId) {
        if (!silentMode) {
          console.warn('⚠️ لا يحتوي توكن الإشعارات على معرف المستخدم');
        }
        return { success: false, error: 'معرف المستخدم مفقود' };
      }

      // تسجيل المستخدم للإشعارات
      const userData: NotificationUserData = {
        userId,
        userName,
        connectedAt: new Date()
      };

      this.connectedUsers.set(userId, userData);
      this.subscribers.set(userId, callback);
      this.authTokenCache = token;
      this.lastAuthCheck = Date.now();

      if (!silentMode) {
        console.log(`✅ تم تسجيل المستخدم للإشعارات: ${userName} (${userId})`);
      }

      // إرسال الإشعارات المعلقة
      this.processPendingNotifications(userId);

      return { success: true, userId };

    } catch (error) {
      if (!options.silentMode) {
        console.error('❌ خطأ في مصادقة الإشعارات (لن يؤثر على الجلسة الأساسية):', error);
      }
      return { success: false, error: 'خطأ في المصادقة' };
    }
  }

  /**
   * استخراج التوكن من مصادر التخزين المختلفة
   */
  private extractTokenFromStorage(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      // البحث في الكوكيز أولاً
      const cookies = document.cookie.split('; ');
      const cookieNames = ['sabq_at', 'auth-token', 'access_token', 'token', 'jwt'];
      
      for (const name of cookieNames) {
        const cookieRow = cookies.find(row => row.startsWith(`${name}=`));
        if (cookieRow) {
          return cookieRow.split('=')[1];
        }
      }

      // البحث في localStorage كبديل
      const storageKeys = ['auth-token', 'sabq_at', 'access_token'];
      for (const key of storageKeys) {
        const token = localStorage.getItem(key);
        if (token) return token;
      }

      return null;
    } catch (error) {
      console.warn('⚠️ خطأ في استخراج التوكن من التخزين:', error);
      return null;
    }
  }

  /**
   * فك تشفير التوكن بأمان بدون التحقق من الصحة
   */
  private parseTokenSafely(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(payload));
      
      // التحقق من انتهاء الصلاحية بشكل أساسي
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * التحقق من صحة التوكن بحذر
   */
  private verifyTokenSecurely(token: string): any {
    // في بيئة العميل، نقوم بفك التوكن بدون التحقق من التوقيع
    // التحقق الفعلي يتم على الخادم
    if (typeof window !== 'undefined') {
      return this.parseTokenSafely(token);
    }

    // في بيئة الخادم، نحتاج إلى التحقق الكامل
    try {
      const jwt = require('jsonwebtoken');
      const secrets = [
        process.env.JWT_SECRET,
        process.env.JWT_ACCESS_SECRET,
        process.env.NEXTAUTH_SECRET
      ].filter(Boolean);

      for (const secret of secrets) {
        try {
          return jwt.verify(token, secret);
        } catch {
          continue;
        }
      }
      return null;
    } catch (error) {
      return this.parseTokenSafely(token);
    }
  }

  /**
   * إرسال إشعار لمستخدم محدد
   */
  async sendNotification(notification: NotificationData): Promise<boolean> {
    try {
      const subscriber = this.subscribers.get(notification.userId);
      
      if (subscriber) {
        // المستخدم متصل، إرسال فوري
        subscriber(notification);
        console.log(`📤 تم إرسال إشعار للمستخدم: ${notification.userId}`);
        return true;
      } else {
        // المستخدم غير متصل، حفظ الإشعار للإرسال لاحقاً
        this.pendingNotifications.push(notification);
        console.log(`📝 تم حفظ إشعار للمستخدم غير المتصل: ${notification.userId}`);
        return false;
      }
    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعار:', error);
      return false;
    }
  }

  /**
   * معالجة الإشعارات المعلقة
   */
  private processPendingNotifications(userId: string): void {
    const userNotifications = this.pendingNotifications.filter(n => n.userId === userId);
    const subscriber = this.subscribers.get(userId);

    if (subscriber && userNotifications.length > 0) {
      userNotifications.forEach(notification => {
        try {
          subscriber(notification);
          console.log(`📤 تم إرسال إشعار معلق للمستخدم: ${userId}`);
        } catch (error) {
          console.error('❌ خطأ في إرسال إشعار معلق:', error);
        }
      });

      // إزالة الإشعارات المرسلة
      this.pendingNotifications = this.pendingNotifications.filter(n => n.userId !== userId);
    }
  }

  /**
   * إلغاء تسجيل المستخدم من الإشعارات
   */
  disconnectUser(userId: string): void {
    this.connectedUsers.delete(userId);
    this.subscribers.delete(userId);
    console.log(`👋 تم قطع اتصال المستخدم من الإشعارات: ${userId}`);
  }

  /**
   * مسح جميع البيانات المؤقتة
   */
  clearAll(): void {
    this.connectedUsers.clear();
    this.subscribers.clear();
    this.pendingNotifications = [];
    this.authTokenCache = null;
    this.lastAuthCheck = 0;
    console.log('🧹 تم مسح جميع بيانات الإشعارات');
  }

  /**
   * الحصول على حالة الاتصال
   */
  getConnectionStatus(userId?: string): {
    totalConnected: number;
    userConnected: boolean;
    pendingCount: number;
  } {
    return {
      totalConnected: this.connectedUsers.size,
      userConnected: userId ? this.connectedUsers.has(userId) : false,
      pendingCount: userId 
        ? this.pendingNotifications.filter(n => n.userId === userId).length 
        : this.pendingNotifications.length
    };
  }

  /**
   * إعداد متقدم للإشعارات مع إعادة المحاولة
   */
  async setupAdvancedNotifications(options: {
    token?: string;
    retryCount?: number;
    silentMode?: boolean;
    onSuccess?: (userId: string) => void;
    onFailure?: (error: string) => void;
  } = {}): Promise<boolean> {
    const { 
      token, 
      retryCount = 1, 
      silentMode = true,
      onSuccess,
      onFailure 
    } = options;

    let attempts = 0;
    while (attempts < this.MAX_RETRY_ATTEMPTS) {
      attempts++;

      const result = this.authenticateUser(
        token,
        (notification) => {
          // معالج افتراضي للإشعارات
          console.log('📩 إشعار جديد:', notification);
        },
        { silentMode: silentMode || attempts > 1 }
      );

      if (result.success && result.userId) {
        if (onSuccess) onSuccess(result.userId);
        return true;
      }

      // انتظار قبل المحاولة التالية
      if (attempts < this.MAX_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    if (onFailure) onFailure('فشل في تسجيل الإشعارات بعد عدة محاولات');
    return false;
  }
}

// تصدير instance مفرد
export const notificationManager = EnhancedNotificationManager.getInstance();

// دالة مساعدة لإعداد الإشعارات بأمان
export async function setupSafeNotifications(
  token?: string,
  callback?: (notification: any) => void
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const manager = EnhancedNotificationManager.getInstance();
    
    const result = manager.authenticateUser(
      token,
      callback || ((notification) => {
        console.log('📩 إشعار:', notification);
      }),
      { silentMode: true, skipValidation: true }
    );

    return result;
  } catch (error) {
    console.warn('⚠️ فشل إعداد الإشعارات الآمنة:', error);
    return { success: false, error: 'فشل الإعداد' };
  }
}

export default EnhancedNotificationManager;
