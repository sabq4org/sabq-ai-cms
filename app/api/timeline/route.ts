import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface TimelineArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  breaking?: boolean;
  published_at: Date | null;
  created_at: Date;
  metadata?: any;
  categories?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  authors?: {
    id: string;
    name: string;
  } | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // جلب جميع المقالات مع بيانات الفئة
    const articles = await prisma.articles.findMany({
      where: {
        status: 'published'
      },
      orderBy: {
        published_at: 'desc'
      },
      take: limit * 2 // نجلب ضعف العدد لنقسمها لاحقاً
    }).catch((error: any) => {
      console.error('خطأ في جلب المقالات:', error);
      return []; // إرجاع مصفوفة فارغة في حالة الخطأ
    });

    // جلب التصنيفات الجديدة
    const categories = await prisma.categories.findMany({
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
    }).catch((error: any) => {
      console.error('خطأ في جلب التصنيفات:', error);
      return []; // إرجاع مصفوفة فارغة في حالة الخطأ
    });

    // جلب معلومات التصنيفات للمقالات
    const categoryIds = [...new Set(articles.map((a: any) => a.category_id).filter(Boolean))];
    const categoriesMap = new Map();
    
    if (categoryIds.length > 0) {
      const articleCategories = await prisma.categories.findMany({
        where: {
          id: { in: categoryIds as string[] }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          color: true
        }
      });
      
      articleCategories.forEach((cat: any) => {
        categoriesMap.set(cat.id, cat);
      });
    }

    // تصنيف المقالات إلى أخبار ومقالات رأي
    const news: any[] = [];
    const opinionArticles: any[] = [];
    
    for (const article of articles) {
      const categoryData = article.category_id ? categoriesMap.get(article.category_id) : null;
      
      // تحديد نوع المقال بناءً على الفئة أو البيانات الوصفية
      const isOpinion = 
        categoryData?.name === 'رأي' || 
        categoryData?.name === 'Opinion' ||
        categoryData?.slug === 'opinion' ||
        (article.metadata && typeof article.metadata === 'object' && 
         'type' in article.metadata && (article.metadata as any).type === 'opinion');
      
      const articleWithCategory = { 
        ...article, 
        category: categoryData 
      };
      
      if (isOpinion) {
        opinionArticles.push(articleWithCategory);
      } else {
        news.push(articleWithCategory);
      }
    }

    // دمج وتنسيق البيانات
    const timelineItems = [
      // تنسيق الأخبار
      ...news.slice(0, limit).map((item: any) => ({
        id: `news-${item.id}`,
        type: 'news' as const,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        image: item.featured_image,
        category: item.category,
        author: null,
        timestamp: item.published_at || item.created_at,
        tag: '📢',
        label: 'خبر جديد',
        color: 'green',
        is_breaking: item.breaking || false,
        breaking: item.breaking || false
      })),
      
      // تنسيق المقالات
      ...opinionArticles.slice(0, limit).map((item: any) => ({
        id: `article-${item.id}`,
        type: 'article' as const,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        image: item.featured_image,
        category: item.category,
        author: null,
        timestamp: item.published_at || item.created_at,
        tag: '📝',
        label: 'مقال جديد',
        color: 'orange',
        is_breaking: item.breaking || false,
        breaking: item.breaking || false
      })),
      
      // تنسيق التصنيفات
      ...categories.map((item: any) => ({
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
        },
        is_breaking: false,
        breaking: false
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
        details: error instanceof Error ? error.message : 'Unknown error',
        items: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          hasMore: false,
          totalPages: 0
        }
      },
      { status: 500 }
    );
  }
} 