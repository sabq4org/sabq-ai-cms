import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { filterTestContent, rejectTestContent } from '@/lib/data-protection'

// جلب المقالات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // بناء شروط البحث
    const where: any = {}
    
    // فلترة حسب الحالة
    const status = searchParams.get('status')
    if (status) {
      where.status = status
    } else {
      // استبعاد المقالات المحذوفة بشكل افتراضي
      where.status = { not: 'deleted' }
    }

    // فلترة حسب التصنيف
    const categoryId = searchParams.get('category_id')
    if (categoryId) {
      where.categoryId = categoryId
    }

    // فلترة حسب المؤلف
    const authorId = searchParams.get('author_id')
    if (authorId) {
      where.authorId = authorId
    }

    // البحث في العنوان والمحتوى
    const search = searchParams.get('search')
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } }
      ]
    }

    // فلترة المقالات المميزة
    const featured = searchParams.get('featured')
    if (featured === 'true') {
      where.featured = true
    }

    // فلترة الأخبار العاجلة
    const breaking = searchParams.get('breaking')
    if (breaking === 'true') {
      where.breaking = true
    }

    // الترتيب
    const sortField = searchParams.get('sort') || 'created_at'
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'
    
    let orderBy: any = {}
    switch (sortField) {
      case 'title':
        orderBy = { title: order }
        break
      case 'views':
        orderBy = { views: order }
        break
      case 'published_at':
        orderBy = { publishedAt: order }
        break
      default:
        orderBy = { createdAt: order }
    }

    // التقسيم (Pagination)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // جلب المقالات مع العلاقات
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          category: true,
          deepAnalysis: true,
          _count: {
            select: {
              interactions: true,
              comments: true
            }
          }
        }
      }),
      prisma.article.count({ where })
    ])

    // تحويل البيانات للتوافق مع الواجهة القديمة
    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      summary: article.excerpt,
      author_id: article.authorId,
      author: article.author,
      category_id: article.categoryId,
      category_name: article.category?.name || 'غير مصنف',
      status: article.status,
      featured_image: article.featuredImage,
      is_breaking: article.breaking,
      is_featured: article.featured,
      views_count: article.views,
      reading_time: article.readingTime || calculateReadingTime(article.content),
      created_at: article.createdAt.toISOString(),
      updated_at: article.updatedAt.toISOString(),
      published_at: article.publishedAt?.toISOString(),
      tags: article.metadata && typeof article.metadata === 'object' && 'tags' in article.metadata ? (article.metadata as any).tags : [],
      interactions_count: article._count.interactions,
      comments_count: article._count.comments
    }))

    // تصفية المحتوى التجريبي في الإنتاج
    const filteredArticles = filterTestContent(formattedArticles)

    // إحصائيات التقسيم
    const stats = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: skip + limit < total,
      hasPrev: page > 1
    }

    return NextResponse.json({
      success: true,
      articles: filteredArticles,
      data: filteredArticles,
      pagination: stats,
      filters: {
        status: searchParams.get('status'),
        category_id: searchParams.get('category_id'),
        search: searchParams.get('search'),
        featured: searchParams.get('featured'),
        breaking: searchParams.get('breaking')
      }
    })
  } catch (error) {
    console.error('خطأ في جلب المقالات:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في استرجاع المقالات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // سجل تصحيح
    console.log('البيانات المستلمة:', {
      title: body.title,
      category_id: body.category_id,
      author_id: body.author_id,
      content_length: body.content?.length || 0
    })
    
    // التحقق من البيانات المطلوبة
    if (!body.title || (!body.content && !body.content_html)) {
      return NextResponse.json({
        success: false,
        error: 'العنوان والمحتوى مطلوبان'
      }, { status: 400 })
    }
    
    // التحقق من المحتوى التجريبي
    const validation = rejectTestContent(body)
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 })
    }

    // إعداد البيانات للحفظ
    const articleData: any = {
      title: body.title.trim(),
      slug: generateSlug(body.title),
      content: body.content,
      excerpt: body.summary?.trim(),
      status: body.status || 'draft',
      featured: body.is_featured || false,
      breaking: body.is_breaking || false,
      views: 0,
      featuredImage: body.featured_image,
      metadata: {
        seo_title: body.seo_title,
        seo_description: body.seo_description,
        seo_keywords: body.seo_keywords,
        tags: body.tags || []
      }
    }

    // ربط المؤلف
    if (body.author_id) {
      articleData.authorId = body.author_id
    }

    // ربط التصنيف
    if (body.category_id && body.category_id !== '') {
      // categoryId في قاعدة البيانات هو String
      articleData.categoryId = String(body.category_id)
    }

    // معالجة الجدولة الزمنية
    if (body.publish_at) {
      const publishDate = new Date(body.publish_at)
      const now = new Date()
      
      if (publishDate > now) {
        articleData.status = 'scheduled'
        articleData.scheduledAt = publishDate
      } else {
        articleData.status = 'published'
        articleData.publishedAt = publishDate
      }
    } else if (body.status === 'published') {
      articleData.publishedAt = new Date()
    }

    // التحقق من عدم تكرار الـ slug
    let finalSlug = articleData.slug
    let counter = 1
    while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${articleData.slug}-${counter}`
      counter++
    }
    articleData.slug = finalSlug

    // إنشاء المقال
    const newArticle = await prisma.article.create({
      data: articleData,
      include: {
        author: true,
        category: true
      }
    })

    // إنشاء تحليل عميق للمقال (اختياري)
    if (newArticle.content.length > 100) {
      await prisma.deepAnalysis.create({
        data: {
          articleId: newArticle.id,
          readabilityScore: 75.5 // يمكن حسابها بشكل أكثر تطوراً
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: newArticle,
      message: 'تم إنشاء المقال بنجاح'
    }, { status: 201 })
  } catch (error) {
    console.error('خطأ في إنشاء المقال:', error)
    
    // معالجة أخطاء Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      if (prismaError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'العنوان أو الـ slug مستخدم بالفعل'
        }, { status: 400 })
      }
      if (prismaError.code === 'P2003') {
        return NextResponse.json({
          success: false,
          error: 'بيانات غير صحيحة: تحقق من المؤلف والتصنيف'
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء المقال',
      message: error instanceof Error ? error.message : 'خطأ غير معروف',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// دوال مساعدة
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function calculateReadingTime(content: string): number {
  const wordsCount = content.split(/\s+/).length
  return Math.ceil(wordsCount / 200)
}

// DELETE: حذف مقالات (حذف ناعم)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const ids = body.ids || []

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'معرفات المقالات مطلوبة'
      }, { status: 400 })
    }

    // تحديث حالة المقالات إلى "محذوف"
    const result = await prisma.article.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        status: 'deleted'
      }
    })

    return NextResponse.json({
      success: true,
      affected: result.count,
      message: `تم حذف ${result.count} مقال(ات) بنجاح`
    })
  } catch (error) {
    console.error('خطأ في حذف المقالات:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف المقالات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
} 