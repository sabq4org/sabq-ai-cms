import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// متغير لحفظ الإعدادات في الذاكرة لتجنب استعلامات قاعدة البيانات المتكررة
let cachedSettings: any = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

/**
 * جلب إعدادات AI من قاعدة البيانات مع التخزين المؤقت
 */
export async function getAISettings() {
  try {
    // التحقق من الذاكرة المؤقتة
    if (cachedSettings && Date.now() < cacheExpiry) {
      return cachedSettings;
    }

    // جلب من قاعدة البيانات
    const settings = await prisma.site_settings.findFirst({
      where: { section: 'ai' }
    });

    if (settings && settings.data) {
      cachedSettings = settings.data as any;
      cacheExpiry = Date.now() + CACHE_DURATION;
      return cachedSettings;
    }

    // إعدادات افتراضية
    const defaultSettings = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.7
      },
      features: {
        aiEditor: true,
        analytics: true,
        notifications: true,
        deepAnalysis: true,
        smartLinks: true,
        commentModeration: true
      }
    };

    return defaultSettings;
  } catch (error) {
    console.error('خطأ في جلب إعدادات AI:', error);
    // في حالة الخطأ، نستخدم الإعدادات من البيئة
    return {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.7
      }
    };
  }
}

/**
 * جلب مفتاح OpenAI API بترتيب الأولوية:
 * 1. قاعدة البيانات (site_settings)
 * 2. متغيرات البيئة
 * 3. قيمة فارغة
 */
export async function getOpenAIKey(): Promise<string> {
  try {
    const settings = await getAISettings();
    
    // التحقق من وجود المفتاح في الإعدادات
    if (settings?.openai?.apiKey && settings.openai.apiKey.trim() !== '') {
      // التحقق من أن المفتاح ليس placeholder
      if (settings.openai.apiKey !== 'sk-...' && settings.openai.apiKey.length > 20) {
        return settings.openai.apiKey.trim();
      }
    }

    // إذا لم يكن في قاعدة البيانات، نحاول من البيئة
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
      if (process.env.OPENAI_API_KEY !== 'sk-...' && process.env.OPENAI_API_KEY.length > 20) {
        return process.env.OPENAI_API_KEY.trim();
      }
    }

    return '';
  } catch (error) {
    console.error('خطأ في جلب مفتاح OpenAI:', error);
    return process.env.OPENAI_API_KEY || '';
  }
}

/**
 * إنشاء عميل OpenAI موحد
 */
export async function createOpenAIClient(): Promise<OpenAI | null> {
  const apiKey = await getOpenAIKey();
  
  if (!apiKey) {
    console.error('لا يوجد مفتاح OpenAI API');
    return null;
  }

  try {
    return new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: false
    });
  } catch (error) {
    console.error('خطأ في إنشاء عميل OpenAI:', error);
    return null;
  }
}

/**
 * التحقق من صحة مفتاح OpenAI
 */
export async function validateOpenAIKey(apiKey: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'المفتاح فارغ' };
  }

  if (apiKey === 'sk-...' || apiKey.length < 20) {
    return { valid: false, error: 'المفتاح غير كامل' };
  }

  try {
    const openai = new OpenAI({ apiKey: apiKey.trim() });
    await openai.models.list();
    return { valid: true };
  } catch (error: any) {
    if (error.status === 401) {
      return { valid: false, error: 'المفتاح غير صحيح' };
    } else if (error.status === 429) {
      return { valid: false, error: 'تم تجاوز حد الاستخدام' };
    } else {
      return { valid: false, error: error.message || 'خطأ غير معروف' };
    }
  }
}

/**
 * مسح الذاكرة المؤقتة للإعدادات
 */
export function clearSettingsCache() {
  cachedSettings = null;
  cacheExpiry = 0;
}

/**
 * حفظ إعدادات AI في قاعدة البيانات
 */
export async function saveAISettings(settings: any) {
  try {
    const existingSettings = await prisma.site_settings.findFirst({
      where: { section: 'ai' }
    });

    if (existingSettings) {
      await prisma.site_settings.update({
        where: { id: existingSettings.id },
        data: { 
          data: settings, 
          updated_at: new Date() 
        }
      });
    } else {
      await prisma.site_settings.create({
        data: {
          id: `ai-${Date.now()}`,
          section: 'ai',
          data: settings,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // مسح الذاكرة المؤقتة
    clearSettingsCache();
    
    return { success: true };
  } catch (error) {
    console.error('خطأ في حفظ إعدادات AI:', error);
    throw error;
  }
} 