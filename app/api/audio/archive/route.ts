import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    console.log('📥 حفظ نشرة صوتية في الأرشيف:', data);
    
    // إنشاء نشرة صوتية جديدة
    const newsletter = await prisma.audio_newsletters.create({
      data: {
        id: uuidv4(),
        title: data.title || `نشرة صوتية - ${new Date().toLocaleDateString('ar')}`,
        content: data.content || '',
        audioUrl: data.url,
        duration: parseInt(data.duration) || 0,
        voice_id: data.voice_id || data.voice || 'default',
        voice_name: data.voice_name || 'صوت افتراضي',
        language: data.language || 'ar',
        category: data.category || 'عام',
        is_published: data.is_published || false,
        is_featured: data.is_featured || false,
        play_count: 0
      }
    });
    
    console.log('✅ تم حفظ النشرة في الأرشيف:', newsletter.id);
    
    return NextResponse.json({
      success: true,
      newsletter,
      message: 'تم حفظ النشرة الصوتية بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في حفظ النشرة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في حفظ النشرة الصوتية',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const is_featured = searchParams.get('is_featured') === 'true';
    const is_published = searchParams.get('is_published') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const newsletters = await prisma.audio_newsletters.findMany({
      where: {
        ...(is_featured && { is_featured: true }),
        ...(is_published && { is_published: true })
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    });
    
    return NextResponse.json({
      success: true,
      newsletters,
      count: newsletters.length
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في جلب النشرات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب النشرات الصوتية',
      details: error.message
    }, { status: 500 });
  }
} 