import { notificationService, Notification } from '@/lib/services/NotificationService';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Notification API
const NotificationMock = jest.fn().mockImplementation((title, options) => ({
  title,
  ...options,
  close: jest.fn(),
  onclick: null
}));
Object.defineProperty(window, 'Notification', { 
  value: NotificationMock,
  configurable: true
});
Object.defineProperty(Notification, 'permission', { 
  value: 'granted',
  configurable: true
});
Object.defineProperty(Notification, 'requestPermission', { 
  value: jest.fn().mockResolvedValue('granted'),
  configurable: true
});

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notificationService.clear();
  });

  afterEach(() => {
    notificationService.destroy();
  });

  describe('إظهار الإشعارات', () => {
    it('يظهر إشعار أساسي', () => {
      const id = notificationService.show('info', 'Test Title', 'Test Message');
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      
      const notifications = notificationService.getAll();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('Test Title');
      expect(notifications[0].message).toBe('Test Message');
      expect(notifications[0].type).toBe('info');
    });

    it('يظهر إشعار مع خيارات مخصصة', () => {
      const actions = [
        {
          id: 'test-action',
          label: 'Test Action',
          action: jest.fn(),
          style: 'primary' as const
        }
      ];

      const id = notificationService.show('warning', 'Warning', 'Test warning', {
        duration: 10000,
        persistent: true,
        actions
      });
      
      const notifications = notificationService.getAll();
      const notification = notifications.find(n => n.id === id);
      
      expect(notification?.duration).toBe(10000);
      expect(notification?.persistent).toBe(true);
      expect(notification?.actions).toEqual(actions);
    });

    it('يحد من عدد الإشعارات', () => {
      // إضافة أكثر من الحد الأقصى
      for (let i = 0; i < 150; i++) {
        notificationService.show('info', `Title ${i}`, `Message ${i}`);
      }
      
      const notifications = notificationService.getAll();
      expect(notifications.length).toBeLessThanOrEqual(100); // الحد الأقصى
    });
  });

  describe('إشعارات المحرر المخصصة', () => {
    it('يظهر إشعار خطأ المحرر', () => {
      const error = new Error('Test editor error');
      const id = notificationService.showEditorError(error, 'TestEditor', 'error-123');
      
      const notifications = notificationService.getAll();
      const notification = notifications.find(n => n.id === id);
      
      expect(notification?.type).toBe('error');
      expect(notification?.title).toBe('خطأ في المحرر');
      expect(notification?.message).toBe('Test editor error');
      expect(notification?.persistent).toBe(true);
      expect(notification?.metadata?.component).toBe('TestEditor');
      expect(notification?.metadata?.errorId).toBe('error-123');
      expect(notification?.actions).toHaveLength(2);
    });

    it('يظهر إشعار نجاح الحفظ التلقائي', () => {
      const saveTime = new Date();
      const id = notificationService.showAutoSaveSuccess(saveTime);
      
      const notifications = notificationService.getAll();
      const notification = notifications.find(n => n.id === id);
      
      expect(notification?.type).toBe('success');
      expect(notification?.title).toBe('تم الحفظ');
      expect(notification?.duration).toBe(3000);
    });

    it('يظهر إشعار خطأ الحفظ التلقائي', () => {
      const id = notificationService.showAutoSaveError('Save failed');
      
      const notifications = notificationService.getAll();
      const notification = notifications.find(n => n.id === id);
      
      expect(notification?.type).toBe('error');
      expect(notification?.title).toBe('فشل الحفظ التلقائي');
      expect(notification?.message).toBe('Save failed');
      expect(notification?.persistent).toBe(true);
      expect(notification?.actions).toHaveLength(1);
    });

    it('يظهر إشعار اكتشاف التضارب', () => {
      const id = notificationService.showConflictDetected(3);
      
      const notifications = notificationService.getAll();
      const notification = notifications.find(n => n.id === id);
      
      expect(notification?.type).toBe('warning');
      expect(notification?.title).toBe('تضارب في النسخ');
      expect(notification?.message).toBe('تم اكتشاف 3 نسخة متضاربة');
      expect(notification?.persistent).toBe(true);
    });

    it('يظهر إشعار الوضع غير المتصل', () => {
      const id = notificationService.showOfflineMode();
      
      const notifications = notificationService.getAll();
      const notification = notifications.find(n => n.id === id);
      
      expect(notification?.type).toBe('warning');
      expect(notification?.title).toBe('وضع عدم الاتصال');
      expect(notification?.duration).toBe(0); // دائم
    });

    it('يظهر تحذير الأداء', () => {
      const id = notificationService.showPerformanceWarning('TestComponent', 5500);
      
      const notifications = notificationService.getAll();
      const notification = notifications.find(n => n.id === id);
      
      expect(notification?.type).toBe('warning');
      expect(notification?.title).toBe('أداء بطيء');
      expect(notification?.message).toBe('TestComponent يستغرق 5500ms للتحميل');
      expect(notification?.duration).toBe(8000);
    });
  });

  describe('إدارة الإشعارات', () => {
    it('يزيل إشعار محدد', () => {
      const id = notificationService.show('info', 'Test', 'Message');
      
      expect(notificationService.getAll()).toHaveLength(1);
      
      notificationService.remove(id);
      
      expect(notificationService.getAll()).toHaveLength(0);
    });

    it('يميز إشعار كمقروء', () => {
      const id = notificationService.show('info', 'Test', 'Message');
      
      notificationService.markAsRead(id);
      
      const notification = notificationService.getAll().find(n => n.id === id);
      expect(notification?.read).toBe(true);
    });

    it('يميز جميع الإشعارات كمقروءة', () => {
      notificationService.show('info', 'Test 1', 'Message 1');
      notificationService.show('info', 'Test 2', 'Message 2');
      
      notificationService.markAllAsRead();
      
      const notifications = notificationService.getAll();
      expect(notifications.every(n => n.read)).toBe(true);
    });

    it('يمسح جميع الإشعارات', () => {
      notificationService.show('info', 'Test 1', 'Message 1');
      notificationService.show('info', 'Test 2', 'Message 2');
      
      expect(notificationService.getAll()).toHaveLength(2);
      
      notificationService.clear();
      
      expect(notificationService.getAll()).toHaveLength(0);
    });

    it('يمسح الإشعارات حسب النوع', () => {
      notificationService.show('info', 'Info', 'Message');
      notificationService.show('error', 'Error', 'Message');
      notificationService.show('warning', 'Warning', 'Message');
      
      expect(notificationService.getAll()).toHaveLength(3);
      
      notificationService.clearByType('error');
      
      const remaining = notificationService.getAll();
      expect(remaining).toHaveLength(2);
      expect(remaining.every(n => n.type !== 'error')).toBe(true);
    });
  });

  describe('الاستعلامات', () => {
    beforeEach(() => {
      notificationService.show('info', 'Info', 'Message');
      notificationService.show('error', 'Error', 'Message');
      notificationService.show('warning', 'Warning', 'Message');
      
      // تمييز واحد كمقروء
      const notifications = notificationService.getAll();
      notificationService.markAsRead(notifications[0].id);
    });

    it('يحصل على جميع الإشعارات', () => {
      const notifications = notificationService.getAll();
      expect(notifications).toHaveLength(3);
    });

    it('يحصل على الإشعارات غير المقروءة', () => {
      const unread = notificationService.getUnread();
      expect(unread).toHaveLength(2);
      expect(unread.every(n => !n.read)).toBe(true);
    });

    it('يحصل على الإشعارات حسب النوع', () => {
      const errors = notificationService.getByType('error');
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('error');
    });

    it('يحصل على إحصائيات الإشعارات', () => {
      const stats = notificationService.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.unread).toBe(2);
      expect(stats.byType.info).toBe(1);
      expect(stats.byType.error).toBe(1);
      expect(stats.byType.warning).toBe(1);
      expect(stats.recent).toHaveLength(3);
    });
  });

  describe('المستمعين', () => {
    it('يضيف ويشغل المستمعين', () => {
      const listener = jest.fn();
      const unsubscribe = notificationService.addListener(listener);
      
      notificationService.show('info', 'Test', 'Message');
      
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test',
            message: 'Message'
          })
        ])
      );
      
      unsubscribe();
    });

    it('يزيل المستمعين بنجاح', () => {
      const listener = jest.fn();
      const unsubscribe = notificationService.addListener(listener);
      
      unsubscribe();
      listener.mockClear();
      
      notificationService.show('info', 'Test', 'Message');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('الإزالة التلقائية', () => {
    it('يزيل الإشعارات تلقائياً بعد انتهاء المدة', (done) => {
      const id = notificationService.show('info', 'Test', 'Message', { duration: 100 });
      
      expect(notificationService.getAll()).toHaveLength(1);
      
      setTimeout(() => {
        expect(notificationService.getAll()).toHaveLength(0);
        done();
      }, 150);
    });

    it('لا يزيل الإشعارات الدائمة', (done) => {
      const id = notificationService.show('info', 'Test', 'Message', { duration: 0 });
      
      expect(notificationService.getAll()).toHaveLength(1);
      
      setTimeout(() => {
        expect(notificationService.getAll()).toHaveLength(1);
        done();
      }, 100);
    });
  });
});