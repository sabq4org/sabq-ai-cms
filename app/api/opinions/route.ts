import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - جلب مقالات الرأي مع فلاتر متقدمة
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // معاملات البحث والفلترة
    const status = searchParams.get('status') || 'published'
    const authorId = searchParams.get('author_id')
    const featured = searchParams.get('featured')
    const pinned = searchParams.get('pinned')
    const mood = searchParams.get('mood')
    const opinionType = searchParams.get('opinion_type')
    const tags = searchParams.get('tags')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort_by') || 'latest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const hasAudio = searchParams.get('has_audio')

    // بناء شروط البحث
    const where: any = {
      type: 'OPINION'
    }

    // فلتر الحالة
    if (status !== 'all') {
      where.status = status
    }

    // فلتر الكاتب
    if (authorId) {
      where.opinion_author_id = authorId
    }

    // فلتر البحث النصي
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // فلتر الوسوم
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim())
      where.metadata = {
        path: ['tags'],
        array_contains: tagList
      }
    }

    // فلتر المميزة
    if (featured !== null) {
      where.OR = [
        { featured: featured === 'true' },
        { 
          metadata: {
            path: ['is_featured'],
            equals: featured === 'true'
          }
        }
      ]
    }

    // فلتر المثبتة
    if (pinned !== null) {
      where.metadata = {
        path: ['is_pinned'],
        equals: pinned === 'true'
      }
    }

    // فلتر النبرة
    if (mood) {
      where.metadata = {
        path: ['mood'],
        equals: mood
      }
    }

    // فلتر نوع المقال
    if (opinionType) {
      where.metadata = {
        path: ['opinion_type'],
        equals: opinionType
      }
    }

    // فلتر الملخص الصوتي
    if (hasAudio !== null) {
      if (hasAudio === 'true') {
        where.metadata = {
          path: ['audio_url'],
          not: null
        }
      } else {
        where.OR = [
          {
            metadata: {
              path: ['audio_url'],
              equals: null
            }
          },
          {
            metadata: {
              path: ['audio_url'],
              equals: undefined
            }
          }
        ]
      }
    }

    // ترتيب النتائج
    let orderBy: any = {}
    switch (sortBy) {
      case 'latest':
        orderBy = { published_at: 'desc' }
        break
      case 'oldest':
        orderBy = { published_at: 'asc' }
        break
      case 'views':
        orderBy = { views: 'desc' }
        break
      case 'likes':
        orderBy = { likes: 'desc' }
        break
      case 'comments':
        orderBy = { comments: { _count: 'desc' } }
        break
      case 'trending':
        // ترتيب بناءً على التفاعل الحديث
        orderBy = [
          { featured: 'desc' },
          { views: 'desc' },
          { likes: 'desc' }
        ]
        break
      default:
        orderBy = { created_at: 'desc' }
    }

    // جلب المقالات مع العلاقات
    const articles = await prisma.articles.findMany({
      where,
      include: {
        opinion_author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            specialization: true,
            bio: true,
            social_links: true,
            is_verified: true,
            articles_count: true,
            total_views: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        _count: {
          select: {
            comments: true,
            article_interactions: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: (page - 1) * limit
    })

    // حساب إجمالي العدد للصفحات
    const totalCount = await prisma.articles.count({ where })
    const totalPages = Math.ceil(totalCount / limit)

    // تحويل البيانات للشكل المطلوب
    const transformedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      status: article.status,
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      comments: article._count.comments,
      interactions: article._count.article_interactions,
      reading_time: article.reading_time,
      featured_image: article.featured_image,
      created_at: article.created_at,
      updated_at: article.updated_at,
      published_at: article.published_at,
      scheduled_at: article.scheduled_at,
      allow_comments: article.allow_comments,
      
      // معلومات الكاتب
      opinion_author: article.opinion_author,
      author_id: article.author_id,
      author_name: article.opinion_author?.name || 'غير محدد',
      
      // التصنيف
      category: article.category,
      
      // البيانات الوصفية
      metadata: {
        ...article.metadata as any,
        is_featured: article.featured || (article.metadata as any)?.is_featured || false,
        is_pinned: (article.metadata as any)?.is_pinned || false,
        opinion_type: (article.metadata as any)?.opinion_type || 'short',
        mood: (article.metadata as any)?.mood || 'neutral',
        tags: (article.metadata as any)?.tags || [],
        seo_title: (article.metadata as any)?.seo_title,
        seo_description: (article.metadata as any)?.seo_description,
        audio_url: (article.metadata as any)?.audio_url,
        audio_summary_text: (article.metadata as any)?.audio_summary_text,
        key_points: (article.metadata as any)?.key_points || [],
        related_topics: (article.metadata as any)?.related_topics || [],
        is_trending: (article.metadata as any)?.is_trending || false,
        is_breaking: (article.metadata as any)?.is_breaking || false
      }
    }))

    // إحصائيات إضافية
    const stats = {
      total: totalCount,
      published: await prisma.articles.count({ 
        where: { ...where, status: 'published' } 
      }),
      draft: await prisma.articles.count({ 
        where: { ...where, status: 'draft' } 
      }),
      pending: await prisma.articles.count({ 
        where: { ...where, status: 'pending_review' } 
      }),
      scheduled: await prisma.articles.count({ 
        where: { ...where, status: 'scheduled' } 
      }),
      featured: await prisma.articles.count({
        where: {
          ...where,
          OR: [
            { featured: true },
            { 
              metadata: {
                path: ['is_featured'],
                equals: true
              }
            }
          ]
        }
      })
    }

    return NextResponse.json({
      success: true,
      articles: transformedArticles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats,
      filters: {
        status,
        authorId,
        featured,
        pinned,
        mood,
        opinionType,
        tags,
        search,
        sortBy,
        hasAudio
      }
    })

  } catch (error) {
    console.error('Error fetching opinion articles:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب مقالات الرأي',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// POST - إنشاء مقال رأي جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      content,
      excerpt,
      opinionAuthorId,
      status = 'draft',
      tags = [],
      reading_time,
      allow_comments = true,
      scheduled_at,
      metadata = {}
    } = body

    // التحقق من البيانات المطلوبة
    if (!title || !content || !opinionAuthorId) {
      return NextResponse.json({
        success: false,
        error: 'البيانات المطلوبة مفقودة',
        required: ['title', 'content', 'opinionAuthorId']
      }, { status: 400 })
    }

    // التحقق من وجود الكاتب
    const author = await prisma.opinion_authors.findUnique({
      where: { id: opinionAuthorId }
    })

    if (!author) {
      return NextResponse.json({
        success: false,
        error: 'الكاتب المحدد غير موجود'
      }, { status: 404 })
    }

    // البحث عن تصنيف الرأي
    let opinionCategory = await prisma.categories.findFirst({
      where: {
        OR: [
          { slug: 'opinion' },
          { name: 'رأي' }
        ]
      }
    })

    // إنشاء التصنيف إذا لم يكن موجوداً
    if (!opinionCategory) {
      opinionCategory = await prisma.categories.create({
        data: {
          id: crypto.randomUUID(),
          name: 'رأي',
          slug: 'opinion',
          description: 'مقالات الرأي والتحليلات',
          color: '#8B5CF6',
          icon: '💭',
          display_order: 1,
          is_active: true
        }
      })
    }

    // إنشاء slug فريد
    let slug = title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // التحقق من فرادة الـ slug
    const existingSlug = await prisma.articles.findFirst({
      where: { slug }
    })

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    // إعداد البيانات الوصفية
    const articleMetadata = {
      opinion_type: metadata.opinion_type || 'short',
      mood: metadata.mood || 'neutral',
      is_featured: metadata.is_featured || false,
      is_pinned: metadata.is_pinned || false,
      tags: tags,
      seo_title: metadata.seo_title || title,
      seo_description: metadata.seo_description || excerpt,
      enable_audio_summary: metadata.enable_audio_summary || false,
      audio_summary_text: metadata.audio_summary_text,
      audio_url: metadata.audio_url,
      key_points: metadata.key_points || [],
      related_topics: metadata.related_topics || [],
      is_trending: metadata.is_trending || false,
      is_breaking: metadata.is_breaking || false,
      ...(scheduled_at && { scheduled_at })
    }

    // إنشاء المقال
    const article = await prisma.articles.create({
      data: {
        id: crypto.randomUUID(),
        title,
        slug,
        content,
        excerpt: excerpt || title.substring(0, 200),
        type: 'OPINION',
        status,
        category_id: opinionCategory.id,
        opinion_author_id: opinionAuthorId,
        author_id: opinionAuthorId, // للتوافق مع النظام القديم
        reading_time: reading_time || Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200),
        allow_comments,
        published_at: status === 'published' ? new Date() : null,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
        metadata: articleMetadata,
        views: 0,
        likes: 0,
        shares: 0
      },
      include: {
        opinion_author: true,
        category: true
      }
    })

    // تحديث عداد مقالات الكاتب
    await prisma.opinion_authors.update({
      where: { id: opinionAuthorId },
      data: {
        articles_count: {
          increment: 1
        },
        last_article_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        created_at: article.created_at,
        published_at: article.published_at,
        opinion_author: article.opinion_author,
        category: article.category
      },
      message: status === 'published' 
        ? 'تم نشر مقال الرأي بنجاح' 
        : 'تم حفظ مقال الرأي كمسودة'
    })

  } catch (error) {
    console.error('Error creating opinion article:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء مقال الرأي',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// PUT - تحديث إعدادات مقالات الرأي بشكل مجمع
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, articleIds, data } = body

    if (!action || !articleIds || !Array.isArray(articleIds)) {
      return NextResponse.json({
        success: false,
        error: 'معاملات مطلوبة: action, articleIds'
      }, { status: 400 })
    }

    let result

    switch (action) {
      case 'bulk_publish':
        result = await prisma.articles.updateMany({
          where: {
            id: { in: articleIds },
            type: 'OPINION'
          },
          data: {
            status: 'published',
            published_at: new Date()
          }
        })
        break

      case 'bulk_draft':
        result = await prisma.articles.updateMany({
          where: {
            id: { in: articleIds },
            type: 'OPINION'
          },
          data: {
            status: 'draft',
            published_at: null
          }
        })
        break

      case 'bulk_feature':
        result = await prisma.articles.updateMany({
          where: {
            id: { in: articleIds },
            type: 'OPINION'
          },
          data: {
            featured: true,
            metadata: {
              ...data.metadata,
              is_featured: true
            }
          }
        })
        break

      case 'bulk_unfeature':
        result = await prisma.articles.updateMany({
          where: {
            id: { in: articleIds },
            type: 'OPINION'
          },
          data: {
            featured: false,
            metadata: {
              ...data.metadata,
              is_featured: false
            }
          }
        })
        break

      case 'bulk_pin':
        // تحديث البيانات الوصفية لإضافة التثبيت
        for (const articleId of articleIds) {
          await prisma.articles.update({
            where: { id: articleId },
            data: {
              metadata: {
                ...data.metadata,
                is_pinned: true
              }
            }
          })
        }
        result = { count: articleIds.length }
        break

      case 'bulk_unpin':
        for (const articleId of articleIds) {
          await prisma.articles.update({
            where: { id: articleId },
            data: {
              metadata: {
                ...data.metadata,
                is_pinned: false
              }
            }
          })
        }
        result = { count: articleIds.length }
        break

      case 'bulk_delete':
        result = await prisma.articles.deleteMany({
          where: {
            id: { in: articleIds },
            type: 'OPINION'
          }
        })
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'إجراء غير مدعوم'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      updated: result.count,
      action,
      message: `تم تحديث ${result.count} مقال بنجاح`
    })

  } catch (error) {
    console.error('Error bulk updating opinion articles:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث المقالات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// DELETE - حذف مقالات الرأي (نقل إلى المهملات)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const articleIds = searchParams.get('ids')?.split(',') || []
    const permanent = searchParams.get('permanent') === 'true'

    if (articleIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم تحديد مقالات للحذف'
      }, { status: 400 })
    }

    let result

    if (permanent) {
      // حذف نهائي
      result = await prisma.articles.deleteMany({
        where: {
          id: { in: articleIds },
          type: 'OPINION'
        }
      })
    } else {
      // نقل إلى المهملات
      result = await prisma.articles.updateMany({
        where: {
          id: { in: articleIds },
          type: 'OPINION'
        },
        data: {
          status: 'deleted',
          deleted_at: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      deleted: result.count,
      permanent,
      message: permanent 
        ? `تم حذف ${result.count} مقال نهائياً`
        : `تم نقل ${result.count} مقال إلى المهملات`
    })

  } catch (error) {
    console.error('Error deleting opinion articles:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف المقالات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
}
