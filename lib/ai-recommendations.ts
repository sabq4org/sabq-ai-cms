/**
 * 🧠 نظام التوصيات الذكي - سبق الذكية
 * AI Personalized Content Generator
 * 
 * 🎯 الهدف: توليد روابط مقالات مخصصة بناءً على سلوك المستخدم الفعلي
 * 🔍 المصادر: سلوك القراءة + التفاعلات + الكلمات المفتاحية + الاتجاهات الشائعة
 */

export interface RecommendedArticle {
  id: string;
  title: string;
  url: string;
  type: 'تحليل' | 'رأي' | 'مقالة' | 'ملخص' | 'عاجل' | 'تقرير';
  reason: string;
  confidence: number; // درجة الثقة في التوصية (0-100)
  thumbnail?: string;
  publishedAt: string;
  category: string;
  readingTime: number;
  viewsCount: number;
  engagement: number; // معدل التفاعل
}

export interface UserBehavior {
  userId?: string;
  recentArticles: string[]; // آخر 10 مقالات قرأها
  favoriteCategories: string[]; // التصنيفات المفضلة
  readingPatterns: {
    timeOfDay: string[];
    daysOfWeek: string[];
    averageReadingTime: number;
  };
  interactions: {
    liked: string[];
    shared: string[];
    saved: string[];
    commented: string[];
  };
  searchHistory: string[];
  deviceType: 'mobile' | 'desktop';
  location?: string;
}

/**
 * 🔍 تحليل سلوك المستخدم وإرجاع التوصيات المخصصة
 */
export async function generatePersonalizedRecommendations({
  userId,
  currentArticleId,
  currentTags = [],
  currentCategory = '',
  userBehavior,
  limit = 4
}: {
  userId?: string;
  currentArticleId: string;
  currentTags?: string[];
  currentCategory?: string;
  userBehavior?: UserBehavior;
  limit?: number;
}): Promise<RecommendedArticle[]> {
  try {
    // 1. جلب سلوك المستخدم (إذا لم يتم تمريره)
    const behavior = userBehavior || await getUserBehaviorData(userId);
    
    // 2. جلب المقالات المرشحة من مصادر متعددة
    const [
      behaviorBasedArticles,
      categoryBasedArticles, 
      trendingArticles,
      semanticSimilarArticles
    ] = await Promise.all([
      getBehaviorBasedRecommendations(behavior, currentArticleId),
      getCategoryBasedRecommendations(currentCategory, currentArticleId),
      getTrendingRecommendations(currentTags),
      getSemanticSimilarArticles(currentArticleId, currentTags)
    ]);

    // 3. دمج وتسجيل النتائج
    const allRecommendations = [
      ...behaviorBasedArticles,
      ...categoryBasedArticles,
      ...trendingArticles,
      ...semanticSimilarArticles
    ];

    // 4. إزالة التكرار وترتيب حسب الصلة
    const uniqueRecommendations = removeDuplicatesAndScore(
      allRecommendations, 
      behavior,
      currentArticleId
    );

    // 5. إرجاع أفضل التوصيات
    return uniqueRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);

  } catch (error) {
    console.error('❌ خطأ في توليد التوصيات الذكية:', error);
    
    // فولباك: توصيات أساسية
    return await getFallbackRecommendations(currentCategory, currentArticleId, limit);
  }
}

/**
 * 📊 جلب بيانات سلوك المستخدم
 */
