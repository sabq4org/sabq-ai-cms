import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من صحة التوكن
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'جلسة غير صالحة' }, { status: 401 });
    }

    const userId = decoded.id;

    // جلب تحليلات المستخدم
    const userInsights = await prisma.user_insights.findUnique({
      where: { user_id: userId }
    });

    // جلب التصنيفات المفضلة للمستخدم
    let preferredCategories: string[] = [];
    if (userInsights?.preferred_categories) {
      const categories = userInsights.preferred_categories as any[];
      preferredCategories = categories.map(cat => cat.category_id);
    }

    // إذا لم توجد تفضيلات، استخدم جميع التصنيفات
    if (preferredCategories.length === 0) {
      const allCategories = await prisma.categories.findMany({
        select: { id: true }
      });
      preferredCategories = allCategories.map(cat => cat.id);
    }

    // جلب المقالات المقروءة مؤخراً لتجنب التكرار
    const recentReadings = await prisma.user_reading_sessions.findMany({
      where: { 
        user_id: userId,
        started_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر 7 أيام
        }
      },
      select: { article_id: true }
    });

    const readArticleIds = recentReadings.map(r => r.article_id);

    // جلب مقال مميز من التصنيفات المفضلة
    const recommendedArticle = await prisma.articles.findFirst({
      where: {
        category_id: {
          in: preferredCategories
        },
        status: 'published',
        published_at: {
          lte: new Date()
        },
        id: {
          notIn: readArticleIds // استبعاد المقالات المقروءة
        }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { views: 'desc' },
        { published_at: 'desc' }
      ]
    });

    if (!recommendedArticle) {
      // إذا لم نجد مقال من التصنيفات المفضلة، نجلب أي مقال مميز
      const anyRecommendation = await prisma.articles.findFirst({
        where: {
          status: 'published',
          published_at: {
            lte: new Date()
          },
          id: {
            notIn: readArticleIds
          }
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { views: 'desc' },
          { published_at: 'desc' }
        ]
      });

      if (!anyRecommendation) {
        return NextResponse.json({
          id: null,
          title: 'لا توجد توصيات متاحة',
          category: 'عام',
          readTime: '0 دقائق',
          url: '#',
          reason: 'لا توجد مقالات جديدة في الوقت الحالي'
        });
      }

      return formatRecommendation(anyRecommendation, 'مقال مميز من المنصة');
    }

    // تحديد سبب التوصية
    const reason = determineRecommendationReason(recommendedArticle, userInsights);
    
    return formatRecommendation(recommendedArticle, reason);

  } catch (error) {
    console.error('خطأ في جلب توصية اليوم:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب التوصية' },
      { status: 500 }
    );
  }
}

function formatRecommendation(article: any, reason: string) {
  // حساب وقت القراءة بناءً على طول المحتوى
  const wordsPerMinute = 200; // متوسط سرعة القراءة بالعربية
  const wordCount = article.content ? article.content.split(' ').length : 0;
  const readTime = Math.ceil(wordCount / wordsPerMinute);

  return NextResponse.json({
    id: article.id,
    title: article.title,
    category: article.categories?.name || 'عام',
    readTime: `${readTime} دقائق`,
    url: `/articles/${article.slug || article.id}`,
    excerpt: article.excerpt,
    featured_image: article.featured_image,
    published_at: article.published_at,
    views: article.views,
    reason: reason
  });
}

function determineRecommendationReason(article: any, userInsights: any): string {
  if (!userInsights) {
    return 'مقال مقترح لك';
  }

  // إذا كان المقال من التصنيفات المفضلة
  if (userInsights.preferred_categories) {
    const categories = userInsights.preferred_categories as any[];
    const topCategory = categories[0];
    if (topCategory && topCategory.category_id === article.category_id) {
      return `من تصنيفك المفضل: ${article.categories?.name}`;
    }
  }

  // بناءً على نوع القارئ
  if (userInsights.reader_type === 'قارئ تحليلي' && article.reading_time > 10) {
    return 'مقال تحليلي عميق يناسب أسلوب قراءتك';
  }

  if (userInsights.reader_type === 'قارئ سريع' && article.reading_time <= 5) {
    return 'مقال موجز يناسب وقتك';
  }

  // بناءً على وقت القراءة المفضل
  const currentHour = new Date().getHours();
  if (userInsights.preferred_reading_time) {
    if (userInsights.preferred_reading_time === 'صباحًا' && currentHour >= 5 && currentHour < 12) {
      return 'مقال صباحي يناسب روتينك اليومي';
    }
    if (userInsights.preferred_reading_time === 'مساءً' && currentHour >= 17 && currentHour < 21) {
      return 'قراءة مسائية مختارة لك';
    }
  }

  // إذا كان المقال مميزًا
  if (article.featured) {
    return 'مقال مميز من اختيار المحررين';
  }

  // إذا كان المقال شائعًا
  if (article.views > 1000) {
    return 'مقال رائج يقرأه الآلاف';
  }

  return 'مقال مقترح بناءً على اهتماماتك';
} 