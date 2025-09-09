import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cache, CACHE_TTL } from '@/lib/redis';

export const runtime = 'nodejs';

// ذاكرة محلية قصيرة جداً كتأمين في حال تعطل Redis - تقليل الوقت
const mem = new Map<string, { ts: number; data: any }>();
const MEM_TTL = 20 * 1000; // تقليل من 45 ثانية إلى 20 ثانية

// دالة مسح الذاكرة المحلية
export function clearMemoryCache() {
  mem.clear();
  console.log('💾 تم مسح ذاكرة التخزين المحلية في /api/news/fast');
}

function keyFromParams(limit: number, page: number, categoryId?: string | null, sort?: string) {
  return `news:fast:v1:${limit}:${page}:${categoryId || 'all'}:${sort || 'published_at_desc'}`;
}

// HEAD request لمسح الكاش بقوة
export async function HEAD(request: NextRequest) {
  try {
    console.log('🧹 [News Fast API] HEAD request - مسح الكاش بقوة');
    
    // مسح جميع أنواع الكاش
    clearMemoryCache();
    
    // مسح أي كاش إضافي في الذاكرة
    if (typeof global !== 'undefined' && (global as any).__newsCache) {
      delete (global as any).__newsCache;
    }
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Cache-Cleared': 'true',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('❌ [News Fast API] HEAD error:', error);
    return new NextResponse(null, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    
    // فحص طلب مسح الكاش
    const clearCache = url.searchParams.get('_clear_cache') === '1' || request.headers.get('X-Cache-Clear') === 'true';
    if (clearCache) {
      clearMemoryCache();
      return new Response('Cache cleared', { status: 200 });
    }
    
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const skip = (page - 1) * limit;
    const categoryId = url.searchParams.get('category_id');
    const excludeId = url.searchParams.get('exclude');
    const sort = url.searchParams.get('sort') || 'published_at';
    const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const noCount = url.searchParams.get('noCount') === '1';
    const fieldsParam = url.searchParams.get('fields');

    const key = keyFromParams(limit, page, categoryId, `${sort}_${order}`);

    // 1) ذاكرة محلية
    const memHit = mem.get(key);
    if (memHit && Date.now() - memHit.ts < MEM_TTL) {
      return NextResponse.json(memHit.data, {
        headers: {
          'Cache-Control': 'public, max-age=10, s-maxage=30, stale-while-revalidate=60',
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
          'Cache-Control': 'public, max-age=10, s-maxage=30, stale-while-revalidate=60',
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
    if (excludeId) where.id = { not: excludeId };

    const orderBy: any = {};
    if (sort === 'views') orderBy.views = order;
    else orderBy.published_at = order;

    // select ديناميكي لتقليص الحقول
    let select: any;
    if (fieldsParam) {
      const allow = new Set(['id','title','slug','featured_image','published_at','views','reading_time','breaking','featured','category_id']);
      select = {};
      for (const f of fieldsParam.split(',').map(s => s.trim())) {
        if (allow.has(f)) (select as any)[f] = true;
      }
      select.id = true; select.title = true; select.slug = true;
    } else {
      select = {
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
      };
    }

    const articles = await prisma.articles.findMany({
      where,
      take: limit,
      skip,
      orderBy,
      select,
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
        'Cache-Control': 'public, max-age=10, s-maxage=30, stale-while-revalidate=60', // تقليل أوقات الكاش
        'CDN-Cache-Control': 'max-age=30',
        'Vercel-CDN-Cache-Control': 'max-age=30',
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


