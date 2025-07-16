import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// محاولة تحميل الإعدادات من قاعدة البيانات عند التشغيل الأول
let aiSettings: any = null;

async function loadSettingsFromDB() {
  if (aiSettings) return aiSettings;
  try {
    const row = await prisma.site_settings.findFirst({
      where: { section: 'ai' }
    });
    if (row) {
      aiSettings = row.data as any;
    }
  } catch (err) {
    console.error('DB load error for AI settings:', err);
  }
  if (!aiSettings) {
    aiSettings = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.7
      },
      features: {
        aiEditor: true,
        analytics: true,
        notifications: true
      }
    };
  }
  return aiSettings;
}

export async function GET() {
  try {
    const current = await loadSettingsFromDB();
    return NextResponse.json({
      success: true,
      data: current
    });
  } catch (error) {
    console.error('خطأ في جلب إعدادات الذكاء الاصطناعي:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب الإعدادات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const current = await loadSettingsFromDB();
    // دمج القيم
    aiSettings = { ...current, ...body };

    // حفظ في قاعدة البيانات
    const existingSettings = await prisma.site_settings.findFirst({
      where: { section: 'ai' }
    });

    if (existingSettings) {
      await prisma.site_settings.update({
        where: { id: existingSettings.id },
        data: { 
          data: aiSettings, 
          updated_at: new Date() 
        }
      });
    } else {
      await prisma.site_settings.create({
        data: {
          id: `ai-${Date.now()}`,
          section: 'ai',
          data: aiSettings,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // تحديث env للمسار الحالي
    if (aiSettings.openai?.apiKey) {
      process.env.OPENAI_API_KEY = aiSettings.openai.apiKey;
    }

    return NextResponse.json({
      success: true,
      message: 'تم حفظ إعدادات الذكاء الاصطناعي بنجاح',
      data: aiSettings
    });
  } catch (error) {
    console.error('خطأ في حفظ إعدادات الذكاء الاصطناعي:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في حفظ الإعدادات' },
      { status: 500 }
    );
  }
} 