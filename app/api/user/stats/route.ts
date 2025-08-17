import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma';
import { headers } from 'next/headers'

interface UserStats {
  articlesRead: number
  totalReadingTime: number
  likes: number
  shares: number
  saves: number
  comments: number
  categoryDistribution: { name: string; count: number; percentage: number }[]
  readingTimes: { hour: number; count: number }[]
  achievements: { id: string; name: string; icon: string; unlockedAt: Date }[]
  readingStreak: number
  balanceScore: number
}

export async function GET(request: Request) {
  try {
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // جلب جميع التفاعلات
    const [interactions, loyaltyPoints, readingHistory, categories] = await Promise.all([
      // التفاعلات
      prisma.interactions.findMany({
        where: { user_id: userId },
        include: {
          articles: {
            include: {
              categories: true
            }
          }
        }
      }),
      
      // نقاط الولاء
      prisma.loyalty_points.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      }),
      
      // سجل القراءة من activity_logs
      prisma.activity_logs.findMany({
        where: {
          user_id: userId,
          action: { in: ['read_article', 'article_viewed'] }
        },
        orderBy: { created_at: 'desc' }
      }),
      
      // التصنيفات
      prisma.categories.findMany()
    ])

    // حساب الإحصائيات
    const stats: UserStats = {
      articlesRead: readingHistory.length,
      totalReadingTime: readingHistory.length * 5, // متوسط 5 دقائق لكل مقال
      likes: interactions.filter((i: any) => i.type === 'like').length,
      shares: interactions.filter((i: any) => i.type === 'share').length,
      saves: interactions.filter((i: any) => i.type === 'save').length,
      comments: interactions.filter((i: any) => i.type === 'comment').length,
      categoryDistribution: [],
      readingTimes: [],
      achievements: [],
      readingStreak: 0,
      balanceScore: 0
    }

    // توزيع التصنيفات
    const categoryCount: Record<string, number> = {}
    interactions.forEach((interaction: any) => {
      if (interaction.article?.category?.name) {
        const catName = interaction.article.category.name
        categoryCount[catName] = (categoryCount[catName] || 0) + 1
      }
    })

    const totalInteractions = Object.values(categoryCount).reduce((a, b) => a + b, 0)
    stats.categoryDistribution = Object.entries(categoryCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalInteractions) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // أوقات القراءة المفضلة
    const readingHours: Record<number, number> = {}
    readingHistory.forEach((log: any) => {
      if (log.created_at) {
        const hour = new Date(log.created_at).getHours()
        readingHours[hour] = (readingHours[hour] || 0) + 1
      }
    })

    stats.readingTimes = Object.entries(readingHours)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count
      }))
      .sort((a, b) => a.hour - b.hour)

    // حساب الإنجازات
    const achievements = []
    
    // إنجاز القارئ المبتدئ
    if (stats.articlesRead >= 5) {
      achievements.push({
        id: 'beginner_reader',
        name: 'قارئ مبتدئ',
        icon: '📚',
        unlockedAt: new Date()
      })
    }
    
    // إنجاز القارئ النشط
    if (stats.articlesRead >= 20) {
      achievements.push({
        id: 'active_reader',
        name: 'قارئ نشط',
        icon: '🏃',
        unlockedAt: new Date()
      })
    }
    
    // إنجاز المتفاعل
    if (stats.likes >= 10) {
      achievements.push({
        id: 'engager',
        name: 'متفاعل',
        icon: '❤️',
        unlockedAt: new Date()
      })
    }
    
    // إنجاز المشارك
    if (stats.shares >= 5) {
      achievements.push({
        id: 'sharer',
        name: 'مشارك',
        icon: '🔗',
        unlockedAt: new Date()
      })
    }

    stats.achievements = achievements

    // حساب سلسلة القراءة
    const today = new Date()
    let streak = 0
    let currentDate = new Date(today)
    
    while (true) {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayReads = readingHistory.filter((log: any) => {
        const logDate = new Date(log.created_at)
        return logDate >= dayStart && logDate <= dayEnd
      })
      
      if (dayReads.length === 0) break
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    stats.readingStreak = streak

    // حساب نقاط التوازن
    if (stats.categoryDistribution.length >= 3) {
      const topThree = stats.categoryDistribution.slice(0, 3)
      const totalTop = topThree.reduce((sum, cat) => sum + cat.percentage, 0)
      stats.balanceScore = Math.round(100 - Math.abs(totalTop - 75))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
} 