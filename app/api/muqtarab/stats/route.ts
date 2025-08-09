import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const totalAngles = await prisma.muqtarabCorner.count();
    const publishedAngles = await prisma.muqtarabCorner.count({ where: { is_active: true } });
    const totalArticles = await prisma.muqtarabArticle.count();
    const publishedArticles = await prisma.muqtarabArticle.count({ where: { status: 'published' } });

    const totalViewsAggregation = await prisma.muqtarabArticle.aggregate({
      _sum: {
        view_count: true,
      },
    });
    const totalViews = totalViewsAggregation._sum.view_count || 0;

    const formattedViews = totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews.toString();

    const stats = {
      totalAngles,
      publishedAngles,
      totalArticles,
      publishedArticles,
      totalViews,
      displayViews: {
        raw: totalViews,
        formatted: formattedViews,
      },
    };

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error('❌ [Muqtarab Stats] خطأ في جلب الإحصائيات:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
