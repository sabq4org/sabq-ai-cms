import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ error: 'معرف المقال مطلوب' }, { status: 400 });
    }

    // 1. جلب المقال من قاعدة البيانات
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        excerpt: true,
        audio_summary_url: true
      }
    });

    if (!article) {
      return NextResponse.json({ error: 'المقال غير موجود' }, { status: 404 });
    }

    // 2. إذا كان الصوت موجود بالفعل، إرجاعه
    if (article.audio_summary_url) {
      return NextResponse.json({ audioUrl: article.audio_summary_url });
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

    // 3. توليد الصوت من ElevenLabs
    // استخدام النموذج الأساسي المتاح للجميع
    const voice = '21m00Tcm4TlvDq8ikWAM'; // Rachel - صوت افتراضي مجاني
    let audioData;
    
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
        {
          text: article.excerpt || article.title,
          model_id: 'eleven_multilingual_v1', // النموذج الأساسي المجاني
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer'
        }
      );
      
      audioData = response.data;
    } catch (err: any) {
      // طباعة تفاصيل كاملة للخطأ
      if (err.response?.data) {
        const errorData = Buffer.from(err.response.data).toString('utf8');
        console.error('❌ ElevenLabs Error Details:', errorData);
        try {
          const parsed = JSON.parse(errorData);
          console.error('❌ Parsed Error:', JSON.stringify(parsed, null, 2));
        } catch {
          // ignore
        }
      } else {
        console.error('❌ ElevenLabs Error:', err.message);
      }
      
      let errorMessage = 'فشل توليد الصوت من الموجز.';
      let errorDetails = '';
      
      if (err.response?.status === 402) {
        errorMessage = 'رصيد ElevenLabs غير كافٍ.';
      } else if (err.response?.status === 401) {
        errorMessage = 'مفتاح ElevenLabs غير صحيح.';
      } else if (err.response?.status === 403) {
        errorMessage = 'ليس لديك صلاحية لاستخدام هذا الصوت أو النموذج.';
        errorDetails = 'تحقق من أن الصوت والنموذج متاحان لحسابك';
      } else if (err.response?.data) {
        // محاولة استخراج رسالة الخطأ من الاستجابة
        const errorData = Buffer.from(err.response.data).toString('utf8');
        try {
          const parsed = JSON.parse(errorData);
          if (parsed.detail?.status === 'missing_permissions') {
            errorMessage = 'الصوت أو النموذج المطلوب غير متاح لحسابك.';
            errorDetails = 'جرب استخدام صوت آخر أو نموذج مختلف';
          } else {
            errorMessage = parsed.detail?.message || parsed.message || errorMessage;
          }
        } catch {
          errorMessage = errorData || errorMessage;
        }
      }
      
      // وضع تجريبي: إرجاع صوت وهمي للاختبار
      if (process.env.NODE_ENV === 'development' && process.env.ELEVENLABS_DEMO_MODE === 'true') {
        console.log('🎭 الوضع التجريبي: استخدام صوت عربي تجريبي');
        
        // استخدام ملف صوتي تجريبي محفوظ مسبقاً
        // يمكن استبداله بملف صوتي حقيقي لاحقاً
        const demoAudioUrl = '/audio/demo-summary.mp3';
        const audioUrl = demoAudioUrl;
        
        // حفظ رابط الصوت التجريبي
        await prisma.articles.update({
          where: { id: articleId },
          data: { audio_summary_url: audioUrl }
        });
        
        return NextResponse.json({ 
          audioUrl,
          isDemo: true,
          message: 'صوت تجريبي - سيتم استبداله بصوت حقيقي قريباً'
        });
      } else {
        return NextResponse.json({ 
          error: errorMessage,
          details: errorDetails
        }, { status: 500 });
      }
    }

    // 4. تحويل الصوت إلى Base64
    const audioBase64 = Buffer.from(audioData).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // 5. حفظ رابط الصوت في قاعدة البيانات
    await prisma.articles.update({
      where: { id: articleId },
      data: { audio_summary_url: audioUrl }
    });

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error('خطأ في توليد الصوت:', error);
    return NextResponse.json({ error: 'فشل توليد الصوت من الموجز' }, { status: 500 });
  }
}