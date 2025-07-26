/**
 * نظام الكاش للإعدادات
 * Settings Cache System
 */

import { SettingsCache } from './types';

// استخدام Map للكاش في الذاكرة
const settingsCache = new Map<string, SettingsCache>();
const CACHE_TTL = 5 * 60 * 1000; // 5 دقائق

/**
 * الحصول على قيمة من الكاش
 * Get cached setting
 */
export async function getCachedSetting(key: string): Promise<any | null> {
  try {
    const cached = settingsCache.get(key);
    
    if (!cached) {
      return null;
    }

    // فحص انتهاء الصلاحية
    if (new Date() > cached.expires_at) {
      settingsCache.delete(key);
      return null;
    }

    // تحديث إحصائيات الوصول
    cached.hit_count++;
    cached.last_accessed = new Date();

    return cached.value;

  } catch (error) {
    console.error('Error getting cached setting:', error);
    return null;
  }
}

/**
 * حفظ قيمة في الكاش
 * Set cached setting
 */
export async function setCachedSetting(key: string, value: any, ttl: number = CACHE_TTL): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + ttl);

    const cacheEntry: SettingsCache = {
      key,
      value,
      expires_at: expiresAt,
      hit_count: 0,
      last_accessed: new Date()
    };

    settingsCache.set(key, cacheEntry);

  } catch (error) {
    console.error('Error setting cached setting:', error);
  }
}

/**
 * إبطال الكاش للإعداد
 * Invalidate cached setting
 */
export async function invalidateSettingsCache(key: string, category?: string): Promise<void> {
  try {
    if (key === '*') {
      // إبطال جميع الكاش
      settingsCache.clear();
      return;
    }

    // إبطال إعداد محدد
    settingsCache.delete(key);

    // إبطال الإعدادات بفئة محددة
    if (category) {
      const keysToDelete: string[] = [];
      for (const [cacheKey] of settingsCache) {
        if (cacheKey.includes(`${category}:`)) {
          keysToDelete.push(cacheKey);
        }
      }
      keysToDelete.forEach(k => settingsCache.delete(k));
    }

  } catch (error) {
    console.error('Error invalidating settings cache:', error);
  }
}

/**
 * إحصائيات الكاش
 * Cache statistics
 */
export async function getCacheStats(): Promise<{
  total_entries: number;
  total_hits: number;
  cache_size: number;
  entries_by_age: { fresh: number; stale: number; expired: number };
}> {
  try {
    const now = new Date();
    let totalHits = 0;
    let fresh = 0;
    let stale = 0;
    let expired = 0;

    for (const [, entry] of settingsCache) {
      totalHits += entry.hit_count;

      const age = now.getTime() - entry.last_accessed.getTime();
      const timeToExpiry = entry.expires_at.getTime() - now.getTime();

      if (timeToExpiry < 0) {
        expired++;
      } else if (age < 60000) { // أقل من دقيقة
        fresh++;
      } else {
        stale++;
      }
    }

    return {
      total_entries: settingsCache.size,
      total_hits: totalHits,
      cache_size: settingsCache.size,
      entries_by_age: { fresh, stale, expired }
    };

  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      total_entries: 0,
      total_hits: 0,
      cache_size: 0,
      entries_by_age: { fresh: 0, stale: 0, expired: 0 }
    };
  }
}

/**
 * تنظيف الكاش المنتهي الصلاحية
 * Cleanup expired cache entries
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, entry] of settingsCache) {
      if (now > entry.expires_at) {
        settingsCache.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;

  } catch (error) {
    console.error('Error cleaning up expired cache:', error);
    return 0;
  }
}

/**
 * إحماء الكاش
 * Warm up cache
 */
export async function warmupCache(settingsToPreload: Array<{ key: string; category?: string }>): Promise<void> {
  try {
    // يمكن تنفيذ تحميل مسبق للإعدادات المهمة
    console.log('Cache warmup initiated for', settingsToPreload.length, 'settings');

    // مثال على التحميل المسبق
    for (const setting of settingsToPreload) {
      const cacheKey = setting.category ? `${setting.category}:${setting.key}` : setting.key;
      
      // يمكن جلب القيمة من قاعدة البيانات وحفظها في الكاش
      // const value = await settingsService.getSetting(setting.key, setting.category, false);
      // if (value) {
      //   await setCachedSetting(cacheKey, value);
      // }
    }

  } catch (error) {
    console.error('Error warming up cache:', error);
  }
}

/**
 * إعدادات الكاش الافتراضية
 * Default cache settings
 */
export const CACHE_SETTINGS = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 دقائق
  MAX_CACHE_SIZE: 1000, // الحد الأقصى لعدد الإدخالات
  CLEANUP_INTERVAL: 10 * 60 * 1000, // تنظيف كل 10 دقائق
  WARMUP_SETTINGS: [
    { key: 'site_name', category: 'general' },
    { key: 'site_description', category: 'general' },
    { key: 'theme_mode', category: 'appearance' },
    { key: 'language', category: 'general' },
    { key: 'timezone', category: 'general' }
  ]
};

/**
 * بدء مؤقت التنظيف التلقائي
 * Start automatic cleanup timer
 */
export function startCacheCleanupTimer(): void {
  setInterval(async () => {
    const cleaned = await cleanupExpiredCache();
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired cache entries`);
    }
  }, CACHE_SETTINGS.CLEANUP_INTERVAL);
}

/**
 * إيقاف الكاش تماماً
 * Disable cache completely
 */
export async function disableCache(): Promise<void> {
  settingsCache.clear();
  console.log('Settings cache disabled and cleared');
}

/**
 * تصدير بيانات الكاش للتحليل
 * Export cache data for analysis
 */
export async function exportCacheData(): Promise<any> {
  try {
    const cacheData: any = {};
    
    for (const [key, entry] of settingsCache) {
      cacheData[key] = {
        expires_at: entry.expires_at,
        hit_count: entry.hit_count,
        last_accessed: entry.last_accessed,
        is_expired: new Date() > entry.expires_at
      };
    }

    return {
      exported_at: new Date(),
      total_entries: settingsCache.size,
      cache_data: cacheData
    };

  } catch (error) {
    console.error('Error exporting cache data:', error);
    return { error: 'فشل في تصدير بيانات الكاش' };
  }
}
