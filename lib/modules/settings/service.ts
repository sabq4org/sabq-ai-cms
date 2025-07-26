/**
 * نظام الإعدادات المتقدم - خدمات الإعدادات
 * Advanced Settings System - Settings Service
 */

import { query } from '@/lib/db';
import { 
  SystemSettings, 
  UserSettings, 
  SettingsUpdatePayload,
  SettingsFilterOptions,
  SettingsBulkUpdate,
  SettingsExportOptions,
  SettingsBackup,
  SettingsAuditLog,
  SETTINGS_CATEGORIES,
  SETTINGS_DATA_TYPES,
  SETTINGS_ENVIRONMENTS
} from './types';
import { validateSettingValue } from './validators';
import { encryptSensitiveValue, decryptSensitiveValue } from '@/lib/utils/encryption';
import { createSettingsBackup, restoreSettingsBackup } from './backup';
import { invalidateSettingsCache, getCachedSetting, setCachedSetting } from './cache';

export class SettingsService {
  
  /**
   * الحصول على الإعدادات العامة للنظام
   * Get system settings
   */
  async getSystemSettings(filters: SettingsFilterOptions = {}) {
    try {
      const whereClause: any = {};
      
      if (filters.category) whereClause.category = filters.category;
      if (filters.section) whereClause.section = filters.section;
      if (filters.environment) whereClause.environment = filters.environment;
      if (filters.is_public !== undefined) whereClause.is_public = filters.is_public;
      if (filters.tags && filters.tags.length > 0) {
        whereClause.tags = { hasSome: filters.tags };
      }
      if (filters.search) {
        whereClause.OR = [
          { key: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const settings = await prisma.systemSettings.findMany({
        where: whereClause,
        orderBy: [
          { priority: 'asc' },
          { category: 'asc' },
          { key: 'asc' }
        ]
      });

      // فك تشفير القيم الحساسة
      return settings.map(setting => ({
        ...setting,
        value: setting.is_encrypted 
          ? decryptSensitiveValue(setting.value)
          : setting.value
      }));

    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw new Error('فشل في جلب إعدادات النظام');
    }
  }

  /**
   * الحصول على إعداد واحد
   * Get single setting
   */
  async getSetting(key: string, category?: string, useCache: boolean = true) {
    try {
      const cacheKey = `setting:${category || 'default'}:${key}`;
      
      if (useCache) {
        const cached = await getCachedSetting(cacheKey);
        if (cached) return cached;
      }

      const whereClause: any = { key };
      if (category) whereClause.category = category;

      const setting = await prisma.systemSettings.findFirst({
        where: whereClause,
        orderBy: { priority: 'asc' }
      });

      if (!setting) return null;

      const decryptedSetting = {
        ...setting,
        value: setting.is_encrypted 
          ? decryptSensitiveValue(setting.value)
          : setting.value
      };

      if (useCache) {
        await setCachedSetting(cacheKey, decryptedSetting);
      }

      return decryptedSetting;

    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      throw new Error(`فشل في جلب الإعداد ${key}`);
    }
  }

  /**
   * تحديث إعداد النظام
   * Update system setting
   */
  async updateSystemSetting(payload: SettingsUpdatePayload, userId: string) {
    try {
      // التحقق من صحة القيمة
      const isValid = await validateSettingValue(payload.value, payload.validation_rules);
      if (!isValid.valid) {
        throw new Error(`قيمة غير صالحة: ${isValid.errors.join(', ')}`);
      }

      // البحث عن الإعداد الحالي
      const existingSetting = await prisma.systemSettings.findFirst({
        where: { 
          key: payload.key,
          category: payload.category || SETTINGS_CATEGORIES.GENERAL
        }
      });

      // تشفير القيم الحساسة
      const shouldEncrypt = this.shouldEncryptSetting(payload.key, payload.value);
      const processedValue = shouldEncrypt 
        ? encryptSensitiveValue(payload.value)
        : payload.value;

      let updatedSetting;

      if (existingSetting) {
        // تسجيل التغيير في سجل المراجعة
        await this.logSettingChange(userId, 'update', payload.key, existingSetting.value, payload.value);

        updatedSetting = await prisma.systemSettings.update({
          where: { id: existingSetting.id },
          data: {
            value: processedValue,
            description: payload.description || existingSetting.description,
            validation_rules: payload.validation_rules || existingSetting.validation_rules,
            is_encrypted: shouldEncrypt,
            updated_at: new Date()
          }
        });
      } else {
        // إنشاء إعداد جديد
        await this.logSettingChange(userId, 'create', payload.key, null, payload.value);

        updatedSetting = await prisma.systemSettings.create({
          data: {
            section: 'custom',
            key: payload.key,
            value: processedValue,
            data_type: this.inferDataType(payload.value),
            description: payload.description,
            category: payload.category || SETTINGS_CATEGORIES.GENERAL,
            environment: SETTINGS_ENVIRONMENTS.PRODUCTION,
            is_public: false,
            is_encrypted: shouldEncrypt,
            validation_rules: payload.validation_rules,
            priority: 3,
            tags: []
          }
        });
      }

      // إبطال الكاش
      await invalidateSettingsCache(payload.key, payload.category);

      return {
        ...updatedSetting,
        value: shouldEncrypt ? payload.value : updatedSetting.value
      };

    } catch (error) {
      console.error('Error updating system setting:', error);
      throw new Error(`فشل في تحديث الإعداد: ${error.message}`);
    }
  }

  /**
   * تحديث متعدد للإعدادات
   * Bulk update settings
   */
  async bulkUpdateSettings(bulkUpdate: SettingsBulkUpdate, userId: string) {
    try {
      // إنشاء نسخة احتياطية قبل التحديث
      if (bulkUpdate.backup_before_update) {
        await createSettingsBackup(`bulk_update_${Date.now()}`, userId);
      }

      const results = [];
      const errors = [];

      for (const setting of bulkUpdate.settings) {
        try {
          const result = await this.updateSystemSetting(setting, userId);
          results.push(result);
        } catch (error) {
          errors.push({ key: setting.key, error: error.message });
        }
      }

      // تسجيل العملية المجمعة
      await this.logSettingChange(userId, 'bulk_update', 'multiple', null, {
        updated_count: results.length,
        error_count: errors.length
      });

      return {
        success: true,
        updated_count: results.length,
        error_count: errors.length,
        results,
        errors
      };

    } catch (error) {
      console.error('Error in bulk update:', error);
      throw new Error(`فشل في التحديث المجمع: ${error.message}`);
    }
  }

  /**
   * إعدادات المستخدم
   * User settings management
   */
  async getUserSettings(userId: string, category?: string) {
    try {
      const whereClause: any = { user_id: userId };
      if (category) whereClause.category = category;

      return await prisma.userSettings.findMany({
        where: whereClause,
        orderBy: [
          { category: 'asc' },
          { key: 'asc' }
        ]
      });

    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw new Error('فشل في جلب إعدادات المستخدم');
    }
  }

  async updateUserSetting(userId: string, key: string, value: any, category: string = 'general') {
    try {
      const dataType = this.inferDataType(value);

      const existingSetting = await prisma.userSettings.findFirst({
        where: { user_id: userId, key, category }
      });

      if (existingSetting) {
        return await prisma.userSettings.update({
          where: { id: existingSetting.id },
          data: {
            value,
            data_type: dataType,
            updated_at: new Date()
          }
        });
      } else {
        return await prisma.userSettings.create({
          data: {
            user_id: userId,
            category,
            key,
            value,
            data_type: dataType,
            is_default: false,
            sync_across_devices: true
          }
        });
      }

    } catch (error) {
      console.error('Error updating user setting:', error);
      throw new Error(`فشل في تحديث إعداد المستخدم: ${error.message}`);
    }
  }

  /**
   * تصدير الإعدادات
   * Export settings
   */
  async exportSettings(options: SettingsExportOptions = {}) {
    try {
      const filters: SettingsFilterOptions = {};
      if (options.categories) {
        // تحويل إلى تصفية بالفئات
      }

      const settings = await this.getSystemSettings(filters);
      
      // تصفية الإعدادات الحساسة
      const filteredSettings = options.include_sensitive 
        ? settings
        : settings.filter(s => !s.is_encrypted);

      switch (options.format) {
        case 'yaml':
          return this.convertToYAML(filteredSettings);
        case 'env':
          return this.convertToEnv(filteredSettings);
        case 'json':
        default:
          return options.minify 
            ? JSON.stringify(filteredSettings)
            : JSON.stringify(filteredSettings, null, 2);
      }

    } catch (error) {
      console.error('Error exporting settings:', error);
      throw new Error('فشل في تصدير الإعدادات');
    }
  }

  /**
   * استعادة الإعدادات من نسخة احتياطية
   * Restore settings from backup
   */
  async restoreSettings(backupId: string, userId: string) {
    try {
      await restoreSettingsBackup(backupId, userId);
      
      // إبطال جميع الكاش
      await invalidateSettingsCache('*');
      
      return { success: true, message: 'تم استعادة الإعدادات بنجاح' };

    } catch (error) {
      console.error('Error restoring settings:', error);
      throw new Error(`فشل في استعادة الإعدادات: ${error.message}`);
    }
  }

  /**
   * وظائف مساعدة
   * Helper functions
   */
  private shouldEncryptSetting(key: string, value: any): boolean {
    const sensitiveKeys = [
      'password', 'secret', 'token', 'key', 'api_key',
      'database_url', 'smtp_password', 'encryption_key'
    ];
    
    return sensitiveKeys.some(sensitiveKey => 
      key.toLowerCase().includes(sensitiveKey)
    );
  }

  private inferDataType(value: any): string {
    if (typeof value === 'boolean') return SETTINGS_DATA_TYPES.BOOLEAN;
    if (typeof value === 'number') return SETTINGS_DATA_TYPES.NUMBER;
    if (Array.isArray(value)) return SETTINGS_DATA_TYPES.ARRAY;
    if (typeof value === 'object') return SETTINGS_DATA_TYPES.JSON;
    if (value instanceof Date) return SETTINGS_DATA_TYPES.DATE;
    return SETTINGS_DATA_TYPES.STRING;
  }

  private async logSettingChange(
    userId: string, 
    action: string, 
    key: string, 
    oldValue: any, 
    newValue: any
  ) {
    try {
      // يمكن تنفيذ نظام سجل المراجعة هنا
      console.log('Settings change logged:', { userId, action, key });
    } catch (error) {
      console.error('Error logging setting change:', error);
    }
  }

  private convertToYAML(settings: any[]): string {
    // تنفيذ تحويل إلى YAML
    return '# Settings Export\n' + JSON.stringify(settings, null, 2);
  }

  private convertToEnv(settings: any[]): string {
    return settings
      .filter(s => s.is_public || s.environment !== 'production')
      .map(s => `${s.key.toUpperCase()}=${s.value}`)
      .join('\n');
  }
}

export const settingsService = new SettingsService();
