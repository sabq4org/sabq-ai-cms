import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cache } from '@/lib/redis'
import { CACHE_KEYS, CACHE_TTL } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit
    
    // إنشاء مفتاح التخزين المؤقت
    const cacheKey = `news:latest:${limit}:${page}`
    
    // محاولة جلب البيانات من Redis
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      console.log('✅ تم جلب الأخبار من Redis cache')
      return NextResponse.json(cachedData)
    }
    
    // جلب الأخبار من قاعدة البيانات
    const [articles, total] = await Promise.all([
      prisma.articles.findMany({
        where: {
          status: 'published',
          NOT: { status: 'deleted' }
        },
        orderBy: {
          published_at: 'desc'
        },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          published_at: true,
          views: true,
          reading_time: true,
          breaking: true,
          featured: true,
          author_id: true,
          category_id: true,
          metadata: true
        }
      }),
      prisma.articles.count({
        where: {
          status: 'published',
          NOT: { status: 'deleted' }
        }
      })
    ])
    
    // جلب معلومات المؤلفين والتصنيفات
    const authorIds = [...new Set(articles.map(a => a.author_id).filter(Boolean))]
    const categoryIds = [...new Set(articles.map(a => a.category_id).filter(Boolean))]
    
    const [authors, categories] = await Promise.all([
      authorIds.length > 0 ? prisma.users.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, name: true, email: true }
      }) : [],
      categoryIds.length > 0 ? prisma.categories.findMany({
        where: { id: { in: categoryIds as string[] } },
        select: { 
          id: true, 
          name: true, 
          slug: true, 
          color: true, 
          icon: true 
        }
      }) : []
    ])
    
    // دمج البيانات
    const authorsMap = new Map(authors.map(a => [a.id, a]))
    const categoriesMap = new Map(categories.map(c => [c.id, c]))
    
    const enrichedArticles = articles.map(article => ({
      ...article,
      author: article.author_id ? authorsMap.get(article.author_id) : null,
      category: article.category_id ? categoriesMap.get(article.category_id) : null,
      author_name: article.author_id ? authorsMap.get(article.author_id)?.name : null,
      category_name: article.category_id ? categoriesMap.get(article.category_id)?.name : null,
      category_color: article.category_id ? categoriesMap.get(article.category_id)?.color : null
    }))
    
    const responseData = {
      success: true,
      articles: enrichedArticles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    }
    
    // حفظ في Redis
    await cache.set(cacheKey, responseData, CACHE_TTL.ARTICLES)
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('❌ خطأ في جلب الأخبار:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الأخبار' },
      { status: 500 }
    )
  }
} 