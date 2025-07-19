import { NextRequest, NextResponse } from 'next/server';
import { 
  getAISettings, 
  saveAISettings, 
  validateOpenAIKey,
  clearSettingsCache 
} from '@/lib/openai-config';

export async function GET() {
  try {
    const settings = await getAISettings();
    
    // إخفاء جزء من المفتاح للأمان
    if (settings?.openai?.apiKey) {
      const key = settings.openai.apiKey;
      if (key.length > 10) {
        settings.openai.apiKey = key.substring(0, 7) + '...' + key.substring(key.length - 4);
        settings.openai.hasKey = true;
      }
    }
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('خطأ في جلب إعدادات OpenAI:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب الإعدادات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // جلب الإعدادات الحالية
    const currentSettings = await getAISettings();
    
    // إذا كان هناك مفتاح جديد، نتحقق من صحته
    if (body.openai?.apiKey && body.openai.apiKey !== 'sk-...****...') {
      const validation = await validateOpenAIKey(body.openai.apiKey);
      if (!validation.valid) {
        return NextResponse.json(
          { 
            success: false, 
            error: `مفتاح OpenAI غير صالح: ${validation.error}` 
          },
          { status: 400 }
        );
      }
    } else if (body.openai?.apiKey === 'sk-...****...') {
      // إذا لم يتم تغيير المفتاح، نستخدم المفتاح الحالي
      body.openai.apiKey = currentSettings?.openai?.apiKey || '';
    }
    
    // دمج الإعدادات الجديدة مع الحالية
    const updatedSettings = {
      ...currentSettings,
      ...body,
      openai: {
        ...currentSettings?.openai,
        ...body.openai
      },
      features: {
        ...currentSettings?.features,
        ...body.features
      }
    };
    
    // حفظ الإعدادات
    await saveAISettings(updatedSettings);
    
    // تحديث متغير البيئة للجلسة الحالية
    if (updatedSettings.openai?.apiKey) {
      process.env.OPENAI_API_KEY = updatedSettings.openai.apiKey;
    }
    
    return NextResponse.json({
      success: true,
      message: 'تم حفظ إعدادات OpenAI بنجاح',
      data: {
        ...updatedSettings,
        openai: {
          ...updatedSettings.openai,
          apiKey: updatedSettings.openai?.apiKey ? 'sk-...****...' : ''
        }
      }
    });
  } catch (error) {
    console.error('خطأ في حفظ إعدادات OpenAI:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في حفظ الإعدادات' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // مسح المفتاح فقط وليس كل الإعدادات
    const currentSettings = await getAISettings();
    
    const updatedSettings = {
      ...currentSettings,
      openai: {
        ...currentSettings?.openai,
        apiKey: ''
      }
    };
    
    await saveAISettings(updatedSettings);
    
    // مسح من متغير البيئة
    delete process.env.OPENAI_API_KEY;
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف مفتاح OpenAI بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف مفتاح OpenAI:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في حذف المفتاح' },
      { status: 500 }
    );
  }
} 