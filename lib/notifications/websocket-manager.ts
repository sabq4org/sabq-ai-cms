// مدير الإشعارات الفورية - سبق الذكية
import jwt from 'jsonwebtoken';

export interface NotificationUserData {
  userId: string;
  userName: string;
  connectedAt: Date;
}

export interface PendingNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  priority: string;
  createdAt: Date;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private connectedUsers = new Map<string, NotificationUserData>(); // userId -> userData
  private notificationQueues = new Map<string, PendingNotification[]>(); // userId -> notifications
  private subscribers = new Map<string, (notification: any) => void>(); // userId -> callback

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * تهيئة مدير الإشعارات
   */
  initialize(): void {
    console.log('� تم تهيئة مدير الإشعارات الذكية');
  }

  /**
   * مصادقة وتسجيل المستخدم
   */
  authenticateUser(tokenOrUndefined: string | undefined, callback: (notification: any) => void): { success: boolean; error?: string; userId?: string } {
    try {
      let decoded: any = null;
      let token = tokenOrUndefined;
      // دعم سحب التوكن من document.cookie/localStorage إذا لم يرسل من الواجهة
      if (!token && typeof document !== 'undefined') {
        try {
          const cookies = document.cookie.split('; ');
          const names = ['sabq_at','auth-token','access_token','token','jwt'];
          for (const n of names) {
            const row = cookies.find(r => r.startsWith(`${n}=`));
            if (row) { token = row.split('=')[1]; break; }
          }
          if (!token) {
            const ls = localStorage.getItem('auth-token');
            if (ls) token = ls;
          }
        } catch {}
      }
      decoded = token ? this.verifyToken(token) : null;
      if (!decoded) {
        return { success: false, error: 'Token غير صحيح' };
      }

      const userId = decoded.userId || decoded.id;
      const userName = decoded.name || decoded.username || 'مجهول';

      // تسجيل المستخدم
      const userData: NotificationUserData = {
        userId,
        userName,
        connectedAt: new Date()
      };

      this.connectedUsers.set(userId, userData);
      this.subscribers.set(userId, callback);

      console.log(`✅ تم توثيق المستخدم: ${userName} (${userId})`);

      // إرسال الإشعارات المعلقة
      this.processPendingNotifications(userId);

      return { success: true, userId };

    } catch (error) {
      console.error('❌ خطأ في مصادقة المستخدم:', error);
      return { success: false, error: 'خطأ في المصادقة' };
    }
  }

  /**
   * إلغاء تسجيل المستخدم
   */
  disconnectUser(userId: string): void {
    this.connectedUsers.delete(userId);
    this.subscribers.delete(userId);
    console.log(`🔌 تم إلغاء تسجيل المستخدم: ${userId}`);
  }

  /**
   * إرسال إشعار لمستخدم محدد
   */
  async sendToUser(userId: string, notification: PendingNotification): Promise<boolean> {
    try {
      const callback = this.subscribers.get(userId);
      
      if (callback && this.connectedUsers.has(userId)) {
        // المستخدم متصل - إرسال فوري
        callback({
          type: 'new_notification',
          data: notification
        });
        console.log(`📤 تم إرسال الإشعار للمستخدم المتصل: ${userId}`);
        
        // حفظ الإشعار في قاعدة البيانات
        await this.saveNotificationToDatabase(notification);
        
        return true;
      } else {
        // المستخدم غير متصل - حفظ في قائمة الانتظار
        this.addToQueue(userId, notification);
        await this.saveNotificationToDatabase(notification);
        console.log(`📭 المستخدم غير متصل، تم حفظ الإشعار: ${userId}`);
        return false;
      }

    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعار:', error);
      return false;
    }
  }

  /**
   * إرسال إشعار لجميع المستخدمين المتصلين
   */
  async broadcastToAll(notification: Omit<PendingNotification, 'userId'>): Promise<void> {
    try {
      this.subscribers.forEach((callback, userId) => {
        const userNotification: PendingNotification = {
          ...notification,
          userId
        };
        
        callback({
          type: 'broadcast_notification',
          data: userNotification
        });
      });

      console.log(`📢 تم بث الإشعار لـ ${this.subscribers.size} مستخدم`);

    } catch (error) {
      console.error('❌ خطأ في بث الإشعار:', error);
    }
  }

  /**
   * إضافة إشعار لقائمة الانتظار
   */
  private addToQueue(userId: string, notification: PendingNotification): void {
    if (!this.notificationQueues.has(userId)) {
      this.notificationQueues.set(userId, []);
    }
    
    const queue = this.notificationQueues.get(userId)!;
    queue.push(notification);
    
    // الاحتفاظ بآخر 50 إشعار فقط
    if (queue.length > 50) {
      queue.splice(0, queue.length - 50);
    }
  }

  /**
   * معالجة الإشعارات المعلقة
   */
  private async processPendingNotifications(userId: string): Promise<void> {
    try {
      // إشعارات من قائمة الانتظار
      const queuedNotifications = this.notificationQueues.get(userId) || [];
      
      // إشعارات من قاعدة البيانات
      const dbNotifications = await this.getUserNotifications(userId, 10);
      
      const callback = this.subscribers.get(userId);
      if (callback) {
        // إرسال الإشعارات المعلقة
        const allPendingNotifications = [
          ...queuedNotifications,
          ...dbNotifications.filter(n => !n.read_at)
        ];

        if (allPendingNotifications.length > 0) {
          callback({
            type: 'pending_notifications',
            data: {
              notifications: allPendingNotifications,
              count: allPendingNotifications.length
            }
          });

          console.log(`� تم إرسال ${allPendingNotifications.length} إشعار معلق للمستخدم: ${userId}`);
        }
      }

      // مسح قائمة الانتظار
      this.notificationQueues.delete(userId);

    } catch (error) {
      console.error('❌ خطأ في معالجة الإشعارات المعلقة:', error);
    }
  }

  /**
   * الحصول على قائمة المستخدمين المتصلين
   */
  getConnectedUsers(): NotificationUserData[] {
    return Array.from(this.connectedUsers.values());
  }

  /**
   * التحقق من حالة اتصال المستخدم
   */
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * الحصول على عدد المستخدمين المتصلين
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * التحقق من صحة الـ JWT Token
   */
  private verifyToken(token: string): any {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      return jwt.verify(token, secret);
    } catch (error) {
      console.error('❌ خطأ في التحقق من Token:', error);
      return null;
    }
  }

  /**
   * حفظ الإشعار في قاعدة البيانات
   */
  private async saveNotificationToDatabase(notification: PendingNotification): Promise<void> {
    try {
      const { default: prisma } = await import('@/lib/prisma');

      await prisma.smartNotifications.create({
        data: {
          id: notification.id,
          user_id: notification.userId,
          type: notification.type as any,
          title: notification.title,
          message: notification.message,
          priority: notification.priority as any,
          status: 'sent',
          created_at: notification.createdAt
        }
      });

      console.log(`� تم حفظ الإشعار في قاعدة البيانات: ${notification.id}`);

    } catch (error) {
      console.error('❌ خطأ في حفظ الإشعار:', error);
    }
  }

  /**
   * جلب إشعارات المستخدم من قاعدة البيانات
   */
  private async getUserNotifications(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { default: prisma } = await import('@/lib/prisma');

      const notifications = await prisma.smartNotifications.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit
      });

      return notifications;

    } catch (error) {
      console.error('❌ خطأ في جلب إشعارات المستخدم:', error);
      return [];
    }
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { default: prisma } = await import('@/lib/prisma');

      await prisma.smartNotifications.update({
        where: {
          id: notificationId,
          user_id: userId
        },
        data: {
          read_at: new Date(),
          status: 'read'
        }
      });

      console.log(`✅ تم تحديد الإشعار كمقروء: ${notificationId}`);
      return true;

    } catch (error) {
      console.error('❌ خطأ في تحديد الإشعار كمقروء:', error);
      return false;
    }
  }

  /**
   * تحديد جميع إشعارات المستخدم كمقروءة
   */
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const { default: prisma } = await import('@/lib/prisma');

      await prisma.smartNotifications.updateMany({
        where: {
          user_id: userId,
          read_at: null
        },
        data: {
          read_at: new Date(),
          status: 'read'
        }
      });

      console.log(`✅ تم تحديد جميع الإشعارات كمقروءة للمستخدم: ${userId}`);
      return true;

    } catch (error) {
      console.error('❌ خطأ في تحديد جميع الإشعارات كمقروءة:', error);
      return false;
    }
  }

  /**
   * إنشاء إشعار جديد
   */
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    priority?: string;
    metadata?: any;
  }): Promise<PendingNotification> {
    const notification: PendingNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'medium',
      createdAt: new Date()
    };

    return notification;
  }

  /**
   * إحصائيات النظام
   */
  getStats() {
    return {
      connectedUsers: this.getConnectedUsersCount(),
      totalQueues: this.notificationQueues.size,
      queuedNotifications: Array.from(this.notificationQueues.values())
        .reduce((sum, queue) => sum + queue.length, 0),
      activeSubscribers: this.subscribers.size
    };
  }
}

// تصدير المثيل الوحيد
export default NotificationManager.getInstance();
