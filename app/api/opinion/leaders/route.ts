import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 GET /api/opinion/leaders - جلب قائد الرأي اليوم');

    // جلب مقال قائد الرأي اليوم باستخدام SQL مباشر
    const opinionLeaderData = await prisma.$queryRaw`
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.excerpt,
        a.summary,
        a.featured_image,
        a.reading_time,
        a.views,
        a.audio_summary_url,
        a.published_at,
        a.ai_quotes,
        a.tags,
        aa.full_name as author_name,
        aa.title as author_title,
        aa.specializations as author_specializations,
        aa.bio as author_bio,
        aa.avatar_url as author_avatar,
        c.name as category_name,
        c.slug as category_slug
      FROM articles a
      LEFT JOIN article_authors aa ON a.article_author_id = aa.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.is_opinion_leader = true 
        AND a.status = 'published'
      ORDER BY a.published_at DESC
      LIMIT 1
    `;

    const opinionLeader = opinionLeaderData[0] || null;

    if (!opinionLeader) {
      console.log('⚠️ لا يوجد مقال قائد رأي منشور');
      return NextResponse.json({
        success: false,
        message: 'لا يوجد مقال قائد رأي منشور حالياً'
      }, { status: 404 });
    }

    // تحويل البيانات إلى الشكل المطلوب
    const opinionData = {
      id: opinionLeader.id,
      title: opinionLeader.title,
      author: {
        name: opinionLeader.author_name || 'كاتب غير محدد',
        specialty: (opinionLeader.author_specializations && opinionLeader.author_specializations[0]) || opinionLeader.author_title || 'كاتب رأي',
        avatar_url: opinionLeader.author_avatar || null
      },
      hero_image: opinionLeader.featured_image || null,
      excerpt: opinionLeader.excerpt || opinionLeader.summary || null,
      read_time: opinionLeader.reading_time || 5,
      views: opinionLeader.views || 0,
      audio_url: opinionLeader.audio_summary_url || null,
      slug: opinionLeader.slug,
      published_at: opinionLeader.published_at,
      category: opinionLeader.category_name || null,
      ai_quotes: opinionLeader.ai_quotes || [],
      tags: opinionLeader.tags || []
    };

    console.log(`✅ تم العثور على قائد الرأي: ${opinionData.title}`);
    
    return NextResponse.json({
      success: true,
      data: opinionData
    });

  } catch (error) {
    console.error('❌ خطأ في جلب قائد الرأي:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب بيانات قائد الرأي',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// API لتحديد مقال كقائد رأي اليوم (للاستخدام من لوحة التحكم)
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 POST /api/opinion/leaders - تحديد قائد رأي جديد');
    
    const { articleId } = await request.json();
    
    if (!articleId) {
      return NextResponse.json({
        success: false,
        error: 'معرف المقال مطلوب'
      }, { status: 400 });
    }

    // إزالة التحديد من جميع المقالات
    await prisma.$executeRaw`
      UPDATE articles 
      SET is_opinion_leader = false 
      WHERE is_opinion_leader = true
    `;

    // تحديد المقال الجديد كقائد رأي
    await prisma.$executeRaw`
      UPDATE articles 
      SET is_opinion_leader = true, article_type = 'opinion'
      WHERE id = ${articleId}
    `;

    // جلب بيانات المقال المحدث
    const updatedArticleData = await prisma.$queryRaw`
      SELECT a.id, a.title, aa.full_name as author_name
      FROM articles a
      LEFT JOIN article_authors aa ON a.article_author_id = aa.id
      WHERE a.id = ${articleId}
    `;

    const updatedArticle = updatedArticleData[0];

    console.log(`✅ تم تحديد المقال "${updatedArticle.title}" كقائد رأي اليوم`);

    return NextResponse.json({
      success: true,
      message: 'تم تحديد قائد الرأي اليوم بنجاح',
      data: {
        id: updatedArticle.id,
        title: updatedArticle.title,
        author: updatedArticle.author_name
      }
    });

  } catch (error) {
    console.error('❌ خطأ في تحديد قائد الرأي:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديد قائد الرأي',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}