import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDbConnected } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureDbConnected();
    
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sort') || 'date';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // بناء شروط الفلترة
    const where: any = {
      status: 'published',
      published_at: {
        not: null
      }
    };

    // فلتر التاريخ
    if (start && end) {
      where.published_at = {
        gte: new Date(start),
        lte: new Date(end)
      };
    }

    // فلتر التصنيف
    if (category && category !== 'all') {
      where.categories = {
        slug: category
      };
    }

    // البحث
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // الترتيب
    let orderBy: any = { published_at: 'desc' };
    if (sortBy === 'views') {
      orderBy = { views: 'desc' };
    } else if (sortBy === 'comments') {
      orderBy = { comments_count: 'desc' };
    }

    // جلب المقالات
    const [articles, total] = await Promise.all([
      prisma.articles.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          image: true,
          published_at: true,
          views: true,
          comments_count: true,
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      }),
      prisma.articles.count({ where })
    ]);

    // إحصائيات إضافية
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [todayCount, weekCount, topCategories] = await Promise.all([
      // مقالات اليوم
      prisma.articles.count({
        where: {
          status: 'published',
          published_at: { gte: todayStart }
        }
      }),
      // مقالات الأسبوع
      prisma.articles.count({
        where: {
          status: 'published',
          published_at: { gte: weekAgo }
        }
      }),
      // أكثر الأقسام نشاطاً
      prisma.categories.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { articles: true }
          }
        },
        orderBy: {
          articles: { _count: 'desc' }
        },
        take: 10
      })
    ]);

    // حساب نسبة النمو الأسبوعي
    const prevWeekStart = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekCount = await prisma.articles.count({
      where: {
        status: 'published',
        published_at: {
          gte: prevWeekStart,
          lt: weekAgo
        }
      }
    });

    const weeklyGrowth = prevWeekCount > 0 
      ? Math.round(((weekCount - prevWeekCount) / prevWeekCount) * 100)
      : 0;

    // عدد الكتاب النشطين
    const activeAuthors = await prisma.users.count({
      where: {
        articles: {
          some: {
            published_at: { gte: weekAgo }
          }
        }
      }
    });

    // تحضير البيانات للإرسال
    const stats = {
      totalArticles: total,
      todayArticles: todayCount,
      weeklyGrowth,
      topCategory: topCategories[0]?.name || 'غير محدد',
      activeAuthors
    };

    const categories = topCategories.map(cat => ({
      id: cat.slug,
      name: cat.name,
      count: cat._count.articles
    }));

    // تحسين البيانات بإضافة معلومات AI (محاكاة)
    const enrichedArticles = articles.map(article => ({
      ...article,
      ai_score: Math.floor(Math.random() * 100),
      trending: Math.random() > 0.8,
      readTime: Math.ceil((article.excerpt?.length || 100) / 200)
    }));

    return NextResponse.json({
      success: true,
      articles: enrichedArticles,
      stats,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Archive API Error:', error);
    
    // في حالة الخطأ، نرجع استجابة فارغة مع رسالة خطأ
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب بيانات الأرشيف',
      articles: [],
      stats: {
        totalArticles: 0,
        todayArticles: 0,
        weeklyGrowth: 0,
        topCategory: 'غير متاح',
        activeAuthors: 0
      },
      categories: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
      }
    }, { status: 500 });
  }
}