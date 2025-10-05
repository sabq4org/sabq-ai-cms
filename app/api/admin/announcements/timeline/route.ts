import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/getAuthenticatedUser';

/**
 * GET /api/admin/announcements/timeline
 * نقطة نهاية للحصول على الخط الزمني للإعلانات
 * - الإعلانات المثبتة
 * - الإعلانات النشطة في آخر 7 أيام
 * - الإعلانات المجدولة خلال 24 ساعة
 */
export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const authResult = await getAuthenticatedUser(request);
    if (authResult.reason !== 'ok' || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = authResult.user;

    // التحقق من وجود الجدول قبل الاستعلام
    try {
      const modelAvailable = Boolean((prisma as any)?.adminAnnouncement?.findMany);
      if (!modelAvailable) {
        console.warn('⚠️ Prisma Client لا يحتوي على نموذج adminAnnouncement بعد. Timeline سيرجع مصفوفة فارغة مؤقتاً.');
        return NextResponse.json([]);
      }
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // استعلام مُحسّن للخط الزمني
      const timeline = await (prisma as any).adminAnnouncement.findMany({
        where: {
          AND: [
            {
              OR: [
                // المثبتة النشطة أو المجدولة
                {
                  isPinned: true,
                  status: { in: ['ACTIVE', 'SCHEDULED'] }
                },
                // النشطة خلال آخر 7 أيام
                {
                  status: 'ACTIVE',
                  startAt: { gte: sevenDaysAgo }
                },
                // المجدولة خلال 24 ساعة القادمة
                {
                  status: 'SCHEDULED',
                  startAt: { 
                    gte: now,
                    lte: oneDayAhead 
                  }
                }
              ]
            },
            // منطق RBAC
            {
              OR: [
                { audienceRoles: { isEmpty: true } },
                { audienceRoles: { has: user.role || 'user' } },
                { audienceUsers: { has: user.id } },
                ...(user.role === 'admin' ? [{}] : [])
              ]
            }
          ]
        },
        orderBy: [
          { isPinned: 'desc' },
          { priority: 'desc' },
          { startAt: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 10, // أحدث 10 عناصر
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      return NextResponse.json(timeline);
      
    } catch (dbError: any) {
      console.error('Database error in timeline:', dbError);
      
      // إذا كان الخطأ بسبب جدول غير موجود، أرجع array فارغ
      if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
        console.warn('⚠️ admin_announcements table does not exist. Run: npx prisma db push');
        return NextResponse.json([]);
      }
      
      throw dbError;
    }

  } catch (error: any) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
