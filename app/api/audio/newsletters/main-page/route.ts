import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🏠 جلب النشرة الرئيسية...');
    
    // جلب أحدث نشرة مفعلة للصفحة الرئيسية
    const newsletter = await prisma.audio_newsletters.findFirst({
      where: {
        is_main_page: true,
        is_published: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    if (!newsletter) {
      console.log('⚠️ لا توجد نشرة رئيسية');
      return NextResponse.json({
        success: false,
        newsletter: null,
        message: 'لا توجد نشرة صوتية للصفحة الرئيسية'
      });
    }
    
    console.log('✅ تم جلب النشرة الرئيسية:', newsletter.id);
    
    // زيادة عدد مرات التشغيل
    await prisma.audio_newsletters.update({
      where: { id: newsletter.id },
      data: { play_count: { increment: 1 } }
    });
    
    return NextResponse.json({
      success: true,
      newsletter,
      message: 'تم جلب النشرة الرئيسية بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في جلب النشرة الرئيسية:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب النشرة الرئيسية',
      details: error.message
    }, { status: 500 });
  }
} 