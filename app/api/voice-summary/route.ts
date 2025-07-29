import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';

// إعدادات الأصوات المتاحة مع خيارات متنوعة
const VOICE_OPTIONS = {
  // أصوات رجالية عربية
  male_1: {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'صوت رجالي عربي احترافي',
    gender: 'male',
    language: 'arabic',
    quality: 'premium'
  },
  male_2: {
    id: 'pNInz6obpgDQGcFmaJgB', 
    name: 'آدم - صوت رجالي عميق',
    gender: 'male',
    language: 'english',
    quality: 'premium'
  },
  // أصوات نسائية
  female_1: {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'راشيل - صوت نسائي واضح',
    gender: 'female', 
    language: 'english',
    quality: 'premium'
  },
  female_2: {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'دومي - صوت نسائي عربي',
    gender: 'female',
    language: 'arabic', 
    quality: 'premium'
  }
};

// دالة ذكية لاختيار الصوت المناسب
function selectVoiceForContent(content: string, category?: string): string {
  // منطق ذكي لاختيار الصوت
  const contentLower = content.toLowerCase();
  
  // للأخبار الرياضية - صوت رجالي قوي
  if (category?.includes('رياض') || contentLower.includes('مباراة') || contentLower.includes('فريق')) {
    return VOICE_OPTIONS.male_1.id;
  }
  
  // للأخبار الثقافية والاجتماعية - صوت نسائي
  if (category?.includes('ثقاف') || category?.includes('مجتمع') || contentLower.includes('فن')) {
    return VOICE_OPTIONS.female_2.id;
  }
  
  // للأخبار التقنية والاقتصادية - صوت رجالي احترافي  
  if (category?.includes('تقني') || category?.includes('اقتصاد') || contentLower.includes('شرك')) {
    return VOICE_OPTIONS.male_2.id;
  }
  
  // افتراضي - صوت عربي احترافي
  return VOICE_OPTIONS.male_1.id;
}

