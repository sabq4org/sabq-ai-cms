import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

// POST: حفظ جلسة قراءة جديدة أو تحديث جلسة موجودة
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      userId,
      articleId,
      sessionId,
      startTime,
      endTime,
      totalDuration,
      activeDuration,
      idleTime,
      scrollDepth,
      readingProgress,
      clicksCount,
      scrollsCount,
      completed,
      deviceType,
      screenSize,
      browser,
      operatingSystem,
      source,
      referrer,
      metadata
    } = data

    console.log('📊 بدء حفظ جلسة قراءة:', { sessionId, userId, articleId })

    // التحقق من البيانات المطلوبة
    if (!userId || !articleId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'بيانات مطلوبة مفقودة: userId, articleId, sessionId' },
        { status: 400 }
      )
    }

    // الحصول على معلومات IP والموقع
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'
    
    const userAgent = request.headers.get('user-agent') || ''

    // حساب نقاط التفاعل
    const engagementScore = calculateEngagementScore({
      totalDuration,
      activeDuration,
      scrollDepth,
      readingProgress,
      clicksCount,
      scrollsCount,
      completed
    })

    // حساب الكلمات المقروءة
    const wordsRead = await estimateWordsRead(readingProgress, articleId)

    // البحث عن جلسة موجودة أو إنشاء جديدة
    const sessionData = {
      id: sessionId,
      user_id: userId,
      article_id: articleId,
      session_id: sessionId,
      start_time: startTime ? new Date(startTime) : new Date(),
      end_time: endTime ? new Date(endTime) : null,
      total_duration: totalDuration || 0,
      active_duration: activeDuration || 0,
      idle_time: idleTime || 0,
      scroll_depth: scrollDepth || 0,
      reading_progress: readingProgress || 0,
      words_read: wordsRead,
      reading_speed: calculateReadingSpeed(totalDuration, readingProgress),
      device_type: deviceType || 'unknown',
      screen_size: screenSize || undefined,
      browser: browser || undefined,
      operating_system: operatingSystem || undefined,
      ip_address: ip,
      source: source || 'direct',
      referrer: referrer || undefined,
      clicks_count: clicksCount || 0,
      scrolls_count: scrollsCount || 0,
      engagement_score: engagementScore,
      completed: completed || false,
      metadata: metadata || {}
    }

    // استخدام upsert لتحديث الجلسة الموجودة أو إنشاء جديدة
    const session = await prisma.reading_sessions.upsert({
      where: { id: sessionId },
      update: {
        end_time: sessionData.end_time,
        total_duration: sessionData.total_duration,
        active_duration: sessionData.active_duration,
        idle_time: sessionData.idle_time,
        scroll_depth: sessionData.scroll_depth,
        reading_progress: sessionData.reading_progress,
        words_read: sessionData.words_read,
        reading_speed: sessionData.reading_speed,
        clicks_count: sessionData.clicks_count,
        scrolls_count: sessionData.scrolls_count,
        engagement_score: sessionData.engagement_score,
        completed: sessionData.completed,
        metadata: sessionData.metadata
      },
      create: sessionData
    })

    // تحديث إحصائيات المقال
    if (completed) {
      await updateArticleStats(articleId, {
        totalViews: 1,
        completedReads: 1,
        totalReadTime: totalDuration,
        avgEngagement: engagementScore
      })

      // منح نقاط ولاء إضافية للقراءة المكتملة
      await awardLoyaltyPoints(userId, articleId, {
        type: 'reading_completed',
        points: 25,
        metadata: {
          sessionId,
          readingProgress,
          totalDuration,
          engagementScore
        }
      })
    }

    // حفظ تفاعل مبسط في جدول interactions
    await prisma.interactions.upsert({
      where: {
        user_id_article_id_type: {
          user_id: userId,
          article_id: articleId,
          type: 'view'
        }
      },
      update: {
        duration: totalDuration,
        scroll_depth: scrollDepth,
        reading_progress: readingProgress,
        device_type: deviceType,
        source: source,
        session_id: sessionId,
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer,
        metadata: {
          sessionId,
          completed,
          engagementScore,
          lastUpdated: new Date().toISOString()
        }
      },
      create: {
        id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        article_id: articleId,
        type: 'view',
        duration: totalDuration,
        scroll_depth: scrollDepth,
        reading_progress: readingProgress,
        device_type: deviceType,
        source: source,
        session_id: sessionId,
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer,
        metadata: {
          sessionId,
          completed,
          engagementScore
        }
      }
    })

    console.log('✅ تم حفظ جلسة القراءة بنجاح:', {
      sessionId,
      totalDuration,
      engagementScore,
      completed
    })

    return NextResponse.json({
      success: true,
      message: 'تم حفظ جلسة القراءة بنجاح',
      data: {
        sessionId: session.id,
        engagementScore,
        completed: session.completed,
        readingProgress: session.reading_progress
      }
    })

  } catch (error) {
    console.error('❌ خطأ في حفظ جلسة القراءة:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// GET: جلب إحصائيات جلسات القراءة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const articleId = searchParams.get('articleId')
    const limit = parseInt(searchParams.get('limit') || '10')

    const whereClause: any = {}
    if (userId) whereClause.user_id = userId
    if (articleId) whereClause.article_id = articleId

    // جلب الجلسات
    const sessions = await prisma.reading_sessions.findMany({
      where: whereClause,
      orderBy: { start_time: 'desc' },
      take: limit,
      select: {
        id: true,
        session_id: true,
        start_time: true,
        end_time: true,
        total_duration: true,
        active_duration: true,
        scroll_depth: true,
        reading_progress: true,
        engagement_score: true,
        completed: true,
        device_type: true,
        source: true,
        article: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    })

    // حساب الإحصائيات العامة
    const stats = await calculateUserReadingStats(userId || undefined)

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        stats
      }
    })

  } catch (error) {
    console.error('❌ خطأ في جلب جلسات القراءة:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

// Helper Functions

function calculateEngagementScore(data: {
  totalDuration?: number
  activeDuration?: number
  scrollDepth?: number
  readingProgress?: number
  clicksCount?: number
  scrollsCount?: number
  completed?: boolean
}): number {
  let score = 0

  // نقاط الوقت (40% من النقاط)
  if (data.totalDuration) {
    score += Math.min(data.totalDuration / 300, 1) * 40 // max 5 minutes = 40 points
  }

  // نقاط التمرير (20% من النقاط)
  if (data.scrollDepth) {
    score += data.scrollDepth * 20
  }

  // نقاط القراءة (30% من النقاط)
  if (data.readingProgress) {
    score += data.readingProgress * 30
  }

  // نقاط التفاعل (10% من النقاط)
  const interactionScore = ((data.clicksCount || 0) * 0.5 + (data.scrollsCount || 0) * 0.1)
  score += Math.min(interactionScore, 10)

  // مكافأة الإكمال
  if (data.completed) {
    score += 20
  }

  return Math.round(Math.min(score, 100))
}

async function estimateWordsRead(readingProgress?: number, articleId?: string): Promise<number> {
  if (!readingProgress || !articleId) return 0

  try {
    // جلب المقال لحساب عدد الكلمات
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: { content: true }
    })

    if (!article) return 0

    // تقدير عدد الكلمات في المحتوى
    const wordCount = article.content.split(/\s+/).length
    return Math.round(wordCount * readingProgress)
  } catch (error) {
    console.error('خطأ في تقدير الكلمات المقروءة:', error)
    return 0
  }
}

