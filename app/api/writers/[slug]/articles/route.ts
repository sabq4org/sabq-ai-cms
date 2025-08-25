import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug: rawSlug } = params;
    const { searchParams } = new URL(request.url);
    
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
    
    // معاملات البحث
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'published_at';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    console.log(`📚 جلب مقالات الكاتب:`, { 
      rawSlug, 
      decodedSlug: slug, 
      search, 
      category, 
      sort, 
      page, 
      limit 
    });
    
    // البحث عن الكاتب
    const writer = await prisma.article_authors.findFirst({
      where: { 
        slug: slug,
        is_active: true 
      },
      select: {
        id: true,
        full_name: true
      }
    });
    
    if (!writer) {
      return NextResponse.json({
        success: false,
        error: 'الكاتب غير موجود'
      }, { status: 404 });
    }
    
    // بناء شروط البحث
    const whereClause: any = {
      article_author_id: writer.id,
      status: 'published',
      article_type: { in: ['opinion', 'analysis', 'interview'] }
    };
    
    // إضافة البحث في العنوان والمحتوى
    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }
    
    // إضافة فلترة التصنيف
    if (category !== 'all') {
      whereClause.category_id = category;
    }
    
    // ترتيب النتائج
    const orderBy: any = {};
    switch (sort) {
      case 'views':
        orderBy.views = 'desc';
        break;
      case 'likes':
        orderBy.likes = 'desc';
        break;
      case 'reading_time':
        orderBy.reading_time = 'desc';
        break;
      case 'published_at':
      default:
        orderBy.published_at = 'desc';
        break;
    }
    
    // جلب المقالات مع العد الإجمالي
    const [articles, totalCount] = await Promise.all([
      prisma.articles.findMany({
        where: whereClause,
        orderBy: orderBy,
        skip: skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          published_at: true,
          views: true,
          likes: true,
          shares: true,
          reading_time: true,
          article_type: true,
          categories: {
            select: {
              id: true,
              name: true,
              color: true,
              slug: true
            }
          }
        }
      }),
      
      prisma.articles.count({
        where: whereClause
      })
    ]);
    
    console.log(`✅ تم جلب ${articles.length} مقال من أصل ${totalCount} للكاتب: ${writer.full_name}`);
    
    return NextResponse.json({
      success: true,
      articles: articles,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1
      },
      writer: {
        id: writer.id,
        name: writer.full_name
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ في جلب مقالات الكاتب:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب مقالات الكاتب',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}