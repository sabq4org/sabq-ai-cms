import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - جلب المقالات مع الفلاتر
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const authorId = searchParams.get('author_id')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const sortBy = searchParams.get('sort_by') || 'latest'

    // بناء شروط البحث
    const where: any = {
      isActive: true
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (category) {
      where.category = category
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    // ترتيب النتائج
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'views':
        orderBy = { viewsCount: 'desc' }
        break
      case 'likes':
        orderBy = { likesCount: 'desc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // جلب المقالات
    const [articles, total] = await Promise.all([
      prisma.opinion_articles.findMany({
        where,
        include: {
          opinion_authors: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.opinion_articles.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('خطأ في جلب المقالات:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المقالات' },
      { status: 500 }
    )
  }
}

// POST - إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      content,
      excerpt,
      authorId,
      category,
      type,
      mood,
      isFeatured = false,
      isPinned = false,
      status = 'draft',
      scheduledAt,
      metadata = {}
    } = body

    // التحقق من الحقول المطلوبة
    if (!title || !content || !authorId) {
      return NextResponse.json(
        { success: false, error: 'العنوان والمحتوى والكاتب مطلوبة' },
        { status: 400 }
      )
    }

    // إنشاء slug من العنوان
    const slug = title
      .replace(/[^\u0600-\u06FF\u0750-\u077F\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()

    // حساب وقت القراءة
    const wordsCount = content.split(/\s+/).length
    const readingTime = Math.ceil(wordsCount / 200) // 200 كلمة في الدقيقة

    const article = await prisma.opinion_articles.create({
      data: {
        id: `opinion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        authorId,
        category: category || 'general',
        status: status as 'draft' | 'published' | 'archived' || 'draft',
        readingTime: readingTime,
        publishedAt: status === 'published' ? new Date() : undefined,
        updatedAt: new Date(),
        metadata: {
          ...metadata,
          wordCount: wordsCount,
          createdBy: 'dashboard',
          isFeatured,
          isPinned,
          type,
          mood
        }
      },
      include: {
        opinion_authors: true
      }
    })

    return NextResponse.json({
      success: true,
      data: article,
      message: 'تم إنشاء المقال بنجاح'
    })

  } catch (error) {
    console.error('خطأ في إنشاء المقال:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المقال' },
      { status: 500 }
    )
  }
}

// PUT - تحديث مقال
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المقال مطلوب' },
        { status: 400 }
      )
    }

    // تحديث وقت القراءة إذا تم تحديث المحتوى
    if (updateData.content) {
      const wordsCount = updateData.content.split(/\s+/).length
      updateData.readingTime = Math.ceil(wordsCount / 200)
      updateData.metadata = {
        ...updateData.metadata,
        wordCount: wordsCount,
        lastUpdatedBy: 'dashboard'
      }
    }

    // إضافة updatedAt
    updateData.updatedAt = new Date()

    // تحديث تاريخ النشر إذا تم تغيير الحالة إلى منشور
    if (updateData.status === 'published') {
      updateData.publishedAt = new Date()
    }

    const article = await prisma.opinion_articles.update({
      where: { id },
      data: updateData,
      include: {
        opinion_authors: true
      }
    })

    return NextResponse.json({
      success: true,
      data: article,
      message: 'تم تحديث المقال بنجاح'
    })

  } catch (error) {
    console.error('خطأ في تحديث المقال:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث المقال' },
      { status: 500 }
    )
  }
}

// DELETE - حذف مقال
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المقال مطلوب' },
        { status: 400 }
      )
    }

    await prisma.opinion_articles.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف المقال بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف المقال:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المقال' },
      { status: 500 }
    )
  }
}
