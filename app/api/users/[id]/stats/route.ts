import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// جلب إحصائيات المستخدم الشاملة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // جلب بيانات المستخدم الأساسية
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // حساب الإحصائيات المختلفة
    const [
      totalComments,
      totalLikes,
      totalShares,
      totalBookmarks,
      totalViews,
      totalPoints,
      recentActivities,
      userInteractions
    ] = await Promise.all([
      // إجمالي التعليقات
      prisma.comments.count({
        where: { user_id: userId }
      }),

      // إجمالي الإعجابات المستلمة
      prisma.comments.aggregate({
        where: { user_id: userId },
        _sum: { likes: true }
      }),

      // إجمالي المشاركات
      prisma.interactions.count({
        where: { 
          user_id: userId,
          type: 'share'
        }
      }),

      // إجمالي الحفظ
      prisma.interactions.count({
        where: { 
          user_id: userId,
          type: 'save'
        }
      }),

      // إجمالي المشاهدات
      prisma.interactions.count({
        where: { 
          user_id: userId,
          type: 'view'
        }
      }),

      // إجمالي النقاط
      prisma.loyalty_points.aggregate({
        where: { user_id: userId },
        _sum: { points: true }
      }),

      // النشاطات الأخيرة (آخر 30 يوم)
      prisma.user_activities?.findMany({
        where: {
          user_id: userId,
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { created_at: 'desc' },
        take: 100
      }),

      // التفاعلات الأخيرة
      prisma.interactions.findMany({
        where: { user_id: userId },
        include: {
          articles: {
            select: {
              title: true,
              slug: true,
              category_id: true,
              metadata: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 50
      })
    ]);

    // حساب السلسلة الحالية
    const currentStreak = await calculateUserStreak(userId);

    // تحليل الاهتمامات
    const interests = analyzeUserInterests(userInteractions);

    // حساب مستوى التفاعل
    const engagementLevel = calculateEngagementLevel({
      totalComments,
      totalLikes: totalLikes._sum.likes || 0,
      totalShares,
      totalViews,
      daysActive: recentActivities ? new Set(
        recentActivities.map((a: any) => new Date(a.created_at).toDateString())
      ).size : 0
    });

    const stats = {
      totalComments,
      totalLikes: totalLikes._sum.likes || 0,
      totalShares,
      totalViews,
      articlesRead: new Set(userInteractions.map(i => i.article_id)).size,
      currentStreak,
      totalPoints: totalPoints._sum.points || 0,
      reputation: user.reputation || 0,
      engagementLevel,
      badges: user.badges || [],
      joinDate: user.created_at.toISOString(),
      lastActivity: recentActivities?.[0]?.created_at.toISOString() || user.updated_at.toISOString(),
      interests,
      weeklyProgress: calculateWeeklyProgress(recentActivities),
      achievements: await calculateAchievements(userId, {
        totalComments,
        totalLikes: totalLikes._sum.likes || 0,
        currentStreak,
        totalPoints: totalPoints._sum.points || 0
      })
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('خطأ في جلب إحصائيات المستخدم:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}

// حساب السلسلة الحالية للمستخدم
async function calculateUserStreak(userId: string): Promise<number> {
  try {
    const activities = await prisma.user_activities?.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 30
    });

    if (!activities || activities.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const uniqueDates = new Set(
      activities.map((a: any) => {
        const date = new Date(a.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    const sortedDates = Array.from(uniqueDates).sort((a, b) => (b as number) - (a as number));

    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(currentDate.getTime() - (i * 24 * 60 * 60 * 1000));
      
      if (sortedDates[i] === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;

  } catch (error) {
    console.error('خطأ في حساب السلسلة:', error);
    return 0;
  }
}

// تحليل اهتمامات المستخدم
function analyzeUserInterests(interactions: any[]) {
  const categories: Record<string, number> = {};
  const tags: Record<string, number> = {};

  interactions.forEach(interaction => {
    if (interaction.articles) {
      // تجميع الفئات
      if (interaction.articles.category_id) {
        categories[interaction.articles.category_id] = 
          (categories[interaction.articles.category_id] || 0) + 1;
      }

      // تجميع الكلمات المفتاحية
      if (interaction.articles.metadata?.tags) {
        const articleTags = interaction.articles.metadata.tags;
        if (Array.isArray(articleTags)) {
          articleTags.forEach((tag: string) => {
            tags[tag] = (tags[tag] || 0) + 1;
          });
        }
      }
    }
  });

  return { categories, tags };
}

// حساب مستوى التفاعل
function calculateEngagementLevel(stats: any): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  const score = stats.totalComments * 3 + 
                stats.totalLikes * 1 + 
                stats.totalShares * 5 + 
                stats.daysActive * 2;

  if (score > 500) return 'expert';
  if (score > 200) return 'advanced';
  if (score > 50) return 'intermediate';
  return 'beginner';
}

// حساب التقدم الأسبوعي
function calculateWeeklyProgress(activities: any[]) {
  if (!activities) return { current: 0, target: 10, percentage: 0 };

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weeklyActivities = activities.filter((a: any) => 
    new Date(a.created_at) >= weekStart
  );

  const current = weeklyActivities.length;
  const target = 10; // هدف أسبوعي
  const percentage = Math.min(100, (current / target) * 100);

  return { current, target, percentage };
}

// حساب الإنجازات
async function calculateAchievements(userId: string, stats: any) {
  const achievements = [
    {
      id: 'first_comment',
      title: 'أول تعليق',
      description: 'قم بكتابة أول تعليق لك',
      icon: '💬',
      type: 'engagement',
      threshold: 1,
      currentProgress: stats.totalComments,
      completed: stats.totalComments >= 1,
      reward: 5
    },
    {
      id: 'comment_master',
      title: 'خبير التعليقات',
      description: 'اكتب 50 تعليق',
      icon: '🗣️',
      type: 'engagement',
      threshold: 50,
      currentProgress: stats.totalComments,
      completed: stats.totalComments >= 50,
      reward: 50
    },
    {
      id: 'week_warrior',
      title: 'محارب الأسبوع',
      description: 'سجل دخولك 7 أيام متتالية',
      icon: '🔥',
      type: 'streak',
      threshold: 7,
      currentProgress: stats.currentStreak,
      completed: stats.currentStreak >= 7,
      reward: 25
    },
    {
      id: 'popular_voice',
      title: 'صوت شعبي',
      description: 'احصل على 100 إعجاب على تعليقاتك',
      icon: '❤️',
      type: 'quality',
      threshold: 100,
      currentProgress: stats.totalLikes,
      completed: stats.totalLikes >= 100,
      reward: 75
    },
    {
      id: 'point_collector',
      title: 'جامع النقاط',
      description: 'اجمع 1000 نقطة',
      icon: '⭐',
      type: 'quality',
      threshold: 1000,
      currentProgress: stats.totalPoints,
      completed: stats.totalPoints >= 1000,
      reward: 100
    }
  ];

  return achievements;
}
