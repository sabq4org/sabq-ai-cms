import { NextRequest, NextResponse } from 'next/server'

// في الواقع ستحفظ هذه الإعدادات في قاعدة البيانات
// هنا نستخدم متغير محلي للتجربة
let settings = {
  showStatisticsBlock: true,
  showSmartRecommendations: true,
  smartContentSource: 'auto' as 'auto' | 'curated' | 'off',
  aiGeneratedTips: true,
  interactiveQuestions: true,
  showGrowthRate: true
}

export async function GET() {
  return NextResponse.json(settings)
}

export async function POST(request: NextRequest) {
  try {
    const newSettings = await request.json()
    
    // تحديث الإعدادات
    settings = { ...settings, ...newSettings }
    
    // في التطبيق الحقيقي ستحفظ في قاعدة البيانات:
    // await prisma.settings.upsert({
    //   where: { key: 'personalization' },
    //   update: { value: settings },
    //   create: { key: 'personalization', value: settings }
    // })
    
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    return NextResponse.json(
      { error: 'خطأ في حفظ الإعدادات' },
      { status: 500 }
    )
  }
}
