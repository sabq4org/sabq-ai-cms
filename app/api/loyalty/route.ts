import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function للاستجابة مع CORS
function corsResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// قواعد النقاط المبسطة
const POINTS_RULES = {
  'read': 1,        // قراءة مقال: +1 نقطة
  'like': 2,        // إعجاب بمقال: +2 نقاط  
  'save': 2,        // حفظ مقال: +2 نقاط
  'comment': 3,     // كتابة تعليق: +3 نقاط
  'share': 3,       // مشاركة مقال: +3 نقاط
  'complete_interests': 5, // إتمام اختيار الاهتمامات: +5 نقاط
};

// حساب المستوى بناءً على النقاط
function calculateLevel(points: number) {
  if (points >= 2000) return { name: 'بلاتيني', color: '#E5E7EB', next: null };
  if (points >= 500) return { name: 'ذهبي', color: '#FBBF24', next: 2000 };
  if (points >= 100) return { name: 'فضي', color: '#9CA3AF', next: 500 };
  return { name: 'برونزي', color: '#92400E', next: 100 };
}

// GET: جلب نقاط المستخدم
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return corsResponse({
        success: false,
        error: 'معرف المستخدم مطلوب'
      }, 400);
    }

    // جلب إجمالي النقاط من قاعدة البيانات
    const pointsSum = await prisma.loyalty_points.aggregate({
      where: { user_id: userId },
      _sum: { points: true }
    });

    const totalPoints = pointsSum._sum.points || 0;
    const level = calculateLevel(totalPoints);

    // جلب آخر 10 نشاطات
    const recentActivities = await prisma.loyalty_points.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    // حساب التقدم للمستوى التالي
    const progress = level.next ? 
      Math.min(100, Math.round((totalPoints / level.next) * 100)) : 100;

    return corsResponse({
      success: true,
      data: {
        totalPoints,
        level: level.name,
        levelColor: level.color,
        nextLevelPoints: level.next,
        progress,
        pointsToNext: level.next ? level.next - totalPoints : 0,
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          action: activity.action,
          points: activity.points,
          referenceId: activity.reference_id,
          referenceType: activity.reference_type,
          metadata: activity.metadata,
          createdAt: activity.created_at
        }))
      }
    });

  } catch (error) {
    console.error('خطأ في جلب نقاط الولاء:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في جلب نقاط الولاء'
    }, 500);
  }
}

// POST: إضافة نقاط جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, articleId, description } = body;

    if (!userId || !action) {
      return corsResponse({
        success: false,
        error: 'معرف المستخدم ونوع النشاط مطلوبان'
      }, 400);
    }

    // التحقق من صحة نوع النشاط
    const points = POINTS_RULES[action as keyof typeof POINTS_RULES];
    if (points === undefined) {
      return corsResponse({
        success: false,
        error: 'نوع نشاط غير صحيح'
      }, 400);
    }

    // منع تكرار بعض النشاطات للمقال نفسه
    if (['like', 'save', 'read'].includes(action) && articleId) {
      const existingAction = await prisma.loyalty_points.findFirst({
        where: {
          user_id: userId,
          action,
          reference_id: articleId
        }
      });

      if (existingAction) {
        return corsResponse({
          success: false,
          error: 'تم تسجيل هذا النشاط مسبقاً لهذا المقال'
        }, 409);
      }
    }

    // إضافة النقاط
    const loyaltyPoint = await prisma.loyalty_points.create({
      data: {
        id: `lp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        action,
        points,
        reference_id: articleId || null,
        reference_type: articleId ? 'article' : null,
        metadata: {
          description: description || `حصل على ${points} نقطة لـ ${action}`,
          timestamp: new Date().toISOString()
        },
        created_at: new Date()
      }
    });

    // حساب إجمالي النقاط الجديد
    const pointsSum = await prisma.loyalty_points.aggregate({
      where: { user_id: userId },
      _sum: { points: true }
    });

    const totalPoints = pointsSum._sum.points || 0;
    const level = calculateLevel(totalPoints);

    console.log(`✅ تم منح ${points} نقطة للمستخدم ${userId} لـ ${action}`);

    return corsResponse({
      success: true,
      message: `تم منحك ${points} نقطة! 🎉`,
      data: {
        pointsAwarded: points,
        totalPoints,
        level: level.name,
        levelColor: level.color,
        description: description || `حصل على ${points} نقطة لـ ${action}`
      }
    });

  } catch (error) {
    console.error('خطأ في إضافة نقاط الولاء:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في إضافة النقاط'
    }, 500);
  }
}

// OPTIONS: للـ CORS
export async function OPTIONS() {
  return corsResponse({}, 200);
} 