import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Memory cache for preview content
const previewCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Check cache first
    const cacheKey = `preview_${slug}`;
    const cached = previewCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'Content-Type': 'application/json',
        }
      });
    }

    // Fetch article preview data with essential fields only
    const article = await prisma.articles.findFirst({
      where: {
        slug: slug,
        status: "published",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        featured_image: true,
        social_image: true,
        published_at: true,
        views: true,
        reading_time: true,
        breaking: true,
        metadata: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Create preview content (first 500 characters of content)
    const previewContent = article.content 
      ? article.content.substring(0, 500) + (article.content.length > 500 ? '...' : '')
      : article.excerpt || '';

    const previewData = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      preview_content: previewContent,
      featured_image: article.featured_image,
      social_image: article.social_image,
      published_at: article.published_at,
      views: article.views,
      reading_time: article.reading_time,
      breaking: article.breaking,
      metadata: article.metadata,
      category: article.categories,
      author: article.author,
      is_preview: true,
      cached_at: new Date().toISOString()
    };

    // Cache the result
    previewCache.set(cacheKey, {
      data: previewData,
      timestamp: Date.now()
    });

    // Clean old cache entries (keep only last 100)
    if (previewCache.size > 100) {
      const entries = Array.from(previewCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      previewCache.clear();
      entries.slice(0, 100).forEach(([key, value]) => {
        previewCache.set(key, value);
      });
    }

    return NextResponse.json(previewData, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error("Error fetching article preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
