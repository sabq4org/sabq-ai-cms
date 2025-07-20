import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // جلب آخر خبر عاجل منشور
    const breakingNews = await prisma.articles.findFirst({
      where: {
        AND: [
          { status: 'published' },
          { published_at: { not: null } },
          {
            OR: [
              { metadata: { path: ['isBreakingNews'], equals: true } },
              { metadata: { path: ['breaking'], equals: true } },
              { metadata: { path: ['is_breaking'], equals: true } }
            ]
          }
        ]
      },
      orderBy: {
        published_at: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        published_at: true,
        metadata: true
      }
    });

    if (!breakingNews) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No breaking news found'
      });
    }

    // استخراج البيانات من metadata
    const metadata = breakingNews.metadata as any || {};
    
    // تحويل البيانات للتنسيق المطلوب
    const formattedNews = {
      id: breakingNews.id,
      title: breakingNews.title,
      slug: breakingNews.slug,
      summary: metadata.summary || metadata.lead || breakingNews.excerpt || '',
      lead: metadata.lead || breakingNews.excerpt || '',
      featuredImage: breakingNews.featured_image,
      publishedAt: breakingNews.published_at?.toISOString() || new Date().toISOString(),
      readTime: metadata.readTime || metadata.reading_time || 5,
      category: metadata.category || 'أخبار'
    };

    return NextResponse.json({
      success: true,
      data: formattedNews
    });

  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch breaking news',
        data: null 
      },
      { status: 500 }
    );
  }
}
