import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30' // آخر 30 يوم
    const authorId = searchParams.get('author_id')
    const detailed = searchParams.get('detailed') === 'true'

    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // بناء شروط البحث
    const where: any = {
      type: 'OPINION',
      published_at: {
        gte: startDate
      }
    }

    if (authorId) {
      where.opinion_author_id = authorId
    }

    // إحصائيات عامة
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      featuredArticles,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      articlesWithAudio
    ] = await Promise.all([
      // إجمالي المقالات
      prisma.articles.count({
        where: { ...where }
      }),

      // المقالات المنشورة
      prisma.articles.count({
        where: { ...where, status: 'published' }
      }),

      // المسودات
      prisma.articles.count({
        where: { ...where, status: 'draft' }
      }),

      // المقالات المميزة
      prisma.articles.count({
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
      }),

      // إجمالي المشاهدات
      prisma.articles.aggregate({
        where,
        _sum: {
          views: true
        }
      }),

      // إجمالي الإعجابات
      prisma.articles.aggregate({
        where,
        _sum: {
          likes: true
        }
      }),

      // إجمالي التعليقات
      prisma.articles.count({
        where: {
          ...where,
          comments: {
            some: {}
          }
        }
      }),

      // إجمالي المشاركات
      prisma.articles.aggregate({
        where,
        _sum: {
          shares: true
        }
      }),

      // المقالات التي لها ملخص صوتي
      prisma.articles.count({
        where: {
          ...where,
          metadata: {
            path: ['audio_url'],
            not: null
          }
        }
      })
    ])

    // أداء الكتاب
    const topAuthors = await prisma.articles.groupBy({
      by: ['opinion_author_id'],
      where,
      _count: {
        id: true
      },
      _sum: {
        views: true,
        likes: true,
        shares: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // جلب تفاصيل الكتاب
    const authorsDetails = await Promise.all(
      topAuthors.map(async (author) => {
        const authorData = await prisma.opinion_authors.findUnique({
          where: { id: author.opinion_author_id || '' },
          select: {
            id: true,
            name: true,
            avatar: true,
            specialization: true
          }
        })

        return {
          ...authorData,
          articles_count: author._count.id,
          total_views: author._sum.views || 0,
          total_likes: author._sum.likes || 0,
          total_shares: author._sum.shares || 0,
          avg_views_per_article: author._count.id > 0 ? Math.round((author._sum.views || 0) / author._count.id) : 0
        }
      })
    )

    // توزيع المزاج/النبرة
    const moodDistribution = await prisma.$queryRaw`
      SELECT 
        COALESCE(metadata->>'mood', 'neutral') as mood,
        COUNT(*) as count
      FROM articles 
      WHERE type = 'OPINION' 
        AND published_at >= ${startDate}
        ${authorId ? prisma.$queryRaw`AND opinion_author_id = ${authorId}` : prisma.$queryRaw``}
      GROUP BY metadata->>'mood'
      ORDER BY count DESC
    ` as any[]

    // توزيع أنواع المقالات
    const typeDistribution = await prisma.$queryRaw`
      SELECT 
        COALESCE(metadata->>'opinion_type', 'short') as opinion_type,
        COUNT(*) as count
      FROM articles 
      WHERE type = 'OPINION' 
        AND published_at >= ${startDate}
        ${authorId ? prisma.$queryRaw`AND opinion_author_id = ${authorId}` : prisma.$queryRaw``}
      GROUP BY metadata->>'opinion_type'
      ORDER BY count DESC
    ` as any[]

    // أكثر الوسوم استخداماً
    const popularTags = await prisma.$queryRaw`
      SELECT 
        tag_value as tag,
        COUNT(*) as count
      FROM articles,
      LATERAL jsonb_array_elements_text(
        COALESCE(metadata->'tags', '[]'::jsonb)
      ) AS tag_value
      WHERE type = 'OPINION' 
        AND published_at >= ${startDate}
        ${authorId ? prisma.$queryRaw`AND opinion_author_id = ${authorId}` : prisma.$queryRaw``}
      GROUP BY tag_value
      ORDER BY count DESC
      LIMIT 20
    ` as any[]

    // أداء المقالات حسب اليوم (آخر 30 يوم)
    const dailyPerformance = await prisma.$queryRaw`
      SELECT 
        DATE(published_at) as date,
        COUNT(*) as articles_count,
        SUM(views) as total_views,
        SUM(likes) as total_likes,
        AVG(views) as avg_views
      FROM articles 
      WHERE type = 'OPINION' 
        AND published_at >= ${startDate}
        AND status = 'published'
        ${authorId ? prisma.$queryRaw`AND opinion_author_id = ${authorId}` : prisma.$queryRaw``}
      GROUP BY DATE(published_at)
      ORDER BY date DESC
      LIMIT 30
    ` as any[]

    // أعلى المقالات أداءً
    let topPerformingArticles = []
    if (detailed) {
      topPerformingArticles = await prisma.articles.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          likes: true,
          shares: true,
          published_at: true,
          opinion_author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: [
          { views: 'desc' },
          { likes: 'desc' }
        ],
        take: 10
      })
    }

    // حساب معدلات التفاعل
    const engagementRate = totalViews._sum.views ? 
      ((totalLikes._sum.likes || 0) + totalComments + (totalShares._sum.shares || 0)) / totalViews._sum.views * 100 : 0

    // حساب متوسط وقت القراءة
    const avgReadingTime = await prisma.articles.aggregate({
      where,
      _avg: {
        reading_time: true
      }
    })

    // توقعات الأداء (مبسطة)
    const avgDailyArticles = publishedArticles / periodDays
    const projectedMonthlyArticles = Math.round(avgDailyArticles * 30)
    const avgViewsPerArticle = publishedArticles > 0 ? Math.round((totalViews._sum.views || 0) / publishedArticles) : 0

    const analytics = {
      summary: {
        period_days: periodDays,
        total_articles: totalArticles,
        published_articles: publishedArticles,
        draft_articles: draftArticles,
        featured_articles: featuredArticles,
        articles_with_audio: articlesWithAudio,
        total_views: totalViews._sum.views || 0,
        total_likes: totalLikes._sum.likes || 0,
        total_comments: totalComments,
        total_shares: totalShares._sum.shares || 0,
        engagement_rate: Math.round(engagementRate * 100) / 100,
        avg_reading_time: Math.round((avgReadingTime._avg.reading_time || 0) * 100) / 100,
        avg_views_per_article: avgViewsPerArticle
      },

      performance: {
        daily_articles_avg: Math.round(avgDailyArticles * 100) / 100,
        projected_monthly_articles: projectedMonthlyArticles,
        engagement_trend: dailyPerformance.length > 7 ? 
          calculateTrend(dailyPerformance.slice(0, 7).map(d => Number(d.total_views))) : 'stable',
        top_performing_day: dailyPerformance.length > 0 ? 
          dailyPerformance.reduce((max, day) => 
            Number(day.total_views) > Number(max.total_views) ? day : max, dailyPerformance[0]
          ) : null
      },

      content_analysis: {
        mood_distribution: moodDistribution.map(m => ({
          mood: m.mood,
          count: Number(m.count),
          percentage: Math.round((Number(m.count) / totalArticles) * 100)
        })),
        type_distribution: typeDistribution.map(t => ({
          type: t.opinion_type,
          count: Number(t.count),
          percentage: Math.round((Number(t.count) / totalArticles) * 100)
        })),
        popular_tags: popularTags.map(tag => ({
          tag: tag.tag,
          count: Number(tag.count)
        })),
        audio_adoption_rate: totalArticles > 0 ? 
          Math.round((articlesWithAudio / totalArticles) * 100) : 0
      },

      authors_performance: authorsDetails.filter(author => author.id),

      timeline: dailyPerformance.map(day => ({
        date: day.date,
        articles_count: Number(day.articles_count),
        total_views: Number(day.total_views),
        total_likes: Number(day.total_likes),
        avg_views: Math.round(Number(day.avg_views))
      })),

      ...(detailed && {
        top_articles: topPerformingArticles.map((article: any) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          views: article.views,
          likes: article.likes,
          shares: article.shares,
          comments: article._count.comments,
          published_at: article.published_at,
          author: article.opinion_author,
          engagement_score: calculateEngagementScore(
            article.views, 
            article.likes, 
            article._count.comments, 
            article.shares
          )
        }))
      }),

      insights: generateInsights({
        totalArticles,
        publishedArticles,
        avgViewsPerArticle,
        engagementRate,
        moodDistribution,
        authorsDetails
      })
    }

    return NextResponse.json({
      success: true,
      analytics,
      generated_at: new Date(),
      author_filter: authorId || null
    })

  } catch (error) {
    console.error('Error generating opinion analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في توليد تحليلات مقالات الرأي',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// دالة حساب اتجاه البيانات
function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable'
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
  
  const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100
  
  if (changePercent > 10) return 'increasing'
  if (changePercent < -10) return 'decreasing'
  return 'stable'
}

// دالة حساب نقاط التفاعل
function calculateEngagementScore(views: number, likes: number, comments: number, shares: number): number {
  const weightedScore = (likes * 1) + (comments * 2) + (shares * 3)
  return views > 0 ? Math.round((weightedScore / views) * 1000) / 10 : 0
}

// دالة توليد رؤى تحليلية
function generateInsights(data: any): string[] {
  const insights: string[] = []
  
  // رؤى حول الإنتاجية
  if (data.publishedArticles > 20) {
    insights.push('مستوى إنتاجية عالي في مقالات الرأي')
  } else if (data.publishedArticles < 5) {
    insights.push('يمكن زيادة عدد مقالات الرأي المنشورة')
  }
  
  // رؤى حول الأداء
  if (data.avgViewsPerArticle > 5000) {
    insights.push('مقالات الرأي تحقق مشاهدات عالية')
  } else if (data.avgViewsPerArticle < 1000) {
    insights.push('يمكن تحسين جودة العناوين وترويج المقالات')
  }
  
  // رؤى حول التفاعل
  if (data.engagementRate > 5) {
    insights.push('معدل تفاعل ممتاز مع مقالات الرأي')
  } else if (data.engagementRate < 2) {
    insights.push('يمكن تحسين التفاعل من خلال محتوى أكثر إثارة للجدل')
  }
  
  // رؤى حول التنويع
  const dominantMood = data.moodDistribution.reduce((max: any, current: any) => 
    current.count > max.count ? current : max, data.moodDistribution[0]
  )
  
  if (dominantMood && dominantMood.percentage > 60) {
    insights.push(`غالبية المقالات ذات نبرة ${dominantMood.mood} - يمكن التنويع أكثر`)
  }
  
  // رؤى حول الكتاب
  if (data.authorsDetails.length > 10) {
    insights.push('تنويع جيد في كتاب الرأي')
  } else {
    insights.push('يمكن إضافة المزيد من كتاب الرأي لزيادة التنويع')
  }
  
  return insights
}
