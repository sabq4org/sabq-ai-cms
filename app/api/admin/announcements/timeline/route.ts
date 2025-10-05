import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/admin/announcements/timeline
 * الحصول على الخط الزمني للإعلانات المهمة
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // استعلام مُحسّن للخط الزمني
    const timeline = await prisma.adminAnnouncement.findMany({
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
              { audienceRoles: { has: user.role } },
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

  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
