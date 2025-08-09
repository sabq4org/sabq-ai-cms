import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';

async function generateUniqueCornerSlug(base: string): Promise<string> {
  let slug = base.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  while (true) {
    const exists = await prisma.muqtarabCorner.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${base}-${nanoid(3)}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const slug = await generateUniqueCornerSlug(body.slug || body.title);

    const newCorner = await prisma.muqtarabCorner.create({
      data: {
        name: body.title,
        slug: slug,
        description: body.description,
        author_name: 'فريق التحرير', // Placeholder
        cover_image: body.coverImage || null,
        theme_color: body.themeColor || '#3B82F6',
        is_featured: body.isFeatured || false,
        is_active: body.isPublished || false,
        creator: body.authorId ? { connect: { id: body.authorId } } : undefined,
      },
    });

    return NextResponse.json({ success: true, corner: newCorner });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to create corner', details: error.message }, { status: 500 });
  }
}

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
