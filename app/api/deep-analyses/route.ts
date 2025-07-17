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
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = parseInt(searchParams.get('offset') || '0');
    const articleId = searchParams.get('articleId');

    // بناء شروط البحث
    const where: any = {};
    if (articleId) {
      where.article_id = articleId;
    }

    // جلب التحليلات العميقة مع بيانات المقالات المرتبطة
    const deepAnalyses = await prisma.deep_analyses.findMany({
      where,
      orderBy: {
        analyzed_at: 'desc'
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
        category: {
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

    // جلب العدد الإجمالي
    const total = await prisma.deep_analyses.count({ where });

    return NextResponse.json({
      success: true,
      data: enrichedAnalyses,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('خطأ في جلب التحليلات العميقة:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب التحليلات العميقة'
    }, { status: 500 });
  }
} 