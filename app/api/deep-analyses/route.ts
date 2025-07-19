import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  getCachedList, 
  ENHANCED_CACHE_KEYS, 
  ENHANCED_CACHE_TTL 
} from '@/lib/cache-manager'

export async function GET(request: NextRequest) {
  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'analyzed_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const articleId = searchParams.get('articleId');
    
    const offset = (page - 1) * limit;

    // بناء شروط البحث
    const where: any = {};
    if (articleId) {
      where.article_id = articleId;
    }

    // معاملات cache
    const cacheParams = {
      where: JSON.stringify(where),
      sortBy,
      sortOrder,
      page,
      limit
    }

    // استخدام cache محسن للتحليل العميق
    const { data, total, fromCache } = await getCachedList(
      ENHANCED_CACHE_KEYS.DEEP_ANALYSIS_LIST(''),
      cacheParams,
      async (): Promise<{ data: any[], total: number }> => {
        console.log('🔍 جلب التحليلات العميقة من قاعدة البيانات...')
        
        // جلب العدد الإجمالي والتحليلات بشكل متوازي
        const [totalCount, deepAnalyses] = await Promise.all([
          prisma.deep_analyses.count({ where }),
          prisma.deep_analyses.findMany({
            where,
            orderBy: {
              [sortBy]: sortOrder as 'asc' | 'desc'
            },
            take: limit,
            skip: offset
          })
        ])

        // جلب بيانات المقالات المرتبطة
        const articleIds = deepAnalyses.map((da: any) => da.article_id);
        const articles = articleIds.length > 0 
          ? await prisma.articles.findMany({
              where: {
                id: {
                  in: articleIds
                }
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
              }
            })
          : []

        // جلب بيانات المؤلفين
        const authorIds = articles.map((a: any) => a.author_id).filter(Boolean);
        const authors = authorIds.length > 0 
          ? await prisma.users.findMany({
              where: {
                id: {
                  in: authorIds
                }
              },
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            })
          : []

        // إنشاء خريطة للمؤلفين
        const authorsMap = new Map(authors.map((a: any) => [a.id, a]));

        // دمج البيانات
        const articlesMap = new Map(articles.map((a: any) => [a.id, {
          ...a,
          author: authorsMap.get(a.author_id)
        }]));
        
        const enrichedAnalyses = deepAnalyses.map((analysis: any) => ({
          ...analysis,
          article: articlesMap.get(analysis.article_id)
        }));

        return {
          data: enrichedAnalyses,
          total: totalCount
        }
      },
      ENHANCED_CACHE_TTL.DEEP_ANALYSIS
    )

    if (fromCache) {
      console.log('📋 تم جلب التحليلات العميقة من cache - سرعة محسنة!')
    }

    return NextResponse.json({
      success: true,
      analyses: data,
      data: data,
      total,
      limit,
      offset,
      page,
      hasNext: offset + limit < total,
      hasPrev: page > 1
    });

  } catch (error) {
    console.error('Error fetching deep analyses:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch deep analyses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newAnalysis = await prisma.deep_analyses.create({
      data: {
        ...body,
        analyzed_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: newAnalysis
    });

  } catch (error) {
    console.error('Error creating deep analysis:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create deep analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
