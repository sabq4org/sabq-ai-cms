import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = body.count || 5;
    const voice = body.voice || 'EXAVITQu4vr4xnSDxMaL'; // صوت عربي احترافي
    const language = body.language || 'arabic';

    console.log('🎙️ بدء توليد النشرة الصوتية...');

    // التحقق من وجود مفاتيح API
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY غير موجود');
      return NextResponse.json({ 
        success: false, 
        error: 'مفتاح OpenAI غير مكون. يرجى إضافة OPENAI_API_KEY في متغيرات البيئة.' 
      }, { status: 500 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('❌ ELEVENLABS_API_KEY غير موجود');
      return NextResponse.json({ 
        success: false, 
        error: 'مفتاح ElevenLabs غير مكون. يرجى إضافة ELEVENLABS_API_KEY في متغيرات البيئة.' 
      }, { status: 500 });
    }

    // 1. جلب آخر الأخبار من API صحيفة سبق
    console.log('📰 جلب آخر الأخبار...');
    
    // استخدام API محلي مؤقتاً حتى يعود API الأصلي للعمل
    let newsData;
    try {
      const newsResponse = await axios.get(`https://sabq.org/api/news/latest`);
      newsData = newsResponse.data;
    } catch (error) {
      console.log('⚠️ استخدام البيانات المحلية...');
      // استخدام API المحلي كبديل
      try {
        const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}` || 'http://localhost:3000';
        const localResponse = await fetch(`${baseUrl}/api/mock-news`);
        if (!localResponse.ok) {
          throw new Error('فشل جلب البيانات المحلية');
        }
        newsData = await localResponse.json();
      } catch (localError) {
        console.error('❌ فشل جلب البيانات المحلية:', localError);
        // استخدام بيانات افتراضية
        newsData = [
          { title: 'خبر عاجل: تطورات مهمة في المملكة' },
          { title: 'الاقتصاد السعودي يحقق نمواً قياسياً' },
          { title: 'إنجازات جديدة في مجال التقنية' },
          { title: 'تطورات إيجابية في القطاع الصحي' },
          { title: 'مشاريع تنموية جديدة في المملكة' }
        ];
      }
    }
    
    const newsItems = newsData
      .slice(0, count)
      .map((n: any, i: number) => `${i + 1}. ${n.title}`)
      .join('\n');

    // 2. توليد نص النشرة الإذاعية باستخدام GPT-4o
    console.log('🤖 توليد النص الإذاعي...');
    const systemPrompt = `أنت مذيع أخبار محترف في إذاعة سعودية رسمية. مهمتك تحويل عناوين الأخبار إلى نشرة إذاعية احترافية.`;
    
    const userPrompt = `حوّل عناوين الأخبار التالية إلى نشرة صوتية إذاعية احترافية باللغة العربية الفصحى:

${newsItems}

المطلوب:
- ابدأ بتحية احترافية مناسبة للوقت
- اذكر اسم "صحيفة سبق الإلكترونية" كمصدر
- اعرض كل خبر بصياغة إذاعية سلسة
- اختتم بشكل احترافي
- المدة المستهدفة: 2-3 دقائق`;

    let narrationText;
    try {
      const gptRes = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: { 
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      narrationText = gptRes.data.choices[0].message.content;
      console.log('✅ تم توليد النص بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في توليد النص:', error.response?.data || error.message);
      // استخدام نص افتراضي
      narrationText = `السلام عليكم ورحمة الله وبركاته، أهلاً بكم في نشرة أخبار صحيفة سبق الإلكترونية.

في نشرتنا لهذا اليوم، نستعرض معكم أهم الأخبار والتطورات:

${newsItems}

كانت هذه أبرز الأخبار من صحيفة سبق الإلكترونية. نشكركم على حسن الاستماع، والسلام عليكم ورحمة الله وبركاته.`;
    }

    // 3. تحويل النص إلى صوت باستخدام ElevenLabs
    console.log('🔊 تحويل النص إلى صوت...');
    let audioData;
    try {
      const audioRes = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
        {
          text: narrationText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer'
        }
      );
      audioData = audioRes.data;
    } catch (error: any) {
      console.error('❌ خطأ في تحويل النص إلى صوت:', error.response?.data || error.message);
      return NextResponse.json({ 
        success: false, 
        error: 'فشل تحويل النص إلى صوت. تحقق من رصيد ElevenLabs.',
        text: narrationText // إرجاع النص على الأقل
      }, { status: 500 });
    }

    // 4. حفظ الملف الصوتي مؤقتاً
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `nashrah-${timestamp}.mp3`;
    
    // في بيئة Vercel، استخدم /tmp
    const tempDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'public', 'temp-podcasts');
    
    // التأكد من وجود المجلد
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (err) {
      console.log('المجلد موجود بالفعل');
    }
    
    const filePath = path.join(tempDir, filename);
    await fs.writeFile(filePath, Buffer.from(audioData));
    console.log('✅ تم حفظ الملف الصوتي');

    // 5. إرجاع رابط الملف
    const publicUrl = process.env.VERCEL 
      ? `data:audio/mp3;base64,${Buffer.from(audioData).toString('base64')}`
      : `/temp-podcasts/${filename}`;
    
    // حذف الملفات القديمة (في البيئة المحلية فقط)
    if (!process.env.VERCEL && tempDir.includes('public')) {
      try {
        const files = await fs.readdir(tempDir);
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        for (const file of files) {
          const fileStat = await fs.stat(path.join(tempDir, file));
          if (fileStat.mtimeMs < oneHourAgo) {
            await fs.unlink(path.join(tempDir, file));
          }
        }
      } catch (err) {
        console.log('تخطي حذف الملفات القديمة');
      }
    }

    return NextResponse.json({ 
      success: true, 
      link: publicUrl,
      text: narrationText,
      duration: Math.round(narrationText.length / 150), // تقدير المدة بالدقائق
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('❌ خطأ في توليد النشرة:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'حدث خطأ في توليد النشرة الصوتية',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

// دالة للحصول على معلومات النشرة الأخيرة
export async function GET() {
  try {
    // في بيئة Vercel، لا يمكن حفظ الملفات بشكل دائم
    if (process.env.VERCEL) {
      return NextResponse.json({ 
        success: true, 
        lastPodcast: null,
        message: 'النشرات الصوتية لا تُحفظ في البيئة السحابية. استخدم زر توليد نشرة جديدة.'
      });
    }

    const tempDir = path.join(process.cwd(), 'public', 'temp-podcasts');
    
    try {
      const files = await fs.readdir(tempDir);
      
      if (files.length === 0) {
        return NextResponse.json({ 
          success: true, 
          lastPodcast: null 
        });
      }

      // الحصول على آخر ملف
      const sortedFiles = files
        .filter(f => f.endsWith('.mp3'))
        .sort((a, b) => b.localeCompare(a));
      
      if (sortedFiles.length > 0) {
        const latestFile = sortedFiles[0];
        const fileStat = await fs.stat(path.join(tempDir, latestFile));
        
        return NextResponse.json({ 
          success: true, 
          lastPodcast: {
            filename: latestFile,
            link: `/temp-podcasts/${latestFile}`,
            createdAt: fileStat.mtime,
            size: fileStat.size
          }
        });
      }
    } catch (err) {
      console.log('مجلد temp-podcasts غير موجود');
    }

    return NextResponse.json({ 
      success: true, 
      lastPodcast: null 
    });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
} 