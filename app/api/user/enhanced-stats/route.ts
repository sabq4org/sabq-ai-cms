import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// GET: جلب إحصائيات شاملة للمستخدم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'all' // all, week, month, year

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      )
    }

    console.log('📊 جلب إحصائيات شاملة للمستخدم:', userId, 'فترة:', period)

    // تحديد النطاق الزمني
    const timeFilter = getTimeFilter(period)

    // جلب جميع الإحصائيات بالتوازي
    const [
      interactionStats,
      readingStats,
      loyaltyStats,
      recentActivity,
      topCategories,
      readingPatterns,
      engagementTrends
    ] = await Promise.all([
      getInteractionStats(userId, timeFilter),
      getReadingStats(userId, timeFilter),
      getLoyaltyStats(userId, timeFilter),
      getRecentActivity(userId, 10),
      getTopCategories(userId, timeFilter),
      getReadingPatterns(userId, timeFilter),
      getEngagementTrends(userId, timeFilter)
    ])

    // حساب النقاط الإجمالية
    const totalPoints = await calculateTotalPoints(userId)
    
    // تحديد مستوى المستخدم ونوع القارئ
    const userLevel = calculateUserLevel(totalPoints)
    const readerType = determineReaderType(readingStats, interactionStats)

    // إحصائيات عامة
    const overallStats = {
      totalPoints,
      userLevel,
      readerType,
      joinedDaysAgo: await calculateDaysSinceJoined(userId),
      currentStreak: await calculateReadingStreak(userId),
      achievements: await getUserAchievements(userId)
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        overallStats,
        interactions: interactionStats,
        reading: readingStats,
        loyalty: loyaltyStats,
        recentActivity,
        preferences: {
          topCategories,
          readingPatterns
        },
        trends: engagementTrends
      }
    })

  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات المستخدم:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

// Helper Functions

function getTimeFilter(period: string) {
  const now = new Date()
  
  switch (period) {
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return { gte: weekAgo }
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return { gte: monthAgo }
    case 'year':
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      return { gte: yearAgo }
    default:
      return {} // جميع الفترات
  }
}

async function getInteractionStats(userId: string, timeFilter: any) {
  try {
    // إحصائيات التفاعلات
    const interactions = await prisma.interactions.groupBy({
      by: ['type'],
      where: {
        user_id: userId,
        created_at: timeFilter
      },
      _count: {
        id: true
      }
    })

    // تحويل النتائج لصيغة أسهل
    const stats = {
      total: 0,
      likes: 0,
      saves: 0,
      shares: 0,
      comments: 0,
      views: 0
    }

    interactions.forEach(interaction => {
      const count = interaction._count.id
      stats.total += count
      stats[interaction.type as keyof typeof stats] = count
    })

    // حساب معدل التفاعل اليومي
    const daysInPeriod = Object.keys(timeFilter).length > 0 ? 
      Math.max(1, Math.ceil((new Date().getTime() - timeFilter.gte.getTime()) / (24 * 60 * 60 * 1000))) : 
      30 // افتراضي للفترة الكاملة

    const dailyAverage = Math.round(stats.total / daysInPeriod)

    return {
      ...stats,
      dailyAverage,
      engagementRate: await calculateEngagementRate(userId, timeFilter)
    }
  } catch (error) {
    console.error('خطأ في جلب إحصائيات التفاعل:', error)
    return { total: 0, likes: 0, saves: 0, shares: 0, comments: 0, views: 0, dailyAverage: 0, engagementRate: 0 }
  }
}

