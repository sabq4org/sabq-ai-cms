/**
 * Phase-2 High-Performance API Handlers
 * Optimized for P95 ≤ 1.5s with caching and cursor pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from './db-pool-v2';
import { withCache, CACHE_CONFIG, CachePurge } from './redis-cache-v2';
import { withServerTiming } from './server-timing';
import { paginateArticles, paginateArticlesByCategory } from './cursor-pagination';

/**
 * Homepage API - Cached with Redis
 */
export async function getHomepageData() {
  return withCache(
    CACHE_CONFIG.home.key,
    CACHE_CONFIG.home.ttl,
    async () => {
      // Use aggregates table for counts
      const [aggregates, featuredNews, trending] = await Promise.all([
        db.$queryRaw`SELECT * FROM aggregates ORDER BY last_updated DESC LIMIT 1` as Promise<any[]>,
        
        // Featured news with minimal fields
        db.articles.findMany({
          where: {
            featured_image: { not: null },
            published_at: { lte: new Date() }
          },
          select: {
            id: true,
            title: true,
            slug: true,
            featured_image: true,
            published_at: true,
            categories: {
              select: { id: true, name: true, slug: true }
            }
          },
          orderBy: { published_at: 'desc' },
          take: 6
        }),
        
        // Trending articles using views
        db.articles.findMany({
          where: {
            published_at: { 
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          select: {
            id: true,
            title: true,
            slug: true,
            featured_image: true,
            views: true,
            published_at: true,
            categories: {
              select: { id: true, name: true, slug: true }
            }
          },
          orderBy: [
            { views: 'desc' },
            { published_at: 'desc' }
          ],
          take: 5
        })
      ]);
      
      return {
        stats: aggregates[0] || null,
        featuredNews,
        trending,
        timestamp: new Date().toISOString()
      };
    },
    { description: 'homepage data' }
  );
}

/**
 * Article by slug API - Cached with Redis
 */
export async function getArticleBySlug(slug: string) {
  return withCache(
    CACHE_CONFIG.article.key(slug),
    CACHE_CONFIG.article.ttl,
    async () => {
      const article = await db.articles.findFirst({
        where: { slug },
        select: {
          id: true,
          title: true,
          content: true,
          excerpt: true,
          slug: true,
          featured_image: true,
          published_at: true,
          views: true,
          categories: {
            select: { 
              id: true, 
              name: true, 
              slug: true 
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });
      
      if (!article) {
        return null;
      }
      
      // Increment view count asynchronously (fire and forget)
      db.articles.update({
        where: { id: article.id },
        data: { views: { increment: 1 } }
      }).catch(err => console.error('Failed to increment views:', err));
      
      return article;
    },
    { description: `article ${slug}` }
  );
}

/**
 * Category articles list API - Cached with cursor pagination
 */
export async function getCategoryArticles(
  categorySlug: string, 
  cursor?: string, 
  limit: number = 12
) {
  // Find category first
  const category = await db.categories.findUnique({
    where: { slug: categorySlug },
    select: { id: true, name: true, slug: true }
  });
  
  if (!category) {
    return { articles: [], hasNextPage: false, nextCursor: null };
  }
  
  const page = cursor ? Math.ceil(parseInt(cursor) / limit) : 1;
  
  return withCache(
    CACHE_CONFIG.categoryList.key(category.id, page),
    CACHE_CONFIG.categoryList.ttl,
    async () => {
      return await paginateArticlesByCategory({ 
        categoryId: category.id, 
        cursor, 
        take: limit 
      });
    },
    { description: `category ${categorySlug} page ${page}` }
  );
}

/**
 * Search articles API - No caching due to query variety
 */
export async function searchArticles(
  query: string, 
  cursor?: string, 
  limit: number = 10
) {
  // Use PostgreSQL full-text search with Arabic support
  const searchQuery = query.trim();
  
  if (!searchQuery || searchQuery.length < 2) {
    return { articles: [], hasNextPage: false, nextCursor: null };
  }
  
  const articles = await db.articles.findMany({
    where: {
      OR: [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        }
      ],
      published_at: { lte: new Date() }
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
      slug: true,
      featured_image: true,
      published_at: true,
      categories: {
        select: { id: true, name: true, slug: true }
      }
    },
    orderBy: { published_at: 'desc' },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 })
  });
  
  const hasNextPage = articles.length > limit;
  const nextCursor = hasNextPage ? articles[limit - 1].id : null;
  
  return {
    articles: articles.slice(0, limit),
    hasNextPage,
    nextCursor,
    query: searchQuery
  };
}

/**
 * API Route Handlers with Server Timing
 */

export const handleHomepage = withServerTiming(async (req: NextRequest) => {
  try {
    const data = await getHomepageData();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
      }
    });
    
  } catch (error) {
    console.error('Homepage API error:', error);
    return NextResponse.json(
      { error: 'Failed to load homepage data' },
      { status: 500 }
    );
  }
});

export const handleArticle = withServerTiming(async (req: NextRequest, slug: string) => {
  try {
    const article = await getArticleBySlug(slug);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(article, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error) {
    console.error('Article API error:', error);
    return NextResponse.json(
      { error: 'Failed to load article' },
      { status: 500 }
    );
  }
});

export const handleCategoryList = withServerTiming(async (
  req: NextRequest, 
  categorySlug: string
) => {
  try {
    const url = new URL(req.url);
    const cursor = url.searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '12'), 24);
    
    const data = await getCategoryArticles(categorySlug, cursor, limit);
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360'
      }
    });
    
  } catch (error) {
    console.error('Category list API error:', error);
    return NextResponse.json(
      { error: 'Failed to load category articles' },
      { status: 500 }
    );
  }
});

export const handleSearch = withServerTiming(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const cursor = url.searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 20);
    
    const data = await searchArticles(query, cursor, limit);
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
});

/**
 * Cache management API handlers
 */

export const handleCachePurge = withServerTiming(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const target = url.searchParams.get('target');
    
    switch (type) {
      case 'home':
        await CachePurge.purgeHome();
        break;
      case 'article':
        if (target) await CachePurge.purgeArticle(target);
        break;
      case 'category':
        if (target) await CachePurge.purgeCategory(target);
        break;
      case 'all':
        await CachePurge.purgeAll();
        break;
      default:
        return NextResponse.json({ error: 'Invalid purge type' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, purged: type, target });
    
  } catch (error) {
    console.error('Cache purge error:', error);
    return NextResponse.json(
      { error: 'Cache purge failed' },
      { status: 500 }
    );
  }
});
