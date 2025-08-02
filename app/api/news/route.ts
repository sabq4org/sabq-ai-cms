/**
 * API للأخبار المنفصلة
 * /api/news - جلب الأخبار من جدول news_articles
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
    const category_id = searchParams.get('category_id');
    const author_id = searchParams.get('author_id');
    const breaking = searchParams.get('breaking');
    const featured = searchParams.get('featured');
    const urgent = searchParams.get('urgent');
    const search = searchParams.get('search');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const sort = searchParams.get('sort') || 'published_at';
    const order = searchParams.get('order') || 'desc';
    
    console.log('🔍 News API Request:', {
      page, limit, status, category_id, author_id, breaking, featured, urgent, search, sort, order
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
    if (category_id) where.category_id = category_id;
    if (author_id) where.author_id = author_id;
    if (breaking === 'true') where.breaking = true;
    if (featured === 'true') where.featured = true;
    if (urgent === 'true') where.urgent = true;
    
    // فلتر البحث النصي
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
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
    } else if (sort === 'views' || sort === 'likes' || sort === 'shares') {
      orderBy[sort] = order;
    } else if (sort === 'title') {
      orderBy.title = order;
    } else {
      orderBy.published_at = 'desc'; // افتراضي
    }
    
    // جلب الأخبار والعدد الإجمالي
    const [news, totalCount] = await Promise.all([
      prisma.news_articles.findMany({
        where,
        include: {
          categories: {
            select: { id: true, name: true, slug: true, color: true }
          },
          author: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.news_articles.count({ where })
    ]);
    
    // حساب معلومات الصفحات
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    
    console.log(`✅ News API: تم جلب ${news.length} خبر من أصل ${totalCount}`);
    
    // إنشاء الاستجابة مع headers صريحة
    const response = NextResponse.json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore
      },
      meta: {
        filters: { status, category_id, author_id, breaking, featured, urgent, search },
        sort: { field: sort, order }
      }
    });
    
    // إضافة headers لمنع مشاكل الترميز
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    
    return response;
    
  } catch (error) {
    console.error('❌ خطأ في News API:', error);
    
    const errorResponse = NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الأخبار',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
    
    errorResponse.headers.set('Content-Type', 'application/json; charset=utf-8');
    return errorResponse;
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 إنشاء خبر جديد:', body.title);
    
    // التحقق من البيانات المطلوبة
    if (!body.title || !body.content || !body.author_id) {
      return NextResponse.json({
        success: false,
        error: 'البيانات المطلوبة مفقودة',
        details: 'title, content, author_id مطلوبة'
      }, { status: 400 });
    }
    
    // إنشاء slug من العنوان
    const slug = body.slug || body.title
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 200);
    
    // إنشاء الخبر الجديد
    const newsArticle = await prisma.news_articles.create({
      data: {
        title: body.title,
        slug: `${slug}-${Date.now()}`,
        content: body.content,
        excerpt: body.excerpt,
        status: body.status || 'draft',
        published_at: body.status === 'published' ? new Date() : body.published_at ? new Date(body.published_at) : null,
        scheduled_for: body.scheduled_for ? new Date(body.scheduled_for) : null,
        category_id: body.category_id,
        author_id: body.author_id,
        breaking: body.breaking || false,
        featured: body.featured || false,
        urgent: body.urgent || false,
        source: body.source,
        location: body.location,
        featured_image: body.featured_image,
        gallery: body.gallery,
        video_url: body.video_url,
        seo_title: body.seo_title,
        seo_description: body.seo_description,
        seo_keywords: body.seo_keywords || [],
        social_image: body.social_image,
        allow_comments: body.allow_comments !== false,
        metadata: body.metadata || {},
        updated_at: new Date()
      },
      include: {
        categories: {
          select: { id: true, name: true, slug: true, color: true }
        },
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log(`✅ تم إنشاء الخبر: ${newsArticle.id}`);
    
    const response = NextResponse.json({
      success: true,
      data: newsArticle,
      message: 'تم إنشاء الخبر بنجاح'
    }, { status: 201 });
    
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الخبر:', error);
    
    const errorResponse = NextResponse.json({
      success: false,
      error: 'حدث خطأ في إنشاء الخبر',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
    
    errorResponse.headers.set('Content-Type', 'application/json; charset=utf-8');
    return errorResponse;
  } finally {
    await prisma.$disconnect();
  }
}