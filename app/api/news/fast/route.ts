import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cache, CACHE_TTL } from '@/lib/redis';

export const runtime = 'nodejs';

// ذاكرة محلية قصيرة جداً كتأمين في حال تعطل Redis
const mem = new Map<string, { ts: number; data: any }>();
const MEM_TTL = 45 * 1000;

function keyFromParams(limit: number, page: number, categoryId?: string | null, sort?: string) {
  return `news:fast:v1:${limit}:${page}:${categoryId || 'all'}:${sort || 'published_at_desc'}`;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const skip = (page - 1) * limit;
    const categoryId = url.searchParams.get('category_id');
    const sort = url.searchParams.get('sort') || 'published_at';
    const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const noCount = url.searchParams.get('noCount') === '1';

    const key = keyFromParams(limit, page, categoryId, `${sort}_${order}`);

    // 1) ذاكرة محلية
    const memHit = mem.get(key);
    if (memHit && Date.now() - memHit.ts < MEM_TTL) {
      return NextResponse.json(memHit.data, {
        headers: {
          'Cache-Control': 'public, max-age=20, s-maxage=60, stale-while-revalidate=300',
          'X-Cache': 'MEMORY',
        },
      });
    }

    // 2) Redis
    const redisHit = await cache.get<any>(key);
    if (redisHit) {
      mem.set(key, { ts: Date.now(), data: redisHit });
      return NextResponse.json(redisHit, {
        headers: {
          'Cache-Control': 'public, max-age=20, s-maxage=60, stale-while-revalidate=300',
          'X-Cache': 'REDIS',
        },
      });
    }

    // 3) قاعدة البيانات - حقول خفيفة فقط
    const where: any = {
      status: 'published',
      article_type: { notIn: ['opinion', 'analysis', 'interview'] },
    };
    if (categoryId && categoryId !== 'all') where.category_id = categoryId;

    const orderBy: any = {};
    if (sort === 'views') orderBy.views = order;
    else orderBy.published_at = order;

    const articles = await prisma.articles.findMany({
      where,
      take: limit,
      skip,
      orderBy,
      select: {
        id: true,
        title: true,
        slug: true,
        featured_image: true,
        published_at: true,
        views: true,
        reading_time: true,
        breaking: true,
        featured: true,
        category_id: true,
      },
    });
    const total = noCount ? undefined : await prisma.articles.count({ where });

    // مخرجات خفيفة ومتوافقة مع الواجهة الحالية
    const payload = {
      success: true,
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        image: a.featured_image,
        featured_image: a.featured_image,
        published_at: a.published_at,
        views: a.views || 0,
        reading_time: a.reading_time || null,
        breaking: a.breaking,
        featured: a.featured,
        category_id: a.category_id,
      })),
      pagination: noCount
        ? {
            total: undefined,
            page,
            limit,
            totalPages: undefined,
            hasNext: articles.length === limit,
            hasPrev: page > 1,
          }
        : {
            total: total as number,
            page,
            limit,
            totalPages: Math.ceil((total as number) / limit),
            hasNext: skip + limit < (total as number),
            hasPrev: page > 1,
          },
    };

    // تخزين
    await cache.set(key, payload, CACHE_TTL.ARTICLES);
    mem.set(key, { ts: Date.now(), data: payload });

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=20, s-maxage=60, stale-while-revalidate=300',
        'CDN-Cache-Control': 'max-age=60',
        'Vercel-CDN-Cache-Control': 'max-age=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('❌ /api/news/fast error:', (error as any)?.message);
    return NextResponse.json(
      { success: false, articles: [], pagination: { total: 0, page: 1, limit: 0 } },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}


