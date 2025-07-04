import { NextRequest, NextResponse } from 'next/server';
import { emailScheduler } from '@/lib/services/emailScheduler';

// GET: جلب إحصائيات المهمة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stats = await emailScheduler.getJobStats(id);
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الإحصائيات' },
      { status: 500 }
    );
  }
} 