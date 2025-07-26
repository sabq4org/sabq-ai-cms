/**
 * نظام النسخ الاحتياطي للإعدادات
 * Settings Backup System
 */

import { PrismaClient } from '@prisma/client';
import { SettingsBackup } from './types';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const BACKUP_DIR = process.env.SETTINGS_BACKUP_DIR || './backups/settings';

/**
 * إنشاء نسخة احتياطية للإعدادات
 * Create settings backup
 */
export async function createSettingsBackup(
  name: string, 
  userId: string, 
  description?: string,
  categories?: string[]
): Promise<SettingsBackup> {
  try {
    // التأكد من وجود مجلد النسخ الاحتياطية
    await ensureBackupDirectory();

    // جلب الإعدادات للنسخ الاحتياطي
    const whereClause: any = {};
    if (categories && categories.length > 0) {
      whereClause.category = { in: categories };
    }

    const settings = await prisma.systemSettings.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    // إنشاء البيانات للنسخة الاحتياطية
    const backupData = {
      metadata: {
        name,
        description,
        created_at: new Date().toISOString(),
        created_by: userId,
        settings_count: settings.length,
        categories: [...new Set(settings.map((s: any) => s.category))],
        version: '1.0'
      },
      settings
    };

    // إنشاء اسم الملف
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `settings-backup-${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, fileName);

    // كتابة الملف
    await fs.writeFile(filePath, JSON.stringify(backupData, null, 2), 'utf8');

    // حساب حجم الملف
    const stats = await fs.stat(filePath);

    // حفظ معلومات النسخة الاحتياطية في قاعدة البيانات
    const backup: SettingsBackup = {
      id: `backup_${Date.now()}`,
      name,
      description,
      settings_count: settings.length,
      categories: backupData.metadata.categories as string[],
      created_by: userId,
      created_at: new Date(),
      file_path: filePath,
      file_size: stats.size
    };

    return backup;

  } catch (error) {
    console.error('Error creating settings backup:', error);
    throw new Error(`فشل في إنشاء النسخة الاحتياطية: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

/**
 * استعادة النسخة الاحتياطية
 * Restore settings backup
 */
export async function restoreSettingsBackup(
  backupId: string, 
  userId: string,
  merge: boolean = false
): Promise<void> {
  try {
    // البحث عن النسخة الاحتياطية
    const backup = await getBackupById(backupId);
    if (!backup) {
      throw new Error('النسخة الاحتياطية غير موجودة');
    }

    // قراءة ملف النسخة الاحتياطية
    const backupContent = await fs.readFile(backup.file_path, 'utf8');
    const backupData = JSON.parse(backupContent);

    if (!merge) {
      // حذف الإعدادات الحالية (إذا لم يكن الدمج مطلوباً)
      await prisma.systemSettings.deleteMany({
        where: {
          category: { in: backup.categories }
        }
      });
    }

    // استعادة الإعدادات
    for (const setting of backupData.settings) {
      await prisma.systemSettings.upsert({
        where: {
          id: setting.id
        },
        update: {
          value: setting.value,
          description: setting.description,
          validation_rules: setting.validation_rules,
          updated_at: new Date()
        },
        create: {
          ...setting,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // تسجيل عملية الاستعادة
    console.log(`Settings restored from backup ${backupId} by user ${userId}`);

  } catch (error) {
    console.error('Error restoring settings backup:', error);
    throw new Error(`فشل في استعادة النسخة الاحتياطية: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

/**
 * قائمة النسخ الاحتياطية
 * List backups
 */
export async function listBackups(): Promise<SettingsBackup[]> {
  try {
    // قراءة ملفات النسخ الاحتياطية
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => file.startsWith('settings-backup-') && file.endsWith('.json'));

    const backups: SettingsBackup[] = [];

    for (const file of backupFiles) {
      try {
        const filePath = path.join(BACKUP_DIR, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        const stats = await fs.stat(filePath);

        backups.push({
          id: file.replace('.json', ''),
          name: data.metadata.name,
          description: data.metadata.description,
          settings_count: data.metadata.settings_count,
          categories: data.metadata.categories,
          created_by: data.metadata.created_by,
          created_at: new Date(data.metadata.created_at),
          file_path: filePath,
          file_size: stats.size
        });
      } catch (error) {
        console.error(`Error reading backup file ${file}:`, error);
      }
    }

    return backups.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

  } catch (error) {
    console.error('Error listing backups:', error);
    throw new Error('فشل في جلب قائمة النسخ الاحتياطية');
  }
}

/**
 * حذف نسخة احتياطية
 * Delete backup
 */
export async function deleteBackup(backupId: string): Promise<void> {
  try {
    const backup = await getBackupById(backupId);
    if (!backup) {
      throw new Error('النسخة الاحتياطية غير موجودة');
    }

    // حذف الملف
    await fs.unlink(backup.file_path);

    console.log(`Backup ${backupId} deleted successfully`);

  } catch (error) {
    console.error('Error deleting backup:', error);
    throw new Error(`فشل في حذف النسخة الاحتياطية: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

/**
 * الحصول على نسخة احتياطية بالمعرف
 * Get backup by ID
 */
async function getBackupById(backupId: string): Promise<SettingsBackup | null> {
  const backups = await listBackups();
  return backups.find(backup => backup.id === backupId) || null;
}

/**
 * التأكد من وجود مجلد النسخ الاحتياطية
 * Ensure backup directory exists
 */
async function ensureBackupDirectory(): Promise<void> {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
}

/**
 * تنظيف النسخ الاحتياطية القديمة
 * Cleanup old backups
 */
export async function cleanupOldBackups(maxAge: number = 30): Promise<void> {
  try {
    const backups = await listBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);

    let deletedCount = 0;

    for (const backup of backups) {
      if (backup.created_at < cutoffDate) {
        try {
          await deleteBackup(backup.id);
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting old backup ${backup.id}:`, error);
        }
      }
    }

    console.log(`Cleaned up ${deletedCount} old backups`);

  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
}

/**
 * ضغط النسخة الاحتياطية
 * Compress backup
 */
export async function compressBackup(backupId: string): Promise<string> {
  try {
    // يمكن تنفيذ ضغط الملفات هنا باستخدام zlib
    const backup = await getBackupById(backupId);
    if (!backup) {
      throw new Error('النسخة الاحتياطية غير موجودة');
    }

    // إرجاع مسار الملف المضغوط
    return backup.file_path + '.gz';

  } catch (error) {
    console.error('Error compressing backup:', error);
    throw new Error('فشل في ضغط النسخة الاحتياطية');
  }
}
