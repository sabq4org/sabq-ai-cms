import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 فحص حالة خدمة ElevenLabs...');

    // التحقق من وجود API Key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        status: 'not_configured',
        message: '⚠️ مفتاح ElevenLabs غير مُعد',
        instructions: {
          step1: 'أنشئ ملف .env.local في جذر المشروع',
          step2: 'أضف السطر التالي:',
          code: 'ELEVENLABS_API_KEY=sk_8867323770dae548ec436056590d60a04ba9a8e1840ea09c',
          step3: 'احفظ الملف وأعد تشغيل الخادم بـ: npm run dev',
          step4: 'تأكد من حالة الخدمة بعد إعادة التشغيل'
        },
        demo_features: [
          '🎙️ عرض واجهة توليد الصوت',
          '📊 عرض إحصائيات تجريبية',
          '🔊 تشغيل ملفات صوتية نموذجية'
        ]
      }, { status: 200 });
    }

    console.log('✅ تم العثور على API Key');

    // فحص الاتصال بـ ElevenLabs مع معالجة محسنة للأخطاء
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني timeout
      
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`📡 استجابة ElevenLabs: ${response.status}`);

      if (!response.ok) {
        let errorMessage = 'خطأ في الاتصال بخدمة ElevenLabs';
        let errorDetails: any = {};
        
        try {
          const errorData = await response.json();
          console.error('خطأ من ElevenLabs:', errorData);
          
          if (response.status === 401) {
            if (errorData.detail?.status === 'missing_permissions') {
              errorMessage = 'المفتاح يفتقد الصلاحيات المطلوبة';
              errorDetails.permissions_help = [
                'افتح https://elevenlabs.io',
                'اذهب إلى Profile → API Keys',
                'اضغط على Edit بجانب مفتاحك',
                'فعّل كل الصلاحيات المتاحة',
                'أو أنشئ مفتاح جديد بصلاحيات كاملة'
              ];
            } else {
              errorMessage = 'مفتاح API غير صالح أو منتهي الصلاحية';
              errorDetails.suggestion = 'تأكد من أن المفتاح صحيح وفعال';
            }
          } else if (response.status === 429) {
            errorMessage = 'تم تجاوز الحد المسموح من الطلبات';
            errorDetails.wait_time = errorData.detail?.wait_time || '60 ثانية';
          } else if (response.status === 422) {
            errorMessage = 'خطأ في معاملات الطلب';
          }
        } catch (jsonError) {
          console.error('خطأ في قراءة رد الخطأ:', jsonError);
        }

        return NextResponse.json({
          success: false,
          status: 'error',
          error: errorMessage,
          statusCode: response.status,
          details: `HTTP ${response.status}: ${response.statusText}`,
          ...errorDetails
        }, { status: 200 }); // نرجع 200 حتى لا يظهر خطأ في الواجهة
      }

      const data = await response.json();
      console.log(`🎙️ تم العثور على ${data.voices?.length || 0} صوت`);

      // تحليل معلومات الاستخدام
      const usage = await fetchUsageInfo(apiKey);
      
      // إعداد قائمة الأصوات المتاحة
      const availableVoices = data.voices?.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        preview_url: voice.preview_url,
        labels: voice.labels || {}
      })) || [];

      return NextResponse.json({
        success: true,
        status: 'operational',
        message: '✅ خدمة ElevenLabs تعمل بنجاح',
        connection: {
          api_status: 'connected',
          response_time: Date.now(),
          voices_count: availableVoices.length
        },
        voices: {
          available: availableVoices.slice(0, 16), // أول 16 صوت
          total_voices: availableVoices.length
        },
        usage: usage,
        service_health: {
          overall: usage.characters.percentage < 90 ? 'healthy' : 'warning',
          api_key: 'valid',
          quota_status: usage.characters.percentage < 80 ? 'good' : 
                       usage.characters.percentage < 90 ? 'warning' : 'critical'
        },
        features: {
          text_to_speech: true,
          voice_cloning: true,
          multilingual: true,
          arabic_support: true
        },
        timestamp: new Date().toISOString()
      });

    } catch (fetchError: any) {
      console.error('خطأ في الاتصال:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          status: 'timeout',
          error: 'انتهت مهلة الاتصال بخدمة ElevenLabs',
          details: 'يرجى المحاولة مرة أخرى',
          troubleshooting: [
            'تحقق من اتصال الإنترنت',
            'جرب استخدام VPN إذا كانت الخدمة محجوبة في منطقتك',
            'تأكد من عدم وجود جدار حماية يحجب الاتصال'
          ]
        }, { status: 200 });
      }
      
      return NextResponse.json({
        success: false,
        status: 'network_error',
        error: 'فشل الاتصال بخدمة ElevenLabs',
        details: fetchError.message || 'خطأ في الشبكة',
        troubleshooting: [
          'تأكد من اتصال الإنترنت',
          'تحقق من إعدادات الجدار الناري',
          'جرب مرة أخرى بعد قليل'
        ]
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error('❌ خطأ عام في فحص الحالة:', error);
    
    return NextResponse.json({
      success: false,
      status: 'error',
      error: 'حدث خطأ غير متوقع',
      details: error.message || 'خطأ غير معروف',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// دالة مساعدة لجلب معلومات الاستخدام
async function fetchUsageInfo(apiKey: string) {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn('فشل جلب معلومات الاستخدام');
      return getDefaultUsage();
    }
    
    const userData = await response.json();
    const subscription = userData.subscription || {};
    
    const charactersUsed = subscription.character_count || 0;
    const charactersLimit = subscription.character_limit || 10000;
    const percentage = Math.round((charactersUsed / charactersLimit) * 100);
    
    return {
      characters: {
        used: charactersUsed,
        limit: charactersLimit,
        percentage: percentage,
        remaining: charactersLimit - charactersUsed
      },
      tier: subscription.tier || 'free',
      next_reset: subscription.next_character_count_reset_unix 
        ? new Date(subscription.next_character_count_reset_unix * 1000).toISOString()
        : null
    };
    
  } catch (error) {
    console.error('خطأ في جلب معلومات الاستخدام:', error);
    return getDefaultUsage();
  }
}

function getDefaultUsage() {
  return {
    characters: {
      used: 0,
      limit: 10000,
      percentage: 0,
      remaining: 10000
    },
    tier: 'unknown',
    next_reset: null
  };
} 