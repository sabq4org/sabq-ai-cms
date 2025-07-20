import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';


// تتبع نشاط المستخدم
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      action, 
      targetType, 
      targetId, 
      metadata = {},
      sessionId,
      timestamp = new Date().toISOString()
    } = body;

    if (!userId || !action || !targetType || !targetId) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    // حفظ النشاط
    const activity = await prisma.user_activities?.create({
      data: {
        id: uuidv4(),
        user_id: userId,
        action,
        target_type: targetType,
        target_id: targetId,
        session_id: sessionId,
        metadata: {
          ...metadata,
          timestamp,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          referer: request.headers.get('referer')
        },
        created_at: new Date()
      }
    });

    // تحليل السلوك وإضافة النقاط
    const behaviorAnalysis = await analyzeBehavior(userId, action, targetType, targetId, metadata);
    
    // تحديث ملف المستخدم
    await updateUserProfile(userId, action, behaviorAnalysis);

    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        action,
        behaviorAnalysis
      }
    });

  } catch (error) {
    console.error('خطأ في تتبع النشاط:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تتبع النشاط' },
      { status: 500 }
    );
  }
}

// تحليل السلوك
async function analyzeBehavior(userId: string, action: string, targetType: string, targetId: string, metadata: any) {
  try {
    // حساب نقاط الجودة بناءً على النشاط
    let qualityPoints = 0;
    let engagementLevel = 'low';

    switch (action) {
      case 'comment':
        qualityPoints = metadata.commentLength > 100 ? 5 : 2;
        engagementLevel = 'high';
        break;
      case 'like':
        qualityPoints = 1;
        engagementLevel = 'medium';
        break;
      case 'share':
        qualityPoints = 3;
        engagementLevel = 'high';
        break;
      case 'view':
        qualityPoints = metadata.readTime > 60 ? 2 : 1;
        engagementLevel = metadata.readTime > 120 ? 'high' : 'medium';
        break;
      case 'scroll':
        qualityPoints = metadata.scrollDepth > 80 ? 2 : 1;
        engagementLevel = metadata.scrollDepth > 90 ? 'high' : 'medium';
        break;
    }

    // تحليل الأنماط
    const patterns = await analyzeUserPatterns(userId, action);

    return {
      qualityPoints,
      engagementLevel,
      patterns,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('خطأ في تحليل السلوك:', error);
    return { qualityPoints: 1, engagementLevel: 'low', patterns: {} };
  }
}

// تحليل أنماط المستخدم
async function analyzeUserPatterns(userId: string, currentAction: string) {
  try {
    // جلب النشاطات الأخيرة (آخر 7 أيام)
    const recentActivities = await prisma.user_activities?.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });

    if (!recentActivities || recentActivities.length === 0) {
      return { isNewUser: true, activityLevel: 'beginner' };
    }

    // تحليل الأنماط
    const actionCounts = recentActivities.reduce((acc: any, activity: any) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {});

    const totalActivities = recentActivities.length;
    const uniqueDays = new Set(recentActivities.map((a: any) => 
      new Date(a.created_at).toDateString()
    )).size;

    // تحديد مستوى النشاط
    let activityLevel = 'beginner';
    if (totalActivities > 50) activityLevel = 'expert';
    else if (totalActivities > 20) activityLevel = 'advanced';
    else if (totalActivities > 5) activityLevel = 'intermediate';

    // تحديد الاهتمامات
    const interests = await analyzeInterests(userId, recentActivities);

    return {
      isNewUser: false,
      activityLevel,
      totalActivities,
      uniqueDays,
      actionCounts,
      interests,
      consistency: uniqueDays / 7, // مؤشر الانتظام
      currentStreak: await calculateCurrentStreak(userId)
    };

  } catch (error) {
    console.error('خطأ في تحليل الأنماط:', error);
    return { isNewUser: true, activityLevel: 'beginner' };
  }
}

// تحليل الاهتمامات
async function analyzeInterests(userId: string, activities: any[]) {
  try {
    const articleIds = activities
      .filter((a: any) => a.target_type === 'article')
      .map((a: any) => a.target_id);

    if (articleIds.length === 0) return {};

    // جلب فئات المقالات
    const articles = await prisma.articles.findMany({
      where: { id: { in: articleIds } },
      select: { 
        id: true, 
        category_id: true,
        metadata: true 
      }
    });

    // تجميع الاهتمامات
    const categoryInterests: any = {};
    const tagInterests: any = {};

    articles.forEach(article => {
      // الفئات
      if (article.category_id) {
        categoryInterests[article.category_id] = 
          (categoryInterests[article.category_id] || 0) + 1;
      }

      // الكلمات المفتاحية من metadata
      if (article.metadata && typeof article.metadata === 'object') {
        const tags = (article.metadata as any).tags || [];
        tags.forEach((tag: string) => {
          tagInterests[tag] = (tagInterests[tag] || 0) + 1;
        });
      }
    });

    return {
      categories: categoryInterests,
      tags: tagInterests,
      totalArticlesRead: articleIds.length
    };

  } catch (error) {
    console.error('خطأ في تحليل الاهتمامات:', error);
    return {};
  }
}

// حساب السلسلة الحالية
async function calculateCurrentStreak(userId: string): Promise<number> {
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

    const sortedDates = Array.from(uniqueDates).sort((a, b) => b - a);

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

// تحديث ملف المستخدم
async function updateUserProfile(userId: string, action: string, analysis: any) {
  try {
    // تحديث إحصائيات المستخدم
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    let metadata = user.metadata as any || {};
    
    // تحديث الإحصائيات
    metadata.stats = metadata.stats || {};
    metadata.stats[`${action}_count`] = (metadata.stats[`${action}_count`] || 0) + 1;
    metadata.stats.total_activities = (metadata.stats.total_activities || 0) + 1;
    metadata.stats.last_activity = new Date().toISOString();
    
    // تحديث مستوى النشاط
    metadata.engagement = {
      level: analysis.engagementLevel,
      patterns: analysis.patterns,
      streak: analysis.patterns?.currentStreak || 0,
      consistency: analysis.patterns?.consistency || 0
    };

    await prisma.users.update({
      where: { id: userId },
      data: { metadata }
    });

    // إضافة نقاط الولاء
    if (analysis.qualityPoints > 0) {
      await prisma.loyalty_points.create({
        data: {
          id: uuidv4(),
          user_id: userId,
          points: analysis.qualityPoints,
          action: `activity_${action}`,
          reference_id: userId,
          reference_type: 'user_activity',
          metadata: {
            engagementLevel: analysis.engagementLevel,
            analysisData: analysis
          },
          created_at: new Date()
        }
      });
    }

  } catch (error) {
    console.error('خطأ في تحديث ملف المستخدم:', error);
  }
}
