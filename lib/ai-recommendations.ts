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
  limit = 6
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
      semanticSimilarArticles,
      mixedContentArticles
    ] = await Promise.all([
      getBehaviorBasedRecommendations(behavior, currentArticleId),
      getCategoryBasedRecommendations(currentCategory, currentArticleId),
      getTrendingRecommendations(currentTags),
      getSemanticSimilarArticles(currentArticleId, currentTags),
      getSmartMixedContent(behavior, currentArticleId) // كوكتيل ذكي جديد
    ]);

    // 3. دمج وتسجيل النتائج
    const allRecommendations = [
      ...behaviorBasedArticles,
      ...categoryBasedArticles,
      ...trendingArticles,
      ...semanticSimilarArticles,
      ...mixedContentArticles
    ];

    // 4. إزالة التكرار وترتيب حسب الصلة
    const uniqueRecommendations = removeDuplicatesAndScore(
      allRecommendations, 
      behavior,
      currentArticleId
    );

    // 5. ضمان التنوع في أنواع المحتوى
    const diversifiedRecommendations = ensureContentDiversity(uniqueRecommendations, limit);

    // 6. إرجاع أفضل التوصيات
    return diversifiedRecommendations
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

/**
 * 🍹 كوكتيل المحتوى الذكي - مزيج متنوع من أنواع المحتوى
 */
async function getSmartMixedContent(
  behavior: UserBehavior,
  currentArticleId: string
): Promise<RecommendedArticle[]> {
  const mixedContent: RecommendedArticle[] = [];
  
  try {
    // 1. محتوى خفيف (أخبار سريعة)
    const lightContent = await fetchArticlesByType(['عاجل', 'ملخص'], currentArticleId, 2);
    lightContent.forEach(article => {
      mixedContent.push({
        ...article,
        reason: 'محتوى خفيف لقراءة سريعة',
        confidence: 75,
        type: article.type || 'ملخص'
      });
    });
    
    // 2. محتوى عميق (تحليلات)
    const deepContent = await fetchArticlesByType(['تحليل', 'تقرير'], currentArticleId, 2);
    deepContent.forEach(article => {
      mixedContent.push({
        ...article,
        reason: 'تحليل معمق يثري معرفتك',
        confidence: 80,
        type: article.type || 'تحليل'
      });
    });
    
    // 3. محتوى رأي (وجهات نظر)
    const opinionContent = await fetchArticlesByType(['رأي'], currentArticleId, 1);
    opinionContent.forEach(article => {
      mixedContent.push({
        ...article,
        reason: 'وجهة نظر قد تغير تفكيرك',
        confidence: 70,
        type: article.type || 'رأي'
      });
    });
    
    // 4. محتوى إبداعي (قصص ومقالات خاصة)
    const creativeContent = await fetchArticlesByType(['مقالة'], currentArticleId, 1);
    creativeContent.forEach(article => {
      mixedContent.push({
        ...article,
        reason: 'محتوى إبداعي يلهمك',
        confidence: 68,
        type: article.type || 'مقالة'
      });
    });
    
  } catch (error) {
    console.error('⚠️ خطأ في توليد الكوكتيل الذكي:', error);
  }
  
  return mixedContent;
}

/**
 * 🖼️ الحصول على صورة افتراضية حسب نوع المحتوى
 */
