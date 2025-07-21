/**
 * خدمة التنبيهات والإشعارات للمحررات
 */

import { editorNotificationManager } from './EditorNotificationFilter';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // بالمللي ثانية، null للإشعارات الدائمة
  actions?: NotificationAction[];
  metadata?: {
    component?: string;
    userId?: string;
    sessionId?: string;
    errorId?: string;
  };
  read: boolean;
  persistent: boolean; // هل يبقى الإشعار بعد إعادة تحميل الصفحة
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void | Promise<void>;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  recent: Notification[];
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];
  private maxNotifications = 100;
  private defaultDuration = 5000; // 5 ثوانٍ

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // تحميل الإشعارات المحفوظة
    this.loadPersistedNotifications();

    // طلب إذن الإشعارات من المتصفح
    this.requestNotificationPermission();

    // حفظ الإشعارات عند إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
      this.persistNotifications();
    });
  }

  private loadPersistedNotifications(): void {
    try {
      const saved = localStorage.getItem('editor-notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })).filter((n: Notification) => n.persistent);
      }
    } catch (error) {
      console.warn('Failed to load persisted notifications:', error);
    }
  }

  private persistNotifications(): void {
    try {
      const persistentNotifications = this.notifications.filter(n => n.persistent);
      localStorage.setItem('editor-notifications', JSON.stringify(persistentNotifications));
    } catch (error) {
      console.warn('Failed to persist notifications:', error);
    }
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.warn('Failed to request notification permission:', error);
      }
    }
  }

  public show(
    type: Notification['type'],
    title: string,
    message: string,
    options: Partial<Notification> = {}
  ): string {
    // فلترة الرسائل المزعجة
    if (!editorNotificationManager.shouldShowMessage(message, type)) {
      editorNotificationManager.logFilteredMessage(`${title}: ${message}`, type);
      return ''; // لا نعرض الرسالة
    }

    // تحويل الرسائل التقنية إلى مفهومة
    const friendlyMessage = editorNotificationManager.transformMessage(message);
    const friendlyTitle = editorNotificationManager.transformMessage(title);

    const notification: Notification = {
      id: this.generateId(),
      type,
      title: friendlyTitle,
      message: friendlyMessage,
      timestamp: new Date(),
      duration: options.duration ?? this.defaultDuration,
      actions: options.actions || [],
      metadata: options.metadata || {},
      read: false,
      persistent: options.persistent || false,
      ...options
    };

    // إضافة الإشعار إلى القائمة
    this.notifications.unshift(notification);

    // الحفاظ على الحد الأقصى للإشعارات
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // إشعار المستمعين
    this.notifyListeners();

    // إظهار إشعار المتصفح إذا كان مسموحاً
    this.showBrowserNotification(notification);

    // إزالة الإشعار تلقائياً إذا كان له مدة محددة
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: this.getIconForType(notification.type),
          tag: notification.id,
          requireInteraction: notification.type === 'error'
        });

        browserNotification.onclick = () => {
          window.focus();
          this.markAsRead(notification.id);
          browserNotification.close();
        };

        // إغلاق الإشعار تلقائياً
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            browserNotification.close();
          }, notification.duration);
        }
      } catch (error) {
        console.warn('Failed to show browser notification:', error);
      }
    }
  }

  private getIconForType(type: Notification['type']): string {
    // استخدام أيقونات SVG مدمجة بدلاً من ملفات منفصلة لتجنب أخطاء 404
    switch (type) {
      case 'success': return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDZMOSAxN0w0IDEyIiBzdHJva2U9IiMxMGI5ODEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
      case 'warning': return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDlWMTNNMTIgMTdIMTIuMDFNMTAuMjkgMy44NkwxLjgyIDEyQTIgMiAwIDAgMCAxLjgyIDEyTDEwLjI5IDIwLjE0QTIgMiAwIDAgMCAxMiAyMUgyNEEyIDIgMCAwIDAgMjUuMDYgMTguOTJMMTYuNTkgMy44NkEyIDIgMCAwIDAgMTIgM1oiIHN0cm9rZT0iI2Y1OTUxNSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==';
      case 'error': return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iI2VmNDQ0NCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0xNSA5TDkgMTVNOSA5TDE1IDE1IiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
      default: return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzM5ODRmOCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0xMiA4VjEyTTEyIDE2SDEyLjAxIiBzdHJva2U9IiMzOTg0ZjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
    }
  }

  // إشعارات مخصصة للمحررات
  public showEditorError(error: Error, component: string, errorId?: string): string {
    // فلترة الأخطاء التقنية في بيئة الإنتاج
    if (process.env.NODE_ENV === 'production' && this.isTechnicalError(error.message)) {
      // تسجيل الخطأ فقط دون إزعاج المستخدم
      console.error(`Technical error in ${component}:`, error);
      return '';
    }

    return this.show('error', 'خطأ في المحرر', this.getUserFriendlyMessage(error.message), {
      persistent: true,
      metadata: { component, errorId },
      actions: [
        {
          id: 'retry',
          label: 'إعادة المحاولة',
          action: () => window.location.reload(),
          style: 'primary'
        },
        {
          id: 'report',
          label: 'إبلاغ عن المشكلة',
          action: () => this.reportError(error, component),
          style: 'secondary'
        }
      ]
    });
  }

  private isTechnicalError(message: string): boolean {
    const technicalErrors = [
      'can\'t access property "slice"',
      'is undefined',
      'is null',
      'Cannot read property',
      'Cannot read properties',
      'Unexpected token',
      'SyntaxError',
      'TypeError',
      'ReferenceError',
      'webpack-internal'
    ];
    
    return technicalErrors.some(error => message.includes(error));
  }

  private getUserFriendlyMessage(technicalMessage: string): string {
    if (technicalMessage.includes('slice') && technicalMessage.includes('undefined')) {
      return 'حدث خطأ في تحميل البيانات. يرجى إعادة تحميل الصفحة.';
    }
    
    if (technicalMessage.includes('Cannot read property') || technicalMessage.includes('Cannot read properties')) {
      return 'حدث خطأ في عرض المحتوى. يرجى المحاولة مرة أخرى.';
    }
    
    if (technicalMessage.includes('Network')) {
      return 'حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
    }
    
    // رسالة عامة للأخطاء الأخرى
    return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو إعادة تحميل الصفحة.';
  }

  public showAutoSaveSuccess(lastSaved: Date): string {
    return this.show('success', 'تم الحفظ', `تم حفظ التغييرات في ${lastSaved.toLocaleTimeString('ar')}`, {
      duration: 3000
    });
  }

  public showAutoSaveError(error: string): string {
    return this.show('error', 'فشل الحفظ التلقائي', error, {
      persistent: true,
      actions: [
        {
          id: 'retry-save',
          label: 'إعادة المحاولة',
          action: () => {
            // يمكن ربطها بخدمة الحفظ التلقائي
            if ((window as any).autoSaveService) {
              (window as any).autoSaveService.saveAllPendingChanges();
            }
          },
          style: 'primary'
        }
      ]
    });
  }

  public showConflictDetected(conflictCount: number): string {
    return this.show('warning', 'تضارب في النسخ', `تم اكتشاف ${conflictCount} نسخة متضاربة`, {
      persistent: true,
      actions: [
        {
          id: 'resolve-conflict',
          label: 'حل التضارب',
          action: () => {
            // يمكن ربطها بمكون حل التضارب
            const event = new CustomEvent('show-conflict-resolver');
            window.dispatchEvent(event);
          },
          style: 'primary'
        }
      ]
    });
  }

  public showOfflineMode(): string {
    return this.show('warning', 'وضع عدم الاتصال', 'تم التبديل إلى الحفظ المحلي', {
      duration: 0, // إشعار دائم
      actions: [
        {
          id: 'retry-connection',
          label: 'إعادة المحاولة',
          action: () => {
            if (navigator.onLine) {
              this.show('success', 'تم الاتصال', 'تم استعادة الاتصال بالإنترنت');
            } else {
              this.show('error', 'لا يوجد اتصال', 'لا يزال الاتصال بالإنترنت غير متاح');
            }
          },
          style: 'secondary'
        }
      ]
    });
  }

  public showPerformanceWarning(component: string, loadTime: number): string {
    return this.show('warning', 'أداء بطيء', `${component} يستغرق ${loadTime}ms للتحميل`, {
      duration: 8000,
      metadata: { component },
      actions: [
        {
          id: 'optimize',
          label: 'تحسين الأداء',
          action: () => {
            // يمكن إضافة منطق تحسين الأداء
            console.log('Performance optimization requested for', component);
          },
          style: 'secondary'
        }
      ]
    });
  }

  // إدارة الإشعارات
  public remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  public markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  public clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  public clearByType(type: Notification['type']): void {
    this.notifications = this.notifications.filter(n => n.type !== type);
    this.notifyListeners();
  }

  // الحصول على الإشعارات
  public getAll(): Notification[] {
    // فلترة الإشعارات بناءً على دور المستخدم والإعدادات
    return this.notifications.filter(notification => 
      editorNotificationManager.shouldShowMessage(notification.message, notification.type)
    );
  }

  public getUnread(): Notification[] {
    // فلترة الإشعارات غير المقروءة أيضاً
    return this.notifications.filter(n => 
      !n.read && 
      editorNotificationManager.shouldShowMessage(n.message, n.type)
    );
  }

  public getByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  public getStats(): NotificationStats {
    const unread = this.getUnread();
    const byType = this.notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.notifications.length,
      unread: unread.length,
      byType,
      recent: this.notifications.slice(0, 10)
    };
  }

  // إدارة المستمعين
  public addListener(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // دوال مساعدة
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async reportError(error: Error, component: string): Promise<void> {
    try {
      await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          },
          component,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
      
      this.show('success', 'تم الإبلاغ', 'تم إرسال تقرير المشكلة بنجاح');
    } catch (reportError) {
      this.show('error', 'فشل الإبلاغ', 'لم نتمكن من إرسال تقرير المشكلة');
    }
  }

  // تنظيف الموارد
  public destroy(): void {
    this.persistNotifications();
    this.notifications = [];
    this.listeners = [];
  }
}

// إنشاء instance واحد للاستخدام العام
export const notificationService = new NotificationService();

// تعريض الخدمة على window للاستخدام العام
if (typeof window !== 'undefined') {
  (window as any).notificationService = notificationService;
}

export default NotificationService;