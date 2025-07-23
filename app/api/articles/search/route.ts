import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET - البحث عن مقال بطرق متعددة (معرف، عنوان، slug)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('search');
    const title = searchParams.get('title');
    const slug = searchParams.get('slug');
    
    if (!query && !title && !slug) {
      return NextResponse.json(
        { error: 'Missing search parameters' },
        { status: 400 }
      );
    }

    let whereCondition: any = {};
    
    if (query) {
      // البحث الشامل
      whereCondition = {
        OR: [
          { id: query },
          { slug: query },
          { title: { contains: query.replace(/-/g, ' ') } },
          { title: { contains: query } },
          { content: { contains: query } }
        ]
      };
    } else if (title) {
      // البحث بالعنوان
      whereCondition = {
        OR: [
          { title: { contains: title } },
          { title: { contains: title.replace(/-/g, ' ') } }
        ]
      };
    } else if (slug) {
      // البحث بالـ slug
      whereCondition = { slug };
    }

    const articles = await prisma.articles.findMany({
      where: {
        ...whereCondition,
        status: 'published'
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5 // أول 5 نتائج
    });

    if (articles.length === 0) {
      return NextResponse.json(
        { error: 'No articles found' },
        { status: 404 }
      );
    }

    // تحويل البيانات للعرض
    const transformedArticles = articles.map(article => {
      const metadata = article.metadata as any || {};
      
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        author: metadata.author_name || 'فريق التحرير',
        category: metadata.category_name || 'عام',
        tags: metadata.tags || [],
        image_url: metadata.image_url || article.featured_image,
        views: article.views || 0,
        published_at: article.published_at,
        created_at: article.created_at,
        updated_at: article.updated_at
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedArticles,
      count: transformedArticles.length
    });

  } catch (error) {
    console.error('Error searching articles:', error);
    return NextResponse.json(
      { error: 'Failed to search articles' },
      { status: 500 }
    );
  }
}
