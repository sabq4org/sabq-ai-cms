/**
 * API endpoint للكلمات المفتاحية الشائعة
 * /api/analytics/keywords
 */

import { NextRequest, NextResponse } from 'next/server';

// نوع بيانات الكلمة المفتاحية
interface KeywordData {
  id: string;
  text: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  url: string;
  category?: string;
  percentage?: number;
  lastUpdated?: string;
}

// نوع البيانات الأساسية قبل إضافة URL
interface BaseKeywordData {
  id: string;
  text: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  percentage: number;
}

// بيانات تجريبية أساسية
const BASE_KEYWORDS: BaseKeywordData[] = [
  { id: 'k1', text: 'السيسي', count: 1250, trend: 'up', category: 'سياسة', percentage: 100 },
  { id: 'k2', text: 'إسرائيل', count: 980, trend: 'up', category: 'دولي', percentage: 78 },
  { id: 'k3', text: 'غزة', count: 1100, trend: 'stable', category: 'أخبار', percentage: 88 },
  { id: 'k4', text: 'الحرب', count: 850, trend: 'down', category: 'عسكري', percentage: 68 },
  { id: 'k5', text: 'أسد', count: 720, trend: 'up', category: 'سياسة', percentage: 58 },
  { id: 'k6', text: 'تركيا', count: 650, trend: 'stable', category: 'دولي', percentage: 52 },
  { id: 'k7', text: 'إيران', count: 580, trend: 'down', category: 'دولي', percentage: 46 },
  { id: 'k8', text: 'قرن', count: 520, trend: 'up', category: 'اقتصاد', percentage: 42 },
  { id: 'k9', text: 'ضبط', count: 480, trend: 'stable', category: 'أمني', percentage: 38 },
  { id: 'k10', text: 'الخرطوم', count: 420, trend: 'up', category: 'دولي', percentage: 34 },
  { id: 'k11', text: 'صنعاء', count: 380, trend: 'down', category: 'دولي', percentage: 30 },
  { id: 'k12', text: 'اقتصاد', count: 350, trend: 'stable', category: 'اقتصاد', percentage: 28 },
  { id: 'k13', text: 'الجزائر', count: 320, trend: 'up', category: 'دولي', percentage: 26 },
  { id: 'k14', text: 'البرهان', count: 290, trend: 'down', category: 'سياسة', percentage: 23 },
  { id: 'k15', text: 'زلزال', count: 260, trend: 'up', category: 'طبيعي', percentage: 21 },
  { id: 'k16', text: 'السعودية', count: 240, trend: 'stable', category: 'محلي', percentage: 19 },
  { id: 'k17', text: 'المغرب', count: 220, trend: 'up', category: 'دولي', percentage: 18 },
  { id: 'k18', text: 'الأردن', count: 200, trend: 'stable', category: 'دولي', percentage: 16 },
  { id: 'k19', text: 'لبنان', count: 180, trend: 'down', category: 'دولي', percentage: 14 },
  { id: 'k20', text: 'العراق', count: 160, trend: 'up', category: 'دولي', percentage: 13 },
  { id: 'k21', text: 'الكويت', count: 140, trend: 'stable', category: 'خليجي', percentage: 11 },
  { id: 'k22', text: 'قطر', count: 120, trend: 'up', category: 'خليجي', percentage: 10 },
  { id: 'k23', text: 'الإمارات', count: 100, trend: 'stable', category: 'خليجي', percentage: 8 },
  { id: 'k24', text: 'البحرين', count: 90, trend: 'up', category: 'خليجي', percentage: 7 },
  { id: 'k25', text: 'عمان', count: 80, trend: 'stable', category: 'خليجي', percentage: 6 },
  { id: 'k26', text: 'اليمن', count: 75, trend: 'down', category: 'دولي', percentage: 6 },
  { id: 'k27', text: 'فلسطين', count: 70, trend: 'up', category: 'دولي', percentage: 6 },
  { id: 'k28', text: 'سوريا', count: 65, trend: 'stable', category: 'دولي', percentage: 5 },
  { id: 'k29', text: 'ليبيا', count: 60, trend: 'down', category: 'دولي', percentage: 5 },
  { id: 'k30', text: 'تونس', count: 55, trend: 'up', category: 'دولي', percentage: 4 },
];

// GET: جلب الكلمات المفتاحية الشائعة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const category = searchParams.get('category');
    const trend = searchParams.get('trend') as 'up' | 'down' | 'stable' | null;
    const minCount = parseInt(searchParams.get('minCount') || '0');

    // تحويل البيانات الأساسية إلى بيانات كاملة مع URLs
    const MOCK_KEYWORDS: KeywordData[] = BASE_KEYWORDS.map(keyword => ({
      ...keyword,
      url: `/news/keywords/${encodeURIComponent(keyword.text)}`
    }));

    let filteredKeywords = [...MOCK_KEYWORDS];

    // تطبيق الفلاتر
    if (category) {
      filteredKeywords = filteredKeywords.filter(k => k.category === category);
    }

    if (trend) {
      filteredKeywords = filteredKeywords.filter(k => k.trend === trend);
    }

    if (minCount > 0) {
      filteredKeywords = filteredKeywords.filter(k => k.count >= minCount);
    }

    // ترتيب حسب العدد وأخذ العدد المطلوب
    const keywords = filteredKeywords
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(keyword => ({
        ...keyword,
        lastUpdated: new Date().toISOString()
      }));

    // إحصائيات إضافية
    const stats = {
      totalKeywords: keywords.length,
      topKeyword: keywords[0],
      trendingUp: keywords.filter(k => k.trend === 'up').length,
      trendingDown: keywords.filter(k => k.trend === 'down').length,
      stable: keywords.filter(k => k.trend === 'stable').length,
      categories: [...new Set(keywords.map(k => k.category))],
      totalMentions: keywords.reduce((sum, k) => sum + k.count, 0),
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      keywords,
      stats,
      pagination: {
        limit,
        total: filteredKeywords.length,
        hasMore: filteredKeywords.length > limit
      }
    });

  } catch (error) {
    console.error('خطأ في جلب الكلمات المفتاحية:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب الكلمات المفتاحية',
      keywords: [],
      stats: null
    }, { status: 500 });
  }
}

// POST: تحديث إحصائيات الكلمات المفتاحية (للاستخدام المستقبلي مع قاعدة البيانات)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, refreshCache } = body;

    // في التطبيق الحقيقي، هنا سيتم حفظ البيانات في قاعدة البيانات
    console.log('تحديث الكلمات المفتاحية:', { keywords: keywords?.length, refreshCache });

    // محاكاة تحديث البيانات
    const updatedKeywords = BASE_KEYWORDS.map((keyword: BaseKeywordData) => ({
      ...keyword,
      // محاكاة تغيير طفيف في الأرقام
      count: keyword.count + Math.floor(Math.random() * 10) - 5,
      url: `/news/keywords/${encodeURIComponent(keyword.text)}`,
      lastUpdated: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الكلمات المفتاحية بنجاح',
      updatedCount: updatedKeywords.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في تحديث الكلمات المفتاحية:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث الكلمات المفتاحية'
    }, { status: 500 });
  }
}
