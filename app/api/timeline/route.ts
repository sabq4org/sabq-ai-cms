import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // جلب جميع المقالات مع بيانات الفئة والمؤلف
    const articlesPromise = prisma.articles.findMany({
      where: {
        status: 'published'
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      },
      orderBy: {
        published_at: 'desc'
      },
      take: limit * 2 // نجلب ضعف العدد لنقسمها لاحقاً
    });

    // جلب التصنيفات الجديدة
    const categoriesPromise = prisma.categories.findMany({
      where: {
        is_active: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        icon: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    });

    // تنفيذ جميع الاستعلامات بالتوازي
    const [articles, categories] = await Promise.all([
      articlesPromise,
      categoriesPromise
    ]);

    // تصنيف المقالات إلى أخبار ومقالات رأي
    const news = [];
    const opinionArticles = [];
    
    for (const article of articles) {
      // تحديد نوع المقال بناءً على الفئة أو البيانات الوصفية
      const isOpinion = 
        article.categories?.name === 'رأي' || 
        article.categories?.name === 'Opinion' ||
        article.categories?.slug === 'opinion' ||
        (article.metadata && typeof article.metadata === 'object' && 
         'type' in article.metadata && (article.metadata as any).type === 'opinion');
      
      if (isOpinion) {
        opinionArticles.push(article);
      } else {
        news.push(article);
      }
    }

    // دمج وتنسيق البيانات
    const timelineItems = [
      // تنسيق الأخبار
      ...news.slice(0, limit).map(item => ({
        id: `news-${item.id}`,
        type: 'news' as const,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        image: item.featured_image,
        category: item.categories,
        author: null,
        timestamp: item.published_at || item.created_at,
        tag: '📢',
        label: 'خبر جديد',
        color: 'green'
      })),
      
      // تنسيق المقالات
      ...opinionArticles.slice(0, limit).map(item => ({
        id: `article-${item.id}`,
        type: 'article' as const,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        image: item.featured_image,
        category: item.categories,
        author: null,
        timestamp: item.published_at || item.created_at,
        tag: '📝',
        label: 'مقال جديد',
        color: 'orange'
      })),
      
      // تنسيق التصنيفات
      ...categories.map(item => ({
        id: `category-${item.id}`,
        type: 'category' as const,
        title: item.name,
        slug: item.slug,
        excerpt: item.description,
        image: null,
        category: null,
        author: null,
        timestamp: item.created_at,
        tag: '🏷️',
        label: 'تصنيف جديد',
        color: 'blue',
        categoryData: {
          color: item.color,
          icon: item.icon
        }
      }))
    ];

    // ترتيب حسب الوقت تنازلياً
    timelineItems.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    // تطبيق الـ pagination
    const paginatedItems = timelineItems.slice(offset, offset + limit);
    const total = timelineItems.length;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      success: true,
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        hasMore,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('خطأ في جلب بيانات الخط الزمني:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'فشل في جلب بيانات الخط الزمني',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 