function getDefaultImageByType(type: RecommendedArticle['type']): string {
  // مجموعة متنوعة من الصور التجريبية عالية الجودة
  const defaultImages = {
    'تحليل': [
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&h=600&fit=crop'
    ],
    'رأي': [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=800&h=600&fit=crop'
    ],
    'عاجل': [
      'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop'
    ],
    'مقالة': [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop'
    ],
    'تقرير': [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop'
    ],
    'ملخص': [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop'
    ]
  };
  
  const images = defaultImages[type] || defaultImages['مقالة'];
  // اختيار صورة عشوائية من المجموعة
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * 🎯 ضمان التنوع في أنواع المحتوى
 */
function ensureContentDiversity(
  recommendations: RecommendedArticle[],
  targetCount: number
): RecommendedArticle[] {
  const typeGroups: { [key: string]: RecommendedArticle[] } = {};
  const diversified: RecommendedArticle[] = [];
  
  // تجميع حسب النوع
  recommendations.forEach(article => {
    const type = article.type || 'مقالة';
    if (!typeGroups[type]) {
      typeGroups[type] = [];
    }
    typeGroups[type].push(article);
  });
  
  // أخذ عينة متنوعة من كل نوع
  const typePriority = ['عاجل', 'تحليل', 'رأي', 'تقرير', 'ملخص', 'مقالة'];
  let addedCount = 0;
  
  // جولة أولى: أخذ مقال واحد من كل نوع
  for (const type of typePriority) {
    if (typeGroups[type] && typeGroups[type].length > 0 && addedCount < targetCount) {
      diversified.push(typeGroups[type].shift()!);
      addedCount++;
    }
  }
  
  // جولة ثانية: ملء الباقي حسب الثقة
  const remaining = recommendations
    .filter(r => !diversified.includes(r))
    .sort((a, b) => b.confidence - a.confidence);
  
  diversified.push(...remaining.slice(0, targetCount - addedCount));
  
  return diversified;
}

/**
 * 📰 جلب مقالات حسب النوع
 */
async function fetchArticlesByType(
  types: string[],
  excludeId: string,
  limit: number
): Promise<RecommendedArticle[]> {
  try {
    // بدلاً من استخدام types، سنجلب مقالات عشوائية
    // يمكن تحسين هذا لاحقاً بإضافة منطق أكثر ذكاءً
    const response = await fetch(`/api/articles?exclude=${excludeId}&limit=${limit}&status=published&sortBy=published_at&order=desc`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (data.success && data.articles) {
      // فلترة المقالات حسب النوع من metadata إن وجد
      const filteredArticles = data.articles.filter((article: any) => {
        if (!article.metadata?.type) return true; // إذا لم يكن هناك نوع، اعتبره صالح
        return types.some(type => article.metadata.type === type);
      });
      
      return filteredArticles.slice(0, limit).map((article: any) => ({
        id: article.id,
        title: article.title,
        url: `/article/${article.id}`,
        type: article.metadata?.type || 'مقالة',
        reason: getSmartReason(article.metadata?.type),
        confidence: Math.floor(Math.random() * 20) + 70, // 70-90
        thumbnail: article.featured_image || article.thumbnail || getDefaultImageByType(determineArticleType(article)),
        publishedAt: article.published_at,
        category: article.category_name || article.categories?.name || article.category,
        readingTime: article.reading_time || Math.ceil((article.content?.length || 1000) / 200),
        viewsCount: article.views || 0,
        engagement: article.engagement_score || 0
      }));
    }
    
    return [];
  } catch (error) {
    console.error('❌ خطأ في جلب المقالات حسب النوع:', error);
    return [];
  }
}

/**
 * 💡 توليد أسباب ذكية للتوصية
 */
function getSmartReason(type?: string): string {
  const reasons = {
    'تحليل': [
      'تحليل يربط الأحداث بسياقها الأوسع',
      'رؤية معمقة تكشف ما وراء الخبر',
      'تحليل ذكي يساعدك على الفهم الأعمق'
    ],
    'رأي': [
      'وجهة نظر جديدة تثري النقاش',
      'رأي جريء يستحق القراءة',
      'منظور مختلف قد يغير قناعاتك'
    ],
    'عاجل': [
      'آخر التطورات في الحدث',
      'خبر عاجل يهمك',
      'تطور مهم يجب متابعته'
    ],
    'تقرير': [
      'تقرير شامل بالأرقام والحقائق',
      'معلومات موثقة ومفصلة',
      'تغطية شاملة للموضوع'
    ],
    'ملخص': [
      'خلاصة مركزة توفر وقتك',
      'أهم النقاط في دقائق',
      'ملخص ذكي للأحداث المهمة'
    ],
    'مقالة': [
      'قراءة ممتعة ومفيدة',
      'محتوى مميز يستحق وقتك',
      'مقال يجمع بين المتعة والفائدة'
    ]
  };
  
  const typeReasons = reasons[type as keyof typeof reasons] || reasons['مقالة'];
  return typeReasons[Math.floor(Math.random() * typeReasons.length)];
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
