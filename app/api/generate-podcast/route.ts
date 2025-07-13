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

    // 1. جلب آخر الأخبار من API صحيفة سبق
    console.log('📰 جلب آخر الأخبار...');
    const newsResponse = await axios.get(`https://sabq.org/api/news/latest`);
    const newsItems = newsResponse.data
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
    
    const narrationText = gptRes.data.choices[0].message.content;
    console.log('✅ تم توليد النص بنجاح');

    // 3. تحويل النص إلى صوت باستخدام ElevenLabs
    console.log('🔊 تحويل النص إلى صوت...');
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

    // 4. حفظ الملف الصوتي مؤقتاً
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `nashrah-${timestamp}.mp3`;
    const tempDir = path.join(process.cwd(), 'public', 'temp-podcasts');
    
    // التأكد من وجود المجلد
    await fs.mkdir(tempDir, { recursive: true });
    
    const filePath = path.join(tempDir, filename);
    await fs.writeFile(filePath, Buffer.from(audioRes.data));
    console.log('✅ تم حفظ الملف الصوتي');

    // 5. إرجاع رابط الملف المؤقت
    const publicUrl = `/temp-podcasts/${filename}`;
    
    // حذف الملفات القديمة (أكثر من ساعة)
    const files = await fs.readdir(tempDir);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const file of files) {
      const fileStat = await fs.stat(path.join(tempDir, file));
      if (fileStat.mtimeMs < oneHourAgo) {
        await fs.unlink(path.join(tempDir, file));
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
      error: err.message || 'حدث خطأ في توليد النشرة الصوتية'
    }, { status: 500 });
  }
}

// دالة للحصول على معلومات النشرة الأخيرة
export async function GET() {
  try {
    const tempDir = path.join(process.cwd(), 'public', 'temp-podcasts');
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