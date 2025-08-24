import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

function getLevel(totalPoints: number): { level: string; nextLevelThreshold: number } {
  if (totalPoints >= 2000) return { level: 'بلاتيني', nextLevelThreshold: 999999 };
  if (totalPoints >= 500) return { level: 'ذهبي', nextLevelThreshold: 2000 };
  if (totalPoints >= 100) return { level: 'فضي', nextLevelThreshold: 500 };
  return { level: 'برونزي', nextLevelThreshold: 100 };
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const agg = await prisma.loyalty_points.aggregate({ where: { user_id: user.id }, _sum: { points: true } });
    const points = agg._sum.points || 0;
    const { level, nextLevelThreshold } = getLevel(points);

    return NextResponse.json({ success: true, points, level, nextLevelThreshold, lastUpdatedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch loyalty' }, { status: 500 });
  }
}


