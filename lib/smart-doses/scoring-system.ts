// نظام التقييم الذكي لمنع أخطاء الذكاء الاصطناعي
export interface ArticleScore {
  articleId: string;
  relevanceScore: number; // مدى الصلة بالموضوع
  freshnessScore: number; // حداثة الخبر  
  engagementScore: number; // التفاعل المتوقع
  qualityScore: number; // جودة المحتوى
  timingScore: number; // مناسبة التوقيت
  finalScore: number; // النتيجة النهائية
  reasons: string[]; // أسباب التقييم
}

export interface ScoringWeights {
  relevance: number;
  freshness: number; 
  engagement: number;
  quality: number;
  timing: number;
}

// أوزان مختلفة حسب وقت الجرعة
export const TIME_BASED_WEIGHTS: Record<string, ScoringWeights> = {
  morning: {
    relevance: 0.25,
    freshness: 0.30, // الأخبار الجديدة مهمة صباحاً
    engagement: 0.20,
    quality: 0.15,
    timing: 0.10
  },
  noon: {
    relevance: 0.35, // الصلة أهم في الظهيرة
    freshness: 0.25,
    engagement: 0.20,
    quality: 0.15,
    timing: 0.05
  },
  evening: {
    relevance: 0.20,
    freshness: 0.15,
    engagement: 0.30, // التفاعل مهم مساءً
    quality: 0.25, // الجودة مهمة للقراءة المتأنية
    timing: 0.10
  },
  night: {
    relevance: 0.15,
    freshness: 0.10,
    engagement: 0.15,
    quality: 0.35, // الجودة الأهم قبل النوم
    timing: 0.25 // التوقيت حرج جداً
  }
};

// قاموس الكلمات المفتاحية الذكية
export const KEYWORD_SCORING = {
  // كلمات إيجابية تزيد النقاط
  positive: [
    'إنجاز', 'نجح', 'تطوير', 'ازدهار', 'نمو', 'ابتكار', 'تقدم',
    'فوز', 'انتصار', 'إبداع', 'استثمار', 'فرصة', 'مبادرة', 'رؤية'
  ],
  
  // كلمات سلبية تقلل النقاط (خاصة في أوقات معينة)
  negative: [
    'حادث', 'وفاة', 'انهيار', 'أزمة', 'كارثة', 'فشل', 'انخفاض',
    'تراجع', 'خسارة', 'إغلاق', 'توقف', 'منع', 'حظر', 'عجز'
  ],
  
  // كلمات عاجلة تزيد الأهمية
  urgent: [
    'عاجل', 'طارئ', 'هام', 'إعلان', 'قرار', 'تطوير', 'تغيير',
    'إطلاق', 'افتتاح', 'توقيع', 'اتفاقية', 'مشروع'
  ],

  // كلمات محلية تزيد الصلة
  local: [
    'السعودية', 'الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام',
    'سعودي', 'المملكة', 'رؤية 2030', 'نيوم', 'القدية'
  ]
};

// حساب درجة الصلة
export function calculateRelevanceScore(article: any, userPreferences?: string[]): number {
  let score = 50; // نقطة البداية
  
  // التحقق من الكلمات المفتاحية الإيجابية
  const text = `${article.title} ${article.excerpt || ''}`.toLowerCase();
  
  KEYWORD_SCORING.positive.forEach(keyword => {
    if (text.includes(keyword)) score += 8;
  });
  
  KEYWORD_SCORING.urgent.forEach(keyword => {
    if (text.includes(keyword)) score += 12;
  });
  
  KEYWORD_SCORING.local.forEach(keyword => {
    if (text.includes(keyword)) score += 6;
  });
  
  // مطابقة تفضيلات المستخدم
  if (userPreferences?.length) {
    userPreferences.forEach(pref => {
      if (text.includes(pref.toLowerCase())) score += 15;
    });
  }
  
  return Math.min(100, Math.max(0, score));
}

// حساب درجة الحداثة
export function calculateFreshnessScore(article: any): number {
  const now = new Date();
  const publishedAt = new Date(article.published_at || article.created_at);
  const hoursDiff = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
  
  // النقاط تقل تدريجياً مع الوقت
  if (hoursDiff < 1) return 100; // أقل من ساعة
  if (hoursDiff < 6) return 90;  // أقل من 6 ساعات
  if (hoursDiff < 12) return 75; // أقل من 12 ساعة
  if (hoursDiff < 24) return 50; // أقل من يوم
  if (hoursDiff < 48) return 25; // أقل من يومين
  return 10; // أكثر من يومين
}

