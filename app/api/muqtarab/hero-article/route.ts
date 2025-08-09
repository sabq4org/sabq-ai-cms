import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const heroArticle = await prisma.muqtarabArticle.findFirst({
      where: {
        is_featured: true,
        status: 'published',
      },
      orderBy: {
        publish_at: 'desc',
      },
      include: {
        corner: true,
        creator: true,
      },
    });

    if (!heroArticle) {
      return NextResponse.json({ success: false, error: 'No hero article found' }, { status: 404 });
    }

    const formattedArticle = {
      id: heroArticle.id,
      title: heroArticle.title,
      excerpt: heroArticle.excerpt || '',
      slug: heroArticle.slug,
      coverImage: heroArticle.cover_image,
      readingTime: heroArticle.read_time,
      publishDate: heroArticle.publish_at,
      views: heroArticle.view_count,
      tags: heroArticle.tags,
      angle: {
        title: heroArticle.corner.name,
        slug: heroArticle.corner.slug,
      },
      author: {
        name: heroArticle.creator?.name || 'فريق التحرير',
        avatar: heroArticle.creator?.avatar,
      },
    };

    return NextResponse.json({ success: true, heroArticle: formattedArticle });
  } catch (error: any) {
    console.error('❌ [Hero Article] خطأ في جلب المقال المميز:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch hero article' }, { status: 500 });
  }
}
