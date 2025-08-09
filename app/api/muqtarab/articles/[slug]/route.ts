import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const article = await prisma.muqtarabArticle.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const formattedArticle = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        author: article.creator ? {
            id: article.creator.id,
            name: article.creator.name,
        } : null,
        coverImage: article.cover_image,
        isPublished: article.status === 'published',
        publishDate: article.publish_at,
        readingTime: article.read_time,
        views: article.view_count,
        likes: article.like_count,
        comments: article.comment_count,
        createdAt: article.created_at,
    };

    return NextResponse.json({ success: true, article: formattedArticle });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch article', details: error.message }, { status: 500 });
  }
}
