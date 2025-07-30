/**
 * نظام الإعدادات المتقدم - خدمات الإعدادات (محدث للعمل مع Prisma)
 * Advanced Settings System - Settings Service (Updated for Prisma)
 */

import prisma from '@/lib/prisma';

import { 
  SettingsUpdatePayload,
  SettingsFilterOptions,
  SettingsBulkUpdate,
  SettingsExportOptions,
  SETTINGS_CATEGORIES,
  SETTINGS_DATA_TYPES,
  SETTINGS_ENVIRONMENTS
} from './types';
import { validateSettingValue } from './validators';
import { encryptSensitiveValue, decryptSensitiveValue } from '@/lib/utils/encryption';
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
      if (filters.section) whereClause.module = filters.section;
      if (filters.is_public !== undefined) whereClause.is_public = filters.is_public;
      
      if (filters.search) {
        whereClause.OR = [
          { key: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const settings = await prisma.systemSettings.findMany({
        where: whereClause,
        orderBy: [
          { module: 'asc' },
          { category: 'asc' },
          { key: 'asc' }
        ]
      });

      // فك تشفير القيم الحساسة إذا كانت مشفرة
      return settings.map(setting => {
        let value = setting.value;
        try {
          // فحص إذا كانت القيمة مشفرة (تحتوي على pattern التشفير)
          if (typeof value === 'string' && value.includes(':') && this.shouldEncryptSetting(setting.key)) {
            value = decryptSensitiveValue(value);
          }
        } catch (error) {
          // إذا فشل فك التشفير، استخدم القيمة الأصلية
          console.warn(`Failed to decrypt setting ${setting.key}:`, error);
        }
        
        return {
          ...setting,
          value
        };
      });

    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw new Error('فشل في جلب إعدادات النظام');
    }
  }

  /**
   * الحصول على إعداد واحد
   * Get single setting
   */
  async getSetting(key: string, category: string = 'general', module: string = 'general', useCache: boolean = true) {
    try {
      const cacheKey = `setting:${module}:${category}:${key}`;
      
      if (useCache) {
        const cached = await getCachedSetting(cacheKey);
        if (cached) return cached;
      }

      const setting = await prisma.systemSettings.findFirst({
        where: { 
          key,
          category,
          module
        }
      });

      if (!setting) return null;

      let value = setting.value;
      try {
        // فك التشفير إذا كان مطلوباً
        if (typeof value === 'string' && value.includes(':') && this.shouldEncryptSetting(setting.key)) {
          value = decryptSensitiveValue(value as string);
        }
      } catch (error) {
        console.warn(`Failed to decrypt setting ${setting.key}:`, error);
      }

      const decryptedSetting = {
        ...setting,
        value
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
  async updateSystemSetting(
    payload: SettingsUpdatePayload & { module?: string }, 
    userId: string
  ) {
    try {
      // التحقق من صحة القيمة
      const isValid = await validateSettingValue(payload.value, payload.validation_rules);
      if (!isValid.valid) {
        throw new Error(`قيمة غير صالحة: ${isValid.errors.join(', ')}`);
      }

      const module = payload.module || 'general';
      const category = payload.category || SETTINGS_CATEGORIES.GENERAL;

      // تشفير القيم الحساسة
      const shouldEncrypt = this.shouldEncryptSetting(payload.key);
      let processedValue: any = payload.value;
      
      if (shouldEncrypt) {
        processedValue = encryptSensitiveValue(payload.value);
      }

      // البحث عن الإعداد الحالي
      const existingSetting = await prisma.systemSettings.findFirst({
        where: { 
          key: payload.key,
          category,
          module
        }
      });

      let updatedSetting;

      if (existingSetting) {
        // تحديث الإعداد الموجود
        updatedSetting = await prisma.systemSettings.update({
          where: { id: existingSetting.id },
          data: {
            value: processedValue,
            description: payload.description || existingSetting.description,
            validation_rules: payload.validation_rules ? JSON.parse(JSON.stringify(payload.validation_rules)) : existingSetting.validation_rules,
            updated_at: new Date()
          }
        });
      } else {
        // إنشاء إعداد جديد
        updatedSetting = await prisma.systemSettings.create({
          data: {
            module,
            category,
            key: payload.key,
            value: processedValue,
            data_type: this.inferDataType(payload.value),
            description: payload.description,
            is_public: false,
            is_user_editable: false,
            default_value: payload.value,
            validation_rules: payload.validation_rules ? JSON.parse(JSON.stringify(payload.validation_rules)) : null
          }
        });
      }

      // إبطال الكاش
      await invalidateSettingsCache(payload.key, category);

      return {
        ...updatedSetting,
        value: shouldEncrypt ? payload.value : updatedSetting.value
      };

    } catch (error) {
      console.error('Error updating system setting:', error);
      throw new Error(`فشل في تحديث الإعداد: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  /**
   * إعدادات المستخدم
   * User settings management
   */
  async getUserSettings(userId: string, module?: string) {
    try {
      const whereClause: any = { user_id: userId };
      if (module) whereClause.module = module;

      return await prisma.userSettings.findMany({
        where: whereClause,
        orderBy: [
          { module: 'asc' },
          { key: 'asc' }
        ]
      });

    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw new Error('فشل في جلب إعدادات المستخدم');
    }
  }

  async updateUserSetting(
    userId: string, 
    key: string, 
    value: any, 
    module: string = 'general'
  ) {
    try {
      const existingSetting = await prisma.userSettings.findFirst({
        where: { user_id: userId, key, module }
      });

      if (existingSetting) {
        return await prisma.userSettings.update({
          where: { id: existingSetting.id },
          data: {
            value,
            updated_at: new Date()
          }
        });
      } else {
        return await prisma.userSettings.create({
          data: {
            user_id: userId,
            module,
            key,
            value
          }
        });
      }

    } catch (error) {
      console.error('Error updating user setting:', error);
      throw new Error(`فشل في تحديث إعداد المستخدم: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  /**
   * تصدير الإعدادات
   * Export settings
   */
  async exportSettings(options: SettingsExportOptions = {}) {
    try {
      const filters: SettingsFilterOptions = {};
      
      const settings = await this.getSystemSettings(filters);
      
      // تصفية الإعدادات الحساسة إذا لم يكن مطلوباً تضمينها
      const filteredSettings = options.include_sensitive 
        ? settings
        : settings.filter(s => !this.shouldEncryptSetting(s.key));

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
   * تحديث متعدد للإعدادات
   * Bulk update settings
   */
  async bulkUpdateSettings(bulkUpdate: SettingsBulkUpdate, userId: string) {
    try {
      const results = [];
      const errors = [];

      for (const setting of bulkUpdate.settings) {
        try {
          const result = await this.updateSystemSetting(setting, userId);
          results.push(result);
        } catch (error) {
          errors.push({ 
            key: setting.key, 
            error: error instanceof Error ? error.message : 'خطأ غير معروف'
          });
        }
      }

      return {
        success: true,
        updated_count: results.length,
        error_count: errors.length,
        results,
        errors
      };

    } catch (error) {
      console.error('Error in bulk update:', error);
      throw new Error(`فشل في التحديث المجمع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  /**
   * حذف إعداد
   * Delete setting
   */
  async deleteSetting(key: string, category: string, module: string, userId: string) {
    try {
      const setting = await prisma.systemSettings.findFirst({
        where: { key, category, module }
      });

      if (!setting) {
        throw new Error('الإعداد غير موجود');
      }

      await prisma.systemSettings.delete({
        where: { id: setting.id }
      });

      // إبطال الكاش
      await invalidateSettingsCache(key, category);

      return { success: true, message: 'تم حذف الإعداد بنجاح' };

    } catch (error) {
      console.error('Error deleting setting:', error);
      throw new Error(`فشل في حذف الإعداد: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  /**
   * وظائف مساعدة
   * Helper functions
   */
  private shouldEncryptSetting(key: string): boolean {
    const sensitiveKeys = [
      'password', 'secret', 'token', 'key', 'api_key',
      'database_url', 'smtp_password', 'encryption_key',
      'private_key', 'client_secret', 'webhook_secret'
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

  private convertToYAML(settings: any[]): string {
    // تنفيذ بسيط لتحويل إلى YAML
    let yaml = '# Settings Export\n';
    yaml += `# Generated at: ${new Date().toISOString()}\n\n`;
    
    settings.forEach(setting => {
      yaml += `${setting.key}: ${JSON.stringify(setting.value)}\n`;
    });
    
    return yaml;
  }

  private convertToEnv(settings: any[]): string {
    return settings
      .filter(s => s.is_public)
      .map(s => `${s.key.toUpperCase()}=${s.value}`)
      .join('\n');
  }
}

export const settingsService = new SettingsService();
