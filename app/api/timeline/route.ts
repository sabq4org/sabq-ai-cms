import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dbConnectionManager from '@/lib/db-connection-manager';

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
      dbConnectionManager.executeWithConnection(async () => {
        return await prisma.articles.findMany({
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
        });
      }),
      
      // المقالات الحديثة
      dbConnectionManager.executeWithConnection(async () => {
        return await prisma.articles.findMany({
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
        });
      }),
      
      // التصنيفات النشطة
      dbConnectionManager.executeWithConnection(async () => {
        return await prisma.categories.findMany({
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
        });
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
      const categoryUpdate = categories[Math.floor(Math.random() * Math.min(3, categories.length))];
      if (categoryUpdate) {
        items.push({
          id: categoryUpdate.id,
          type: 'category',
          title: `تحديث في قسم ${categoryUpdate.name}`,
          slug: categoryUpdate.slug,
          timestamp: categoryUpdate.updated_at,
          tag: 'تصنيف',
          label: 'تحديث القسم',
          color: categoryUpdate.color || '#10b981',
          categoryData: {
            color: categoryUpdate.color,
            icon: categoryUpdate.icon
          }
        });
      }
    }

    // ترتيب حسب الوقت
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const response = {
      success: true,
      items: items.slice(0, limit),
      pagination: {
        page,
        limit,
        hasMore: recentArticles.length === limit
      }
    };

    // حفظ في الكاش
    timelineCache.set(cacheKey, { data: response, timestamp: Date.now() });
    
    // تنظيف الكاش القديم
    if (timelineCache.size > 20) {
      const oldestKey = Array.from(timelineCache.keys())[0];
      timelineCache.delete(oldestKey);
    }

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب الخط الزمني:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب البيانات',
      items: [],
      pagination: { page, limit, hasMore: false }
    }, { status: 500 });
  }
} 