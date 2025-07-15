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

    // جلب أو إنشاء تحليلات المستخدم
    let userInsights = await prisma.user_insights.findUnique({
      where: { user_id: userId }
    });

    // إذا لم توجد تحليلات، احسبها
    if (!userInsights) {
      userInsights = await calculateUserInsights(userId);
    } else {
      // تحديث التحليلات إذا كانت قديمة (أكثر من 24 ساعة)
      const hoursSinceUpdate = (Date.now() - userInsights.updated_at.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate > 24) {
        userInsights = await calculateUserInsights(userId);
      }
    }

    // تنسيق البيانات للعرض
    const formattedInsights = {
      readCount: userInsights.total_reads,
      savedCount: userInsights.total_saved,
      interactedCount: userInsights.total_interactions,
      readingTime: formatReadingTime(userInsights.preferred_reading_time),
      articleTypes: userInsights.preferred_article_types || {},
      categories: formatCategories(userInsights.preferred_categories),
      diversityScore: Math.round(userInsights.diversity_score || 0),
      readerType: userInsights.reader_type || 'قارئ جديد',
      weeklyStats: {
        reads: userInsights.weekly_reads,
        streak: userInsights.weekly_streak,
        lastReadDate: userInsights.last_read_date
      }
    };

    return NextResponse.json(formattedInsights);

  } catch (error) {
    console.error('خطأ في جلب تحليلات المستخدم:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب التحليلات' },
      { status: 500 }
    );
  }
}

async function calculateUserInsights(userId: string) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // جلب جلسات القراءة
  const readingSessions = await prisma.user_reading_sessions.findMany({
    where: { user_id: userId },
    include: {
      articles: {
        select: {
          category_id: true,
          content: true
        }
      }
    }
  });

  // جلب التفاعلات
  const interactions = await prisma.interactions.findMany({
    where: { user_id: userId }
  });

  // حساب الإحصائيات الأساسية
  const totalReads = readingSessions.length;
  const totalSaved = interactions.filter(i => i.type === 'save').length;
  const totalInteractions = interactions.length;

  // حساب متوسط وقت القراءة
  const avgReadTime = readingSessions.length > 0
    ? readingSessions.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) / readingSessions.length / 60
    : 0;

  // تحليل وقت القراءة المفضل
  const readingHours = readingSessions
    .filter(s => s.time_of_day !== null)
    .map(s => s.time_of_day!);
  const preferredReadingTime = analyzeReadingTime(readingHours);

  // تحليل التصنيفات المفضلة
  const categoryStats = analyzeCategoryPreferences(readingSessions);
  
  // حساب التنوع
  const diversityScore = calculateDiversityScore(categoryStats);

  // تحليل نوع القارئ
  const articleLengths = readingSessions.map(s => 
    s.articles.content ? s.articles.content.length : 0
  );
  const avgArticleLength = articleLengths.length > 0
    ? articleLengths.reduce((sum, len) => sum + len, 0) / articleLengths.length
    : 0;
  
  const readerType = analyzeReaderType(avgReadTime, avgArticleLength);

  // حساب نشاط الأسبوع
  const weeklyReads = readingSessions.filter(s => 
    s.started_at > oneWeekAgo
  ).length;

  const weeklyStreak = calculateWeeklyStreak(readingSessions);

  // إنشاء أو تحديث التحليلات
  const insights = await prisma.user_insights.upsert({
    where: { user_id: userId },
    update: {
      total_reads: totalReads,
      total_saved: totalSaved,
      total_interactions: totalInteractions,
      avg_read_time: avgReadTime,
      preferred_reading_time: preferredReadingTime,
      reader_type: readerType,
      diversity_score: diversityScore,
      preferred_categories: categoryStats,
      preferred_article_types: analyzeArticleTypes(avgReadTime),
      avg_article_length: Math.round(avgArticleLength),
      weekly_reads: weeklyReads,
      weekly_streak: weeklyStreak,
      last_read_date: readingSessions.length > 0 
        ? readingSessions[readingSessions.length - 1].started_at
        : null,
      updated_at: new Date()
    },
    create: {
      id: `insights-${userId}`,
      user_id: userId,
      total_reads: totalReads,
      total_saved: totalSaved,
      total_interactions: totalInteractions,
      avg_read_time: avgReadTime,
      preferred_reading_time: preferredReadingTime,
      reader_type: readerType,
      diversity_score: diversityScore,
      preferred_categories: categoryStats,
      preferred_article_types: analyzeArticleTypes(avgReadTime),
      avg_article_length: Math.round(avgArticleLength),
      weekly_reads: weeklyReads,
      weekly_streak: weeklyStreak,
      last_read_date: readingSessions.length > 0 
        ? readingSessions[readingSessions.length - 1].started_at
        : null
    }
  });

  return insights;
}

