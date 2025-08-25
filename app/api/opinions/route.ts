/**
 * API لمقالات الرأي المنفصلة
 * /api/opinions - جلب مقالات الرأي من جدول opinion_articles
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // معاملات البحث والفلترة
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const skip = (page - 1) * limit;
    
    const status = searchParams.get('status') || 'published';
    const writer_id = searchParams.get('writer_id');
    const article_type = searchParams.get('article_type');
    const opinion_category = searchParams.get('opinion_category');
    const featured = searchParams.get('featured');
    const is_leader_opinion = searchParams.get('is_leader_opinion');
    const difficulty_level = searchParams.get('difficulty_level');
    const tags = searchParams.get('tags')?.split(',');
    const topics = searchParams.get('topics')?.split(',');
    const min_quality_score = searchParams.get('min_quality_score');
    const search = searchParams.get('search');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const sort = searchParams.get('sort') || 'published_at';
    const order = searchParams.get('order') || 'desc';
    
    console.log('🔍 Opinions API Request:', {
      page, limit, status, writer_id, article_type, opinion_category, featured, is_leader_opinion, difficulty_level, tags, topics, min_quality_score, search, sort, order
    });
    
    // بناء شروط البحث
    const where: any = {};
    
    // فلتر الحالة
    if (status === 'all') {
      where.status = { in: ['draft', 'published', 'archived'] };
    } else {
      where.status = status;
    }
    
    // فلاتر أخرى
    if (writer_id) where.writer_id = writer_id;
    if (article_type) where.article_type = article_type;
    if (opinion_category) where.opinion_category = opinion_category;
    if (featured === 'true') where.featured = true;
    if (is_leader_opinion === 'true') where.is_leader_opinion = true;
    if (difficulty_level) where.difficulty_level = difficulty_level;
    if (min_quality_score) where.quality_score = { gte: parseFloat(min_quality_score) };
    
    // فلتر الكلمات المفتاحية والمواضيع
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }
    if (topics && topics.length > 0) {
      where.topics = { hasSome: topics };
    }
    
    // فلتر البحث النصي
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
        { topics: { hasSome: [search] } }
      ];
    }
    
    // فلتر التاريخ
    if (date_from || date_to) {
      where.published_at = {};
      if (date_from) where.published_at.gte = new Date(date_from);
      if (date_to) where.published_at.lte = new Date(date_to);
    }
    
    // بناء ترتيب النتائج
    const orderBy: any = {};
    if (sort === 'published_at' || sort === 'created_at') {
      orderBy[sort] = order;
    } else if (sort === 'views' || sort === 'likes' || sort === 'saves' || sort === 'shares') {
      orderBy[sort] = order;
    } else if (sort === 'quality_score' || sort === 'engagement_score' || sort === 'ai_rating') {
      orderBy[sort] = order;
    } else if (sort === 'title') {
      orderBy.title = order;
    } else {
      orderBy.published_at = 'desc'; // افتراضي
    }
    
    // جلب مقالات الرأي والعدد الإجمالي
    const [opinions, totalCount] = await Promise.all([
      prisma.opinion_articles.findMany({
        where,
        include: {
          writer: {
            select: { 
              id: true, 
              full_name: true, 
              slug: true,
              title: true,
              bio: true,
              avatar_url: true,
              social_links: true,
              role: true,
              specializations: true,
              total_articles: true,
              total_views: true,
              total_likes: true,
              ai_score: true,
              is_active: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.opinion_articles.count({ where })
    ]);
    
    // حساب معلومات الصفحات
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    
    console.log(`✅ Opinions API: تم جلب ${opinions.length} مقال رأي من أصل ${totalCount}`);
    
    // إنشاء الاستجابة مع headers صريحة
    const response = NextResponse.json({
      success: true,
      data: opinions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore
      },
      meta: {
        filters: { 
          status, writer_id, article_type, opinion_category, featured, is_leader_opinion, 
          difficulty_level, tags, topics, min_quality_score, search 
        },
        sort: { field: sort, order }
      }
    });
    
    // إضافة headers لمنع مشاكل الترميز
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
    
  } catch (error) {
    console.error('❌ خطأ في Opinions API:', error);
    
    const errorResponse = NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب مقالات الرأي',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
    
    errorResponse.headers.set('Content-Type', 'application/json; charset=utf-8');
    return errorResponse;
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 إنشاء مقال رأي جديد:', body.title);
    
    // التحقق من البيانات المطلوبة
    if (!body.title || !body.content || !body.writer_id) {
      return NextResponse.json({
        success: false,
        error: 'البيانات المطلوبة مفقودة',
        details: 'title, content, writer_id مطلوبة'
      }, { status: 400 });
    }
    
    // التحقق من وجود الكاتب
    const writerExists = await prisma.article_authors.findUnique({
      where: { id: body.writer_id }
    });
    
    if (!writerExists) {
      return NextResponse.json({
        success: false,
        error: 'الكاتب المحدد غير موجود',
        details: `لا يوجد كاتب بالمعرف: ${body.writer_id}`
      }, { status: 404 });
    }
    
    // إنشاء slug من العنوان
    const slug = body.slug || body.title
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 200);
    
    // إنشاء مقال الرأي الجديد
    const opinionArticle = await prisma.opinion_articles.create({
      data: {
        title: body.title,
        slug: `${slug}-${Date.now()}`,
        content: body.content,
        excerpt: body.excerpt,
        status: body.status || 'draft',
        published_at: body.status === 'published' ? new Date() : body.published_at ? new Date(body.published_at) : null,
        scheduled_for: body.scheduled_for ? new Date(body.scheduled_for) : null,
        writer_id: body.writer_id,
        writer_role: body.writer_role,
        writer_specialty: body.writer_specialty,
        article_type: body.article_type || 'opinion',
        opinion_category: body.opinion_category,
        featured: body.featured || false,
        is_leader_opinion: body.is_leader_opinion || false,
        difficulty_level: body.difficulty_level || 'medium',
        estimated_read: body.estimated_read,
        quality_score: body.quality_score || 7.0,
        engagement_score: body.engagement_score || 0.0,
        ai_rating: body.ai_rating || 0.0,
        featured_image: body.featured_image,
        quote_image: body.quote_image,
        author_image: body.author_image,
        tags: body.tags || [],
        topics: body.topics || [],
        related_entities: body.related_entities || [],
        seo_title: body.seo_title,
        seo_description: body.seo_description,
        seo_keywords: body.seo_keywords || [],
        social_image: body.social_image,
        allow_comments: body.allow_comments !== false,
        allow_rating: body.allow_rating !== false,
        allow_sharing: body.allow_sharing !== false,
        key_quotes: body.key_quotes || [],
        main_points: body.main_points || [],
        conclusion: body.conclusion,
        podcast_url: body.podcast_url,
        metadata: body.metadata || {},
        updated_at: new Date()
      },
      include: {
        writer: {
          select: { 
            id: true, 
            full_name: true, 
            slug: true,
            title: true,
            bio: true,
            avatar_url: true,
            social_links: true,
            role: true,
            specializations: true,
            total_articles: true,
            total_views: true,
            total_likes: true,
            ai_score: true,
            is_active: true
          }
        }
      }
    });
    
    console.log(`✅ تم إنشاء مقال الرأي: ${opinionArticle.id}`);
    
    const response = NextResponse.json({
      success: true,
      data: opinionArticle,
      message: 'تم إنشاء مقال الرأي بنجاح'
    }, { status: 201 });
    
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء مقال الرأي:', error);
    
    const errorResponse = NextResponse.json({
      success: false,
      error: 'حدث خطأ في إنشاء مقال الرأي',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
    
    errorResponse.headers.set('Content-Type', 'application/json; charset=utf-8');
    return errorResponse;
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}