async function getUserBehaviorData(userId?: string): Promise<UserBehavior> {
  if (!userId) {
    return getAnonymousUserBehavior();
  }

  try {
    // استخدام API الجديد
    const response = await fetch(`/api/user-behavior?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: فشل جلب بيانات المستخدم`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('✅ تم جلب سلوك المستخدم:', data.data);
      return data.data;
    } else {
      throw new Error(data.error || 'استجابة غير صالحة من الخادم');
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب سلوك المستخدم:', error);
    console.log('🔄 استخدام السلوك الافتراضي...');
    return getAnonymousUserBehavior();
  }
}

/**
 * 🕵️ سلوك المستخدم المجهول (افتراضي)
 */
function getAnonymousUserBehavior(): UserBehavior {
  return {
    recentArticles: [],
    favoriteCategories: ['أخبار', 'تقنية', 'اقتصاد'],
    readingPatterns: {
      timeOfDay: ['morning', 'evening'],
      daysOfWeek: ['sunday', 'monday', 'tuesday'],
      averageReadingTime: 180 // 3 دقائق
    },
    interactions: {
      liked: [],
      shared: [],
      saved: [],
      commented: []
    },
    searchHistory: [],
    deviceType: 'mobile'
  };
}

/**
 * 🎯 توصيات بناءً على سلوك المستخدم
 */
async function getBehaviorBasedRecommendations(
  behavior: UserBehavior, 
  currentArticleId: string
): Promise<RecommendedArticle[]> {
  const recommendations: RecommendedArticle[] = [];

  try {
    // بناءً على التصنيفات المفضلة
    if (behavior.favoriteCategories.length > 0) {
      const categoryArticles = await fetchArticlesByCategories(
        behavior.favoriteCategories, 
        currentArticleId
      );
      
      categoryArticles.forEach(article => {
        recommendations.push({
          ...article,
          reason: `لأنك تهتم بمواضيع ${article.category}`,
          confidence: 85,
          type: determineArticleType(article)
        });
      });
    }

    // بناءً على المقالات التي تفاعل معها
    if (behavior.interactions.liked.length > 0) {
      const similarToLiked = await findSimilarToInteracted(
        behavior.interactions.liked,
        currentArticleId
      );
      
      similarToLiked.forEach(article => {
        recommendations.push({
          ...article,
          reason: 'مشابه لمقالات أعجبتك سابقاً',
          confidence: 90,
          type: determineArticleType(article)
        });
      });
    }

    return recommendations.slice(0, 2); // أفضل 2 توصية

  } catch (error) {
    console.error('خطأ في التوصيات السلوكية:', error);
    return [];
  }
}

/**
 * 📂 توصيات بناءً على نفس التصنيف
 */
async function getCategoryBasedRecommendations(
  category: string, 
  currentArticleId: string
): Promise<RecommendedArticle[]> {
  if (!category) return [];

  try {
    const similarArticles = await fetchArticlesByCategory(category, currentArticleId);
    
    return similarArticles.slice(0, 1).map(article => ({
      ...article,
      reason: `من نفس قسم ${category}`,
      confidence: 70,
      type: determineArticleType(article)
    }));

  } catch (error) {
    console.error('خطأ في توصيات التصنيف:', error);
    return [];
  }
}

/**
 * 🔥 توصيات المقالات الشائعة
 */
async function getTrendingRecommendations(
  tags: string[]
): Promise<RecommendedArticle[]> {
  try {
    const trendingArticles = await fetchTrendingArticles(tags);
    
    return trendingArticles.slice(0, 1).map(article => ({
      ...article,
      reason: `يتفاعل معها ${article.viewsCount.toLocaleString()} قارئ`,
      confidence: 75,
      type: determineArticleType(article)
    }));

  } catch (error) {
    console.error('خطأ في التوصيات الشائعة:', error);
    return [];
  }
}

/**
 * 🧠 توصيات بناءً على التشابه الدلالي
 */
async function getSemanticSimilarArticles(
  articleId: string,
  tags: string[]
): Promise<RecommendedArticle[]> {
  try {
    const similarArticles = await fetchSemanticallySimilarArticles(articleId, tags);
    
    return similarArticles.slice(0, 1).map(article => ({
      ...article,
      reason: 'محتوى مشابه قد يهمك',
      confidence: 80,
      type: determineArticleType(article)
    }));

  } catch (error) {
    console.error('خطأ في التوصيات الدلالية:', error);
    return [];
  }
}

/**
 * 🔄 إزالة التكرار وتسجيل درجات الثقة
 */
function removeDuplicatesAndScore(
  articles: RecommendedArticle[],
  behavior: UserBehavior,
  currentArticleId: string
): RecommendedArticle[] {
  // إزالة المقال الحالي والمكررات
  const seen = new Set([currentArticleId]);
  const unique: RecommendedArticle[] = [];

  articles.forEach(article => {
    if (!seen.has(article.id)) {
      seen.add(article.id);
      
      // تعديل درجة الثقة بناءً على عوامل إضافية
      let adjustedConfidence = article.confidence;
      
      // زيادة الثقة للمقالات الحديثة
      const daysSincePublished = Math.floor(
        (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePublished <= 1) adjustedConfidence += 10;
      else if (daysSincePublished <= 7) adjustedConfidence += 5;
      
      // زيادة الثقة للمقالات عالية التفاعل
      if (article.engagement > 0.1) adjustedConfidence += 5;
      if (article.engagement > 0.2) adjustedConfidence += 10;
      
      unique.push({
        ...article,
        confidence: Math.min(100, adjustedConfidence)
      });
    }
  });

  return unique;
}

/**
 * 🎭 تحديد نوع المقال
 */
function determineArticleType(article: any): RecommendedArticle['type'] {
  const title = article.title.toLowerCase();
  
  if (title.includes('تحليل') || title.includes('دراسة')) return 'تحليل';
  if (title.includes('رأي') || title.includes('وجهة نظر')) return 'رأي';
  if (title.includes('ملخص') || title.includes('خلاصة')) return 'ملخص';
  if (title.includes('عاجل') || title.includes('خبر عاجل')) return 'عاجل';
  if (title.includes('تقرير') || title.includes('تحقيق')) return 'تقرير';
  
  return 'مقالة';
}

/**
 * 🚨 توصيات احتياطية في حالة الخطأ
 */
async function getFallbackRecommendations(
  category: string,
  currentArticleId: string,
  limit: number
): Promise<RecommendedArticle[]> {
  try {
    // محاكاة مقالات احتياطية
    const fallbackArticles = await fetchPopularArticles(limit);
    
    return fallbackArticles.map((article, index) => ({
      ...article,
      reason: 'مقالة شائعة',
      confidence: 60 - (index * 5),
      type: 'مقالة' as const
    }));

  } catch (error) {
    console.error('فشل في جلب التوصيات الاحتياطية:', error);
    return [];
  }
}

// =============================================================================
// 📡 دوال API المحاكاة (يجب استبدالها بـ APIs حقيقية)
// =============================================================================

async function fetchArticlesByCategories(categories: string[], excludeId: string) {
  // محاكاة API call
  return mockArticles.filter(article => 
    categories.includes(article.category) && article.id !== excludeId
  );
}

async function findSimilarToInteracted(likedIds: string[], excludeId: string) {
  // محاكاة العثور على مقالات مشابهة للمقالات التي أعجب بها المستخدم
  return mockArticles.filter(article => 
    article.id !== excludeId && Math.random() > 0.7
  );
}

async function fetchArticlesByCategory(category: string, excludeId: string) {
  return mockArticles.filter(article => 
    article.category === category && article.id !== excludeId
  );
}

async function fetchTrendingArticles(tags: string[]) {
  return mockArticles
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 5);
}

async function fetchSemanticallySimilarArticles(articleId: string, tags: string[]) {
  // محاكاة التشابه الدلالي
  return mockArticles.filter(article => 
    article.id !== articleId && Math.random() > 0.6
  );
}

async function fetchPopularArticles(limit: number) {
  return mockArticles
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, limit);
}

