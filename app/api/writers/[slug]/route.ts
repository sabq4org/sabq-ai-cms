import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug: rawSlug } = params;
    
    if (!rawSlug) {
      return NextResponse.json(
        { 
          success: false,
          error: 'معرف الكاتب مطلوب' 
        },
        { status: 400 }
      );
    }
    
    // فك ترميز الـ slug للتعامل مع الأسماء العربية
    const slug = decodeURIComponent(rawSlug);
    
    console.log(`🔍 البحث عن الكاتب:`, {
      rawSlug,
      decodedSlug: slug,
      areEqual: rawSlug === slug
    });
    
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
        email: true,
        avatar_url: true,
        social_links: true,
        role: true,
        specializations: true,
        total_articles: true,
        total_views: true,
        total_likes: true,
        total_shares: true,
        ai_score: true,
        last_article_at: true,
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