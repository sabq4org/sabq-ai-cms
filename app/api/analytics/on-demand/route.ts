import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, articleId, userId, timestamp } = body

    // تسجيل أحداث On-Demand Loading
    console.log('📊 On-Demand Analytics:', {
      event,
      articleId,
      userId,
      time: new Date(timestamp).toLocaleTimeString('ar-SA'),
      userAgent: req.headers.get('user-agent')?.substring(0, 50)
    })

    // حفظ مؤقت للإحصائيات
    const stats = updateOnDemandStats(event)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'تم تسجيل الحدث',
        stats
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error tracking on-demand analytics:', error)
    return new Response('OK', { status: 200 }) // Silent fail
  }
}

// إحصائيات مؤقتة في الذاكرة
const onDemandStats = {
  open_comments: 0,
  open_personalized: 0,
  total_page_views: 0,
  engagement_rate: 0
}

function updateOnDemandStats(event: string) {
  if (event === 'open_comments') {
    onDemandStats.open_comments++
  } else if (event === 'open_personalized') {
    onDemandStats.open_personalized++
  }
  
  onDemandStats.total_page_views++
  
  // حساب معدل التفاعل
  const totalInteractions = onDemandStats.open_comments + onDemandStats.open_personalized
  onDemandStats.engagement_rate = onDemandStats.total_page_views > 0 ? 
    Math.round((totalInteractions / onDemandStats.total_page_views) * 100) : 0

  return onDemandStats
}

export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'On-Demand Loading Analytics',
      stats: onDemandStats,
      insights: {
        comments_click_rate: onDemandStats.total_page_views > 0 ? 
          `${Math.round((onDemandStats.open_comments / onDemandStats.total_page_views) * 100)}%` : '0%',
        personalized_click_rate: onDemandStats.total_page_views > 0 ? 
          `${Math.round((onDemandStats.open_personalized / onDemandStats.total_page_views) * 100)}%` : '0%',
        overall_engagement: `${onDemandStats.engagement_rate}%`
      }
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
