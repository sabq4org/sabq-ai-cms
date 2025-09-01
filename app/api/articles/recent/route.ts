import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDbConnected } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await ensureDbConnected();
    
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
    const category = searchParams.get('category');
    const isLight = searchParams.get('light') === 'true';
    
    // شروط الاستعلام
    const where: any = {
      status: 'published',
    };
    
    if (category) {
      where.category_id = category;
    }

    // تحديد الحقول المطلوبة حسب النوع
    const selectFields = isLight ? {
      id: true,
      title: true,
      slug: true,
      featured_image: true,
      published_at: true,
      views: true,
      categories: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    } : {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featured_image: true,
      published_at: true,
      views: true,
      featured: true,
      breaking: true,
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true
        }
      }
    };

    // جلب أحدث الأخبار المنشورة
    const articles = await prisma.articles.findMany({
      where,
      take: limit,
      orderBy: [
        { published_at: 'desc' }
      ],
      select: selectFields
    });

    const response = {
      success: true,
      data: articles,
      total: articles.length,
      metadata: {
        type: isLight ? 'recent-news-light' : 'recent-news',
        light: isLight,
        timestamp: new Date().toISOString()
      }
    };

    const cacheTime = isLight ? 300 : 180; // النسخة الخفيفة تُخزن لفترة أطول

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, max-age=${cacheTime}`,
      },
    });

  } catch (error) {
    console.error('خطأ في /api/articles/recent:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب الأخبار الحديثة',
      data: [],
      total: 0,
    }, { status: 500 });
  }
}
