import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function getLevel(totalPoints: number): string {
  if (totalPoints >= 2000) return 'بلاتيني';
  if (totalPoints >= 500) return 'ذهبي';
  if (totalPoints >= 100) return 'فضي';
  return 'برونزي';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || searchParams.get('user_id');
    if (!userId || userId === 'anonymous') {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const aggregate = await prisma.loyalty_points.aggregate({
      where: { user_id: userId },
      _sum: { points: true },
    });
    const totalPoints = aggregate._sum.points || 0;
    const level = getLevel(totalPoints);

    return NextResponse.json({ 
      success: true, 
      total_points: totalPoints, 
      level,
      data: {
        total_points: totalPoints,
        level,
        user_id: userId
      }
    });
  } catch (error) {
    console.error('Error in /api/loyalty/points:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch points' }, { status: 500 });
  }
} 