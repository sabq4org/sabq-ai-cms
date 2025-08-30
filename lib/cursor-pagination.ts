/**
 * Cursor-based pagination to eliminate OFFSET performance issues
 * Replaces deep OFFSET queries that get slower as page number increases
 */

import { prisma } from './prisma';

export interface CursorPaginationParams {
  take?: number;
  cursor?: string | number;
  orderBy?: 'asc' | 'desc';
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | number | null;
  prevCursor: string | number | null;
  hasMore: boolean;
  total?: number;
}

/**
 * Generic cursor pagination for articles
 */
export async function paginateArticles({
  take = 20,
  cursor,
  orderBy = 'desc',
  where = {},
  include = {}
}: {
  take?: number;
  cursor?: string | number;
  orderBy?: 'asc' | 'desc';
  where?: any;
  include?: any;
}): Promise<CursorPaginationResult<any>> {
  
  // Ensure we never take more than 100 items at once
  const limit = Math.min(take, 100);
  
  // Build cursor condition
  const cursorCondition = cursor ? {
    id: orderBy === 'desc' ? { lt: cursor } : { gt: cursor }
  } : undefined;

  // Combine where conditions
  const whereClause = {
    ...where,
    ...(cursorCondition && cursorCondition)
  };

  // Fetch one extra item to check if there are more results
  const articles = await prisma.articles.findMany({
    take: limit + 1,
    where: whereClause,
    orderBy: [
      { id: orderBy },
      { published_at: orderBy }
    ],
    // Select only needed fields to reduce payload
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      published_at: true,
      featured_image: true,
      views: true,
      category_id: true,
      author_id: true,
      status: true
    }
  });

  // Check if there are more results
  const hasMore = articles.length > limit;
  const data = hasMore ? articles.slice(0, -1) : articles;

  // Get cursors for pagination
  const nextCursor = hasMore ? data[data.length - 1]?.id : null;
  const prevCursor = data.length > 0 ? data[0]?.id : null;

  return {
    data,
    nextCursor,
    prevCursor,
    hasMore
  };
}

/**
 * Category-specific article pagination
 */
export async function paginateArticlesByCategory({
  categoryId,
  take = 20,
  cursor,
  orderBy = 'desc'
}: {
  categoryId: string;
  take?: number;
  cursor?: string | number;
  orderBy?: 'asc' | 'desc';
}) {
  return paginateArticles({
    take,
    cursor,
    orderBy,
    where: {
      status: 'published',
      category_id: categoryId
    }
  });
}

/**
 * Trending articles with cursor pagination
 */
export async function paginateTrendingArticles({
  take = 10,
  cursor
}: {
  take?: number;
  cursor?: string | number;
}) {
  const limit = Math.min(take, 50);
  
  const articles = await prisma.articles.findMany({
    take: limit + 1,
    ...(cursor && {
      cursor: { id: String(cursor) },
      skip: 1
    }),
    where: {
      status: 'published'
    },
    orderBy: [
      { views: 'desc' },
      { published_at: 'desc' },
      { id: 'desc' } // Ensure consistent ordering
    ],
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      published_at: true,
      featured_image: true
    }
  });

  const hasMore = articles.length > limit;
  const data = hasMore ? articles.slice(0, -1) : articles;
  const nextCursor = hasMore ? data[data.length - 1]?.id : null;

  return {
    data,
    nextCursor,
    hasMore
  };
}

/**
 * Helper to convert old page-based pagination to cursor
 */
export function convertPageToCursor(page: number, pageSize: number = 20) {
  // For migration purposes - not recommended for production use
  console.warn('⚠️ Page-based pagination detected. Consider migrating to cursor-based pagination');
  
  if (page <= 1) return undefined;
  
  // This is an approximation and not perfect, but helps during migration
  return (page - 1) * pageSize;
}

/**
 * Get aggregated counts without expensive COUNT queries
 */
export async function getAggregatedCount(key: string): Promise<number> {
  try {
    const result = await prisma.$queryRaw`
      SELECT value FROM aggregates WHERE key = ${key} LIMIT 1
    ` as Array<{ value: bigint }>;
    
    return result[0]?.value ? Number(result[0].value) : 0;
  } catch (error) {
    console.error('Failed to get aggregated count:', error);
    return 0;
  }
}
