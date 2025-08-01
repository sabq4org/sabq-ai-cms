import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { 
          success: false,
          error: 'معرف الكاتب مطلوب' 
        },
        { status: 400 }
      );
    }
    
    console.log(`🔍 البحث عن الكاتب بالـ slug: ${slug}`);
    
    // البحث عن الكاتب في جدول article_authors بناءً على slug
    const writer = await prisma.article_authors.findFirst({
      where: { 
        slug: slug,
        is_active: true 
      },
      select: {
        id: true,
        full_name: true,
        slug: true,
        title: true,
        bio: true,
        avatar_url: true,
        cover_image: true,
        specializations: true,
        location: true,
        email: true,
        website: true,
        social_media: true,
        verification_status: true,
        joined_date: true,
        total_articles: true,
        total_views: true,
        total_likes: true,
        avg_reading_time: true,
        featured_topics: true,
        is_active: true,
        created_at: true,
        updated_at: true
      }
    });
    
    if (!writer) {
      console.log(`❌ لا يوجد كاتب بالـ slug: ${slug}`);
      return NextResponse.json({
        success: false,
        error: 'الكاتب غير موجود'
      }, { status: 404 });
    }
    
    console.log(`✅ تم العثور على الكاتب: ${writer.full_name}`);
    
    return NextResponse.json({
      success: true,
      writer: writer
    });
    
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الكاتب:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب بيانات الكاتب',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}