// حساب درجة التفاعل المتوقع
export function calculateEngagementScore(article: any): number {
  const views = article.views_count || 0;
  const likes = article.likes_count || 0;
  const comments = article.comments_count || 0;
  
  // تطبيع النقاط
  const viewScore = Math.min(40, views / 100);
  const likeScore = Math.min(30, likes * 2);
  const commentScore = Math.min(30, comments * 5);
  
  return viewScore + likeScore + commentScore;
}

// حساب درجة الجودة
export function calculateQualityScore(article: any): number {
  let score = 60; // نقطة البداية
  
  // طول العنوان مناسب
  const titleLength = article.title?.length || 0;
  if (titleLength > 20 && titleLength < 80) score += 15;
  
  // وجود ملخص
  if (article.excerpt && article.excerpt.length > 50) score += 10;
  
  // وجود صورة
  if (article.featured_image) score += 10;
  
  // وجود كاتب
  if (article.author_name && article.author_name !== 'غير محدد') score += 5;
  
  return Math.min(100, score);
}

// حساب درجة التوقيت
export function calculateTimingScore(article: any, timeSlot: string): number {
  const text = `${article.title} ${article.excerpt || ''}`.toLowerCase();
  let score = 70; // نقطة البداية
  
  // تقييم خاص لكل وقت
  switch (timeSlot) {
    case 'morning':
      // تفضيل الأخبار الإيجابية والمحفزة
      KEYWORD_SCORING.positive.forEach(keyword => {
        if (text.includes(keyword)) score += 8;
      });
      break;
      
    case 'night':
      // خصم نقاط للأخبار السلبية
      KEYWORD_SCORING.negative.forEach(keyword => {
        if (text.includes(keyword)) score -= 20;
      });
      break;
      
    case 'noon':
      // تفضيل الأخبار العاجلة
      KEYWORD_SCORING.urgent.forEach(keyword => {
        if (text.includes(keyword)) score += 10;
      });
      break;
  }
  
  return Math.min(100, Math.max(0, score));
}

// النظام الرئيسي للتقييم
export function scoreArticleForDose(
  article: any, 
  timeSlot: string, 
  userPreferences?: string[]
): ArticleScore {
  const weights = TIME_BASED_WEIGHTS[timeSlot] || TIME_BASED_WEIGHTS.morning;
  
  const relevanceScore = calculateRelevanceScore(article, userPreferences);
  const freshnessScore = calculateFreshnessScore(article);
  const engagementScore = calculateEngagementScore(article);
  const qualityScore = calculateQualityScore(article);
  const timingScore = calculateTimingScore(article, timeSlot);
  
  const finalScore = 
    relevanceScore * weights.relevance +
    freshnessScore * weights.freshness +
    engagementScore * weights.engagement +
    qualityScore * weights.quality +
    timingScore * weights.timing;
  
  const reasons: string[] = [];
  if (relevanceScore > 80) reasons.push('محتوى ذو صلة عالية');
  if (freshnessScore > 90) reasons.push('خبر حديث جداً');
  if (engagementScore > 70) reasons.push('تفاعل مرتفع');
  if (qualityScore > 85) reasons.push('جودة ممتازة');
  if (timingScore < 40) reasons.push('قد لا يناسب التوقيت');
  
  return {
    articleId: article.id,
    relevanceScore,
    freshnessScore,
    engagementScore,
    qualityScore,
    timingScore,
    finalScore: Math.round(finalScore),
    reasons
  };
}

// فلترة وترتيب المقالات
export function selectBestArticlesForDose(
  articles: any[],
  timeSlot: string,
  maxArticles: number = 5,
  userPreferences?: string[]
): { articles: any[], scores: ArticleScore[] } {
  
  // تقييم جميع المقالات
  const scoredArticles = articles.map(article => ({
    article,
    score: scoreArticleForDose(article, timeSlot, userPreferences)
  }));
  
  // ترتيب حسب النقاط
  scoredArticles.sort((a, b) => b.score.finalScore - a.score.finalScore);
  
  // اختيار الأفضل مع تنويع التصنيفات
  const selected: any[] = [];
  const selectedCategories: Set<string> = new Set();
  const scores: ArticleScore[] = [];
  
  for (const item of scoredArticles) {
    if (selected.length >= maxArticles) break;
    
    const category = item.article.category_name || 'عام';
    
    // تجنب التكرار المفرط في نفس التصنيف
    const categoryCount = Array.from(selectedCategories).filter(c => c === category).length;
    if (categoryCount >= 2 && selectedCategories.size > 1) continue;
    
    // تجنب النقاط المنخفضة جداً
    if (item.score.finalScore < 40) continue;
    
    selected.push(item.article);
    scores.push(item.score);
    selectedCategories.add(category);
  }
  
  return { articles: selected, scores };
}
