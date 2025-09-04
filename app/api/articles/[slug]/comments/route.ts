import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cache as redisCache, CACHE_TTL } from "@/lib/redis";

export const runtime = "nodejs";

// كاش في الذاكرة
const memCache = new Map<string, { ts: number; data: any }>();
const MEM_TTL = 60 * 1000; // دقيقة واحدة

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const offset = (page - 1) * limit;
    
    const cacheKey = `comments:${slug}:${page}:${limit}`;
    
    // 1. كاش الذاكرة
    const memCached = memCache.get(cacheKey);
    if (memCached && Date.now() - memCached.ts < MEM_TTL) {
      return NextResponse.json(memCached.data, {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60",
          "X-Cache": "MEMORY",
        },
      });
    }
    
    // 2. Redis
    try {
      const cached = await redisCache.get<any>(cacheKey);
      if (cached) {
        memCache.set(cacheKey, { ts: Date.now(), data: cached });
        return NextResponse.json(cached, {
          headers: {
            "Cache-Control": "public, max-age=30, s-maxage=60",
            "X-Cache": "REDIS",
          },
        });
      }
    } catch (redisError) {
      console.warn("Redis error:", redisError);
    }
    
    // 3. جلب المقال أولاً للحصول على ID
    const article = await prisma.articles.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: "published",
      },
      select: { id: true },
    });
    
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    
    // 4. جلب التعليقات
    const [comments, total] = await Promise.all([
      prisma.comments.findMany({
        where: {
          article_id: article.id,
          status: "approved",
          parent_id: null, // التعليقات الرئيسية فقط
        },
        select: {
          id: true,
          content: true,
          created_at: true,
          likes: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          // الردود
          replies: {
            where: { status: "approved" },
            select: {
              id: true,
              content: true,
              created_at: true,
              likes: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: { created_at: "asc" },
            take: 3, // أول 3 ردود فقط
          },
        },
        orderBy: { created_at: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.comments.count({
        where: {
          article_id: article.id,
          status: "approved",
          parent_id: null,
        },
      }),
    ]);
    
    const response = {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    // حفظ في الكاش
    try {
      await redisCache.set(cacheKey, response, 60); // دقيقة واحدة فقط للتعليقات
    } catch (redisError) {
      console.warn("Failed to save to Redis:", redisError);
    }
    
    memCache.set(cacheKey, { ts: Date.now(), data: response });
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60",
        "X-Cache": "MISS",
      },
    });
    
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
