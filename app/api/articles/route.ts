import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCachedCategories } from '@/lib/services/categoriesCache'
import { dbConnectionManager } from '@/lib/db-connection-manager'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const status = searchParams.get('status') || 'published'
  
  const skip = (page - 1) * limit
  
  try {
    // استخدام مدير الاتصال لضمان استقرار الاستعلام
    const result = await dbConnectionManager.executeWithConnection(async () => {
      // بناء شروط البحث
      const where: any = {
        status: status
      }
      
      if (category) {
        where.category_id = category
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { excerpt: { contains: search } }
        ]
      }
      
      // جلب المقالات والعدد الإجمالي بشكل متوازي
      const [articles, total] = await Promise.all([
        prisma.articles.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            published_at: 'desc'
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            categories: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        }),
        prisma.articles.count({ where })
      ])
      
      return { articles, total }
    })
    
    // إضافة معلومات التصنيفات من cache للمقالات التي لا تحتوي عليها
    const categoriesResult = await getCachedCategories()
    const categoriesMap = new Map(categoriesResult.categories.map(c => [c.id, c]))
    
    const articlesWithCategories = result.articles.map(article => {
      if (!article.categories && article.category_id) {
        const categoryInfo = categoriesMap.get(article.category_id)
        if (categoryInfo) {
          return { ...article, categories: categoryInfo }
        }
      }
      return article
    })
    
    return NextResponse.json({
      success: true,
      articles: articlesWithCategories,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      },
      cache: {
        categoriesFromCache: categoriesResult.fromCache,
        categoriesCacheAge: categoriesResult.cacheAge
      }
    })
    
  } catch (error: any) {
    console.error('❌ خطأ في جلب المقالات:', error)
    
    // معالجة أخطاء الاتصال
    if (error.message?.includes('connection') || error.code === 'P2024') {
      return NextResponse.json({
        success: false,
        error: 'مشكلة في الاتصال بقاعدة البيانات',
        details: 'يرجى المحاولة مرة أخرى',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب المقالات',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const article = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.create({
        data: {
          ...data,
          id: data.id || generateId(),
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    })
    
    return NextResponse.json({
      success: true,
      article
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء المقال:', error)
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء المقال',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// دالة مساعدة لتوليد ID
function generateId() {
  return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
