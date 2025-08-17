import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_8867323770dae548ec436056590d60a04ba9a8e1840ea09c';
// أصوات ElevenLabs المتاحة للعربية
const ARABIC_VOICES = {
  'Saber': 'EXAVITQu4vr4xnSDxMaL', // صوت ذكوري عربي
  'Fatima': 'XrExE9yKIg1WjnnlVkGX', // صوت أنثوي عربي
  'Default': '21m00Tcm4TlvDq8ikWAM' // صوت افتراضي
};
const VOICE_ID = ARABIC_VOICES.Saber;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'النص مطلوب' },
        { status: 400 }
      );
    }

    // الاتصال بـ ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.5,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API Error:', error);
      return NextResponse.json(
        { error: 'فشل في تحويل النص لصوت' },
        { status: response.status }
      );
    }

    // إرجاع الصوت كـ stream
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('خطأ في تحويل النص لصوت:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الطلب' },
      { status: 500 }
    );
  }
}

// GET: الحصول على قائمة الأصوات المتاحة
export async function GET() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('فشل في جلب الأصوات');
    }

    const data = await response.json();
    
    // فلترة الأصوات العربية أو المناسبة
    const arabicVoices = data.voices.filter((voice: any) => 
      voice.labels?.language === 'ar' || 
      voice.labels?.description?.includes('Arabic') ||
      voice.name.includes('Arabic')
    );

    return NextResponse.json({
      success: true,
      voices: arabicVoices.length > 0 ? arabicVoices : data.voices.slice(0, 5)
    });

  } catch (error) {
    console.error('خطأ في جلب الأصوات:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الأصوات المتاحة' },
      { status: 500 }
    );
  }
} 