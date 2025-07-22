import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface QueryParams {
  articleId: string;
  category?: string;
  tags?: string;
  limit?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const category = searchParams.get('category');
    const tags = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!articleId) {
      return NextResponse.json(
        { error: 'معرف المقال مطلوب' },
        { status: 400 }
      );
    }

    // الحصول على المقال الحالي لاستخراج التصنيفات والعلامات
    const currentArticle = await prisma.articles.findUnique({
      where: { id: articleId },
      include: {
        categories: true
      }
    });

    if (!currentArticle) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404 }
      );
    }

    // استخراج معرفات التصنيفات والعلامات
    const categoryId = currentArticle.categories?.id;
    const articleTags = currentArticle.seo_keywords ? 
      currentArticle.seo_keywords.split(',').map(tag => tag.trim()) : [];
    const tagsArray = tags ? tags.split(',').filter(Boolean) : articleTags;

    // بناء استعلام معقد للحصول على أفضل المقالات المرتبطة
    let relatedArticles = [];

    try {
      // 1. البحث عن مقالات بنفس التصنيف والعلامات
      const categorySimilar = await prisma.articles.findMany({
        where: {
          AND: [
            { id: { not: articleId } },
            { status: 'published' },
            {
              OR: [
                { category_id: categoryId },
                {
                  seo_keywords: {
                    contains: tagsArray[0] // البحث عن أول علامة
                  }
                }
              ]
            }
          ]
        },
        include: {
          categories: true
        },
        orderBy: [
          { views: 'desc' },
          { published_at: 'desc' }
        ],
        take: limit
      });

      relatedArticles = categorySimilar;

      // 2. إذا لم نجد مقالات كافية، نبحث عن مقالات شائعة حديثة
      if (relatedArticles.length < limit) {
        const popularRecent = await prisma.articles.findMany({
          where: {
            AND: [
              { id: { not: articleId } },
              { status: 'published' },
              {
                published_at: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر أسبوع
                }
              }
            ]
          },
          include: {
            categories: true
          },
          orderBy: [
            { views: 'desc' },
            { published_at: 'desc' }
          ],
          take: limit - relatedArticles.length
        });

        // دمج النتائج وتجنب التكرار
        const existingIds = relatedArticles.map((a: any) => a.id);
        const newArticles = popularRecent.filter((a: any) => !existingIds.includes(a.id));
        relatedArticles = [...relatedArticles, ...newArticles];
      }

      // 3. إذا مازلنا بحاجة لمزيد، نجلب مقالات عشوائية من نفس الفئة
      if (relatedArticles.length < limit && categoryId) {
        const randomCategory = await prisma.articles.findMany({
          where: {
            AND: [
              { id: { not: articleId } },
              { status: 'published' },
              { category_id: categoryId }
            ]
          },
          include: {
            categories: true
          },
          orderBy: {
            published_at: 'desc'
          },
          take: limit - relatedArticles.length
        });

        const existingIds = relatedArticles.map((a: any) => a.id);
        const newArticles = randomCategory.filter((a: any) => !existingIds.includes(a.id));
        relatedArticles = [...relatedArticles, ...newArticles];
      }

    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات:', dbError);
      
      // في حالة فشل قاعدة البيانات، نعيد بيانات تجريبية
      return NextResponse.json({
        articles: [
          {
            id: '1',
            title: 'تطورات جديدة في قطاع التكنولوجيا السعودي',
            summary: 'نظرة على أحدث الاستثمارات والمبادرات التقنية في المملكة',
            slug: 'tech-developments-saudi',
            type: 'news',
            featured_image_url: '/images/tech-news.jpg',
            author: { name: 'سارة الأحمد' },
            read_time: 6,
            views_count: 2150,
            category: { name: 'تقنية' },
            published_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            title: 'تحليل: أسواق النفط العالمية وتأثيرها على الاقتصاد المحلي',
            summary: 'دراسة معمقة لتقلبات أسعار النفط وانعكاساتها الاقتصادية',
            slug: 'oil-market-analysis',
            type: 'analysis',
            featured_image_url: '/images/oil-analysis.jpg',
            author: { name: 'د. عبدالله المطيري' },
            read_time: 12,
            views_count: 3420,
            category: { name: 'اقتصاد' },
            published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            title: 'رؤية 2030: إنجازات وتحديات جديدة',
            summary: 'استعراض شامل لما تم تحقيقه والخطط المستقبلية',
            slug: 'vision-2030-progress',
            type: 'news',
            featured_image_url: '/images/vision-2030.jpg',
            author: { name: 'خالد الراشد' },
            read_time: 8,
            views_count: 5680,
            category: { name: 'سياسة' },
            published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
          }
        ],
        fallback: true
      });
    }

    // تنسيق البيانات للإرسال
    const formattedArticles = relatedArticles.map((article: any) => ({
      id: article.id,
      title: article.title,
      summary: article.excerpt || article.seo_description,
      slug: article.slug,
      type: determineArticleType(article),
      featured_image_url: article.featured_image || '/images/default-article.jpg',
      author: {
        name: 'محرر صبق' // يمكن تحسين هذا لاحقاً بإضافة relation للمؤلف
      },
      read_time: article.reading_time || Math.ceil((article.content?.length || 1000) / 1000),
      views_count: article.views || 0,
      category: {
        name: article.categories?.name || 'أخبار عامة'
      },
      published_at: article.published_at?.toISOString() || article.created_at?.toISOString(),
      created_at: article.created_at?.toISOString(),
      tags: article.seo_keywords ? article.seo_keywords.split(',').map((t: string) => t.trim()) : []
    }));

    return NextResponse.json({
      articles: formattedArticles,
      total: formattedArticles.length,
      query: {
        articleId,
        category,
        tags: tagsArray,
        limit
      }
    });

  } catch (error) {
    console.error('خطأ في جلب المحتوى المرتبط:', error);

    // إرجاع بيانات تجريبية في حالة الخطأ
    return NextResponse.json({
      articles: [
        {
          id: '1',
          title: 'أخبار متنوعة من المملكة العربية السعودية',
          summary: 'تغطية شاملة لآخر الأحداث والتطورات',
          slug: 'saudi-mixed-news',
          type: 'news',
          featured_image_url: '/images/default-news.jpg',
          author: { name: 'فريق التحرير' },
          read_time: 5,
          views_count: 1000,
          category: { name: 'أخبار عامة' },
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ],
      fallback: true,
      error: error instanceof Error ? error.message : 'خطأ غير متوقع'
    });
  }
}

// دالة لتحديد نوع المقال
function determineArticleType(article: any): 'news' | 'analysis' | 'opinion' | 'breaking' {
  const title = article.title?.toLowerCase() || '';
  const content = article.content?.toLowerCase() || '';
  
  if (title.includes('تحليل') || title.includes('دراسة') || content.includes('تحليل عميق')) {
    return 'analysis';
  }
  
  if (title.includes('رأي') || title.includes('مقال') || article.categories?.name === 'مقالات الرأي') {
    return 'opinion';
  }
  
  if (title.includes('عاجل') || title.includes('خبر عاجل') || article.breaking) {
    return 'breaking';
  }
  
  return 'news';
}
