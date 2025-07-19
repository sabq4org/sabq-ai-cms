import { autoSaveService, AutoSaveConfig } from '@/lib/services/AutoSaveService';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('AutoSaveService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // إعادة تعيين الخدمة
    autoSaveService.destroy();
  });

  afterEach(() => {
    autoSaveService.destroy();
  });

  describe('تسجيل التكوين', () => {
    it('يسجل تكوين جديد بنجاح', () => {
      const config: AutoSaveConfig = {
        key: 'test-editor',
        interval: 30000,
        maxVersions: 10
      };

      expect(() => autoSaveService.register(config)).not.toThrow();
    });

    it('ينشئ حالة أولية عند التسجيل', () => {
      const config: AutoSaveConfig = {
        key: 'test-editor',
        interval: 30000,
        maxVersions: 10
      };

      autoSaveService.register(config);
      const state = autoSaveService.getState('test-editor');

      expect(state).toBeDefined();
      expect(state?.isEnabled).toBe(true);
      expect(state?.hasUnsavedChanges).toBe(false);
      expect(state?.versions).toEqual([]);
    });
  });

  describe('الحفظ', () => {
    beforeEach(() => {
      const config: AutoSaveConfig = {
        key: 'test-editor',
        interval: 30000,
        maxVersions: 5
      };
      autoSaveService.register(config);
    });

    it('يحفظ المحتوى بنجاح', async () => {
      const content = { text: 'Test content' };
      
      await expect(autoSaveService.save('test-editor', content)).resolves.not.toThrow();
      
      const state = autoSaveService.getState('test-editor');
      expect(state?.lastSaved).toBeDefined();
      expect(state?.hasUnsavedChanges).toBe(false);
      expect(state?.versions).toHaveLength(1);
    });

    it('يحافظ على الحد الأقصى للنسخ', async () => {
      const content = { text: 'Test content' };
      
      // حفظ أكثر من الحد الأقصى
      for (let i = 0; i < 7; i++) {
        await autoSaveService.save('test-editor', { ...content, version: i });
      }
      
      const state = autoSaveService.getState('test-editor');
      expect(state?.versions).toHaveLength(5); // الحد الأقصى
    });

    it('يرفض الحفظ للمفاتيح غير المسجلة', async () => {
      const content = { text: 'Test content' };
      
      await expect(autoSaveService.save('unregistered-key', content))
        .rejects.toThrow('AutoSave not registered for key: unregistered-key');
    });
  });

  describe('الاستعادة', () => {
    beforeEach(() => {
      const config: AutoSaveConfig = {
        key: 'test-editor',
        interval: 30000,
        maxVersions: 5
      };
      autoSaveService.register(config);
    });

    it('يستعيد آخر نسخة محفوظة', async () => {
      const content = { text: 'Test content' };
      await autoSaveService.save('test-editor', content);
      
      const restored = await autoSaveService.restore('test-editor');
      expect(restored).toEqual(content);
    });

    it('يستعيد نسخة محددة بالمعرف', async () => {
      const content1 = { text: 'Content 1' };
      const content2 = { text: 'Content 2' };
      
      await autoSaveService.save('test-editor', content1);
      await autoSaveService.save('test-editor', content2);
      
      const state = autoSaveService.getState('test-editor');
      const firstVersionId = state?.versions[1]?.id; // النسخة الأولى
      
      if (firstVersionId) {
        const restored = await autoSaveService.restore('test-editor', firstVersionId);
        expect(restored).toEqual(content1);
      }
    });

    it('يرمي خطأ عند عدم وجود نسخ محفوظة', async () => {
      await expect(autoSaveService.restore('test-editor'))
        .rejects.toThrow('No saved version found');
    });
  });

  describe('كشف التضارب', () => {
    beforeEach(() => {
      const config: AutoSaveConfig = {
        key: 'test-editor',
        interval: 30000,
        maxVersions: 10,
        enableConflictResolution: true
      };
      autoSaveService.register(config);
    });

    it('يكتشف التضارب بين النسخ', async () => {
      // محاكاة نسخ متضاربة
      const content1 = { text: 'Content 1' };
      const content2 = { text: 'Content 2' };
      
      await autoSaveService.save('test-editor', content1);
      
      // تغيير الوقت قليلاً لمحاكاة التضارب
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 30000); // 30 ثانية
      await autoSaveService.save('test-editor', content2);
      
      const conflicts = await autoSaveService.detectConflicts('test-editor');
      expect(conflicts).toBeDefined();
    });
  });

  describe('إدارة الحالة', () => {
    it('يتتبع التغييرات غير المحفوظة', () => {
      const config: AutoSaveConfig = {
        key: 'test-editor',
        interval: 30000,
        maxVersions: 5
      };
      autoSaveService.register(config);
      
      autoSaveService.markAsChanged('test-editor');
      
      const state = autoSaveService.getState('test-editor');
      expect(state?.hasUnsavedChanges).toBe(true);
    });

    it('يعيد null للمفاتيح غير المسجلة', () => {
      const state = autoSaveService.getState('non-existent-key');
      expect(state).toBeNull();
    });
  });

  describe('المستمعين', () => {
    it('يضيف ويزيل المستمعين بنجاح', () => {
      const config: AutoSaveConfig = {
        key: 'test-editor',
        interval: 30000,
        maxVersions: 5
      };
      autoSaveService.register(config);
      
      const listener = jest.fn();
      const unsubscribe = autoSaveService.addListener('test-editor', listener);
      
      // تغيير الحالة لتشغيل المستمع
      autoSaveService.markAsChanged('test-editor');
      
      expect(listener).toHaveBeenCalled();
      
      // إزالة المستمع
      unsubscribe();
      listener.mockClear();
      
      autoSaveService.markAsChanged('test-editor');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('التنظيف', () => {
    it('ينظف الموارد عند الإلغاء', () => {
      const config: AutoSaveConfig = {
        key: 'test-editor',
        interval: 30000,
        maxVersions: 5
      };
      autoSaveService.register(config);
      
      expect(() => autoSaveService.unregister('test-editor')).not.toThrow();
      
      const state = autoSaveService.getState('test-editor');
      expect(state).toBeNull();
    });

    it('ينظف جميع الموارد عند التدمير', () => {
      const config: AutoSaveConfig = {
        key: 'test-editor',
        interval: 30000,
        maxVersions: 5
      };
      autoSaveService.register(config);
      
      expect(() => autoSaveService.destroy()).not.toThrow();
      
      const state = autoSaveService.getState('test-editor');
      expect(state).toBeNull();
    });
  });
});