function analyzeReadingTime(hours: number[]): string {
  if (hours.length === 0) return 'غير محدد';
  
  const hourCounts = hours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const avgHour = hours.reduce((sum, h) => sum + h, 0) / hours.length;

  if (avgHour >= 5 && avgHour < 12) return 'صباحًا';
  if (avgHour >= 12 && avgHour < 17) return 'ظهرًا';
  if (avgHour >= 17 && avgHour < 21) return 'مساءً';
  return 'ليلاً';
}

function analyzeCategoryPreferences(sessions: any[]): any {
  const categoryMap: Record<string, number> = {};
  
  sessions.forEach(session => {
    if (session.articles.category_id) {
      categoryMap[session.articles.category_id] = 
        (categoryMap[session.articles.category_id] || 0) + 1;
    }
  });

  return Object.entries(categoryMap)
    .map(([category_id, count]) => ({
      category_id,
      count,
      percentage: Math.round((count / sessions.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateDiversityScore(categoryStats: any[]): number {
  if (categoryStats.length === 0) return 0;
  
  // نسبة التنوع = عدد التصنيفات المختلفة / إجمالي التصنيفات الممكنة * 100
  const uniqueCategories = categoryStats.length;
  const totalPossibleCategories = 10; // عدد التصنيفات في النظام
  
  return Math.min((uniqueCategories / totalPossibleCategories) * 100, 100);
}

function analyzeReaderType(avgReadTime: number, avgArticleLength: number): string {
  if (avgReadTime > 8 && avgArticleLength > 3000) {
    return 'قارئ تحليلي';
  } else if (avgReadTime < 3 && avgArticleLength < 1500) {
    return 'قارئ سريع';
  } else {
    return 'قارئ متوازن';
  }
}

function analyzeArticleTypes(avgReadTime: number): any {
  if (avgReadTime > 8) {
    return { تحليلية: 70, مختصرة: 30 };
  } else if (avgReadTime < 3) {
    return { تحليلية: 20, مختصرة: 80 };
  } else {
    return { تحليلية: 50, مختصرة: 50 };
  }
}

function calculateWeeklyStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  // ترتيب الجلسات حسب التاريخ
  const sortedSessions = sessions.sort((a, b) => 
    b.started_at.getTime() - a.started_at.getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const dateToCheck = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
    const hasReadOnDate = sortedSessions.some(session => {
      const sessionDate = new Date(session.started_at);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === dateToCheck.getTime();
    });

    if (hasReadOnDate) {
      streak++;
    } else if (i > 0) {
      // إذا انقطعت السلسلة، توقف
      break;
    }
  }

  return streak;
}

function formatReadingTime(time: string | null): string {
  if (!time) return 'غير محدد';
  
  const timeMap: Record<string, string> = {
    'صباحًا': 'صباحًا (5 ص - 12 م)',
    'ظهرًا': 'ظهرًا (12 م - 5 م)',
    'مساءً': 'مساءً (5 م - 9 م)',
    'ليلاً': 'ليلاً (9 م - 5 ص)'
  };

  return timeMap[time] || time;
}

function formatCategories(categories: any): any {
  if (!categories || !Array.isArray(categories)) return {};
  
  const result: Record<string, number> = {};
  categories.forEach((cat: any) => {
    // هنا يمكن ربط category_id مع اسم التصنيف من قاعدة البيانات
    result[cat.category_id] = cat.count;
  });
  
  return result;
} 