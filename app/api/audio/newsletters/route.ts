import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('📚 جلب جميع النشرات الصوتية...');
    
    const newsletters = await prisma.audio_newsletters.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log(`✅ تم جلب ${newsletters.length} نشرة`);
    
    return NextResponse.json({
      success: true,
      newsletters,
      count: newsletters.length
    });
  } catch (error: any) {
    console.error('❌ خطأ في جلب النشرات:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب النشرات',
      details: error.message
    }, { status: 500 });
  }
} 