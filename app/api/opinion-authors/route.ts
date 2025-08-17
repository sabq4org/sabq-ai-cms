import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authors = await prisma.article_authors.findMany({
      where: {
        is_active: true,
        role: 'writer',
      },
      select: {
        id: true,
        full_name: true,
        slug: true,
        title: true,
        bio: true,
        avatar_url: true,
        total_articles: true,
        total_views: true,
      },
      orderBy: [
        { total_views: 'desc' },
        { full_name: 'asc' },
      ],
      take: 50, // Limit to a reasonable number
    });

    const formattedAuthors = authors.map((author) => ({
      id: author.id,
      name: author.full_name,
      bio: author.bio,
      avatarUrl: author.avatar_url,
      slug: author.slug,
      title: author.title,
      stats: {
        totalArticles: author.total_articles || 0,
        totalViews: author.total_views || 0,
      },
    }));

    return NextResponse.json({
      success: true,
      authors: formattedAuthors,
    });
  } catch (error: any) {
    console.error('❌ Error fetching opinion authors:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch opinion authors',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
