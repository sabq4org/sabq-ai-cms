import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PODCASTS_FILE = path.join(process.cwd(), 'data', 'audio-podcasts.json');

// تحديث حالة نشر النشرة
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { is_published, is_daily } = body;
    
    // قراءة الملف الحالي
    const data = await fs.readFile(PODCASTS_FILE, 'utf-8');
    const { podcasts } = JSON.parse(data);
    
    // البحث عن النشرة وتحديثها
    const podcastIndex = podcasts.findIndex((p: any) => p.id === id);
    
    if (podcastIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'النشرة غير موجودة' },
        { status: 404 }
      );
    }
    
    // تحديث حالة النشرة
    if (is_published !== undefined) {
      podcasts[podcastIndex].is_published = is_published;
    }
    if (is_daily !== undefined) {
      podcasts[podcastIndex].is_daily = is_daily;
    }
    
    // حفظ التغييرات
    await fs.writeFile(
      PODCASTS_FILE,
      JSON.stringify({ podcasts }, null, 2),
      'utf-8'
    );
    
    return NextResponse.json({
      success: true,
      podcast: podcasts[podcastIndex]
    });
    
  } catch (error) {
    console.error('خطأ في تحديث حالة النشرة:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث حالة النشرة' },
      { status: 500 }
    );
  }
} 