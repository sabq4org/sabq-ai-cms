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

    // جلب القراء المشابهين من الجدول المخصص
    let similarReaders = await prisma.user_similar_readers.findMany({
      where: { user_id: userId },
      orderBy: { similarity_score: 'desc' },
      take: 10,
      select: { similar_user_id: true }
    });

    let similarUserIds = similarReaders.map(r => r.similar_user_id);

    // إذا لم نجد قراء مشابهين محسوبين مسبقاً، نحسبهم الآن
    if (similarUserIds.length === 0) {
      similarUserIds = await findSimilarReaders(userId);
    }

    if (similarUserIds.length === 0) {
      return NextResponse.json([]);
    }

    // جلب المقالات التي قرأها القراء المشابهون
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const similarReadings = await prisma.user_reading_sessions.findMany({
      where: {
        user_id: {
          in: similarUserIds
        },
        started_at: {
          gte: oneWeekAgo
        }
      },
      select: {
        article_id: true
      },
      distinct: ['article_id']
    });

    const articleIds = similarReadings.map(r => r.article_id);

    // جلب المقالات التي لم يقرأها المستخدم الحالي
    const userReadings = await prisma.user_reading_sessions.findMany({
      where: { 
        user_id: userId,
        article_id: {
          in: articleIds
        }
      },
      select: { article_id: true }
    });

    const userReadArticleIds = userReadings.map(r => r.article_id);
    const unreadArticleIds = articleIds.filter(id => !userReadArticleIds.includes(id));

    if (unreadArticleIds.length === 0) {
      return NextResponse.json([]);
    }

    // جلب تفاصيل المقالات
    const recommendedArticles = await prisma.articles.findMany({
      where: {
        id: {
          in: unreadArticleIds
        },
        status: 'published',
        published_at: {
          lte: new Date()
        }
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { views: 'desc' },
        { published_at: 'desc' }
      ],
      take: 5
    });

    // تنسيق النتائج
    const formattedArticles = recommendedArticles.map(article => ({
      id: article.id,
      title: article.title,
      url: `/articles/${article.slug || article.id}`,
      category: article.categories?.name || 'عام',
      excerpt: article.excerpt,
      featured_image: article.featured_image,
      published_at: article.published_at,
      views: article.views,
      matchReason: determineMatchReason(article)
    }));

    return NextResponse.json(formattedArticles);

  } catch (error) {
    console.error('خطأ في جلب مقالات القراء المشابهين:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب التوصيات' },
      { status: 500 }
    );
  }
}

async function findSimilarReaders(userId: string): Promise<string[]> {
  try {
    // جلب اهتمامات المستخدم الحالي
    const userInsights = await prisma.user_insights.findUnique({
      where: { user_id: userId }
    });

    if (!userInsights || !userInsights.preferred_categories) {
      return [];
    }

    const userCategories = userInsights.preferred_categories as any[];
    const userCategoryIds = userCategories.map(cat => cat.category_id);

    if (userCategoryIds.length === 0) {
      return [];
    }

    // البحث عن مستخدمين لديهم اهتمامات مشابهة
    // نستخدم استعلام أبسط بدلاً من array_contains المعقد
    const allUsersWithInsights = await prisma.user_insights.findMany({
      where: {
        user_id: {
          not: userId
        }
      },
      select: {
        user_id: true,
        preferred_categories: true,
        reader_type: true
      },
      take: 100
    });

    // تصفية المستخدمين الذين لديهم اهتمامات مشتركة
    const similarUsers = allUsersWithInsights.filter(user => {
      const otherCategories = user.preferred_categories as any[];
      const otherCategoryIds = otherCategories.map(cat => cat.category_id);
      
      // التحقق من وجود اهتمامات مشتركة
      const hasCommonInterests = userCategoryIds.some(id => 
        otherCategoryIds.includes(id)
      );
      
      return hasCommonInterests;
    }).slice(0, 20);

    // حساب درجة التشابه وحفظها
    const similarityScores = similarUsers.map(user => {
      const otherCategories = user.preferred_categories as any[];
      const otherCategoryIds = otherCategories.map(cat => cat.category_id);
      
      // حساب التقاطع بين الاهتمامات
      const commonCategories = userCategoryIds.filter(id => 
        otherCategoryIds.includes(id)
      );
      
      // درجة التشابه = عدد الاهتمامات المشتركة / إجمالي الاهتمامات
      const similarityScore = commonCategories.length / 
        Math.max(userCategoryIds.length, otherCategoryIds.length);

      // إضافة نقاط إضافية إذا كان نوع القارئ متشابه
      const readerTypeBonus = user.reader_type === userInsights.reader_type ? 0.1 : 0;

      return {
        user_id: user.user_id,
        score: Math.min(similarityScore + readerTypeBonus, 1),
        commonCategories: commonCategories
      };
    });

    // ترتيب حسب درجة التشابه
    similarityScores.sort((a, b) => b.score - a.score);

    // حفظ القراء المشابهين في قاعدة البيانات للمرات القادمة
    for (const similar of similarityScores.slice(0, 10)) {
      try {
        await prisma.user_similar_readers.create({
          data: {
            id: `sim-${userId}-${similar.user_id}`,
            user_id: userId,
            similar_user_id: similar.user_id,
            similarity_score: similar.score,
            common_categories: similar.commonCategories
          }
        });
      } catch (error) {
        // تجاهل الأخطاء في حالة وجود السجل مسبقاً
      }
    }

    return similarityScores.slice(0, 10).map(s => s.user_id);

  } catch (error) {
    console.error('خطأ في إيجاد القراء المشابهين:', error);
    return [];
  }
}

function determineMatchReason(article: any): string {
  const reasons = [
    'قراء مثلك اهتموا بهذا الموضوع',
    'يتناسب مع اهتماماتك السابقة',
    'مقال رائج بين القراء المشابهين لك',
    'موضوع مميز في دائرة اهتماماتك',
    'ينصح به قراء لديهم نفس اهتماماتك'
  ];

  // اختيار سبب بناءً على خصائص المقال
  if (article.views > 5000) {
    return 'مقال شائع جداً بين القراء المشابهين لك';
  }
  
  if (article.featured) {
    return 'مقال مميز أعجب القراء الذين يشاركونك الاهتمامات';
  }

  // اختيار سبب عشوائي من القائمة
  return reasons[Math.floor(Math.random() * reasons.length)];
} 