// اختبارات مدير الخصوصية - سبق الذكية
import PrivacyManager, { PrivacyLevel, SensitiveDataType } from '@/lib/tracking/privacy-manager';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch for API calls
global.fetch = jest.fn();

describe('PrivacyManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('loadPrivacySettings', () => {
    it('يجب أن يحمل الإعدادات الافتراضية عند عدم وجود إعدادات محفوظة', () => {
      const settings = PrivacyManager.loadPrivacySettings();

      expect(settings.level).toBe(PrivacyLevel.BALANCED);
      expect(settings.userConsent).toBe(false);
      expect(settings.dataRetentionDays).toBe(365);
      expect(settings.allowedDataTypes).toContain(SensitiveDataType.BEHAVIOR);
      expect(settings.allowedDataTypes).toContain(SensitiveDataType.CONTENT);
    });

    it('يجب أن يحمل الإعدادات المحفوظة', () => {
      const savedSettings = {
        level: PrivacyLevel.MINIMAL,
        userConsent: true,
        dataRetentionDays: 30,
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
        consentVersion: '2.0',
        consentTimestamp: new Date().toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const settings = PrivacyManager.loadPrivacySettings();

      expect(settings.level).toBe(PrivacyLevel.MINIMAL);
      expect(settings.userConsent).toBe(true);
      expect(settings.dataRetentionDays).toBe(30);
    });

    it('يجب أن يعيد تعيين الإعدادات عند تغيير إصدار الموافقة', () => {
      const outdatedSettings = {
        level: PrivacyLevel.FULL,
        userConsent: true,
        consentVersion: '1.0', // إصدار قديم
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        dataRetentionDays: 365,
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(outdatedSettings));

      const settings = PrivacyManager.loadPrivacySettings();

      expect(settings.userConsent).toBe(false);
      expect(settings.consentTimestamp).toBeUndefined();
    });

    it('يجب أن يتعامل مع بيانات تالفة في localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const settings = PrivacyManager.loadPrivacySettings();

      expect(settings.level).toBe(PrivacyLevel.BALANCED);
      expect(settings.userConsent).toBe(false);
    });
  });

  describe('savePrivacySettings', () => {
    it('يجب أن يحفظ الإعدادات في localStorage', () => {
      const policy = {
        level: PrivacyLevel.FULL,
        userConsent: true,
        dataRetentionDays: 180,
        allowedDataTypes: [SensitiveDataType.BEHAVIOR, SensitiveDataType.CONTENT],
        anonymizeData: false,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: true,
        crossSiteTracking: false,
        consentVersion: '2.0',
      };

      PrivacyManager.savePrivacySettings(policy);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sabq_privacy_settings',
        expect.stringContaining('"level":"full"')
      );
    });

    it('يجب أن يضيف timestamp والإصدار عند الحفظ', () => {
      const policy = {
        level: PrivacyLevel.MINIMAL,
        userConsent: true,
        dataRetentionDays: 90,
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
        consentVersion: '2.0',
      };

      PrivacyManager.savePrivacySettings(policy);

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.consentTimestamp).toBeDefined();
      expect(savedData.consentVersion).toBe('2.0');
    });
  });

  describe('canCollectData', () => {
    beforeEach(() => {
      // Set up valid consent
      const validPolicy = {
        level: PrivacyLevel.BALANCED,
        userConsent: true,
        allowedDataTypes: [SensitiveDataType.BEHAVIOR, SensitiveDataType.CONTENT],
        dataRetentionDays: 365,
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
        consentVersion: '2.0',
        consentTimestamp: new Date(),
      };

      PrivacyManager.savePrivacySettings(validPolicy);
    });

    it('يجب أن يسمح بجمع البيانات المصرح بها', () => {
      const canCollectBehavior = PrivacyManager.canCollectData(SensitiveDataType.BEHAVIOR);
      const canCollectContent = PrivacyManager.canCollectData(SensitiveDataType.CONTENT);

      expect(canCollectBehavior).toBe(true);
      expect(canCollectContent).toBe(true);
    });

    it('يجب أن يمنع جمع البيانات غير المصرح بها', () => {
      const canCollectLocation = PrivacyManager.canCollectData(SensitiveDataType.LOCATION);
      const canCollectDevice = PrivacyManager.canCollectData(SensitiveDataType.DEVICE);

      expect(canCollectLocation).toBe(false);
      expect(canCollectDevice).toBe(false);
    });

    it('يجب أن يمنع جمع جميع البيانات عند إيقاف التتبع', () => {
      const offPolicy = {
        level: PrivacyLevel.OFF,
        userConsent: false,
        allowedDataTypes: [],
        dataRetentionDays: 0,
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
        consentVersion: '2.0',
      };

      PrivacyManager.savePrivacySettings(offPolicy);

      const canCollectAny = PrivacyManager.canCollectData(SensitiveDataType.BEHAVIOR);
      expect(canCollectAny).toBe(false);
    });

    it('يجب أن يمنع جمع البيانات بدون موافقة', () => {
      const noConsentPolicy = {
        level: PrivacyLevel.BALANCED,
        userConsent: false, // لا توجد موافقة
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        dataRetentionDays: 365,
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
        consentVersion: '2.0',
      };

      PrivacyManager.savePrivacySettings(noConsentPolicy);

      const canCollect = PrivacyManager.canCollectData(SensitiveDataType.BEHAVIOR);
      expect(canCollect).toBe(false);
    });
  });

  describe('filterData', () => {
    beforeEach(() => {
      const policy = {
        level: PrivacyLevel.BALANCED,
        userConsent: true,
        allowedDataTypes: [SensitiveDataType.BEHAVIOR, SensitiveDataType.CONTENT],
        anonymizeData: true,
        encryptData: true,
        dataRetentionDays: 365,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
        consentVersion: '2.0',
        consentTimestamp: new Date(),
      };

      PrivacyManager.savePrivacySettings(policy);
    });

    it('يجب أن يعيد null للبيانات غير المصرح بها', () => {
      const data = { sensitive_info: 'test' };
      const filtered = PrivacyManager.filterData(data, SensitiveDataType.LOCATION);

      expect(filtered).toBeNull();
    });

    it('يجب أن يصفي البيانات في المستوى الأدنى', () => {
      const minimalPolicy = {
        level: PrivacyLevel.MINIMAL,
        userConsent: true,
        allowedDataTypes: [SensitiveDataType.PII],
        anonymizeData: true,
        encryptData: false,
        dataRetentionDays: 30,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
        consentVersion: '2.0',
        consentTimestamp: new Date(),
      };

      PrivacyManager.savePrivacySettings(minimalPolicy);

      const data = {
        email: 'user@example.com',
        phone: '+966501234567',
        name: 'أحمد محمد',
        other_data: 'safe_data',
      };

      const filtered = PrivacyManager.filterData(data, SensitiveDataType.PII);

      expect(filtered.email).toBeUndefined();
      expect(filtered.phone).toBeUndefined();
      expect(filtered.name).toBeUndefined();
      expect(filtered.other_data).toBe('safe_data');
    });

    it('يجب أن يطبق إخفاء الهوية عند تفعيله', () => {
      const data = {
        user_id: 'user-123',
        timestamp: new Date().toISOString(),
        ip_address: '192.168.1.1',
        content: 'some content',
      };

      const filtered = PrivacyManager.filterData(data, SensitiveDataType.BEHAVIOR);

      expect(filtered.user_id).toMatch(/^anon_/);
      expect(filtered.ip_address).toBeUndefined();
    });

    it('يجب أن يشفر البيانات الحساسة عند تفعيل التشفير', () => {
      const data = {
        reading_pattern: { detailed_interactions: 'sensitive_data' },
        other_field: 'normal_data',
      };

      const filtered = PrivacyManager.filterData(data, SensitiveDataType.BEHAVIOR);

      expect(filtered.other_field).toBe('normal_data');
      // التشفير يجب أن يغير البيانات الحساسة
      expect(filtered.detailed_interactions).not.toBe('sensitive_data');
    });
  });

  describe('generateAnonymousId', () => {
    it('يجب أن يولد معرف مجهول بدون معرف مستخدم', () => {
      const anonymousId = PrivacyManager.generateAnonymousId();

      expect(anonymousId).toMatch(/^anon_\d+_[a-z0-9]+$/);
    });

    it('يجب أن يولد معرف مجهول مستقر للمستخدم نفسه', () => {
      const userId = 'user-123';
      const id1 = PrivacyManager.generateAnonymousId(userId);
      const id2 = PrivacyManager.generateAnonymousId(userId);

      expect(id1).toMatch(/^anon_[a-f0-9]+$/);
      expect(id2).toMatch(/^anon_[a-f0-9]+$/);
      // يجب أن يبدآ بنفس الجزء (نفس المستخدم)
      expect(id1.substring(0, 20)).toBe(id2.substring(0, 20));
    });
  });

  describe('isDataExpired', () => {
    it('يجب أن يحدد انتهاء صلاحية البيانات القديمة', () => {
      const policy = {
        level: PrivacyLevel.BALANCED,
        dataRetentionDays: 30,
        userConsent: true,
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
        consentVersion: '2.0',
      };

      PrivacyManager.savePrivacySettings(policy);

      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40); // 40 يوم في الماضي

      const isExpired = PrivacyManager.isDataExpired(oldDate);
      expect(isExpired).toBe(true);
    });

    it('يجب أن يحدد عدم انتهاء صلاحية البيانات الحديثة', () => {
      const policy = {
        level: PrivacyLevel.BALANCED,
        dataRetentionDays: 365,
        userConsent: true,
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
        consentVersion: '2.0',
      };

      PrivacyManager.savePrivacySettings(policy);

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10); // 10 أيام في الماضي

      const isExpired = PrivacyManager.isDataExpired(recentDate);
      expect(isExpired).toBe(false);
    });
  });

  describe('generatePrivacyReport', () => {
    it('يجب أن يولد تقرير خصوصية شامل', () => {
      const policy = {
        level: PrivacyLevel.BALANCED,
        userConsent: true,
        consentTimestamp: new Date(),
        consentVersion: '2.0',
        dataRetentionDays: 365,
        allowedDataTypes: [SensitiveDataType.BEHAVIOR, SensitiveDataType.CONTENT],
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
      };

      PrivacyManager.savePrivacySettings(policy);

      const report = PrivacyManager.generatePrivacyReport();

      expect(report.privacy_level).toBe('balanced');
      expect(report.consent_status).toBe(true);
      expect(report.data_retention_days).toBe(365);
      expect(report.data_types_collected).toContain('behavioral_patterns');
      expect(report.anonymization_enabled).toBe(true);
      expect(report.encryption_enabled).toBe(true);
      expect(report.third_party_sharing).toBe(false);
      expect(report.generated_at).toBeDefined();
    });
  });

  describe('requestDataDeletion', () => {
    it('يجب أن يطلب حذف البيانات بنجاح', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await PrivacyManager.requestDataDeletion('user-123');

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/privacy/delete-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'user-123' }),
      });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sabq_privacy_settings');
    });

    it('يجب أن يتعامل مع فشل حذف البيانات', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await PrivacyManager.requestDataDeletion('user-123');

      expect(result).toBe(false);
    });

    it('يجب أن يتعامل مع أخطاء الشبكة', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await PrivacyManager.requestDataDeletion('user-123');

      expect(result).toBe(false);
    });
  });

  describe('exportUserData', () => {
    it('يجب أن يصدر بيانات المستخدم بنجاح', async () => {
      const mockData = {
        user_id: 'user-123',
        reading_sessions: [],
        interactions: [],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await PrivacyManager.exportUserData('user-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.exported_at).toBeDefined();
    });

    it('يجب أن يتعامل مع فشل تصدير البيانات', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await PrivacyManager.exportUserData('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateConsent', () => {
    it('يجب أن يتحقق من صحة الموافقة الحديثة', () => {
      const validPolicy = {
        level: PrivacyLevel.BALANCED,
        userConsent: true,
        consentTimestamp: new Date(), // موافقة حديثة
        consentVersion: '2.0',
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        dataRetentionDays: 365,
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
      };

      PrivacyManager.savePrivacySettings(validPolicy);

      const isValid = PrivacyManager.validateConsent();
      expect(isValid).toBe(true);
    });

    it('يجب أن يرفض الموافقة المنتهية الصلاحية', () => {
      const expiredPolicy = {
        level: PrivacyLevel.BALANCED,
        userConsent: true,
        consentTimestamp: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // 400 يوم في الماضي
        consentVersion: '2.0',
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        dataRetentionDays: 365,
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
      };

      PrivacyManager.savePrivacySettings(expiredPolicy);

      const isValid = PrivacyManager.validateConsent();
      expect(isValid).toBe(false);
    });

    it('يجب أن يرفض الموافقة بإصدار قديم', () => {
      const outdatedPolicy = {
        level: PrivacyLevel.BALANCED,
        userConsent: true,
        consentTimestamp: new Date(),
        consentVersion: '1.0', // إصدار قديم
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        dataRetentionDays: 365,
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
      };

      PrivacyManager.savePrivacySettings(outdatedPolicy);

      const isValid = PrivacyManager.validateConsent();
      expect(isValid).toBe(false);
    });

    it('يجب أن يرفض عدم وجود موافقة', () => {
      const noConsentPolicy = {
        level: PrivacyLevel.BALANCED,
        userConsent: false,
        consentTimestamp: new Date(),
        consentVersion: '2.0',
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        dataRetentionDays: 365,
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
      };

      PrivacyManager.savePrivacySettings(noConsentPolicy);

      const isValid = PrivacyManager.validateConsent();
      expect(isValid).toBe(false);
    });
  });

  describe('Data Sanitization', () => {
    it('يجب أن ينقي البيانات في وضع الخصوصية', () => {
      const privacyPolicy = {
        level: PrivacyLevel.BALANCED,
        userConsent: true,
        allowedDataTypes: [SensitiveDataType.BEHAVIOR],
        dataRetentionDays: 365,
        anonymizeData: true,
        encryptData: true,
        shareWithThirdParties: false,
        geoLocationTracking: false,
        crossSiteTracking: false,
        consentVersion: '2.0',
        consentTimestamp: new Date(),
      };

      PrivacyManager.savePrivacySettings(privacyPolicy);

      const sensitiveData = {
        email: 'user@example.com',
        phone: '+966501234567',
        password: 'secret123',
        token: 'jwt-token',
        ip: '192.168.1.1',
        safe_data: 'this is safe',
      };

      const sanitized = PrivacyManager['removeSensitiveData'](sensitiveData);

      expect(sanitized.email).toBeUndefined();
      expect(sanitized.phone).toBeUndefined();
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.token).toBeUndefined();
      expect(sanitized.ip).toBeUndefined();
      expect(sanitized.safe_data).toBe('this is safe');
    });
  });

  describe('Edge Cases', () => {
    it('يجب أن يتعامل مع localStorage غير متاح', () => {
      // Mock localStorage unavailable
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
      });

      const settings = PrivacyManager.loadPrivacySettings();
      expect(settings.level).toBe(PrivacyLevel.BALANCED);

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
    });

    it('يجب أن يتعامل مع بيانات null', () => {
      const filtered = PrivacyManager.filterData(null, SensitiveDataType.BEHAVIOR);
      expect(filtered).toBeNull();
    });

    it('يجب أن يتعامل مع بيانات undefined', () => {
      const filtered = PrivacyManager.filterData(undefined, SensitiveDataType.BEHAVIOR);
      expect(filtered).toBeNull();
    });
  });
});
