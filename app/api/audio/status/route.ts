import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 فحص حالة خدمة ElevenLabs...');

    // التحقق من وجود API Key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      // مؤقتاً: نعرض رسالة إرشادية بدلاً من خطأ
      return NextResponse.json({
        success: false,
        status: 'demo',
        message: '⚠️ وضع تجريبي - يرجى إضافة مفتاح ElevenLabs',
        instructions: {
          step1: 'سجل في https://elevenlabs.io/sign-up',
          step2: 'احصل على المفتاح من Profile → API Keys',
          step3: 'حدّث ELEVENLABS_API_KEY في .env.local',
          step4: 'أعد تشغيل الخادم'
        },
        demo_features: [
          '🎙️ عرض واجهة توليد الصوت',
          '📊 عرض إحصائيات تجريبية',
          '🔊 تشغيل ملفات صوتية نموذجية'
        ]
      }, { status: 200 });
    }

    console.log('✅ تم العثور على API Key');

    // فحص الاتصال بـ ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      }
    });

    console.log(`📡 استجابة ElevenLabs: ${response.status}`);

    if (!response.ok) {
      let errorMessage = 'خطأ في الاتصال بخدمة ElevenLabs';
      
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.detail?.status === 'missing_permissions') {
          errorMessage = 'المفتاح يفتقد الصلاحيات المطلوبة - يرجى تفعيل كل الصلاحيات في لوحة التحكم';
        } else {
          errorMessage = 'مفتاح API غير صالح أو منتهي الصلاحية';
        }
      } else if (response.status === 429) {
        errorMessage = 'تم تجاوز الحد المسموح من الطلبات';
      } else if (response.status === 422) {
        errorMessage = 'خطأ في معاملات الطلب';
      }

      const errorDetails = response.status === 401 ? {
        permissions_help: [
          'افتح https://elevenlabs.io',
          'اذهب إلى Profile → API Keys',
          'اضغط على Edit بجانب مفتاحك',
          'فعّل كل الصلاحيات المتاحة',
          'أو أنشئ مفتاح جديد بصلاحيات كاملة'
        ]
      } : {};

      return NextResponse.json({
        success: false,
        status: 'error',
        error: errorMessage,
        statusCode: response.status,
        details: `HTTP ${response.status}: ${response.statusText}`,
        ...errorDetails
      }, { status: response.status });
    }

    const data = await response.json();
    console.log(`🎙️ تم العثور على ${data.voices?.length || 0} صوت`);

    // تحديد الأصوات المتاحة
    const availableVoices = [
      {
        id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Bradford (مُفضل)',
        type: 'male_professional',
        supported: true
      },
      {
        id: 'EXAVITQu4vr4xnSDxMaL', 
        name: 'Rachel',
        type: 'female_professional',
        supported: true
      },
      {
        id: 'arabic_male_1',
        name: 'صوت عربي رجالي',
        type: 'male_arabic',
        supported: true
      },
      {
        id: 'arabic_female_1',
        name: 'صوت عربي نسائي', 
        type: 'female_arabic',
        supported: true
      }
    ];

    // التحقق من الأصوات الموجودة فعلياً
    const actualVoices = data.voices || [];
    const bradford = actualVoices.find((v: any) => v.voice_id === 'pNInz6obpgDQGcFmaJgB');
    const rachel = actualVoices.find((v: any) => v.voice_id === 'EXAVITQu4vr4xnSDxMaL');

    // إعداد المقاييس
    const quota = data.subscription || {};
    const usage = {
      characters_used: quota.character_count || 0,
      characters_limit: quota.character_limit || 10000,
      requests_used: quota.api_calls_count || 0,
      requests_limit: quota.api_calls_limit || 1000
    };

    const usagePercentage = (usage.characters_used / usage.characters_limit) * 100;

    console.log('📊 إحصائيات الاستخدام:', usage);

    return NextResponse.json({
      success: true,
      status: 'operational',
      message: 'خدمة ElevenLabs تعمل بنجاح',
      connection: {
        api_status: 'connected',
        response_time: Date.now(),
        voices_count: actualVoices.length
      },
      voices: {
        available: availableVoices,
        bradford_available: !!bradford,
        rachel_available: !!rachel,
        total_voices: actualVoices.length
      },
      usage: {
        characters: {
          used: usage.characters_used,
          limit: usage.characters_limit,
          percentage: Math.round(usagePercentage),
          remaining: usage.characters_limit - usage.characters_used
        },
        requests: {
          used: usage.requests_used,
          limit: usage.requests_limit,
          remaining: usage.requests_limit - usage.requests_used
        }
      },
      service_health: {
        overall: usagePercentage < 90 ? 'healthy' : 'warning',
        api_key: 'valid',
        quota_status: usagePercentage < 80 ? 'good' : usagePercentage < 90 ? 'warning' : 'critical'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ خطأ في فحص حالة ElevenLabs:', error);
    console.error('تفاصيل الخطأ:', {
      message: error.message,
      cause: error.cause,
      code: error.code,
      stack: error.stack
    });
    
    // التحقق من نوع الخطأ
    let errorDetails = 'خطأ غير معروف';
    let troubleshootingSteps: string[] = [];
    
    if (error.cause?.code === 'ECONNREFUSED') {
      errorDetails = 'تم رفض الاتصال - تحقق من اتصال الإنترنت';
      troubleshootingSteps = [
        'تأكد من اتصال الإنترنت',
        'تحقق من عدم وجود جدار حماية يحجب الاتصال',
        'جرب استخدام VPN إذا كنت في منطقة محجوبة'
      ];
    } else if (error.cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || error.cause?.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
      errorDetails = 'مشكلة في شهادة SSL - قد تكون بسبب الشبكة المحلية';
      troubleshootingSteps = [
        'جرب استخدام شبكة مختلفة',
        'تحقق من إعدادات الوقت والتاريخ في جهازك',
        'جرب تعطيل برامج مكافحة الفيروسات مؤقتاً'
      ];
    } else if (error.message.includes('fetch failed')) {
      errorDetails = 'فشل الاتصال بخدمة ElevenLabs';
      troubleshootingSteps = [
        'تأكد من اتصال الإنترنت',
        'تحقق من صحة ELEVENLABS_API_KEY',
        'تأكد من أن الخدمة غير محجوبة في منطقتك',
        'جرب مرة أخرى بعد دقائق قليلة'
      ];
    }
    
    return NextResponse.json({
      success: false,
      status: 'error',
      error: 'فشل في الاتصال بخدمة ElevenLabs',
      details: errorDetails,
      errorCode: error.code || error.cause?.code,
      troubleshooting: troubleshootingSteps,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 