// دالة تحسين النص للقراءة الصوتية
function optimizeTextForTTS(text: string): string {
  return text
    // تنظيف HTML tags
    .replace(/<[^>]*>/g, '')
    // تحسين علامات الترقيم للتوقف الطبيعي
    .replace(/\./g, '. ')
    .replace(/،/g, '، ')
    .replace(/؛/g, '؛ ')
    // تحويل الأرقام الإنجليزية إلى عربية
    .replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
    // إضافة مسافات بين الجمل الطويلة
    .replace(/([.!?])([أ-ي])/g, '$1 $2')
    // تقصير النص إذا كان طويل جداً (حد أقصى 500 حرف)
    .substring(0, 500)
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const voiceType = searchParams.get('voice') || 'auto'; // auto, male, female, or specific voice ID

    if (!articleId) {
      return NextResponse.json({ error: 'معرف المقال مطلوب' }, { status: 400 });
    }

    // 1. جلب المقال من قاعدة البيانات مع معلومات إضافية
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        excerpt: true,
        audio_summary_url: true,
        categories: {
          select: {
            name: true
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json({ error: 'المقال غير موجود' }, { status: 404 });
    }

    // 2. إذا كان الصوت موجود بالفعل، إرجاعه (مع خيار إعادة التوليد)
    const forceRegenerate = searchParams.get('regenerate') === 'true';
    if (article.audio_summary_url && !forceRegenerate) {
      return NextResponse.json({ 
        audioUrl: article.audio_summary_url,
        cached: true,
        message: 'تم استرجاع الصوت المحفوظ مسبقاً'
      });
    }

    // التحقق من وجود موجز للمقال
    if (!article.excerpt) {
      return NextResponse.json({ error: 'المقال لا يحتوي على موجز' }, { status: 400 });
    }

    console.log(`🎙️ توليد صوت لموجز المقال ${article.id}: ${article.title}`);

    // التحقق من مفتاح ElevenLabs
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('❌ مفتاح ElevenLabs غير موجود في متغيرات البيئة');
      return NextResponse.json({ error: 'مفتاح ElevenLabs غير مكون' }, { status: 500 });
    }

    // 3. اختيار الصوت المناسب
    let selectedVoice: string;
         if (voiceType === 'auto') {
       selectedVoice = selectVoiceForContent(article.excerpt, article.categories?.name);
     } else if (voiceType === 'male') {
      selectedVoice = VOICE_OPTIONS.male_1.id;
    } else if (voiceType === 'female') {
      selectedVoice = VOICE_OPTIONS.female_1.id;
    } else {
      // استخدام معرف صوت محدد
      selectedVoice = voiceType;
    }

         console.log(`🔊 استخدام الصوت: ${selectedVoice} للفئة: ${article.categories?.name || 'غير محدد'}`);

     // 4. تحسين النص للقراءة الصوتية
    const optimizedText = optimizeTextForTTS(article.excerpt);
    console.log(`📝 النص المحسن للقراءة: ${optimizedText.substring(0, 100)}...`);

    // 5. توليد الصوت من ElevenLabs
    let audioData;
    
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
        {
          text: optimizedText,
          model_id: 'eleven_multilingual_v2', // النموذج المحسن للعربية
          voice_settings: {
            stability: 0.6, // استقرار أعلى للنطق العربي
            similarity_boost: 0.8, // تحسين جودة الصوت
            style: 0.5, // نبرة متوازنة
            use_speaker_boost: true // تعزيز وضوح المتحدث
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 30000 // زيادة المهلة الزمنية
        }
      );
      
      audioData = response.data;
      console.log(`✅ تم توليد صوت بحجم: ${audioData.byteLength} بايت`);
      
    } catch (err: any) {
      // معالجة شاملة للأخطاء
      console.error('❌ خطأ ElevenLabs تفصيلي:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data ? Buffer.from(err.response.data).toString('utf8').substring(0, 200) : 'No data'
      });
      
      let errorMessage = 'فشل توليد الصوت من الموجز.';
      let errorDetails = '';
      
      if (err.response?.status === 401) {
        errorMessage = 'مفتاح ElevenLabs غير صحيح أو منتهي الصلاحية';
        errorDetails = 'يرجى تحديث مفتاح API من إعدادات النظام';
      } else if (err.response?.status === 429) {
        errorMessage = 'تم تجاوز حد الاستخدام لـ ElevenLabs';
        errorDetails = 'يرجى الانتظار أو ترقية الحساب';
      } else if (err.response?.status === 422) {
        errorMessage = 'خطأ في بيانات الطلب';
        errorDetails = 'النص قد يكون طويلاً جداً أو يحتوي على رموز غير مدعومة';
      }
      
      // الوضع التجريبي المحسن
      if (process.env.NODE_ENV === 'development') {
        console.log('🎭 الوضع التجريبي: إنشاء ملف صوتي تجريبي محسن');
        
        // إنشاء ملف صوتي تجريبي محسن مع البيانات الصحيحة
        const demoAudioUrl = '/audio/demo-summary-enhanced.mp3';
        
        // حفظ رابط الصوت التجريبي مع metadata
        await prisma.articles.update({
          where: { id: articleId },
          data: { 
            audio_summary_url: demoAudioUrl,
            metadata: {
              audio_demo: true,
              voice_used: selectedVoice,
              generated_at: new Date().toISOString(),
              text_length: optimizedText.length
            }
          }
        });
        
        return NextResponse.json({ 
          audioUrl: demoAudioUrl,
          isDemo: true,
          voiceInfo: VOICE_OPTIONS[Object.keys(VOICE_OPTIONS).find(key => 
            VOICE_OPTIONS[key as keyof typeof VOICE_OPTIONS].id === selectedVoice
          ) as keyof typeof VOICE_OPTIONS],
          message: 'صوت تجريبي محسن - سيتم استبداله بصوت حقيقي عند إصلاح مفتاح ElevenLabs'
        });
      } else {
        return NextResponse.json({ 
          error: errorMessage,
          details: errorDetails,
          troubleshooting: {
            step1: 'تحقق من صحة مفتاح ElevenLabs API',
            step2: 'تأكد من وجود رصيد كافٍ في الحساب',
            step3: 'جرب استخدام صوت مختلف',
            step4: 'قصّر النص أو أعد صياغته'
          }
        }, { status: 500 });
      }
    }

    // 6. تحويل الصوت إلى Base64 أو رفعه لخادم خارجي
    let audioUrl: string;
    
    if (process.env.UPLOAD_AUDIO_TO_CLOUD === 'true') {
      // TODO: رفع للخادم السحابي (Cloudinary, AWS S3, etc.)
      audioUrl = `data:audio/mpeg;base64,${Buffer.from(audioData).toString('base64')}`;
    } else {
      // حفظ محلي كـ Base64
      audioUrl = `data:audio/mpeg;base64,${Buffer.from(audioData).toString('base64')}`;
    }

    // 7. حفظ رابط الصوت في قاعدة البيانات مع metadata
    await prisma.articles.update({
      where: { id: articleId },
      data: { 
        audio_summary_url: audioUrl,
        metadata: {
          audio_generated: true,
          voice_used: selectedVoice,
          voice_name: VOICE_OPTIONS[Object.keys(VOICE_OPTIONS).find(key => 
            VOICE_OPTIONS[key as keyof typeof VOICE_OPTIONS].id === selectedVoice
          ) as keyof typeof VOICE_OPTIONS]?.name,
          generated_at: new Date().toISOString(),
          text_length: optimizedText.length,
          audio_size: audioData.byteLength
        }
      }
    });

    return NextResponse.json({ 
      audioUrl,
      voiceInfo: VOICE_OPTIONS[Object.keys(VOICE_OPTIONS).find(key => 
        VOICE_OPTIONS[key as keyof typeof VOICE_OPTIONS].id === selectedVoice
      ) as keyof typeof VOICE_OPTIONS],
      stats: {
        textLength: optimizedText.length,
        audioSize: audioData.byteLength,
        estimatedDuration: Math.ceil(optimizedText.length / 15) + ' ثانية' // تقدير: 15 حرف/ثانية
      },
      message: 'تم توليد الصوت بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ عام في توليد الصوت:', error);
    return NextResponse.json({ 
      error: 'فشل توليد الصوت من الموجز',
      details: 'خطأ داخلي في الخادم'
    }, { status: 500 });
  }
}

