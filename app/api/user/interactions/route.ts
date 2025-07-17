import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

// GET: جلب تفاعلات المستخدم مع المقالات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'saved' // saved, liked, shared
    const sort = searchParams.get('sort') || 'recent'
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    console.log('📚 جلب تفاعلات المستخدم:', { userId, type, sort, category, search })

    // تحديد نوع التفاعل
    const interactionType = type === 'saved' ? 'save' : type === 'liked' ? 'like' : 'share'

    // بناء شروط البحث
    const whereClause: any = {
      user_id: userId,
      type: interactionType
    }

    // حساب الإزاحة للصفحات
    const skip = (page - 1) * limit

    // جلب التفاعلات مع معرفات المقالات
    const [interactions, totalCount, stats] = await Promise.all([
      prisma.interactions.findMany({
        where: whereClause,
        orderBy: getOrderBy(sort),
        skip,
        take: limit
      }),
      prisma.interactions.count({ where: whereClause }),
      getUserInteractionStats(userId)
    ])

    // جلب تفاصيل المقالات
    const articleIds = interactions.map(i => i.article_id)
    const articlesData = await prisma.articles.findMany({
      where: { id: { in: articleIds } },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // دمج البيانات
    let articles = interactions
      .map(interaction => {
        const article = articlesData.find(a => a.id === interaction.article_id)
        if (!article) return null

        return {
          ...article,
          interaction_date: interaction.created_at.toISOString(),
          interaction_type: interaction.type,
          reading_progress: interaction.reading_progress || 0,
          
          // تحويل التاريخات لـ strings
          created_at: article.created_at.toISOString(),
          published_at: article.published_at?.toISOString(),
          
          // معلومات التصنيف
          category_name: article.category?.name,
          category_id: article.category_id ? parseInt(article.category_id) : 0,
          
          // معلومات الكاتب
          author_name: article.author?.name
        }
      })
      .filter(Boolean) as any[]

    // تطبيق فلاتر إضافية
    if (category) {
      articles = articles.filter(article => article.category_name === category)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt?.toLowerCase().includes(searchLower) ||
        article.summary?.toLowerCase().includes(searchLower)
      )
    }

    // حساب الإحصائيات الفرعية
    const categoryStats = articles.reduce((acc: Record<string, number>, article) => {
      const catName = article.category_name || 'غير محدد'
      acc[catName] = (acc[catName] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        articles,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        stats,
        filters: {
          categories: Object.keys(categoryStats),
          categoryStats
        }
      }
    })

  } catch (error) {
    console.error('❌ خطأ في جلب تفاعلات المستخدم:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

// Helper Functions

function getOrderBy(sort: string): any {
  switch (sort) {
    case 'recent':
      return { created_at: 'desc' as const }
    case 'oldest':
      return { created_at: 'asc' as const }
    case 'popular':
      return { created_at: 'desc' as const } // fallback since article relation may not work
    case 'title':
      return { created_at: 'desc' as const } // fallback since article relation may not work
    default:
      return { created_at: 'desc' as const }
  }
}

async function getUserInteractionStats(userId: string) {
  try {
    const [saves, likes, shares] = await Promise.all([
      prisma.interactions.count({
        where: { user_id: userId, type: 'save' }
      }),
      prisma.interactions.count({
        where: { user_id: userId, type: 'like' }
      }),
      prisma.interactions.count({
        where: { user_id: userId, type: 'share' }
      })
    ])

    return {
      saved: saves,
      liked: likes,
      shared: shares,
      total: saves + likes + shares
    }
  } catch (error) {
    console.error('خطأ في حساب إحصائيات التفاعل:', error)
    return {
      saved: 0,
      liked: 0,
      shared: 0,
      total: 0
    }
  }
}

// POST: تصدير تفاعلات المستخدم
export async function POST(request: NextRequest) {
  try {
    const { userId, format = 'json' } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    // جلب جميع التفاعلات
    const interactions = await prisma.interactions.findMany({
      where: { user_id: userId },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            excerpt: true,
            category_id: true,
            author_id: true,
            published_at: true,
            views: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // تنسيق البيانات للتصدير
    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      total_interactions: interactions.length,
      interactions: interactions.map(interaction => ({
        type: interaction.type,
        date: interaction.created_at.toISOString(),
        article: {
          id: interaction.article.id,
          title: interaction.article.title,
          excerpt: interaction.article.excerpt,
          published_at: interaction.article.published_at?.toISOString()
        },
        metadata: interaction.metadata
      })),
      statistics: await getUserInteractionStats(userId)
    }

    if (format === 'csv') {
      // تحويل لـ CSV
      const csv = convertToCSV(exportData.interactions)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="interactions-${userId}-${Date.now()}.csv"`
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: exportData
    })

  } catch (error) {
    console.error('❌ خطأ في تصدير التفاعلات:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في تصدير البيانات' },
      { status: 500 }
    )
  }
}

function convertToCSV(interactions: any[]): string {
  const headers = ['Type', 'Date', 'Article Title', 'Article ID', 'Published Date']
  const rows = interactions.map(interaction => [
    interaction.type,
    interaction.date,
    interaction.article.title,
    interaction.article.id,
    interaction.article.published_at || ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n')

  return csvContent
} 