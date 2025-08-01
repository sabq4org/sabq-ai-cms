import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('📝 جلب قائمة كتّاب المقالات...');
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active_only') === 'true';
    const limit = searchParams.get('limit');
    
    const whereClause: any = {};
    if (activeOnly) {
      whereClause.is_active = true;
    }
    
    const queryOptions: any = {
      where: whereClause,
      select: {
        id: true,
        full_name: true,
        slug: true,
        title: true,
        bio: true,
        email: true,
        avatar_url: true,
        social_links: true,
        is_active: true,
        specializations: true,
        total_articles: true,
        total_views: true,
        total_likes: true,
        total_shares: true,
        ai_score: true,
        last_article_at: true,
        created_at: true
      },
      orderBy: {
        full_name: 'asc'
      }
    };
    
    if (limit) {
      queryOptions.take = parseInt(limit);
    }
    
    const authors = await prisma.article_authors.findMany(queryOptions);
    
    console.log(`✅ تم جلب ${authors.length} كاتب من قاعدة البيانات`);
    
    return NextResponse.json({
      success: true,
      authors: authors,
      total: authors.length
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في جلب كتّاب المقالات:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب بيانات الكتّاب',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 إنشاء كاتب جديد...');
    
    const body = await request.json();
    const {
      full_name,
      title,
      bio,
      email,
      avatar_url,
      social_links,
      specializations
    } = body;
    
    // التحقق من البيانات المطلوبة
    if (!full_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'الاسم الكامل مطلوب'
        },
        { status: 400 }
      );
    }
    
    // إنشاء slug فريد
    const baseSlug = full_name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, '-');
    
    const timestamp = Date.now();
    const slug = `${baseSlug}-${timestamp}`;
    
    // إنشاء الكاتب
    const newAuthor = await prisma.article_authors.create({
      data: {
        id: `author_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        full_name,
        slug,
        title: title || null,
        bio: bio || null,
        email: email || null,
        avatar_url: avatar_url || null,
        social_links: social_links || {},
        specializations: specializations || [],
        is_active: true,
        role: 'writer',
        total_articles: 0,
        total_views: 0,
        total_likes: 0,
        total_shares: 0,
        ai_score: 0.0
      }
    });
    
    console.log(`✅ تم إنشاء كاتب جديد: ${newAuthor.full_name}`);
    
    return NextResponse.json({
      success: true,
      author: newAuthor,
      message: 'تم إنشاء الكاتب بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء الكاتب:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في إنشاء الكاتب',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}