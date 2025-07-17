import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// مسار ملف حفظ البيانات
const PODCASTS_FILE = path.join(process.cwd(), 'data', 'audio-podcasts.json');

// التأكد من وجود الملف
async function ensureFile() {
  try {
    await fs.access(PODCASTS_FILE);
  } catch {
    await fs.mkdir(path.dirname(PODCASTS_FILE), { recursive: true });
    await fs.writeFile(PODCASTS_FILE, JSON.stringify({ podcasts: [] }));
  }
}

// جلب النشرات الصوتية المحفوظة
export async function GET(request: NextRequest) {
  try {
    await ensureFile();
    
    // التحقق من معامل is_daily
    const url = new URL(request.url);
    const isDailyOnly = url.searchParams.get('daily') === 'true';
    const publishedOnly = url.searchParams.get('published') === 'true';
    const latest = url.searchParams.get('latest') === 'true';
    
    const data = await fs.readFile(PODCASTS_FILE, 'utf-8');
    const { podcasts } = JSON.parse(data);
    
    // فلترة النشرات اليومية أو المنشورة
    let filteredPodcasts = podcasts;
    if (isDailyOnly) {
      filteredPodcasts = podcasts.filter((p: any) => p.is_daily === true);
    }
    if (publishedOnly) {
      filteredPodcasts = podcasts.filter((p: any) => p.is_published === true);
    }
    
    // ترتيب حسب التاريخ الأحدث
    filteredPodcasts.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // إرجاع آخر نشرة منشورة فقط إذا طُلب ذلك
    if (latest && filteredPodcasts.length > 0) {
      return NextResponse.json({
        success: true,
        podcast: filteredPodcasts[0]
      });
    }

    return NextResponse.json({ 
      success: true, 
      podcasts: filteredPodcasts.slice(0, 50) // آخر 50 نشرة
    });
  } catch (error) {
    console.error('❌ خطأ في جلب النشرات:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch podcasts',
      podcasts: [] 
    }, { status: 200 });
  }
}

// حفظ نشرة صوتية جديدة
export async function POST(request: NextRequest) {
  try {
    await ensureFile();
    
    const body = await request.json();
    const { filename, url, size, duration, voice, text_length, is_daily, is_published } = body;

    // قراءة البيانات الحالية
    const data = await fs.readFile(PODCASTS_FILE, 'utf-8');
    const { podcasts } = JSON.parse(data);
    
    // إضافة النشرة الجديدة
    const newPodcast = {
      id: `podcast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename,
      url,
      size,
      duration: duration || '0 ثانية',
      voice,
      text_length,
      is_daily: is_daily || false,
      is_published: is_published || false, // إضافة حقل is_published
      created_at: new Date().toISOString(),
      created_by: 'user'
    };
    
    podcasts.unshift(newPodcast); // إضافة في البداية
    
    // حفظ البيانات
    await fs.writeFile(PODCASTS_FILE, JSON.stringify({ podcasts }, null, 2));

    return NextResponse.json({ 
      success: true, 
      podcast: newPodcast 
    });
  } catch (error) {
    console.error('❌ خطأ في حفظ النشرة:', error);
    return NextResponse.json({ 
      error: 'Failed to save podcast' 
    }, { status: 500 });
  }
} 