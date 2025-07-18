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

export async function GET(request: NextRequest) {
  try {
    await ensureFile();
    
    // قراءة البيانات من الملف
    const data = await fs.readFile(PODCASTS_FILE, 'utf-8');
    const { podcasts } = JSON.parse(data);
    
    // البحث عن آخر نشرة يومية منشورة
    const featuredNewsletter = podcasts.find((p: any) => 
      p.is_daily === true && p.is_published === true
    );
    
    if (!featuredNewsletter) {
      // إذا لم توجد نشرة يومية، احصل على آخر نشرة منشورة
      const latestNewsletter = podcasts.find((p: any) => 
        p.is_published === true
      );
      
      return NextResponse.json({
        success: true,
        newsletter: latestNewsletter || null
      });
    }

    // زيادة عداد التشغيل (اختياري - يمكن إضافته لاحقاً)
    // يمكن تحديث الملف هنا إذا أردت زيادة عداد التشغيل

    return NextResponse.json({
      success: true,
      newsletter: featuredNewsletter
    });
  } catch (error) {
    console.error('Error fetching featured newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured newsletter' },
      { status: 500 }
    );
  }
} 