// API للحصول على قائمة الأصوات المتاحة
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'get_voices') {
      return NextResponse.json({
        voices: VOICE_OPTIONS,
        recommendations: {
          sports: 'male_1',
          culture: 'female_2', 
          technology: 'male_2',
          general: 'male_1'
        }
      });
    }
    
    if (action === 'test_voice') {
      const { voiceId, text = 'هذا اختبار للصوت. مرحباً بكم في صحيفة سبق الإلكترونية.' } = await request.json();
      
      // إرسال طلب اختبار مبسط
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'مفتاح ElevenLabs غير متوفر' }, { status: 500 });
      }
      
      try {
        const response = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            text: text.substring(0, 100), // نص قصير للاختبار
            model_id: 'eleven_multilingual_v1'
          },
          {
            headers: {
              'Accept': 'audio/mpeg',
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            timeout: 10000
          }
        );
        
        const audioBase64 = Buffer.from(response.data).toString('base64');
        return NextResponse.json({
          success: true,
          testAudio: `data:audio/mpeg;base64,${audioBase64}`,
          message: 'تم اختبار الصوت بنجاح'
        });
        
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'فشل اختبار الصوت',
          details: error instanceof Error ? error.message : 'خطأ غير معروف'
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'إجراء غير صحيح' }, { status: 400 });
    
  } catch (error) {
    console.error('خطأ في POST /api/voice-summary:', error);
    return NextResponse.json({ 
      error: 'فشل في معالجة الطلب' 
    }, { status: 500 });
  }
}