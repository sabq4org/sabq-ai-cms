import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// جلب التحدي الأسبوعي الحالي
export async function GET(request: NextRequest) {
  try {
    // تحدي افتراضي للأسبوع
    const weeklyChallenge = {
      id: 'weekly_engagement_2025_week_3',
      title: 'تحدي التفاعل الأسبوعي',
      description: 'شارك في 15 تفاعل مختلف هذا الأسبوع واحصل على 100 نقطة!',
      type: 'weekly',
      startDate: getWeekStart().toISOString(),
      endDate: getWeekEnd().toISOString(),
      requirements: {
        comments: 5,
        likes: 5,
        shares: 3,
        reads: 2
      },
      rewards: {
        points: 100,
        badge: 'متفاعل أسبوعي',
        title: 'نجم الأسبوع'
      },
      currentProgress: {
        comments: 0,
        likes: 0,
        shares: 0,
        reads: 0,
        totalProgress: 0,
        isCompleted: false
      },
      participants: 127,
      leaderboard: [
        { name: 'أحمد محمد', progress: 14, rank: 1 },
        { name: 'فاطمة عبدالله', progress: 12, rank: 2 },
        { name: 'محمد عبدالرحمن', progress: 11, rank: 3 }
      ]
    };

    return NextResponse.json({
      success: true,
      challenge: weeklyChallenge
    });

  } catch (error) {
    console.error('خطأ في جلب التحدي الأسبوعي:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب التحدي' },
      { status: 500 }
    );
  }
}

// الانضمام للتحدي الأسبوعي
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, challengeId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم انضمامك للتحدي بنجاح!',
      challenge: {
        id: challengeId,
        joinedAt: new Date().toISOString(),
        progress: {
          comments: 0,
          likes: 0,
          shares: 0,
          reads: 0
        }
      }
    });

  } catch (error) {
    console.error('خطأ في الانضمام للتحدي:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في الانضمام' },
      { status: 500 }
    );
  }
}

// دوال مساعدة
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // الأحد = 0
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function getWeekEnd(): Date {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}
