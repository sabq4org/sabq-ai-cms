import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice_id, settings } = await req.json();
    
    console.log('🎤 طلب معاينة صوت:', { voice_id, text_length: text?.length });
    
    // التحقق من وجود API Key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('❌ لا يوجد مفتاح API');
      
      // في حالة عدم وجود مفتاح، نرجع ملف صوتي تجريبي
      return NextResponse.json({
        success: true,
        preview_url: '/demo-audio.mp3', // ملف تجريبي موجود
        size: 0,
        text_used: 'معاينة تجريبية - يتطلب مفتاح API للمعاينة الفعلية',
        demo_mode: true
      });
    }
    
    // التحقق من voice_id
    if (!voice_id) {
      return NextResponse.json({
        success: false,
        error: 'يجب تحديد معرف الصوت'
      }, { status: 400 });
    }
    
    // نص معاينة افتراضي
    const previewText = text || 'مرحباً، هذا مثال على صوتي. يمكنني قراءة النصوص بوضوح وطلاقة.';
    
    // إعدادات الصوت الافتراضية
    const voiceSettings = settings || {
      stability: 0.6,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true
    };
    
    console.log('📡 إرسال طلب إلى ElevenLabs...');
    
    try {
      // استخدام fetch بدلاً من axios لتجنب مشاكل التبعيات
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text: previewText.substring(0, 100), // حد أقصى 100 حرف للمعاينة
            model_id: 'eleven_multilingual_v2',
            voice_settings: voiceSettings
          })
        }
      );
      
      console.log(`📊 استجابة ElevenLabs: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ خطأ من ElevenLabs:', errorText);
        
        let errorMessage = 'فشل في توليد معاينة الصوت';
        
        if (response.status === 401) {
          errorMessage = 'مفتاح API غير صالح - تحقق من صحة المفتاح';
        } else if (response.status === 404) {
          errorMessage = 'الصوت المطلوب غير موجود';
        } else if (response.status === 429) {
          errorMessage = 'تجاوزت حد الاستخدام - حاول لاحقاً';
        }
        
        // في حالة الخطأ، نرجع ملف تجريبي
        return NextResponse.json({
          success: true,
          preview_url: '/demo-audio.mp3',
          size: 0,
          text_used: errorMessage,
          demo_mode: true,
          error: errorMessage
        });
      }
      
      // قراءة البيانات الصوتية
      const audioData = await response.arrayBuffer();
      console.log(`✅ تم استلام الصوت: ${audioData.byteLength} بايت`);
      
      // تحويل الصوت إلى Base64
      const audioBase64 = Buffer.from(audioData).toString('base64');
      const dataUri = `data:audio/mpeg;base64,${audioBase64}`;
      
      return NextResponse.json({
        success: true,
        preview_url: dataUri,
        size: audioData.byteLength,
        text_used: previewText.substring(0, 100),
        demo_mode: false
      });
      
    } catch (fetchError: any) {
      console.error('❌ خطأ في الاتصال بـ ElevenLabs:', fetchError);
      
      // في حالة فشل الاتصال، نرجع ملف تجريبي
      return NextResponse.json({
        success: true,
        preview_url: '/demo-audio.mp3',
        size: 0,
        text_used: 'معاينة تجريبية - فشل الاتصال بالخدمة',
        demo_mode: true,
        error: 'فشل الاتصال بخدمة ElevenLabs'
      });
    }
    
  } catch (error: any) {
    console.error('❌ خطأ عام في معاينة الصوت:', error);
    
    // في أي خطأ، نرجع ملف تجريبي
    return NextResponse.json({
      success: true,
      preview_url: '/demo-audio.mp3',
      size: 0,
      text_used: 'معاينة تجريبية - حدث خطأ في النظام',
      demo_mode: true,
      error: error.message || 'حدث خطأ غير متوقع'
    });
  }
} 