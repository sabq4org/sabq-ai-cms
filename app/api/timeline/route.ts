import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Cache في الذاكرة
const timelineCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 ثانية للتحديثات السريعة

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const skip = (page - 1) * limit;
  
  const cacheKey = `${page}-${limit}`;
  
  // التحقق من الكاش
  const cached = timelineCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  }
  
  try {
    // جلب الأخبار العاجلة والمقالات الحديثة بالتوازي
    const [breakingNews, recentArticles, categories] = await Promise.all([
      // الأخبار العاجلة
      prisma.articles.findMany({
        where: {
          breaking: true,
          status: 'published'
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          published_at: true,
          breaking: true,
          category_id: true,
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          }
        },
        orderBy: { published_at: 'desc' },
        take: 5
      }),
      
      // المقالات الحديثة
      prisma.articles.findMany({
        where: {
          status: 'published',
          breaking: false
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          published_at: true,
          category_id: true,
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          }
        },
        orderBy: { published_at: 'desc' },
        skip,
        take: limit
      }),
      
      // التصنيفات النشطة
      prisma.categories.findMany({
        where: { is_active: true },
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          icon: true,
          updated_at: true
        },
        orderBy: { updated_at: 'desc' },
        take: 10
      })
    ]);

    // دمج وترتيب العناصر
    const items: any[] = [];
    
    // إضافة الأخبار العاجلة أولاً
    if (page === 1) {
      breakingNews.forEach(article => {
        items.push({
          id: article.id,
          type: 'news',
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          image: article.featured_image,
          breaking: true,
          category: article.categories,
          timestamp: article.published_at || new Date(),
          tag: 'عاجل',
          label: 'خبر عاجل',
          color: '#ef4444'
        });
      });
    }
    
    // إضافة المقالات العادية
    recentArticles.forEach(article => {
      items.push({
        id: article.id,
        type: 'article',
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        image: article.featured_image,
        breaking: false,
        category: article.categories,
        timestamp: article.published_at || new Date(),
        tag: article.categories?.name || 'مقال',
        label: 'مقال جديد',
        color: article.categories?.color || '#3b82f6'
      });
    });
    
    // إضافة تحديثات التصنيفات (صفحة 2 فما فوق)
    if (page > 1 && categories.length > 0) {
      const randomCategories = categories
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      randomCategories.forEach(category => {
        items.push({
          id: `cat-update-${category.id}`,
          type: 'category',
          title: `تحديث في قسم ${category.name}`,
          slug: category.slug,
          excerpt: `محتوى جديد في قسم ${category.name}`,
          image: null,
          breaking: false,
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
            color: category.color
          },
          timestamp: category.updated_at || new Date(),
          tag: 'تحديث',
          label: 'قسم محدث',
          color: category.color || '#6b7280'
        });
      });
    }
    
    // ترتيب حسب الوقت
    items.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
    
    const response = {
      items,
      pagination: {
        page,
        limit,
        hasMore: recentArticles.length === limit
      },
      stats: {
        totalItems: items.length,
        breakingNews: breakingNews.length,
        articles: recentArticles.length,
        categoryUpdates: items.filter(i => i.type === 'category').length
      }
    };
    
    // حفظ في الكاش
    timelineCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  } catch (error) {
    console.error('❌ خطأ في جلب الخط الزمني:', error);
    return NextResponse.json(
      { 
        error: 'فشل جلب الخط الزمني',
        message: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
} 