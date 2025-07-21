import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { category, tags = [], limit = 8 } = await request.json();
    const articleId = params.id;

    // الحصول على المقال الحالي
    const currentArticle = await prisma.articles.findUnique({
      where: { id: articleId }
    });

    if (!currentArticle) {
      return NextResponse.json(
        { success: false, error: 'المقال غير موجود' },
        { status: 404 }
      );
    }

    const recommendations = [];

    // 1. مقالات مشابهة من نفس الفئة
    if (currentArticle.category_id) {
      const similarCategoryArticles = await prisma.articles.findMany({
        where: {
          id: { not: articleId },
          category_id: currentArticle.category_id,
          status: 'published'
        },
        orderBy: [
          { views: 'desc' },
          { published_at: 'desc' }
        ],
        take: 3
      });

      recommendations.push(...similarCategoryArticles);
    }

    // 2. مقالات حديثة شائعة
    const popularArticles = await prisma.articles.findMany({
      where: {
        id: { not: articleId },
        status: 'published',
        published_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر أسبوع
        }
      },
      orderBy: [
        { views: 'desc' },
        { likes: 'desc' }
      ],
      take: 4
    });

    recommendations.push(...popularArticles);

    // 3. مقالات عشوائية أخرى
    const randomArticles = await prisma.articles.findMany({
      where: {
        id: { not: articleId },
        status: 'published'
      },
      orderBy: { created_at: 'desc' },
      take: 3
    });

    recommendations.push(...randomArticles);

    // إزالة التكرارات وتحديد العدد
    const uniqueRecommendations = recommendations
      .filter((article, index, self) => 
        index === self.findIndex(a => a.id === article.id)
      )
      .slice(0, limit)
      .map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        slug: article.slug,
        content: article.content,
        featured_image: article.featured_image,
        author_id: article.author_id,
        category_id: article.category_id,
        views: article.views,
        reading_time: article.reading_time,
        published_at: article.published_at,
        created_at: article.created_at,
        likes: article.likes,
        saves: article.saves,
        shares: article.shares
      }));

    return NextResponse.json({
      success: true,
      recommendations: uniqueRecommendations,
      total: uniqueRecommendations.length
    });

  } catch (error) {
    console.error('خطأ في جلب التوصيات:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في جلب التوصيات',
        recommendations: []
      },
      { status: 500 }
    );
  }
}
