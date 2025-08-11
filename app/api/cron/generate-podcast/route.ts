import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // التحقق من أن الطلب قادم من Vercel Cron
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // تحديد الرابط الأساسي للتطبيق
    const baseUrl = process.env.NEXTAUTH_URL || 
                   process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.NEXT_PUBLIC_APP_URL ||
                   'http://localhost:3000';

    console.log('🔄 [Podcast Cron] استدعاء API توليد النشرة من:', baseUrl);

    // استدعاء API توليد النشرة
    const response = await fetch(`${baseUrl}/api/generate-podcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': process.env.CRON_SECRET || '' // إرسال CRON_SECRET للتحقق
      },
      body: JSON.stringify({
        count: 7, // عدد الأخبار للنشرة التلقائية
        language: 'arabic',
        voice: 'EXAVITQu4vr4xnSDxMaL'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ تم توليد النشرة الصوتية تلقائياً:', data.link);
      return NextResponse.json({ 
        success: true, 
        message: 'تم توليد النشرة الصوتية بنجاح',
        link: data.link,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(data.error || 'فشل توليد النشرة');
    }

  } catch (error: any) {
    console.error('❌ خطأ في Cron Job:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 