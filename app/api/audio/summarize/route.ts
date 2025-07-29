import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// أصوات مناسبة للملخصات
const SUMMARY_VOICES = {
  adam: 'pNInz6obpgDQGcFmaJgB', // Adam - صوت رجالي واضح
  sarah: 'EXAVITQu4vr4xnSDxMaL', // Sarah - صوت نسائي احترافي
  george: 'JBFqnCBsd6RMkjVDRZzb', // George - صوت بريطاني ناضج
  rachel: '21m00Tcm4TlvDq8ikWAM', // Rachel - صوت نسائي دافئ
} as const;

type VoiceName = keyof typeof SUMMARY_VOICES;

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'sarah', lang = 'ar' } = await req.json();

    // التحقق من وجود النص
    if (!text) {
      return NextResponse.json(
        { error: 'النص مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود مفتاح API
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('❌ مفتاح ElevenLabs غير موجود');
      
      // في حالة عدم وجود المفتاح، استخدم ملف صوتي تجريبي
      return NextResponse.json({
        success: true,
        audio_url: '/demo-audio.mp3',
        duration: Math.ceil(text.length / 15), // تقدير تقريبي
        voice_used: 'demo',
        demo_mode: true
      });
    }

    // الحصول على معرف الصوت
    const voiceId = SUMMARY_VOICES[voice as VoiceName] || SUMMARY_VOICES.sarah;

    // إعدادات الصوت المحسنة للملخصات
    const voiceSettings = {
      stability: 0.65, // استقرار أعلى للوضوح
      similarity_boost: 0.75,
      style: 0.4, // أسلوب متوسط للملخصات
      use_speaker_boost: true
    };

    console.log('🎙️ توليد صوت الملخص:', {
      textLength: text.length,
      voice: voice,
      voiceId: voiceId
    });

    // استدعاء ElevenLabs API
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: text,
        model_id: lang === 'ar' ? 'eleven_multilingual_v2' : 'eleven_monolingual_v1',
        voice_settings: voiceSettings
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 ثانية
      }
    );

    // تحويل الصوت إلى Base64 Data URI
    const audioBuffer = Buffer.from(response.data);
    const base64Audio = audioBuffer.toString('base64');
    const dataUri = `data:audio/mpeg;base64,${base64Audio}`;

    console.log('✅ تم توليد صوت الملخص بنجاح');

    return NextResponse.json({
      success: true,
      audio_url: dataUri,
      size: audioBuffer.length,
      duration: Math.ceil(text.length / 15), // تقدير تقريبي
      voice_used: voice
    });

  } catch (error: any) {
    console.error('❌ خطأ في توليد صوت الملخص:', error);

    // معالجة أخطاء ElevenLabs المحددة
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        return NextResponse.json({
          success: false,
          error: 'مفتاح API غير صالح',
          demo_mode: true,
          audio_url: '/demo-audio.mp3'
        }, { status: 200 });
      } else if (status === 422) {
        return NextResponse.json({
          success: false,
          error: 'النص طويل جداً أو يحتوي على أحرف غير مدعومة',
          details: error.response.data
        }, { status: 200 });
      } else if (status === 429) {
        return NextResponse.json({
          success: false,
          error: 'تم تجاوز حد الاستخدام',
          details: 'يرجى المحاولة لاحقاً'
        }, { status: 200 });
      }
    }

    // استخدام صوت تجريبي في حالة الخطأ
    return NextResponse.json({
      success: false,
      error: 'فشل في توليد الصوت',
      demo_mode: true,
      audio_url: '/demo-audio.mp3',
      details: error.message
    }, { status: 200 });
  }
} 