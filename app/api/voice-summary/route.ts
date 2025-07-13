import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ 
        error: 'يرجى تمرير معرف المقال articleId' 
      }, { status: 400 });
    }

    // التحقق من وجود مفتاح ElevenLabs
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('❌ ELEVENLABS_API_KEY غير موجود');
      return NextResponse.json({ 
        success: false, 
        error: 'مفتاح ElevenLabs غير مكون.' 
      }, { status: 500 });
    }

    // 1. جلب بيانات المقال من قاعدة البيانات
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        excerpt: true, // استخدام excerpt بدلاً من summary
        audio_summary_url: true
      }
    });

    if (!article) {
      return NextResponse.json({ 
        error: 'المقال غير موجود' 
      }, { status: 404 });
    }

    // إذا كان الصوت موجود مسبقاً، أرجعه
    if (article.audio_summary_url) {
      return NextResponse.json({ 
        success: true, 
        audioUrl: article.audio_summary_url,
        cached: true 
      });
    }

    // التحقق من وجود موجز
    if (!article.excerpt) {
      return NextResponse.json({ 
        error: 'هذا المقال لا يحتوي على موجز' 
      }, { status: 400 });
    }

    // 2. تحضير النص (قص الموجز إلى 800 حرف كحد أقصى)
    const narrationText = article.excerpt.slice(0, 800);
    console.log(`🎙️ توليد صوت لموجز المقال ${articleId}: ${article.title}`);

    // 3. توليد الصوت من ElevenLabs
    const voice = 'EXAVITQu4vr4xnSDxMaL'; // صوت عربي احترافي
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
          },
        },
        {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );
      audioData = audioRes.data;
      console.log('✅ تم توليد الصوت بنجاح');
    } catch (err: any) {
      console.error('❌ ElevenLabs Error:', err.response?.data || err.message);
      
      let errorMessage = 'فشل توليد الصوت من الموجز.';
      if (err.response?.status === 402) {
        errorMessage = 'رصيد ElevenLabs غير كافٍ.';
      } else if (err.response?.status === 401) {
        errorMessage = 'مفتاح ElevenLabs غير صحيح.';
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // 4. حفظ الملف مؤقتاً
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `summary-${articleId}-${timestamp}.mp3`;
    
    // في بيئة Vercel، استخدم /tmp
    const tempDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'public', 'audio-summaries');
    
    // التأكد من وجود المجلد
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (err) {
      console.log('المجلد موجود بالفعل');
    }
    
    const filePath = path.join(tempDir, filename);
    await fs.writeFile(filePath, Buffer.from(audioData));

    // 5. محاولة رفع الملف إلى الخادم (إن وُجد)
    let audioUrl = null;
    
    if (process.env.SITE_UPLOAD_ENDPOINT) {
      try {
        const form = new FormData();
        form.append('file', await fs.readFile(filePath), filename);
        
        const uploadRes = await axios.post(
          process.env.SITE_UPLOAD_ENDPOINT,
          form,
          { 
            headers: form.getHeaders(),
            timeout: 30000 
          }
        );
        
        audioUrl = uploadRes.data.link;
        console.log('✅ تم رفع الملف بنجاح');
      } catch (uploadErr: any) {
        console.error('❌ Upload Error:', uploadErr.response?.data || uploadErr.message);
      }
    }

    // إذا لم ينجح الرفع، استخدم الملف المحلي أو Base64
    if (!audioUrl) {
      audioUrl = process.env.VERCEL 
        ? `data:audio/mp3;base64,${Buffer.from(audioData).toString('base64')}`
        : `/audio-summaries/${filename}`;
    }

    // 6. حفظ رابط الصوت في قاعدة البيانات
    await prisma.articles.update({
      where: { id: articleId },
      data: { audio_summary_url: audioUrl }
    });

    // حذف الملف المؤقت إذا تم الرفع بنجاح
    if (audioUrl && !audioUrl.startsWith('data:') && !audioUrl.startsWith('/audio-summaries/')) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.log('تخطي حذف الملف المؤقت');
      }
    }

    return NextResponse.json({ 
      success: true, 
      audioUrl: audioUrl,
      cached: false 
    });

  } catch (err: any) {
    console.error('❌ Unexpected Error:', err.message);
    return NextResponse.json({ 
      error: 'فشل داخلي في إنشاء صوت الموجز.',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

// دالة لحذف الصوت المخزن مؤقتاً (للتحديث)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ 
        error: 'يرجى تمرير معرف المقال articleId' 
      }, { status: 400 });
    }

    // حذف رابط الصوت من قاعدة البيانات
    await prisma.articles.update({
      where: { id: articleId },
      data: { audio_summary_url: null }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'تم حذف الصوت المخزن مؤقتاً' 
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
} 