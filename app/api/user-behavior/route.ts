import { NextRequest, NextResponse } from 'next/server';
import { UserBehavior } from '@/lib/ai-recommendations';

/**
 * 📊 API لجلب سلوك المستخدم للتوصيات الذكية
 * GET /api/user-behavior?userId=123
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    console.log('🔍 جلب سلوك المستخدم:', userId);

    // محاكاة جلب سلوك المستخدم من قاعدة البيانات
    const userBehavior: UserBehavior = await fetchUserBehaviorFromDB(userId);

    return NextResponse.json({
      success: true,
      data: userBehavior
    });

  } catch (error) {
    console.error('❌ خطأ في جلب سلوك المستخدم:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطأ في جلب بيانات المستخدم',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

/**
 * 🔍 جلب سلوك المستخدم من قاعدة البيانات (محاكاة)
 */
async function fetchUserBehaviorFromDB(userId: string): Promise<UserBehavior> {
  // محاكاة تأخير شبكة
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // محاكاة بيانات سلوك مستخدم حقيقي بناءً على معرف المستخدم
  const mockUserBehaviors: Record<string, UserBehavior> = {
    'tech_enthusiast': {
      userId: 'tech_enthusiast',
      recentArticles: ['ai-article-123', 'blockchain-news-456', 'startup-analysis-789'],
      favoriteCategories: ['تقنية', 'ذكاء اصطناعي', 'ريادة أعمال'],
      readingPatterns: {
        timeOfDay: ['morning', 'evening'],
        daysOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
        averageReadingTime: 420 // 7 دقائق - قارئ متعمق
      },
      interactions: {
        liked: ['ai-article-123', 'machine-learning-guide-321', 'tech-future-654'],
        shared: ['blockchain-news-456', 'startup-success-story-789'],
        saved: ['programming-tips-111', 'ai-ethics-222', 'crypto-investment-333'],
        commented: ['ai-article-123', 'tech-debate-456']
      },
      searchHistory: [
        'الذكاء الاصطناعي في السعودية', 
        'تطبيقات البلوك تشين', 
        'استثمار في الشركات التقنية',
        'مستقبل البرمجة'
      ],
      deviceType: 'desktop',
      location: 'الرياض'
    },
    
    'business_reader': {
      userId: 'business_reader',
      recentArticles: ['economy-report-111', 'market-analysis-222', 'investment-guide-333'],
      favoriteCategories: ['اقتصاد', 'أعمال', 'استثمار', 'أسواق مالية'],
      readingPatterns: {
        timeOfDay: ['morning', 'afternoon'],
        daysOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
        averageReadingTime: 360 // 6 دقائق
      },
      interactions: {
        liked: ['stock-market-analysis-444', 'business-strategy-555'],
        shared: ['economic-forecast-666', 'investment-opportunity-777'],
        saved: ['financial-planning-888', 'market-trends-999', 'business-growth-000'],
        commented: ['market-discussion-111']
      },
      searchHistory: [
        'السوق السعودي للأسهم', 
        'الاستثمار في العقار', 
        'رؤية 2030 والاقتصاد',
        'الشركات الناشئة السعودية'
      ],
      deviceType: 'mobile',
      location: 'جدة'
    },
    
    'sports_fan': {
      userId: 'sports_fan',
      recentArticles: ['football-match-123', 'sports-news-456', 'athlete-profile-789'],
      favoriteCategories: ['رياضة', 'كرة قدم', 'أولمبياد'],
      readingPatterns: {
        timeOfDay: ['evening', 'night'],
        daysOfWeek: ['thursday', 'friday', 'saturday', 'sunday'],
        averageReadingTime: 240 // 4 دقائق
      },
      interactions: {
        liked: ['al-hilal-victory-123', 'world-cup-coverage-456'],
        shared: ['sports-highlights-789', 'player-transfer-news-000'],
        saved: ['fitness-tips-111', 'training-routines-222'],
        commented: ['match-discussion-333', 'team-performance-444']
      },
      searchHistory: [
        'الهلال والنصر', 
        'كأس العالم 2026', 
        'الرياضة السعودية',
        'محمد صلاح'
      ],
      deviceType: 'mobile',
      location: 'الدمام'
    }
  };

  // إرجاع سلوك المستخدم إذا وُجد، وإلا سلوك افتراضي ذكي
  return mockUserBehaviors[userId] || generateDefaultUserBehavior(userId);
}

/**
 * 🎲 توليد سلوك افتراضي ذكي للمستخدم الجديد
 */
function generateDefaultUserBehavior(userId: string): UserBehavior {
  // اختيار اهتمامات عشوائية واقعية
  const allCategories = ['أخبار', 'تقنية', 'اقتصاد', 'رياضة', 'صحة', 'ثقافة', 'سفر'];
  const randomCategories = allCategories
    .sort(() => 0.5 - Math.random())
    .slice(0, 3); // اختيار 3 تصنيفات عشوائية

  const deviceTypes = ['mobile', 'desktop'] as const;
  const locations = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'];

  return {
    userId: userId,
    recentArticles: [],
    favoriteCategories: randomCategories,
    readingPatterns: {
      timeOfDay: ['morning', 'evening'],
      daysOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
      averageReadingTime: 180 + Math.floor(Math.random() * 240) // بين 3-7 دقائق
    },
    interactions: {
      liked: [],
      shared: [],
      saved: [],
      commented: []
    },
    searchHistory: [],
    deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
    location: locations[Math.floor(Math.random() * locations.length)]
  };
}

/**
 * 📝 تحديث سلوك المستخدم (POST)
 * يُستخدم لتسجيل تفاعلات جديدة
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, articleId, category, searchQuery } = body;
    
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم ونوع الإجراء مطلوبان' },
        { status: 400 }
      );
    }
    
    console.log(`📊 تحديث سلوك المستخدم ${userId}:`, { action, articleId, category });
    
    // في التطبيق الحقيقي، ستحفظ البيانات في قاعدة البيانات
    // مثال تسجيل الإجراءات المختلفة:
    switch (action) {
      case 'like':
        console.log(`❤️ إعجاب بالمقال ${articleId}`);
        break;
      case 'share':
        console.log(`📤 مشاركة المقال ${articleId}`);
        break;
      case 'save':
        console.log(`💾 حفظ المقال ${articleId}`);
        break;
      case 'comment':
        console.log(`💬 تعليق على المقال ${articleId}`);
        break;
      case 'view':
        console.log(`👁️ مشاهدة المقال ${articleId}`);
        break;
      case 'search':
        console.log(`🔍 بحث عن: ${searchQuery}`);
        break;
      default:
        console.log(`🔄 إجراء عام: ${action}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديث سلوك المستخدم بنجاح',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث سلوك المستخدم:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في تحديث السلوك',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
