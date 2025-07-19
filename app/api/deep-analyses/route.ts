import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // جلب العدد الإجمالي
    const total = await prisma.deep_analyses.count({ where });

    // جلب التحليلات العميقة مع بيانات المقالات المرتبطة
    const deepAnalyses = await prisma.deep_analyses.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc'
      },
      take: limit,
      skip: offset
    });

    // جلب بيانات المقالات المرتبطة
    const articleIds = deepAnalyses.map((da: any) => da.article_id);
    const articles = await prisma.articles.findMany({
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
    });

    // جلب بيانات المؤلفين
    const authorIds = articles.map((a: any) => a.author_id).filter(Boolean);
    const authors = await prisma.users.findMany({
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
    });

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

    return NextResponse.json({
      success: true,
      analyses: enrichedAnalyses,
      data: enrichedAnalyses,
      total,
      limit,
      offset,
      page
    });
  } catch (error) {
    console.error('خطأ في جلب التحليلات العميقة:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب التحليلات العميقة'
    }, { status: 500 });
  }
}

// POST - إنشاء تحليل جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Creating analysis with data:', body);
    
    const analysis = await prisma.deep_analyses.create({
      data: {
        id,
        article_id: body.sourceArticleId || `article-${id}`,
        ai_summary: body.summary || body.title,
        key_topics: body.tags || [],
        tags: body.tags || [],
        sentiment: 'neutral',
        readability_score: Number(body.contentScore?.readability || 0.7),
        engagement_score: Number(body.qualityScore || 0),
        suggested_headlines: [],
        related_articles: [],
        metadata: {
          title: body.title,
          summary: body.summary,
          content: body.content,
          featuredImage: body.featuredImage,
          categories: body.categories,
          tags: body.tags,
          authorName: body.authorName,
          sourceType: body.sourceType,
          creationType: body.creationType,
          analysisType: body.analysisType,
          status: body.status,
          isActive: body.isActive,
          isFeatured: body.isFeatured,
          displayPosition: body.displayPosition
        },
        updated_at: new Date()
      }
    });
    
    console.log('Analysis created successfully:', analysis.id);
    
    return NextResponse.json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('Error creating analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create analysis' },
      { status: 500 }
    );
  }
} 