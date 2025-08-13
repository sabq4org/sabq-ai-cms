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

      // إنشاء البيانات النهائية
      const keywords = sortedKeywords.map(([text, count], index) => {
        // حساب الحجم بناءً على الترتيب والتكرار
        let size = 1;
        if (index < 3) size = 5;
        else if (index < 8) size = 4;
        else if (index < 15) size = 3;
        else if (index < 25) size = 2;

        // تحديد الاتجاه (محاكاة - يمكن تطويرها لاحقاً)
        const trend = Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down';

        return {
          id: `keyword-${index}`,
          text,
          count,
          trend,
          size,
          url: `/search?q=${encodeURIComponent(text)}`,
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
      
      // إرجاع بيانات تجريبية في حالة فشل قاعدة البيانات
      const mockKeywords = [
        { id: '1', text: 'السعودية', count: 156, trend: 'up', size: 5, url: '/search?q=السعودية' },
        { id: '2', text: 'الرياض', count: 134, trend: 'up', size: 4, url: '/search?q=الرياض' },
        { id: '3', text: 'اقتصاد', count: 98, trend: 'stable', size: 4, url: '/search?q=اقتصاد' },
        { id: '4', text: 'تقنية', count: 87, trend: 'up', size: 3, url: '/search?q=تقنية' },
        { id: '5', text: 'رؤية', count: 76, trend: 'up', size: 3, url: '/search?q=رؤية' },
        { id: '6', text: 'نيوم', count: 65, trend: 'up', size: 3, url: '/search?q=نيوم' },
        { id: '7', text: 'الذكاء الاصطناعي', count: 54, trend: 'up', size: 2, url: '/search?q=ذكاء+اصطناعي' },
        { id: '8', text: 'الطاقة', count: 43, trend: 'stable', size: 2, url: '/search?q=طاقة' },
        { id: '9', text: 'المملكة', count: 89, trend: 'stable', size: 3, url: '/search?q=المملكة' },
        { id: '10', text: 'جدة', count: 67, trend: 'down', size: 2, url: '/search?q=جدة' },
        { id: '11', text: 'الدمام', count: 45, trend: 'stable', size: 2, url: '/search?q=الدمام' },
        { id: '12', text: 'القمة', count: 38, trend: 'up', size: 2, url: '/search?q=قمة' },
        { id: '13', text: 'استثمار', count: 56, trend: 'up', size: 2, url: '/search?q=استثمار' },
        { id: '14', text: 'تطوير', count: 41, trend: 'up', size: 2, url: '/search?q=تطوير' },
        { id: '15', text: 'البيئة', count: 33, trend: 'stable', size: 1, url: '/search?q=البيئة' }
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
