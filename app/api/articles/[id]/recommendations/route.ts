import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { category, tags = [], limit = 12 } = await request.json();
    const resolvedParams = await params;
    const articleId = resolvedParams.id;

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

    // ✍️ 1. مقالات مشابهة من نفس الفئة (أولوية عالية)
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
        take: 4
      });

      const formattedSimilar = similarCategoryArticles.map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        slug: article.slug,
        content: article.content,
        featured_image: article.featured_image,
        author_name: article.author_id, // سنحتاج تحسين هذا لاحقاً
        category_name: 'مقالات مشابهة',
        views: article.views,
        reading_time: article.reading_time,
        published_at: article.published_at,
        created_at: article.created_at,
        likes: article.likes,
        saves: article.saves,
        shares: article.shares,
        type: 'news'
      }));

      recommendations.push(...formattedSimilar);
    }

    // � 2. مقالات حديثة شائعة
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

    const formattedPopular = popularArticles.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      content: article.content,
      featured_image: article.featured_image,
      author_name: article.author_id, // سنحتاج تحسين هذا لاحقاً
      category_name: 'أخبار شائعة',
      views: article.views,
      reading_time: article.reading_time,
      published_at: article.published_at,
      created_at: article.created_at,
      likes: article.likes,
      saves: article.saves,
      shares: article.shares,
      type: 'news'
    }));

    recommendations.push(...formattedPopular);

    // 🎯 3. مقالات عشوائية لكسر الرتابة
    const randomArticles = await prisma.articles.findMany({
      where: {
        id: { not: articleId },
        status: 'published'
      },
      orderBy: { created_at: 'desc' },
      take: 4
    });

    // إضافة تنويع في النوع للمقالات العشوائية
    const formattedRandom = randomArticles.map((article, index) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      content: article.content,
      featured_image: article.featured_image,
      author_name: article.author_id,
      category_name: index % 3 === 0 ? 'تحليل عميق' : index % 3 === 1 ? 'مقال رأي' : 'أخبار متنوعة',
      views: article.views,
      reading_time: article.reading_time,
      published_at: article.published_at,
      created_at: article.created_at,
      likes: article.likes,
      saves: article.saves,
      shares: article.shares,
      type: index % 3 === 0 ? 'analysis' : index % 3 === 1 ? 'opinion' : 'news'
    }));

    recommendations.push(...formattedRandom);

    recommendations.push(...formattedPopular);

    // إزالة التكرارات وترتيب ذكي للمحتوى
    const uniqueRecommendations = recommendations
      .filter((article, index, self) => 
        index === self.findIndex(a => a.id === article.id)
      )
      .slice(0, limit);

    // 🎯 ترتيب ذكي: أولوية للتحليلات والآراء ثم الأخبار
    const sortedRecommendations = [
      ...uniqueRecommendations.filter(r => r.type === 'analysis'),
      ...uniqueRecommendations.filter(r => r.type === 'opinion'),
      ...uniqueRecommendations.filter(r => r.type === 'news')
    ].slice(0, limit);

    return NextResponse.json({
      success: true,
      recommendations: sortedRecommendations,
      smart: {
        // معلومات إضافية للعرض الذكي
        news: sortedRecommendations.filter(r => r.type === 'news'),
        opinion: sortedRecommendations.filter(r => r.type === 'opinion'),  
        analysis: sortedRecommendations.filter(r => r.type === 'analysis')
      },
      total: sortedRecommendations.length
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
