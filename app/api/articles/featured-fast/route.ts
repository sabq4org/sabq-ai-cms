import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cache, CACHE_TTL } from '@/lib/redis';

export const runtime = 'nodejs';

// كاش في الذاكرة للطلبات المتزامنة
const memCache = new Map<string, { ts: number; data: any }>();
const MEM_TTL = 10 * 1000; // 10 ثواني

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '3'), 10);
    
    const cacheKey = `featured-fast:v1:${limit}`;
    
    // 1. تحقق من كاش الذاكرة
    const memCached = memCache.get(cacheKey);
    if (memCached && Date.now() - memCached.ts < MEM_TTL) {
      return NextResponse.json(memCached.data, {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
          'X-Cache': 'MEMORY',
        },
      });
    }
    
    // 2. تحقق من Redis
    try {
      const redisCached = await cache.get(cacheKey);
      if (redisCached) {
        memCache.set(cacheKey, { ts: Date.now(), data: redisCached });
        return NextResponse.json(redisCached, {
          headers: {
            'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
            'X-Cache': 'REDIS',
          },
        });
      }
    } catch (redisError) {
      console.warn('Redis error:', redisError);
    }
    
    // 3. جلب من قاعدة البيانات - حقول محدودة فقط
    const articles = await prisma.articles.findMany({
      where: {
        status: 'published',
        featured: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        featured_image: true,
        breaking: true,
        published_at: true,
        views: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: {
        published_at: 'desc',
      },
      take: limit,
    });
    
    const payload = {
      success: true,
      data: articles.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        featured_image: article.featured_image,
        breaking: article.breaking,
        published_at: article.published_at,
        views: article.views || 0,
        categories: article.categories,
      })),
    };
    
    // حفظ في Redis
    try {
      await cache.set(cacheKey, payload, CACHE_TTL.ARTICLES);
    } catch (redisError) {
      console.warn('Failed to save to Redis:', redisError);
    }
    
    // حفظ في كاش الذاكرة
    memCache.set(cacheKey, { ts: Date.now(), data: payload });
    
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('❌ /api/articles/featured-fast error:', error);
    return NextResponse.json(
      { success: false, data: [] },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
