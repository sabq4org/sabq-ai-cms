import { NextRequest, NextResponse } from 'next/server';
import { handleOptions, corsResponse } from '@/lib/cors';

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return handleOptions();
}

export const runtime = 'nodejs';

// تحديد الفترة الزمنية الحالية
function getCurrentPeriod(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 16) return 'afternoon';
  if (hour >= 16 && hour < 19) return 'evening';
  return 'night';
}

// GET - جلب الجرعات (نسخة مبسطة)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const period = searchParams.get('period') || getCurrentPeriod();

    // إرجاع بيانات تجريبية
    const mockDose = {
      id: `dose-${date}-${period}`,
      title: getTitle(period),
      subtitle: getSubtitle(period),
      date: new Date(date).toISOString(),
      period: period,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contents: [
        {
          id: `content-1-${period}`,
          contentType: 'tip',
          title: getTipTitle(period),
          summary: getTipSummary(period),
          displayOrder: 0,
          imageUrl: null,
          audioUrl: null,
          articleId: null
        },
        {
          id: `content-2-${period}`,
          contentType: 'quote',
          title: 'حكمة اليوم',
          summary: 'النجاح ليس نهائياً، والفشل ليس قاتلاً، الشجاعة للاستمرار هي ما يهم.',
          displayOrder: 1,
          imageUrl: null,
          audioUrl: null,
          articleId: null
        }
      ]
    };

    return corsResponse(mockDose);

  } catch (error) {
    console.error('Error in daily-doses API:', error);
    return corsResponse({
      error: 'Internal server error',
      message: 'حدث خطأ في جلب الجرعة اليومية'
    }, 500);
  }
}

function getTitle(period: string): string {
  const titles = {
    morning: 'ابدأ صباحك بالمفيد والمُلهم',
    afternoon: 'استراحة العصر المفيدة',
    evening: 'خلاصة المساء',
    night: 'ختام اليوم بالمفيد'
  };
  return titles[period as keyof typeof titles] || titles.morning;
}

function getSubtitle(period: string): string {
  const subtitles = {
    morning: 'أهم ما تحتاجه اليوم… في دقائق تختصر لك كل شيء',
    afternoon: 'محتوى مختار للاستراحة المفيدة',
    evening: 'خلاصة ما يستحق المتابعة من اليوم',
    night: 'تأملات وإلهام لنهاية يوم مثمر'
  };
  return subtitles[period as keyof typeof subtitles] || subtitles.morning;
}

function getTipTitle(period: string): string {
  const tips = {
    morning: 'نصيحة بداية اليوم',
    afternoon: 'نصيحة العصر',
    evening: 'نصيحة المساء',
    night: 'نصيحة الليل'
  };
  return tips[period as keyof typeof tips] || tips.morning;
}

function getTipSummary(period: string): string {
  const summaries = {
    morning: 'ابدأ يومك بكوب من الماء وخمس دقائق من التأمل لتحسين تركيزك وإنتاجيتك',
    afternoon: 'خذ استراحة قصيرة، واشرب الماء، وتمدد قليلاً لتجديد طاقتك',
    evening: 'راجع إنجازات اليوم واكتب ثلاثة أشياء تشعر بالامتنان لها',
    night: 'اقرأ صفحات قليلة من كتاب مفيد قبل النوم لتغذية عقلك'
  };
  return summaries[period as keyof typeof summaries] || summaries.morning;
} 