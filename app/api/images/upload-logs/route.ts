import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // جلب آخر 100 سجل مرتبة حسب التاريخ
    const { data: logs, error } = await supabase
      .from('upload_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('خطأ في جلب سجلات الرفع:', error);
      return NextResponse.json({
        success: false,
        error: 'فشل في جلب السجلات'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      logs: logs || []
    });

  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في الخادم'
    }, { status: 500 });
  }
} 