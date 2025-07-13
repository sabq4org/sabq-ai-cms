import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';

export async function POST(req: NextRequest) {
  try {
    // التحقق من CRON_SECRET للأمان
    const CRON_SECRET = process.env.CRON_SECRET;
    const sentSecret = req.headers.get('x-cron-secret');
    if (CRON_SECRET && sentSecret !== CRON_SECRET) {
      return NextResponse.json({ 
        error: 'Unauthorized access' 
      }, { status: 401 });
    }

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
      .map((n: any) => `- ${n.title}`)
      .join('\n');

    // 2. توليد نص النشرة الإذاعية باستخدام GPT-4o مع تقصير النص
    console.log('🤖 توليد النص الإذاعي...');
    const prompt = `حوّل الأخبار التالية إلى نشرة صوتية رسمية باللغة ${language}. اجعلها مختصرة في فقرة واحدة فقط بدون مقدمات طويلة:\n${newsItems}`;

    let narrationText;
    try {
      const gptRes = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500 // تقليل عدد التوكنز للحصول على نص أقصر
        },
        {
          headers: { 
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // تقصير النص إلى 1000 حرف كحد أقصى
      narrationText = gptRes.data.choices[0].message.content.slice(0, 1000);
      console.log(`✅ تم توليد النص بنجاح (${narrationText.length} حرف)`);
    } catch (error: any) {
      console.error('❌ خطأ في توليد النص:', error.response?.data || error.message);
      // استخدام نص افتراضي مختصر
      narrationText = `نشرة أخبار صحيفة سبق. أهم الأخبار: ${newsItems}. شكراً لكم.`.slice(0, 1000);
    }

    // 3. تحويل النص إلى صوت باستخدام ElevenLabs مع معالجة محسنة للأخطاء
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
            similarity_boost: 0.75
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
      console.log('✅ تم تحويل النص إلى صوت بنجاح');
    } catch (error: any) {
      console.error('❌ ElevenLabs Error:', error.response?.data || error.message);
      
      // معالجة أنواع مختلفة من الأخطاء
      let errorMessage = 'فشل تحويل النص إلى صوت.';
      
      if (error.response?.status === 401) {
        errorMessage = 'مفتاح ElevenLabs غير صحيح.';
      } else if (error.response?.status === 402) {
        errorMessage = 'رصيد ElevenLabs غير كافٍ. يرجى شحن الرصيد.';
      } else if (error.response?.status === 400) {
        errorMessage = 'النص طويل جداً أو يحتوي على أحرف غير مدعومة.';
      } else if (error.response?.data) {
        // محاولة استخراج رسالة الخطأ من الاستجابة
        const errorData = Buffer.from(error.response.data).toString('utf8');
        try {
          const parsed = JSON.parse(errorData);
          errorMessage = parsed.detail?.message || parsed.message || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage,
        text: narrationText // إرجاع النص على الأقل
      }, { status: 500 });
    }

    // 4. حفظ الملف الصوتي
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

    // 5. محاولة رفع الملف إلى الخادم (إن وُجد)
    let uploadedUrl = null;
    if (process.env.SITE_UPLOAD_ENDPOINT) {
      try {
        const form = new FormData();
        form.append('file', await fs.readFile(filePath), filename);
        
        const uploadRes = await axios.post(
          process.env.SITE_UPLOAD_ENDPOINT,
          form,
          { 
            headers: form.getHeaders(),
            timeout: 30000 // 30 ثانية كحد أقصى
          }
        );
        
        uploadedUrl = uploadRes.data.link;
        console.log('✅ تم رفع الملف بنجاح');
      } catch (uploadErr: any) {
        console.error('❌ Upload Error:', uploadErr.response?.data || uploadErr.message);
        // الاستمرار بدون رفع - سنستخدم الملف المحلي
      }
    }

    // 6. إرجاع رابط الملف
    const publicUrl = uploadedUrl || (process.env.VERCEL 
      ? `data:audio/mp3;base64,${Buffer.from(audioData).toString('base64')}`
      : `/temp-podcasts/${filename}`);
    
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
      timestamp: new Date().toISOString(),
      uploaded: !!uploadedUrl
    });

  } catch (err: any) {
    console.error('❌ Unexpected Error:', err.message);
    return NextResponse.json({ 
      success: false, 
      error: 'حدث خطأ داخلي في إنشاء النشرة الصوتية.',
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