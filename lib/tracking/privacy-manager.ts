// مدير الخصوصية في نظام التتبع - سبق الذكية
import { AdvancedEncryption } from '../auth/security-standards';
import CryptoJS from 'crypto-js';

// مستويات الخصوصية
export enum PrivacyLevel {
  FULL = 'full',           // جمع جميع البيانات
  BALANCED = 'balanced',   // جمع البيانات الأساسية مع التشفير
  MINIMAL = 'minimal',     // الحد الأدنى من البيانات
  OFF = 'off'             // إيقاف التتبع تماماً
}

// أنواع البيانات الحساسة
export enum SensitiveDataType {
  PII = 'personally_identifiable_info',      // معلومات شخصية
  LOCATION = 'location_data',                 // بيانات الموقع
  DEVICE = 'device_fingerprint',              // بصمة الجهاز
  BEHAVIOR = 'behavioral_patterns',           // الأنماط السلوكية
  CONTENT = 'content_interaction'             // تفاعل المحتوى
}

// واجهة سياسة الخصوصية
export interface PrivacyPolicy {
  level: PrivacyLevel;
  dataRetentionDays: number;
  allowedDataTypes: SensitiveDataType[];
  anonymizeData: boolean;
  encryptData: boolean;
  shareWithThirdParties: boolean;
  geoLocationTracking: boolean;
  crossSiteTracking: boolean;
  userConsent: boolean;
  consentTimestamp?: Date;
  consentVersion: string;
}

// إعدادات التشفير
export interface EncryptionSettings {
  algorithm: string;
  keyRotationIntervalHours: number;
  saltLength: number;
  hashIterations: number;
}

// مدير الخصوصية
export class PrivacyManager {
  private static readonly STORAGE_KEY = 'sabq_privacy_settings';
  private static readonly CONSENT_VERSION = '2.0';
  private static readonly DEFAULT_RETENTION_DAYS = 365;
  
  private static encryptionSettings: EncryptionSettings = {
    algorithm: 'AES-256-GCM',
    keyRotationIntervalHours: 24,
    saltLength: 32,
    hashIterations: 100000
  };

  private static currentPolicy: PrivacyPolicy = {
    level: PrivacyLevel.BALANCED,
    dataRetentionDays: this.DEFAULT_RETENTION_DAYS,
    allowedDataTypes: [
      SensitiveDataType.BEHAVIOR,
      SensitiveDataType.CONTENT
    ],
    anonymizeData: true,
    encryptData: true,
    shareWithThirdParties: false,
    geoLocationTracking: false,
    crossSiteTracking: false,
    userConsent: false,
    consentVersion: this.CONSENT_VERSION
  };

  /**
   * تحميل إعدادات الخصوصية
   */
  static loadPrivacySettings(): PrivacyPolicy {
    try {
      if (typeof window === 'undefined') {
        return this.currentPolicy;
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored) as PrivacyPolicy;
        
        // التحقق من إصدار الموافقة
        if (settings.consentVersion !== this.CONSENT_VERSION) {
          console.log('🔄 إصدار جديد من سياسة الخصوصية - إعادة طلب الموافقة');
          return this.resetPrivacySettings();
        }

        this.currentPolicy = settings;
        return settings;
      }
    } catch (error) {
      console.error('❌ فشل في تحميل إعدادات الخصوصية:', error);
    }

