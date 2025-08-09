import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const corners = await prisma.muqtarabCorner.findMany({
      where: {
        is_active: true,
      },
      include: {
        _count: {
          select: { articles: true },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const formattedCorners = corners.map((corner) => ({
      id: corner.id,
      title: corner.name,
      slug: corner.slug,
      description: corner.description || '',
      icon: 'BookOpen', // Fallback icon
      themeColor: corner.theme_color || '#3B82F6',
      author: { name: corner.creator?.name || 'فريق التحرير' },
      coverImage: corner.cover_image,
      isFeatured: corner.is_featured,
      isPublished: corner.is_active,
      createdAt: corner.created_at,
      updatedAt: corner.updated_at,
      articlesCount: corner._count.articles,
      totalViews: 0, // This should be calculated separately if needed
    }));

    return NextResponse.json({
      success: true,
      angles: formattedCorners,
    });
  } catch (error: any) {
    console.error('خطأ في جلب الزوايا:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب الزوايا',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
