import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '@/lib/prisma'

// جلب المقالات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // استخراج المعاملات
    const status = searchParams.get('status') || 'published'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit
    const featured = searchParams.get('featured') === 'true'
    const breaking = searchParams.get('breaking') === 'true'
    const categorySlug = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort') || 'published_at'
    const order = searchParams.get('order') || 'desc'

    // بناء شروط البحث
    const where: any = {
      status,
      ...(featured && { featured: true }),
      ...(breaking && { breaking: true }),
      ...(categorySlug && {
        category: {
          slug: categorySlug
        }
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // تحديد الترتيب
    const orderBy: any = {}
    if (sortBy === 'published_at') {
      orderBy.publishedAt = order
    } else if (sortBy === 'created_at') {
      orderBy.createdAt = order
    } else if (sortBy === 'views') {
      orderBy.views = order
    } else if (sortBy === 'title') {
      orderBy.title = order
    }

    // جلب المقالات مع العلاقات
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          _count: {
            select: {
              interactions: true,
              comments: {
                where: { status: 'approved' }
              }
            }
          },
          interactions: {
            where: {
              type: 'like'
            },
            select: {
              userId: true
            }
          }
        }
      }),
      prisma.article.count({ where })
    ])

    // تحويل البيانات لتتوافق مع الواجهة الحالية
    const formattedArticles = articles.map(article => ({
      ...article,
      author_name: article.author?.name || 'مجهول',
      author_email: article.author?.email,
      author_avatar: article.author?.avatar,
      category_name: article.category?.name,
      category_slug: article.category?.slug,
      likes_count: article._count.interactions,
      comments_count: article._count.comments,
      liked_by: article.interactions.map(i => i.userId),
      // إزالة الحقول الإضافية
      author: undefined,
      category: undefined,
      _count: undefined,
      interactions: undefined
    }))

    // معلومات الصفحات
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المقالات' },
      { status: 500 }
    )
  }
}

// إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // التحقق من البيانات المطلوبة
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'العنوان والمحتوى مطلوبان' },
        { status: 400 }
      )
    }

    // إنشاء slug من العنوان
    const slug = data.slug || generateSlug(data.title)
    
    // التحقق من وجود slug مماثل
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })
    
    if (existingArticle) {
      return NextResponse.json(
        { error: 'يوجد مقال آخر بنفس العنوان' },
        { status: 400 }
      )
    }

    // إنشاء المقال
    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || generateExcerpt(data.content),
        status: data.status || 'draft',
        featured: data.featured || false,
        breaking: data.breaking || false,
        featuredImage: data.featured_image,
        metadata: data.metadata || {},
        tags: data.tags || [],
        authorId: data.author_id,
        categoryId: data.category_id,
        publishedAt: data.status === 'published' ? new Date() : null,
        scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        category: true
      }
    })

    // إذا كان المقال منشوراً، أنشئ تحليل عميق له
    if (article.status === 'published' && data.ai_analysis) {
      await prisma.deepAnalysis.create({
        data: {
          articleId: article.id,
          aiSummary: data.ai_analysis.summary,
          keyPoints: data.ai_analysis.key_points,
          tags: data.ai_analysis.tags,
          sentiment: data.ai_analysis.sentiment,
          readabilityScore: data.ai_analysis.readability_score,
          estimatedReadTime: data.ai_analysis.estimated_read_time
        }
      })
    }

    // تسجيل النشاط
    if (data.author_id) {
      await prisma.activityLog.create({
        data: {
          userId: data.author_id,
          action: 'article_created',
          entityType: 'article',
          entityId: article.id,
          newValue: { title: article.title, status: article.status },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
    }

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    const errorMessage = handlePrismaError(error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// دوال مساعدة
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0600-\u06FF]/g, '') // السماح بالأحرف العربية
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function generateExcerpt(content: string, length: number = 150): string {
  // إزالة HTML tags
  const plainText = content.replace(/<[^>]*>/g, '')
  
  // قص النص
  if (plainText.length <= length) return plainText
  
  // قص عند آخر مسافة قبل الحد
  const trimmed = plainText.substr(0, length)
  const lastSpace = trimmed.lastIndexOf(' ')
  
  return lastSpace > 0 
    ? trimmed.substr(0, lastSpace) + '...'
    : trimmed + '...'
} 