    return this.currentPolicy;
  }

  /**
   * حفظ إعدادات الخصوصية
   */
  static savePrivacySettings(policy: PrivacyPolicy): void {
    try {
      if (typeof window === 'undefined') {
        return;
      }

      policy.consentTimestamp = new Date();
      policy.consentVersion = this.CONSENT_VERSION;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(policy));
      this.currentPolicy = policy;
      
      console.log('💾 تم حفظ إعدادات الخصوصية');
    } catch (error) {
      console.error('❌ فشل في حفظ إعدادات الخصوصية:', error);
    }
  }

  /**
   * إعادة تعيين إعدادات الخصوصية
   */
  static resetPrivacySettings(): PrivacyPolicy {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    
    this.currentPolicy.userConsent = false;
    this.currentPolicy.consentTimestamp = undefined;
    
    return this.currentPolicy;
  }

  /**
   * التحقق من الموافقة على جمع نوع معين من البيانات
   */
  static canCollectData(dataType: SensitiveDataType): boolean {
    const policy = this.getCurrentPolicy();
    
    // إذا كان التتبع متوقف تماماً
    if (policy.level === PrivacyLevel.OFF) {
      return false;
    }

    // إذا لم يوافق المستخدم
    if (!policy.userConsent) {
      return false;
    }

    // التحقق من نوع البيانات المسموح
    return policy.allowedDataTypes.includes(dataType);
  }

  /**
   * تصفية البيانات حسب سياسة الخصوصية
   */
  static filterData(data: any, dataType: SensitiveDataType): any {
    const policy = this.getCurrentPolicy();

    // إذا غير مسموح بجمع هذا النوع من البيانات
    if (!this.canCollectData(dataType)) {
      return null;
    }

    let filteredData = { ...data };

    // تطبيق التصفية حسب مستوى الخصوصية
    switch (policy.level) {
      case PrivacyLevel.MINIMAL:
        filteredData = this.applyMinimalFiltering(filteredData, dataType);
        break;
      
      case PrivacyLevel.BALANCED:
        filteredData = this.applyBalancedFiltering(filteredData, dataType);
        break;
      
      case PrivacyLevel.FULL:
        // لا تصفية - جمع جميع البيانات
        break;
      
      default:
        return null;
    }

    // تطبيق إخفاء الهوية إذا مطلوب
    if (policy.anonymizeData) {
      filteredData = this.anonymizeData(filteredData, dataType);
    }

    // تطبيق التشفير إذا مطلوب
    if (policy.encryptData) {
      filteredData = this.encryptSensitiveFields(filteredData, dataType);
    }

    return filteredData;
  }

  /**
   * تشفير البيانات الحساسة
   */
  static encryptSensitiveData(data: string): string {
    try {
      return AdvancedEncryption.encryptPII(data);
    } catch (error) {
      console.error('❌ فشل في تشفير البيانات:', error);
      return data;
    }
  }

  /**
   * فك تشفير البيانات الحساسة
   */
  static decryptSensitiveData(encryptedData: string): string {
    try {
      return AdvancedEncryption.decryptPII(encryptedData);
    } catch (error) {
      console.error('❌ فشل في فك تشفير البيانات:', error);
      return encryptedData;
    }
  }

  /**
   * إنشاء معرف مجهول الهوية
   */
  static generateAnonymousId(userId?: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    
    if (userId) {
      // إنشاء hash مستقر للمستخدم
      const hash = CryptoJS.SHA256(userId + timestamp.substring(0, 8)).toString();
      return `anon_${hash.substring(0, 16)}`;
    }
    
    return `anon_${timestamp}_${random}`;
  }

  /**
   * التحقق من انتهاء صلاحية البيانات
   */
  static isDataExpired(timestamp: Date): boolean {
    const policy = this.getCurrentPolicy();
    const now = new Date();
    const expirationDate = new Date(timestamp);
    expirationDate.setDate(expirationDate.getDate() + policy.dataRetentionDays);
    
    return now > expirationDate;
  }

  /**
   * إنشاء تقرير الخصوصية
   */
  static generatePrivacyReport(): any {
    const policy = this.getCurrentPolicy();
    
    return {
      privacy_level: policy.level,
      consent_status: policy.userConsent,
      consent_date: policy.consentTimestamp,
      consent_version: policy.consentVersion,
      data_retention_days: policy.dataRetentionDays,
      data_types_collected: policy.allowedDataTypes,
      anonymization_enabled: policy.anonymizeData,
      encryption_enabled: policy.encryptData,
      third_party_sharing: policy.shareWithThirdParties,
      location_tracking: policy.geoLocationTracking,
      cross_site_tracking: policy.crossSiteTracking,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * طلب حذف البيانات (Right to be Forgotten)
   */
  static async requestDataDeletion(userId: string): Promise<boolean> {
    try {
      console.log(`🗑️ طلب حذف البيانات للمستخدم: ${userId}`);
      
      // يمكن إضافة استدعاء API لحذف البيانات من الخادم
      const response = await fetch('/api/privacy/delete-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (response.ok) {
        // حذف البيانات المحلية
        this.resetPrivacySettings();
        console.log('✅ تم حذف البيانات بنجاح');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ فشل في حذف البيانات:', error);
      return false;
    }
  }

  /**
   * تصدير البيانات الشخصية
   */
  static async exportUserData(userId: string): Promise<any> {
    try {
      console.log(`📤 تصدير البيانات للمستخدم: ${userId}`);
      
      const response = await fetch(`/api/privacy/export-user-data?user_id=${userId}`);
      
      if (response.ok) {
        const userData = await response.json();
        return {
          success: true,
          data: userData,
          exported_at: new Date().toISOString()
        };
      }
      
      return { success: false, error: 'فشل في تصدير البيانات' };
    } catch (error) {
      console.error('❌ فشل في تصدير البيانات:', error);
      return { success: false, error: error.message };
    }
  }

  // الطرق الخاصة

  private static getCurrentPolicy(): PrivacyPolicy {
    return this.currentPolicy;
  }

  private static applyMinimalFiltering(data: any, dataType: SensitiveDataType): any {
    const filtered = { ...data };

    switch (dataType) {
      case SensitiveDataType.PII:
        // إزالة جميع المعلومات الشخصية
        delete filtered.email;
        delete filtered.phone;
        delete filtered.name;
        delete filtered.address;
        break;

      case SensitiveDataType.LOCATION:
        // إزالة بيانات الموقع الدقيقة
        if (filtered.location) {
          delete filtered.location.coordinates;
          delete filtered.location.city;
          // الاحتفاظ بالدولة فقط
        }
        break;

      case SensitiveDataType.DEVICE:
        // إزالة بصمة الجهاز التفصيلية
        if (filtered.device) {
          delete filtered.device.serial;
          delete filtered.device.mac_address;
          delete filtered.device.unique_id;
        }
        break;

      case SensitiveDataType.BEHAVIOR:
        // تقليل تفاصيل السلوك
        if (filtered.reading_pattern) {
          delete filtered.reading_pattern.pause_points;
          delete filtered.reading_pattern.detailed_interactions;
        }
        break;
    }

    return filtered;
  }

  private static applyBalancedFiltering(data: any, dataType: SensitiveDataType): any {
    const filtered = { ...data };

    switch (dataType) {
      case SensitiveDataType.PII:
        // تشفير المعلومات الشخصية
        if (filtered.email) {
          filtered.email = this.hashSensitiveValue(filtered.email);
        }
        break;

      case SensitiveDataType.LOCATION:
        // تقليل دقة الموقع
        if (filtered.location?.coordinates) {
          filtered.location.coordinates = this.reduceLocationPrecision(
            filtered.location.coordinates
          );
        }
        break;

      case SensitiveDataType.DEVICE:
        // تشفير معرفات الجهاز
        if (filtered.device?.unique_id) {
          filtered.device.unique_id = this.hashSensitiveValue(filtered.device.unique_id);
        }
        break;
    }

    return filtered;
  }

  private static anonymizeData(data: any, dataType: SensitiveDataType): any {
    const anonymized = { ...data };

    // استبدال معرف المستخدم بمعرف مجهول
    if (anonymized.user_id) {
      anonymized.user_id = this.generateAnonymousId(anonymized.user_id);
    }

    // إزالة الطوابع الزمنية الدقيقة
    if (anonymized.timestamp) {
      anonymized.timestamp = this.roundTimestamp(new Date(anonymized.timestamp));
    }

    // إزالة عنوان IP
    delete anonymized.ip_address;

    return anonymized;
  }

  private static encryptSensitiveFields(data: any, dataType: SensitiveDataType): any {
    const encrypted = { ...data };
    const sensitiveFields = this.getSensitiveFields(dataType);

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        encrypted[field] = this.encryptSensitiveData(
          typeof encrypted[field] === 'string' 
            ? encrypted[field] 
            : JSON.stringify(encrypted[field])
        );
      }
    }

    return encrypted;
  }

  private static getSensitiveFields(dataType: SensitiveDataType): string[] {
    const fieldsMap = {
      [SensitiveDataType.PII]: ['email', 'phone', 'name', 'address'],
      [SensitiveDataType.LOCATION]: ['coordinates', 'ip_address'],
      [SensitiveDataType.DEVICE]: ['unique_id', 'serial', 'mac_address'],
      [SensitiveDataType.BEHAVIOR]: ['detailed_interactions', 'pause_points'],
      [SensitiveDataType.CONTENT]: ['search_queries', 'private_content']
    };

    return fieldsMap[dataType] || [];
  }

  private static hashSensitiveValue(value: string): string {
    return CryptoJS.SHA256(value + this.getSalt()).toString().substring(0, 16);
  }

  private static getSalt(): string {
    // في بيئة الإنتاج، يجب استخدام salt فريد ومحفوظ بأمان
    return process.env.PRIVACY_SALT || 'sabq_privacy_salt_2024';
  }

  private static reduceLocationPrecision(coordinates: { latitude: number; longitude: number }): any {
    // تقليل الدقة إلى كيلومتر واحد تقريباً
    return {
      latitude: Math.round(coordinates.latitude * 100) / 100,
      longitude: Math.round(coordinates.longitude * 100) / 100
    };
  }

  private static roundTimestamp(date: Date): string {
    // تقريب الوقت إلى أقرب ساعة
    const rounded = new Date(date);
    rounded.setMinutes(0, 0, 0);
    return rounded.toISOString();
  }

  /**
   * التحقق من صحة الموافقة
   */
  static validateConsent(): boolean {
    const policy = this.getCurrentPolicy();
    
    if (!policy.userConsent) {
      return false;
    }

    // التحقق من انتهاء صلاحية الموافقة (سنة واحدة)
    if (policy.consentTimestamp) {
      const consentAge = Date.now() - new Date(policy.consentTimestamp).getTime();
      const maxAge = 365 * 24 * 60 * 60 * 1000; // سنة بالميلي ثانية
      
      if (consentAge > maxAge) {
        console.log('⏰ انتهت صلاحية الموافقة - إعادة طلب موافقة');
        return false;
      }
    }

    // التحقق من إصدار الموافقة
    if (policy.consentVersion !== this.CONSENT_VERSION) {
      return false;
    }

    return true;
  }
}

export default PrivacyManager;
