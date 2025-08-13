/**
 * API لجلب الكلمات المفتاحية الرائجة
 * GET /api/analytics/trending-keywords
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // استخراج المعاملات من URL
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const timeframe = searchParams.get('timeframe') || '7d'; // 7d, 30d, 90d

    // حساب تاريخ البداية حسب الإطار الزمني
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    try {
      // جلب المقالات الحديثة مع العناوين والمحتوى
      const articles = await prisma.articles.findMany({
        where: {
          status: 'published',
          created_at: {
            gte: startDate
          }
        },
        select: {
          id: true,
          title: true,
          summary: true,
          content: true
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 200 // نأخذ عينة كبيرة للتحليل
      });

      // استخراج الكلمات المفتاحية من النصوص
      const keywordCounts = new Map<string, number>();
      const keywordArticles = new Map<string, string[]>();

      // قائمة الكلمات المستبعدة (stop words)
      const stopWords = new Set([
        'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
        'التي', 'الذي', 'التي', 'اللذان', 'اللتان', 'الذين', 'اللاتي', 'اللواتي',
        'كان', 'كانت', 'يكون', 'تكون', 'أن', 'إن', 'كل', 'بعض', 'أي', 'أية',
        'لا', 'لم', 'لن', 'ما', 'لما', 'إذا', 'إذ', 'حيث', 'كيف', 'متى', 'أين',
        'هو', 'هي', 'هم', 'هن', 'أنت', 'أنتم', 'أنتن', 'أنا', 'نحن',
        'قال', 'قالت', 'أضاف', 'أضافت', 'أوضح', 'أوضحت', 'أشار', 'أشارت',
        'كما', 'أيضا', 'أيضاً', 'كذلك', 'وقد', 'فقد', 'قد', 'سوف', 'سيتم', 'تم'
      ]);

      // تحليل النصوص
      articles.forEach((article: any) => {
        // دمج النصوص
        const text = `${article.title} ${article.summary || ''} ${article.content || ''}`.toLowerCase();
        
        // استخراج الكلمات العربية (3 أحرف أو أكثر)
        const words = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]{3,}/g) || [];
        
        words.forEach(word => {
          // تنظيف الكلمة
          const cleanWord = word.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, '').trim();
          
          if (cleanWord.length >= 3 && !stopWords.has(cleanWord)) {
            keywordCounts.set(cleanWord, (keywordCounts.get(cleanWord) || 0) + 1);
            
            if (!keywordArticles.has(cleanWord)) {
              keywordArticles.set(cleanWord, []);
            }
            keywordArticles.get(cleanWord)!.push(article.id);
          }
        });
      });

      // تحويل إلى مصفوفة وترتيب حسب التكرار
      const sortedKeywords = Array.from(keywordCounts.entries())
        .filter(([word, count]) => count >= 3) // الكلمات التي تظهر 3 مرات على الأقل
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      // إنشاء البيانات النهائية بالتنسيق الجديد
      const keywords = sortedKeywords.map(([text, count], index) => {
        // حساب الوزن (1-100) بناءً على التكرار
        const maxCount = sortedKeywords[0][1];
        const weight = Math.round((count / maxCount) * 100);

        // تحديد فئة اللون حسب السياق
        let colorKey = 'misc';
        if (['السعودية', 'الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'].some(city => text.includes(city))) {
          colorKey = 'geo';
        } else if (['اقتصاد', 'استثمار', 'تجارة', 'مال', 'أسهم', 'نفط'].some(eco => text.includes(eco))) {
          colorKey = 'economy';
        } else if (['سياسة', 'حكومة', 'وزير', 'أمير', 'ملك'].some(pol => text.includes(pol))) {
          colorKey = 'politics';
        } else if (['حرب', 'صراع', 'نزاع', 'قتال'].some(conf => text.includes(conf))) {
          colorKey = 'conflict';
        } else if (['تقنية', 'ذكاء', 'رقمي', 'تكنولوجيا', 'الذكاء الاصطناعي'].some(tech => text.includes(tech))) {
          colorKey = 'tech';
        } else if (['رياضة', 'كرة', 'لاعب', 'نادي', 'بطولة'].some(sport => text.includes(sport))) {
          colorKey = 'sports';
        }

        // تحديد الاتجاه (محاكاة - يمكن تطويرها لاحقاً للمقارنة مع الفترة السابقة)
        const trendRandom = Math.random();
        let trend: 'up' | 'down' | 'flat' = 'flat';
        if (trendRandom > 0.7) trend = 'up';
        else if (trendRandom < 0.3) trend = 'down';

        return {
          id: `keyword-${index + 1}`,
          text,
          weight,
          count,
          colorKey,
          trend,
          href: `/search?q=${encodeURIComponent(text)}`,
          articleIds: keywordArticles.get(text) || []
        };
      });

      return NextResponse.json({
        success: true,
        keywords,
        total: keywords.length,
        timeframe,
        generatedAt: new Date().toISOString()
      });

    } catch (dbError) {
      console.error('خطأ في الاتصال بقاعدة البيانات:', dbError);
      
      // إرجاع بيانات تجريبية محدثة في حالة فشل قاعدة البيانات
      const mockKeywords = [
        { id: '1', text: 'السعودية', weight: 95, count: 156, colorKey: 'geo', trend: 'up', href: '/search?q=السعودية' },
        { id: '2', text: 'الرياض', weight: 88, count: 134, colorKey: 'geo', trend: 'up', href: '/search?q=الرياض' },
        { id: '3', text: 'اقتصاد', weight: 75, count: 98, colorKey: 'economy', trend: 'flat', href: '/search?q=اقتصاد' },
        { id: '4', text: 'تقنية', weight: 68, count: 87, colorKey: 'tech', trend: 'up', href: '/search?q=تقنية' },
        { id: '5', text: 'رؤية', weight: 62, count: 76, colorKey: 'politics', trend: 'up', href: '/search?q=رؤية' },
        { id: '6', text: 'نيوم', weight: 58, count: 65, colorKey: 'economy', trend: 'up', href: '/search?q=نيوم' },
        { id: '7', text: 'الذكاء الاصطناعي', weight: 52, count: 54, colorKey: 'tech', trend: 'up', href: '/search?q=ذكاء+اصطناعي' },
        { id: '8', text: 'الطاقة', weight: 45, count: 43, colorKey: 'economy', trend: 'flat', href: '/search?q=طاقة' },
        { id: '9', text: 'المملكة', weight: 72, count: 89, colorKey: 'geo', trend: 'flat', href: '/search?q=المملكة' },
        { id: '10', text: 'جدة', weight: 59, count: 67, colorKey: 'geo', trend: 'down', href: '/search?q=جدة' },
        { id: '11', text: 'الدمام', weight: 42, count: 45, colorKey: 'geo', trend: 'flat', href: '/search?q=الدمام' },
        { id: '12', text: 'القمة', weight: 38, count: 38, colorKey: 'politics', trend: 'up', href: '/search?q=قمة' },
        { id: '13', text: 'استثمار', weight: 48, count: 56, colorKey: 'economy', trend: 'up', href: '/search?q=استثمار' },
        { id: '14', text: 'تطوير', weight: 41, count: 41, colorKey: 'misc', trend: 'up', href: '/search?q=تطوير' },
        { id: '15', text: 'البيئة', weight: 35, count: 33, colorKey: 'misc', trend: 'flat', href: '/search?q=البيئة' }
      ];

      return NextResponse.json({
        success: true,
        keywords: mockKeywords.slice(0, limit),
        total: mockKeywords.length,
        timeframe,
        isMock: true,
        generatedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('خطأ في API الكلمات المفتاحية:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في جلب الكلمات المفتاحية',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, {
      status: 500
    });
  }
}

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, {
    status: 405
  });
}
