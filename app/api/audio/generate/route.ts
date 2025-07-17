import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// معرفات الأصوات المتاحة في ElevenLabs
const VOICE_IDS = {
  bradford: 'LGwrqKPCFGTmTzJQSMhH', // رجالي عميق
  rachel: '21m00Tcm4TlvDq8ikWAM', // نسائي واضح
  arabic_male: 'g5i5w0JqE7tN1zo8vZPx', // عربي رجالي احترافي
  arabic_female: 'XB0fDUnXU5powFXDhCwa', // عربي نسائي
  adam: 'pNInz6obpgDQGcFmaJgB', // رجالي شاب
  antoni: 'ErXwobaYiN019PkySvjV', // رجالي ودود
  arnold: 'VR6AewLTigWG4xSOukaG', // رجالي قوي
  bella: 'EXAVITQu4vr4xnSDxMaL', // نسائي ناعم
  domi: 'AZnzlk1XvdvUeBnXmlld', // نسائي نشيط
  elli: 'MF3mGyEYCl7XYWbV9V6O', // نسائي شاب
  josh: 'TxGEqnHWrfWFTfGW9XjX', // رجالي عميق
  sam: 'yoZ06aMxZJJ28mfd3POQ', // محايد
} as const;

export async function POST(req: NextRequest) {
  try {
    console.log('🎙️ بدء توليد الصوت...');
    
    const body = await req.json();
    const { 
      summary, 
      voice = 'bradford', 
      filename = 'daily-news',
      language = 'arabic'
    } = body;

    // التحقق من صحة البيانات
    if (!summary || typeof summary !== 'string') {
      return NextResponse.json({ 
        error: 'Missing or invalid summary',
        details: 'يجب توفير نص الملخص' 
      }, { status: 400 });
    }

    if (summary.length < 10) {
      return NextResponse.json({ 
        error: 'Summary too short',
        details: 'النص قصير جداً، يجب أن يكون 10 أحرف على الأقل' 
      }, { status: 400 });
    }

    // اختيار الصوت المناسب
    const selectedVoiceId = VOICE_IDS[voice as keyof typeof VOICE_IDS] || VOICE_IDS.bradford;

    // التحقق من مفتاح ElevenLabs
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey.startsWith('sk_demo')) {
      console.log('⚠️ وضع تجريبي - إرجاع ملف صوتي نموذجي');
      
      // في الوضع التجريبي، نرجع ملف صوتي موجود مسبقاً
      const demoFiles = [
        '/audio/daily-news-2025-07-17T13-02-46-229Z.mp3',
        '/audio/daily-news-2025-07-17T13-01-36-470Z.mp3',
        '/audio/test-news-2025-07-17T12-44-46-842Z.mp3'
      ];
      
      const randomFile = demoFiles[Math.floor(Math.random() * demoFiles.length)];
      
      return NextResponse.json({
        success: true,
        demo_mode: true,
        url: randomFile,
        filename: randomFile.split('/').pop() || 'demo.mp3',
        size: 1258496, // حجم تقريبي
        duration_estimate: '90 ثانية',
        voice_used: voice,
        voice_id: selectedVoiceId,
        text_length: summary.length,
        message: '🎯 وضع تجريبي - تم إرجاع ملف صوتي نموذجي',
        notice: 'لتوليد صوت حقيقي، يرجى إضافة مفتاح ElevenLabs صحيح'
      });
    }
    console.log(`🔊 استخدام الصوت: ${voice} (${selectedVoiceId})`);

    // تحسين النص للقراءة الصوتية
    const optimizedText = summary
      .replace(/<[^>]*>/g, '') // إزالة HTML tags
      .replace(/\./g, '. ') // تحسين التوقف
      .replace(/،/g, '، ')
      .replace(/؛/g, '؛ ')
      .trim()
      .substring(0, 2500); // حد أقصى 2500 حرف

    console.log(`📝 النص المُحسَّن: ${optimizedText.substring(0, 100)}...`);

    // طلب التوليد من ElevenLabs
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        text: optimizedText,
        model_id: 'eleven_multilingual_v2', // النموذج المحسن للعربية
        voice_settings: {
          stability: language === 'arabic' ? 0.6 : 0.4, // استقرار أعلى للعربية
          similarity_boost: 0.75,
          style: 0.3, // نبرة طبيعية
          use_speaker_boost: true // تعزيز وضوح المتحدث
        }
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer',
        timeout: 30000 // مهلة 30 ثانية
      }
    );

    console.log(`✅ تم توليد الصوت بنجاح، الحجم: ${response.data.byteLength} بايت`);

    // إنشاء مجلد الصوت إذا لم يكن موجوداً
    const outputPath = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
      console.log('📁 تم إنشاء مجلد الصوت');
    }

    // تسمية الملف مع الطابع الزمني لتجنب التكرار
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputPath, `${filename}-${timestamp}.mp3`);
    const publicUrl = `/audio/${filename}-${timestamp}.mp3`;

    // حفظ الملف الصوتي
    fs.writeFileSync(outputFile, response.data);
    console.log(`💾 تم حفظ الملف: ${outputFile}`);

    // حفظ النشرة في الأرشيف
    try {
      const archiveResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/audio/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `${filename}-${timestamp}.mp3`,
          url: publicUrl,
          size: response.data.byteLength,
          duration: Math.ceil(optimizedText.length / 15) + ' ثانية',
          voice: voice,
          text_length: optimizedText.length,
          is_daily: body.is_daily === true // إضافة علامة للنشرة اليومية
        })
      });

      if (!archiveResponse.ok) {
        console.error('⚠️ فشل حفظ النشرة في الأرشيف');
      } else {
        console.log('✅ تم حفظ النشرة في الأرشيف');
      }
    } catch (archiveError) {
      console.error('⚠️ خطأ في حفظ الأرشيف:', archiveError);
    }

    // إرجاع معلومات مفصلة
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: `${filename}-${timestamp}.mp3`,
      size: response.data.byteLength,
      duration_estimate: Math.ceil(optimizedText.length / 15) + ' ثانية', // تقدير: 15 حرف/ثانية
      voice_used: voice,
      voice_id: selectedVoiceId,
      text_length: optimizedText.length,
      message: 'تم توليد النشرة الصوتية بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في توليد الصوت:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data ? Buffer.from(error.response.data).toString('utf8').substring(0, 200) : 'No data'
    });

    // معالجة أخطاء محددة
    let errorMessage = 'Failed to generate audio';
    let errorDetails = 'خطأ غير معروف في توليد الصوت';

    if (error.response?.status === 401) {
      errorMessage = 'Invalid ElevenLabs API key';
      errorDetails = 'مفتاح ElevenLabs غير صحيح أو منتهي الصلاحية';
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded';
      errorDetails = 'تم تجاوز حد الاستخدام، يرجى الانتظار قليلاً';
    } else if (error.response?.status === 422) {
      errorMessage = 'Invalid request data';
      errorDetails = 'بيانات الطلب غير صحيحة، تحقق من النص أو الصوت المحدد';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network connection failed';
      errorDetails = 'فشل الاتصال بخدمة ElevenLabs، تحقق من الإنترنت';
    } else if (error.code === 'ENOENT') {
      errorMessage = 'File system error';
      errorDetails = 'خطأ في نظام الملفات، تحقق من الصلاحيات';
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      troubleshooting: {
        step1: 'تحقق من صحة مفتاح ElevenLabs API',
        step2: 'تأكد من وجود اتصال إنترنت مستقر',
        step3: 'تحقق من صحة النص المرسل',
        step4: 'جرب صوت مختلف إذا استمر الخطأ'
      }
    }, { status: 500 });
  }
}

// GET endpoint لاختبار حالة الخدمة
export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    return NextResponse.json({
      status: 'operational',
      message: 'خدمة توليد الصوت تعمل بشكل طبيعي',
      api_key_configured: !!apiKey,
      available_voices: Object.keys(VOICE_IDS),
      voice_details: VOICE_IDS,
      endpoints: {
        generate: 'POST /api/audio/generate',
        test: 'GET /api/audio/generate'
      },
      usage_example: {
        method: 'POST',
        body: {
          summary: 'نص الملخص المراد تحويله لصوت',
          voice: 'bradford', // اختياري
          filename: 'daily-news', // اختياري  
          language: 'arabic' // اختياري
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'خطأ في خدمة توليد الصوت',
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 