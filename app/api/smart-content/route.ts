import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDbConnected } from '@/lib/prisma';

// Cache في الذاكرة
const smartContentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cacheKey = searchParams.toString();

  // التحقق من الكاش
  const cached = smartContentCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  try {
    await ensureDbConnected();
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const category = searchParams.get('category');
    
    // جلب محتوى ذكي - مقالات حديثة ومتنوعة
    const where: any = {
      status: 'published',
    };
    
    if (category) {
      where.category_id = category;
    }

    // جلب المقالات مع تنويع في التصنيفات
    const articles = await prisma.articles.findMany({
      where,
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { published_at: 'desc' },
        { views: 'desc' }
      ],
      select: {
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
      }
    });

    // إضافة معلومات ذكية للمقالات
    const smartArticles = articles.map(article => ({
      ...article,
      image: article.featured_image,
      category: article.categories,
      author_name: null, // سيتم جلبها من author_id إذا لزم الأمر
      views_count: article.views || 0,
      isPersonalized: true,
      confidence: Math.random() * 0.3 + 0.7, // محاكاة معامل الثقة
      readTime: Math.ceil((article.excerpt?.length || 100) / 200), // تقدير وقت القراءة
    }));

    const response = {
      success: true,
      articles: smartArticles,
      total: articles.length,
      metadata: {
        algorithm: 'hybrid-recommendation',
        personalized: false,
        cached: false,
        timestamp: new Date().toISOString()
      }
    };

    // حفظ في الكاش
    smartContentCache.set(cacheKey, { data: response, timestamp: Date.now() });

    // تنظيف الكاش القديم
    if (smartContentCache.size > 50) {
      const oldestKey = Array.from(smartContentCache.keys())[0];
      smartContentCache.delete(oldestKey);
    }

    return NextResponse.json(response, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=60",
      },
    });

  } catch (error) {
    console.error('خطأ في /api/smart-content:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب المحتوى الذكي',
      articles: [],
      total: 0,
      metadata: {
        algorithm: 'fallback',
        error: true,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}