// =============================================================================
// 🎭 بيانات محاكاة للاختبار
// =============================================================================

const mockArticles = [
  {
    id: 'ai-future-work-2025',
    title: 'تحليل مباشر: مستقبل العمل مع الذكاء الاصطناعي في 2025',
    url: '/article/ai-future-work-2025',
    thumbnail: '/images/ai-future.jpg',
    publishedAt: '2025-07-20T10:00:00Z',
    category: 'تقنية',
    readingTime: 5,
    viewsCount: 15420,
    engagement: 0.25
  },
  {
    id: 'women-economic-empowerment',
    title: 'رأي: التمكين الاقتصادي للمرأة السعودية - نجاحات وتحديات',
    url: '/article/women-economic-empowerment', 
    thumbnail: '/images/women-empowerment.jpg',
    publishedAt: '2025-07-21T14:30:00Z',
    category: 'اقتصاد',
    readingTime: 4,
    viewsCount: 8930,
    engagement: 0.18
  },
  {
    id: 'neom-weekly-summary',
    title: 'ملخّص ذكي: أهم ما دار حول مشروع نيوم هذا الأسبوع',
    url: '/article/neom-weekly-summary',
    thumbnail: '/images/neom-summary.jpg', 
    publishedAt: '2025-07-22T08:15:00Z',
    category: 'أخبار',
    readingTime: 3,
    viewsCount: 12500,
    engagement: 0.22
  },
  {
    id: 'sports-analysis-saudi',
    title: 'تحليل: الرياضة السعودية وخطط الاستثمار الجديدة',
    url: '/article/sports-analysis-saudi',
    thumbnail: '/images/sports-saudi.jpg',
    publishedAt: '2025-07-19T16:45:00Z',
    category: 'رياضة',
    readingTime: 6,
    viewsCount: 7600,
    engagement: 0.15
  }
];
