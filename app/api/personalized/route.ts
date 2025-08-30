import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function لحساب الوقت النسبي  
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'منذ أقل من ساعة'
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  return date.toLocaleDateString('ar-SA')
}

// حساب درجة التخصيص بناءً على اهتمامات المستخدم
function calculatePersonalizationScore(
  article: any,
  userCategories: string[],
  userInteractions: any[]
): number {
  let score = 0.5 // النتيجة الأساسية

  // التطابق مع الفئات المفضلة
  if (userCategories.includes(article.category)) {
    score += 0.3
  }

  // التفاعل السابق مع المؤلف
  const authorInteractions = userInteractions.filter(i => i.authorId === article.authorId)
  if (authorInteractions.length > 0) {
    score += 0.1
  }

  // حداثة المقال
  const hoursSincePublished = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
  if (hoursSincePublished < 24) {
    score += 0.1
  }

  return Math.min(score, 1.0)
}

export async function GET(req: NextRequest) {
  const startTime = performance.now()
  
  // رؤوس private cache - لا يتم تخزين المحتوى المخصص مشتركاً
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'private, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Vary': 'Cookie, Authorization'
  }

  try {
    // محاكاة بيانات مخصصة للاختبار
    const mockRecommendedArticles = [
      {
        id: '1',
        title: 'تطوير الذكاء الاصطناعي في السعودية يشهد نمواً متسارعاً',
        excerpt: 'تشهد المملكة العربية السعودية تطوراً كبيراً في مجال الذكاء الاصطناعي ضمن رؤية 2030...',
        category: 'تقنية',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        timeAgo: 'منذ ساعتين',
        imageUrl: 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=AI+Development',
        readTime: 5,
        views: 1250,
        score: 0.95,
        reason: 'من اهتماماتك: تقنية'
      },
      {
        id: '2', 
        title: 'مونديال 2034: السعودية تستعد لاستضافة أكبر حدث رياضي',
        excerpt: 'تتجه الأنظار إلى السعودية كمرشح قوي لاستضافة كأس العالم 2034...',
        category: 'رياضة',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        timeAgo: 'منذ 4 ساعات',
        imageUrl: 'https://via.placeholder.com/400x200/16a34a/ffffff?text=World+Cup+2034',
        readTime: 4,
        views: 890,
        score: 0.87,
        reason: 'بناءً على قراءاتك السابقة'
      },
      {
        id: '3',
        title: 'اقتصاد المملكة يسجل نمواً قياسياً في القطاع غير النفطي',
        excerpt: 'حقق الاقتصاد السعودي إنجازات مهمة في تنويع مصادر الدخل...',
        category: 'اقتصاد',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        timeAgo: 'منذ 8 ساعات',
        imageUrl: 'https://via.placeholder.com/400x200/f59e0b/ffffff?text=Economy+Growth',
        readTime: 6,
        views: 2100,
        score: 0.82,
        reason: 'رائج هذا الأسبوع'
      }
    ]

    const mockTrendingArticles = [
      {
        id: '4',
        title: 'مهرجان الرياض للكتاب يجذب أكثر من مليون زائر',
        excerpt: 'شهد معرض الرياض الدولي للكتاب إقبالاً جماهيرياً كبيراً...',
        category: 'ثقافة',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        timeAgo: 'منذ 6 ساعات',
        imageUrl: 'https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Book+Festival',
        readTime: 3,
        views: 3200,
        score: 0.9,
        reason: 'الأكثر قراءة اليوم'
      },
      {
        id: '5',
        title: 'نيوم تكشف عن مشاريع جديدة في مجال الطاقة المتجددة',
        excerpt: 'أعلنت نيوم عن خطط طموحة لتطوير مشاريع الطاقة المتجددة...',
        category: 'بيئة',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        timeAgo: 'منذ 12 ساعة',
        imageUrl: 'https://via.placeholder.com/400x200/10b981/ffffff?text=NEOM+Energy',
        readTime: 7,
        views: 1800,
        score: 0.85,
        reason: 'مشروع رائد'
      }
    ]

    const response = {
      items: mockRecommendedArticles,
      recommendations: {
        trending: mockTrendingArticles,
        similar: mockRecommendedArticles.slice(1),
        categories: []
      },
      userPreferences: {
        topCategories: ['تقنية', 'رياضة', 'اقتصاد', 'ثقافة'],
        readingHabits: [
          'قرأت 45 مقال هذا الشهر',
          'الفئة المفضلة: تقنية',
          'متوسط القراءة يومياً: 2 مقال',
          'تفضل القراءة في المساء'
        ]
      }
    }

    const endTime = performance.now()

    return new Response(JSON.stringify(response), { 
      headers: {
        ...headers,
        'Server-Timing': `personalized;dur=${(endTime - startTime).toFixed(2)}`
      }
    })

  } catch (error) {
    console.error('Error generating personalized content:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'فشل في جلب المحتوى المخصص',
        items: [],
        recommendations: { trending: [], similar: [], categories: [] },
        userPreferences: { topCategories: [], readingHabits: [] }
      }),
      { 
        status: 500, 
        headers 
      }
    )
  }
}
