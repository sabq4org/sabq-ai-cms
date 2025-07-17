import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// POST: إضافة/إزالة تفاعل مع تتبع مفصل
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      userId,
      articleId,
      type, // like, save, share, comment, view
      action = 'toggle', // add, remove, toggle
      metadata = {}
    } = data

    console.log('🔥 معالجة تفاعل محسن:', { userId, articleId, type, action })

    // التحقق من البيانات المطلوبة
    if (!userId || !articleId || !type) {
      return NextResponse.json(
        { success: false, error: 'بيانات مطلوبة مفقودة' },
        { status: 400 }
      )
    }

    // التحقق من صحة نوع التفاعل
    const validTypes = ['like', 'save', 'share', 'comment', 'view']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'نوع تفاعل غير صحيح' },
        { status: 400 }
      )
    }

    // الحصول على معلومات الطلب
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''

    // التحقق من التفاعل الموجود
    const existingInteraction = await prisma.interactions.findFirst({
      where: {
        user_id: userId,
        article_id: articleId,
        type: type as any
      }
    })

    let newInteraction = null
    let isAdded = false

    if (action === 'toggle') {
      if (existingInteraction) {
        // إزالة التفاعل
        await prisma.interactions.delete({
          where: { id: existingInteraction.id }
        })
        isAdded = false
        
        // تقليل العداد في المقال
        await updateArticleCounter(articleId, type, -1)
        
        // سجل نشاط الإزالة
        await logUserActivity(userId, 'interaction_removed', {
          articleId,
          interactionType: type,
          ip,
          userAgent
        })
        
      } else {
        // إضافة التفاعل
        newInteraction = await createInteraction({
          userId,
          articleId,
          type,
          ip,
          userAgent,
          referrer,
          metadata
        })
        isAdded = true
        
        // زيادة العداد في المقال
        await updateArticleCounter(articleId, type, 1)
        
        // منح نقاط الولاء
        await awardInteractionPoints(userId, articleId, type, newInteraction.id)
        
        // سجل نشاط الإضافة
        await logUserActivity(userId, 'interaction_added', {
          articleId,
          interactionType: type,
          interactionId: newInteraction.id,
          ip,
          userAgent
        })
      }
    } else if (action === 'add' && !existingInteraction) {
      // إضافة فقط إذا لم يكن موجود
      newInteraction = await createInteraction({
        userId,
        articleId,
        type,
        ip,
        userAgent,
        referrer,
        metadata
      })
      isAdded = true
      
      await updateArticleCounter(articleId, type, 1)
      await awardInteractionPoints(userId, articleId, type, newInteraction.id)
      await logUserActivity(userId, 'interaction_added', {
        articleId,
        interactionType: type,
        interactionId: newInteraction.id,
        ip,
        userAgent
      })
      
    } else if (action === 'remove' && existingInteraction) {
      // إزالة فقط إذا كان موجود
      await prisma.interactions.delete({
        where: { id: existingInteraction.id }
      })
      isAdded = false
      
      await updateArticleCounter(articleId, type, -1)
      await logUserActivity(userId, 'interaction_removed', {
        articleId,
        interactionType: type,
        ip,
        userAgent
      })
    }

    // جلب العدادات المحدثة للمقال
    const updatedCounts = await getArticleInteractionCounts(articleId)
    
    // جلب حالة تفاعلات المستخدم مع هذا المقال
    const userInteractions = await getUserArticleInteractions(userId, articleId)

    console.log('✅ تم معالجة التفاعل بنجاح:', {
      type,
      action,
      isAdded,
      updatedCounts
    })

    return NextResponse.json({
      success: true,
      message: isAdded ? 'تم إضافة التفاعل' : 'تم إزالة التفاعل',
      data: {
        interactionId: newInteraction?.id || null,
        isAdded,
        type,
        articleCounts: updatedCounts,
        userInteractions,
        points: getInteractionPoints(type)
      }
    })

  } catch (error) {
    console.error('❌ خطأ في معالجة التفاعل:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}

// GET: جلب تفاعلات المستخدم مع مقال محدد
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const articleId = searchParams.get('articleId')

    if (!userId || !articleId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم ومعرف المقال مطلوبان' },
        { status: 400 }
      )
    }

    // جلب تفاعلات المستخدم مع المقال
    const interactions = await prisma.interactions.findMany({
      where: {
        user_id: userId,
        article_id: articleId
      },
      select: {
        type: true,
        created_at: true,
        metadata: true
      }
    })

    // تحويل النتائج لصيغة سهلة الاستخدام
    const userInteractions = {
      liked: interactions.some(i => i.type === 'like'),
      saved: interactions.some(i => i.type === 'save'),
      shared: interactions.some(i => i.type === 'share'),
      commented: interactions.some(i => i.type === 'comment'),
      viewed: interactions.some(i => i.type === 'view')
    }

    // جلب عدادات المقال
    const articleCounts = await getArticleInteractionCounts(articleId)

    return NextResponse.json({
      success: true,
      data: {
        userInteractions,
        articleCounts,
        interactionHistory: interactions
      }
    })

  } catch (error) {
    console.error('❌ خطأ في جلب التفاعلات:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

// Helper Functions

async function createInteraction(data: {
  userId: string
  articleId: string
  type: string
  ip: string
  userAgent: string
  referrer: string
  metadata: any
}) {
  const deviceInfo = parseUserAgent(data.userAgent)
  
  return await prisma.interactions.create({
    data: {
      id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: data.userId,
      article_id: data.articleId,
      type: data.type as any,
      device_type: deviceInfo.deviceType,
      source: determineSource(data.referrer),
      session_id: `session-${Date.now()}`,
      ip_address: data.ip,
      user_agent: data.userAgent,
      referrer: data.referrer || undefined,
      metadata: {
        ...data.metadata,
        timestamp: new Date().toISOString(),
        browser: deviceInfo.browser,
        os: deviceInfo.os
      }
    }
  })
}

async function updateArticleCounter(articleId: string, type: string, increment: number) {
  try {
    const updateData: any = {}
    
    switch (type) {
      case 'like':
        updateData.likes = { increment }
        break
      case 'save':
        updateData.saves = { increment }
        break
      case 'share':
        updateData.shares = { increment }
        break
      case 'view':
        updateData.views = { increment }
        break
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.articles.update({
        where: { id: articleId },
        data: updateData
      })
    }
  } catch (error) {
    console.error('خطأ في تحديث عدادات المقال:', error)
  }
}

async function awardInteractionPoints(userId: string, articleId: string, type: string, interactionId: string) {
  const pointsMap: Record<string, number> = {
    like: 10,
    save: 15,
    share: 20,
    comment: 25,
    view: 1
  }

  const points = pointsMap[type] || 0
  if (points === 0) return

  try {
    await prisma.loyalty_points.create({
      data: {
        id: `loyalty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        points,
        action: `${type}_interaction`,
        reference_id: articleId,
        reference_type: 'article',
        metadata: {
          interactionId,
          interactionType: type,
          timestamp: new Date().toISOString()
        }
      }
    })
  } catch (error) {
    console.error('خطأ في منح نقاط الولاء:', error)
  }
}

async function logUserActivity(userId: string, action: string, details: any) {
  try {
    await prisma.activity_logs.create({
      data: {
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        action,
        entity_type: 'interaction',
        entity_id: details.articleId,
        new_value: details,
        ip_address: details.ip,
        user_agent: details.userAgent,
        created_at: new Date()
      }
    })
  } catch (error) {
    console.error('خطأ في تسجيل النشاط:', error)
  }
}

async function getArticleInteractionCounts(articleId: string) {
  try {
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: {
        likes: true,
        saves: true,
        shares: true,
        views: true
      }
    })

    return article || { likes: 0, saves: 0, shares: 0, views: 0 }
  } catch (error) {
    console.error('خطأ في جلب عدادات المقال:', error)
    return { likes: 0, saves: 0, shares: 0, views: 0 }
  }
}

async function getUserArticleInteractions(userId: string, articleId: string) {
  try {
    const interactions = await prisma.interactions.findMany({
      where: {
        user_id: userId,
        article_id: articleId
      },
      select: { type: true }
    })

    return {
      liked: interactions.some(i => i.type === 'like'),
      saved: interactions.some(i => i.type === 'save'),
      shared: interactions.some(i => i.type === 'share'),
      commented: interactions.some(i => i.type === 'comment'),
      viewed: interactions.some(i => i.type === 'view')
    }
  } catch (error) {
    console.error('خطأ في جلب تفاعلات المستخدم:', error)
    return {
      liked: false,
      saved: false,
      shared: false,
      commented: false,
      viewed: false
    }
  }
}

function parseUserAgent(userAgent: string) {
  let deviceType = 'desktop'
  let browser = 'Unknown'
  let os = 'Unknown'

  // Device type detection
  if (/Mobile|Android|iPhone/.test(userAgent)) {
    deviceType = 'mobile'
  } else if (/iPad|Tablet/.test(userAgent)) {
    deviceType = 'tablet'
  }

  // Browser detection
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'

  // OS detection
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iOS')) os = 'iOS'

  return { deviceType, browser, os }
}

function determineSource(referrer: string): string {
  if (!referrer) return 'direct'
  
  if (referrer.includes('google.com')) return 'google'
  if (referrer.includes('facebook.com')) return 'facebook'
  if (referrer.includes('twitter.com')) return 'twitter'
  if (referrer.includes('linkedin.com')) return 'linkedin'
  if (referrer.includes('whatsapp.com')) return 'whatsapp'
  
  // إذا كان من نفس الموقع
  if (referrer.includes(process.env.NEXT_PUBLIC_SITE_URL || 'localhost')) {
    return 'internal'
  }
  
  return 'referrer'
}

function getInteractionPoints(type: string): number {
  const pointsMap: Record<string, number> = {
    like: 10,
    save: 15,
    share: 20,
    comment: 25,
    view: 1
  }
  return pointsMap[type] || 0
} 