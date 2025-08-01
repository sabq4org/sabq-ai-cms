import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: جلب الأخبار (للإدارة)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status') || 'all';
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const skip = (page - 1) * limit;

    // بناء شروط البحث - فقط الأخبار
    const where: any = {
      // تصفية الأخبار فقط (كل ما ليس مقال رأي)
      OR: [
        { article_type: 'news' },
        { article_type: { equals: null } }, // الأخبار القديمة قد لا تحتوي على نوع
        { 
          article_type: { 
            notIn: ['opinion', 'analysis', 'interview'] 
          } 
        }
      ]
    };
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (category_id && category_id !== 'all') {
      where.category_id = category_id;
    }
    
    if (search) {
      where.AND = [
        where.OR, // الحفاظ على تصفية نوع المحتوى
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
      // إزالة OR الأصلية لتجنب التعارض
      delete where.OR;
    }

    // ترتيب النتائج
    const orderBy: any = {};
    orderBy[sort] = order;

    // جلب الأخبار مع العد
    const [articles, totalCount] = await Promise.all([
      prisma.articles.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      }),
      
      prisma.articles.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      articles,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + limit < totalCount
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب الأخبار:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الأخبار',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}