async function getReadingStats(userId: string, timeFilter: any) {
  try {
    // إحصائيات جلسات القراءة
    const sessions = await prisma.user_reading_sessions?.aggregate({
      where: {
        user_id: userId,
        started_at: timeFilter
      },
      _count: { id: true },
      _sum: {
        duration_seconds: true
      },
      _avg: {
        scroll_depth: true,
        read_percentage: true
      }
    })

    if (!sessions) {
      return {
        totalSessions: 0,
        totalReadingTime: 0,
        totalActiveTime: 0,
        wordsRead: 0,
        avgEngagement: 0,
        avgProgress: 0,
        avgScrollDepth: 0,
        avgReadingSpeed: 0,
        completedArticles: 0,
        completionRate: 0
      }
    }

    // عدد المقالات المكتملة
    const completedArticles = await prisma.user_reading_sessions?.count({
      where: {
        user_id: userId,
        started_at: timeFilter,
        read_percentage: { gte: 90 }
      }
    }) || 0

    const totalSessions = sessions._count.id
    const completionRate = totalSessions > 0 ? Math.round((completedArticles / totalSessions) * 100) : 0

    return {
      totalSessions,
      totalReadingTime: sessions._sum.duration_seconds || 0,
      totalActiveTime: sessions._sum.duration_seconds || 0,
      wordsRead: sessions._sum/*words_read removed*/ || 0,
      avgEngagement: Math.round(sessions._avg.scroll_depth || 0),
      avgProgress: Math.round((sessions._avg.read_percentage || 0) * 100),
      avgScrollDepth: Math.round((sessions._avg.scroll_depth || 0) * 100),
      avgReadingSpeed: 0, // reading_speed field not available
      completedArticles,
      completionRate
    }
  } catch (error) {
    console.error('خطأ في جلب إحصائيات القراءة:', error)
    return {
      totalSessions: 0,
      totalReadingTime: 0,
      totalActiveTime: 0,
      wordsRead: 0,
      avgEngagement: 0,
      avgProgress: 0,
      avgScrollDepth: 0,
      avgReadingSpeed: 0,
      completedArticles: 0,
      completionRate: 0
    }
  }
}

async function getLoyaltyStats(userId: string, timeFilter: any) {
  try {
    const loyaltyData = await prisma.loyalty_points.aggregate({
      where: {
        user_id: userId,
        created_at: timeFilter
      },
      _sum: { points: true },
      _count: { id: true }
    })

    // جلب تفاصيل مصادر النقاط
    const pointSources = await prisma.loyalty_points.groupBy({
      by: ['action'],
      where: {
        user_id: userId,
        created_at: timeFilter
      },
      _sum: { points: true },
      _count: { id: true }
    })

    const sources = pointSources.map(source => ({
      action: source.action,
      points: source._sum.points || 0,
      count: source._count.id
    }))

    return {
      totalPoints: loyaltyData._sum.points || 0,
      totalTransactions: loyaltyData._count.id,
      sources
    }
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الولاء:', error)
    return { totalPoints: 0, totalTransactions: 0, sources: [] }
  }
}

async function getRecentActivity(userId: string, limit: number) {
  try {
    const activities = await prisma.activity_logs.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
      select: {
        action: true,
        entity_type: true,
        entity_id: true,
        created_at: true,
        new_value: true
      }
    })

    return activities.map(activity => ({
      action: activity.action,
      type: activity.entity_type,
      entityId: activity.entity_id,
      timestamp: activity.created_at,
      details: activity.new_value
    }))
  } catch (error) {
    console.error('خطأ في جلب النشاط الأخير:', error)
    return []
  }
}

