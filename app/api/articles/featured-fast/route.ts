import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '3'), 10);
    
    const articles = await prisma.articles.findMany({
      where: {
        status: 'published',
        featured: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        social_image: true,
        breaking: true,
        featured: true,
        status: true,
        published_at: true,
        views: true,
      },
      orderBy: {
        published_at: 'desc',
      },
      take: limit,
    });

    // Clean up large base64 images to prevent performance issues
    const cleanedArticles = articles.map(article => ({
      ...article,
      featured_image: article.featured_image && article.featured_image.startsWith('data:') && article.featured_image.length > 10000
        ? null // Remove large base64 images
        : article.featured_image,
      social_image: article.social_image && article.social_image.startsWith('data:') && article.social_image.length > 10000
        ? null // Remove large base64 images  
        : article.social_image,
    }));
    
    const payload = {
      success: true,
      data: cleanedArticles,
    };
    
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return NextResponse.json(
      { success: false, data: [] },
      { status: 500 }
    );
  }
}