function calculateReadingSpeed(duration?: number, progress?: number): number {
  if (!duration || !progress || duration < 60) return 0
  
  // تقدير سرعة القراءة بناءً على متوسط 250 كلمة في الدقيقة
  const estimatedWords = progress * 500 // افتراض 500 كلمة في المقال المتوسط
  const minutes = duration / 60
  return Math.round(estimatedWords / minutes)
}

async function updateArticleStats(articleId: string, stats: {
  totalViews?: number
  completedReads?: number
  totalReadTime?: number
  avgEngagement?: number
}) {
  try {
    await prisma.articles.update({
      where: { id: articleId },
      data: {
        views: { increment: stats.totalViews || 0 }
      }
    })
  } catch (error) {
    console.error('خطأ في تحديث إحصائيات المقال:', error)
  }
}

async function awardLoyaltyPoints(userId: string, articleId: string, reward: {
  type: string
  points: number
  metadata?: any
}) {
  try {
    await prisma.loyalty_points.create({
      data: {
        id: `loyalty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        points: reward.points,
        action: reward.type,
        reference_id: articleId,
        reference_type: 'article',
        metadata: reward.metadata
      }
    })
  } catch (error) {
    console.error('خطأ في منح نقاط الولاء:', error)
  }
}

async function calculateUserReadingStats(userId?: string) {
  if (!userId) return null

  try {
    const stats = await prisma.reading_sessions.aggregate({
      where: { user_id: userId },
      _count: { id: true },
      _sum: {
        total_duration: true,
        active_duration: true
      },
      _avg: {
        engagement_score: true,
        reading_progress: true,
        scroll_depth: true
      }
    })

    const completedReads = await prisma.reading_sessions.count({
      where: {
        user_id: userId,
        completed: true
      }
    })

    return {
      totalSessions: stats._count.id,
      totalReadingTime: stats._sum.total_duration || 0,
      totalActiveTime: stats._sum.active_duration || 0,
      avgEngagement: Math.round(stats._avg.engagement_score || 0),
      avgProgress: Math.round((stats._avg.reading_progress || 0) * 100),
      avgScrollDepth: Math.round((stats._avg.scroll_depth || 0) * 100),
      completedReads,
      completionRate: stats._count.id > 0 ? Math.round((completedReads / stats._count.id) * 100) : 0
    }
  } catch (error) {
    console.error('خطأ في حساب إحصائيات القراءة:', error)
    return null
  }
} 