async function getTopCategories(userId: string, timeFilter: any) {
  try {
    // جلب التفاعلات مع المقالات والتصنيفات
    const interactions = await prisma.interactions.findMany({
      where: {
        user_id: userId,
        created_at: timeFilter,
        type: { in: ['like', 'save', 'view'] }
      },
      include: {
        articles: {
          include: {
            categories: true
          }
        }
      }
    })

    // تجميع التفاعلات حسب التصنيف
    const categoryStats: Record<string, { name: string, count: number, types: Record<string, number> }> = {}

    interactions.forEach(interaction => {
      const category = interaction.articles.categories
      if (!category) return

      if (!categoryStats[category.id]) {
        categoryStats[category.id] = {
          name: category.name,
          count: 0,
          types: { like: 0, save: 0, view: 0 }
        }
      }

      categoryStats[category.id].count++
      categoryStats[category.id].types[interaction.type]++
    })

    // ترتيب التصنيفات حسب عدد التفاعلات
    return Object.entries(categoryStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  } catch (error) {
    console.error('خطأ في جلب التصنيفات الأعلى:', error)
    return []
  }
}

async function getReadingPatterns(userId: string, timeFilter: any) {
  try {
    // أنماط القراءة حسب الوقت والجهاز
    const patterns = await prisma.user_reading_sessions?.findMany({
      where: {
        user_id: userId,
        started_at: timeFilter
      },
      select: {
        started_at: true,
        device_type: true,
        duration_seconds: true,
        scroll_depth: true
      }
    })

    if (!patterns) return { hourlyPattern: [], devicePattern: [], weeklyPattern: [] }

    // تحليل الأنماط الساعية
    const hourlyPattern = Array(24).fill(0)
    const devicePattern: Record<string, number> = {}
    const weeklyPattern = Array(7).fill(0)

    patterns.forEach(session => {
      if (!session.started_at) return
      const hour = session.started_at.getHours()
      const day = session.started_at.getDay()
      const device = session.device_type || 'unknown'

      hourlyPattern[hour]++
      devicePattern[device] = (devicePattern[device] || 0) + 1
      weeklyPattern[day]++
    })

    return {
      hourlyPattern,
      devicePattern: Object.entries(devicePattern).map(([device, count]) => ({ device, count })),
      weeklyPattern
    }
  } catch (error) {
    console.error('خطأ في جلب أنماط القراءة:', error)
    return { hourlyPattern: [], devicePattern: [], weeklyPattern: [] }
  }
}

async function getEngagementTrends(userId: string, timeFilter: any) {
  try {
    // اتجاهات التفاعل على مدار الأيام
    const trends = await prisma.interactions.findMany({
      where: {
        user_id: userId,
        created_at: timeFilter
      },
      select: {
        type: true,
        created_at: true
      },
      orderBy: { created_at: 'asc' }
    })

    // تجميع البيانات حسب اليوم
    const dailyTrends: Record<string, Record<string, number>> = {}

    trends.forEach(interaction => {
      const date = interaction.created_at.toISOString().split('T')[0]
      
      if (!dailyTrends[date]) {
        dailyTrends[date] = { like: 0, save: 0, share: 0, view: 0, total: 0 }
      }
      
      dailyTrends[date][interaction.type]++
      dailyTrends[date].total++
    })

    return Object.entries(dailyTrends).map(([date, counts]) => ({
      date,
      ...counts
    }))
  } catch (error) {
    console.error('خطأ في جلب اتجاهات التفاعل:', error)
    return []
  }
}

async function calculateEngagementRate(userId: string, timeFilter: any): Promise<number> {
  try {
    const viewsCount = await prisma.interactions.count({
      where: {
        user_id: userId,
        type: 'view',
        created_at: timeFilter
      }
    })

    const engagementsCount = await prisma.interactions.count({
      where: {
        user_id: userId,
        type: { in: ['like', 'save', 'share', 'comment'] },
        created_at: timeFilter
      }
    })

    return viewsCount > 0 ? Math.round((engagementsCount / viewsCount) * 100) : 0
  } catch (error) {
    console.error('خطأ في حساب معدل التفاعل:', error)
    return 0
  }
}

async function calculateTotalPoints(userId: string): Promise<number> {
  try {
    const result = await prisma.loyalty_points.aggregate({
      where: { user_id: userId },
      _sum: { points: true }
    })
    return result._sum.points || 0
  } catch (error) {
    console.error('خطأ في حساب النقاط الإجمالية:', error)
    return 0
  }
}

function calculateUserLevel(totalPoints: number): { level: number, title: string, nextLevelPoints: number } {
  const levels = [
    { level: 1, title: 'قارئ مبتدئ', minPoints: 0 },
    { level: 2, title: 'قارئ نشط', minPoints: 100 },
    { level: 3, title: 'قارئ مهتم', minPoints: 300 },
    { level: 4, title: 'قارئ متفاعل', minPoints: 600 },
    { level: 5, title: 'قارئ خبير', minPoints: 1000 },
    { level: 6, title: 'قارئ متميز', minPoints: 1500 },
    { level: 7, title: 'قارئ محترف', minPoints: 2500 },
    { level: 8, title: 'قارئ أسطوري', minPoints: 5000 }
  ]

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalPoints >= levels[i].minPoints) {
      const nextLevel = levels[i + 1]
      return {
        level: levels[i].level,
        title: levels[i].title,
        nextLevelPoints: nextLevel ? nextLevel.minPoints - totalPoints : 0
      }
    }
  }

  return { level: 1, title: 'قارئ مبتدئ', nextLevelPoints: 100 - totalPoints }
}

function determineReaderType(readingStats: any, interactionStats: any): string {
  const { completionRate, avgEngagement } = readingStats
  const { engagementRate } = interactionStats

  if (completionRate >= 80 && avgEngagement >= 70) {
    return 'قارئ متوازن'
  } else if (engagementRate >= 50) {
    return 'قارئ متفاعل'
  } else if (completionRate >= 60) {
    return 'قارئ مركز'
  } else if (interactionStats.total >= 20) {
    return 'قارئ اجتماعي'
  } else {
    return 'قارئ عابر'
  }
}

async function calculateDaysSinceJoined(userId: string): Promise<number> {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { created_at: true }
    })
    
    if (!user) return 0
    
    const now = new Date()
    const joinDate = new Date(user.created_at)
    return Math.floor((now.getTime() - joinDate.getTime()) / (24 * 60 * 60 * 1000))
  } catch (error) {
    console.error('خطأ في حساب أيام العضوية:', error)
    return 0
  }
}

async function calculateReadingStreak(userId: string): Promise<number> {
  try {
    // حساب سلسلة القراءة اليومية
    const recentSessions = await prisma.user_reading_sessions?.findMany({
      where: {
        user_id: userId,
        started_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // آخر 30 يوم
        }
      },
      select: { started_at: true },
      orderBy: { started_at: 'desc' }
    })

    if (!recentSessions || recentSessions.length === 0) return 0

    // تجميع الجلسات حسب اليوم
    const dailySessions = new Set(
      recentSessions
        .filter(session => session.started_at)
        .map(session => 
          session.started_at!.toISOString().split('T')[0]
        )
    )

    const sortedDays = Array.from(dailySessions).sort().reverse()
    
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    
    for (let i = 0; i < sortedDays.length; i++) {
      const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]
      
      if (sortedDays[i] === expectedDate) {
        streak++
      } else {
        break
      }
    }

    return streak
  } catch (error) {
    console.error('خطأ في حساب سلسلة القراءة:', error)
    return 0
  }
}

async function getUserAchievements(userId: string): Promise<string[]> {
  try {
    const achievements = []
    
    // حساب الإنجازات بناءً على الإحصائيات
    const totalPoints = await calculateTotalPoints(userId)
    const interactionCount = await prisma.interactions.count({
      where: { user_id: userId }
    })
    
    if (totalPoints >= 100) achievements.push('أول 100 نقطة')
    if (totalPoints >= 500) achievements.push('500 نقطة')
    if (totalPoints >= 1000) achievements.push('ألف نقطة')
    if (interactionCount >= 50) achievements.push('متفاعل نشط')
    if (interactionCount >= 100) achievements.push('متفاعل محترف')
    
    return achievements
  } catch (error) {
    console.error('خطأ في جلب الإنجازات:', error)
    return []
  }
} 