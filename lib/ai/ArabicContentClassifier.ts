/**
 * 🧠 ArabicContentClassifier
 * وحدة تصنيف المحتوى العربي الذكية
 * تحليل وتصنيف المقالات الإخبارية تلقائياً
 */

import { prisma } from '@/lib/prisma';

// أنواع البيانات
export interface ClassificationResult {
  mainCategory: string;
  subCategory?: string;
  qualityScore: number;
  regionRelevance: number;
  suggestions: string[];
  confidence: number;
}

export interface ArticleContent {
  title: string;
  content: string;
  excerpt?: string;
  keywords?: string[];
}

// التصنيفات الرئيسية المدعومة
export const MAIN_CATEGORIES = {
  POLITICAL: 'سياسي',
  ECONOMIC: 'اقتصادي',
  SPORTS: 'رياضي',
  CULTURAL: 'ثقافي',
  SOCIAL: 'اجتماعي',
  TECH: 'تقني',
  HEALTH: 'صحي',
  ENTERTAINMENT: 'ترفيهي',
  EDUCATIONAL: 'تعليمي',
  ENVIRONMENTAL: 'بيئي'
} as const;

// التصنيفات الفرعية حسب كل تصنيف رئيسي
export const SUB_CATEGORIES = {
  POLITICAL: ['انتخابات', 'علاقات دولية', 'سياسة محلية', 'قرارات حكومية'],
  ECONOMIC: ['أسواق مالية', 'اقتصاد محلي', 'تجارة دولية', 'استثمارات', 'عملات رقمية'],
  SPORTS: ['كرة القدم', 'رياضات أخرى', 'بطولات', 'أخبار اللاعبين'],
  CULTURAL: ['أدب', 'فنون', 'تراث', 'معارض', 'مهرجانات'],
  TECH: ['ذكاء اصطناعي', 'أجهزة', 'تطبيقات', 'أمن سيبراني', 'ابتكارات']
} as const;

/**
 * وظيفة التصنيف الذكي للمحتوى العربي
 */
export async function classifyArabicContent(
  article: ArticleContent,
  useAI: boolean = true
): Promise<ClassificationResult> {
  try {
    // في حالة عدم استخدام AI، نستخدم تصنيف بسيط بناءً على الكلمات المفتاحية
    if (!useAI) {
      return await simpleClassification(article);
    }

    // استخدام نموذج AI للتصنيف الذكي
    const aiClassification = await performAIClassification(article);
    
    // حفظ نتيجة التصنيف في قاعدة البيانات للتعلم المستقبلي
    await saveClassificationResult(article, aiClassification);
    
    return aiClassification;
  } catch (error) {
    console.error('خطأ في تصنيف المحتوى:', error);
    // في حالة الفشل، نرجع للتصنيف البسيط
    return await simpleClassification(article);
  }
}

/**
 * التصنيف البسيط بناءً على الكلمات المفتاحية
 */
async function simpleClassification(article: ArticleContent): Promise<ClassificationResult> {
  const text = `${article.title} ${article.content}`.toLowerCase();
  
  // قوائم الكلمات المفتاحية لكل تصنيف
  const categoryKeywords = {
    'سياسي': ['حكومة', 'وزير', 'رئيس', 'انتخابات', 'برلمان', 'سياسة', 'دبلوماسية'],
    'اقتصادي': ['اقتصاد', 'بورصة', 'أسهم', 'بنك', 'استثمار', 'عملة', 'تضخم', 'نمو'],
    'رياضي': ['مباراة', 'لاعب', 'فريق', 'بطولة', 'هدف', 'تدريب', 'ملعب', 'كأس'],
    'ثقافي': ['ثقافة', 'فن', 'معرض', 'كتاب', 'مسرح', 'سينما', 'موسيقى', 'تراث'],
    'تقني': ['تقنية', 'تطبيق', 'برمجة', 'ذكاء', 'روبوت', 'انترنت', 'هاتف', 'حاسوب'],
    'صحي': ['صحة', 'طب', 'مستشفى', 'علاج', 'دواء', 'طبيب', 'مرض', 'لقاح'],
  };

  let bestMatch = { category: 'اجتماعي', score: 0 };

  // حساب أفضل تطابق
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.filter(keyword => text.includes(keyword)).length;
    if (score > bestMatch.score) {
      bestMatch = { category, score };
    }
  }

  return {
    mainCategory: bestMatch.category,
    subCategory: undefined,
    qualityScore: calculateQualityScore(article),
    regionRelevance: calculateRegionRelevance(article),
    suggestions: generateSuggestions(article),
    confidence: Math.min(bestMatch.score * 20, 100)
  };
}

/**
 * التصنيف الذكي باستخدام AI
 */
async function performAIClassification(article: ArticleContent): Promise<ClassificationResult> {
  // هنا يتم استدعاء نموذج AI (مثل OpenAI أو نموذج محلي)
  // للتبسيط، سنستخدم محاكاة للنتيجة
  
  // في التطبيق الفعلي، استخدم:
  // const result = await spark.llm(...) أو أي خدمة AI أخرى
  
  // محاكاة نتيجة AI
  const mockAIResult = {
    mainCategory: MAIN_CATEGORIES.POLITICAL,
    subCategory: 'سياسة محلية',
    qualityScore: 85,
    regionRelevance: 90,
    suggestions: [
      'تحسين المقدمة لتكون أكثر جذباً',
      'إضافة مصادر موثوقة للمعلومات',
      'تقليل التكرار في بعض الفقرات'
    ],
    confidence: 95
  };

  return mockAIResult;
}

/**
 * حساب جودة المحتوى
 */
function calculateQualityScore(article: ArticleContent): number {
  let score = 50; // النقطة الأساسية

  // طول المحتوى
  const contentLength = article.content.length;
  if (contentLength > 500) score += 10;
  if (contentLength > 1000) score += 10;
  if (contentLength > 2000) score += 5;

  // وجود عنوان واضح
  if (article.title.length > 10 && article.title.length < 100) score += 10;

  // وجود فقرات منظمة
  const paragraphs = article.content.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length > 3) score += 10;

  // تنوع المحتوى (عدم التكرار)
  const uniqueWords = new Set(article.content.split(/\s+/));
  const totalWords = article.content.split(/\s+/).length;
  const uniquenessRatio = uniqueWords.size / totalWords;
  if (uniquenessRatio > 0.3) score += 5;

  return Math.min(score, 100);
}

/**
 * حساب مدى الارتباط الجغرافي
 */
function calculateRegionRelevance(article: ArticleContent): number {
  const text = `${article.title} ${article.content}`.toLowerCase();
  let score = 0;

  // كلمات مفتاحية محلية
  const localKeywords = ['السعودية', 'المملكة', 'الرياض', 'جدة', 'مكة', 'المدينة', 'الخليج', 'العربية'];
  const regionalKeywords = ['الشرق الأوسط', 'العرب', 'الخليجي', 'المنطقة'];
  const globalKeywords = ['العالم', 'الدولي', 'العالمي', 'أمريكا', 'أوروبا', 'آسيا'];

  // حساب النقاط
  localKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 15;
  });

  regionalKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 10;
  });

  globalKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 5;
  });

  return Math.min(score, 100);
}

/**
 * توليد اقتراحات التحسين
 */
function generateSuggestions(article: ArticleContent): string[] {
  const suggestions: string[] = [];

  // التحقق من طول العنوان
  if (article.title.length < 30) {
    suggestions.push('العنوان قصير جداً، يُفضل أن يكون أكثر وصفاً');
  } else if (article.title.length > 100) {
    suggestions.push('العنوان طويل جداً، يُفضل اختصاره');
  }

  // التحقق من طول المحتوى
  if (article.content.length < 300) {
    suggestions.push('المحتوى قصير، يُنصح بإضافة المزيد من التفاصيل');
  }

  // التحقق من وجود فقرات
  const paragraphs = article.content.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length < 3) {
    suggestions.push('يُنصح بتقسيم المحتوى إلى فقرات منفصلة لسهولة القراءة');
  }

  // التحقق من وجود مقدمة
  if (!article.excerpt || article.excerpt.length < 50) {
    suggestions.push('إضافة مقدمة أو ملخص قصير للمقال');
  }

  return suggestions;
}

/**
 * حفظ نتيجة التصنيف في قاعدة البيانات
 */
async function saveClassificationResult(
  article: ArticleContent,
  classification: ClassificationResult
): Promise<void> {
  try {
    // حفظ في جدول التصنيفات للتعلم المستقبلي
    // يمكن استخدام هذه البيانات لتحسين النموذج
    console.log('حفظ نتيجة التصنيف:', {
      title: article.title.substring(0, 50),
      category: classification.mainCategory,
      confidence: classification.confidence
    });
  } catch (error) {
    console.error('خطأ في حفظ نتيجة التصنيف:', error);
  }
}

/**
 * دالة مساعدة لتحويل التصنيف إلى معرف قاعدة البيانات
 */
export function getCategoryId(categoryName: string): number {
  const categoryMap: Record<string, number> = {
    [MAIN_CATEGORIES.POLITICAL]: 1,
    [MAIN_CATEGORIES.ECONOMIC]: 2,
    [MAIN_CATEGORIES.SPORTS]: 3,
    [MAIN_CATEGORIES.CULTURAL]: 4,
    [MAIN_CATEGORIES.SOCIAL]: 5,
    [MAIN_CATEGORIES.TECH]: 6,
    [MAIN_CATEGORIES.HEALTH]: 7,
    [MAIN_CATEGORIES.ENTERTAINMENT]: 8,
    [MAIN_CATEGORIES.EDUCATIONAL]: 9,
    [MAIN_CATEGORIES.ENVIRONMENTAL]: 10
  };

  return categoryMap[categoryName] || 5; // افتراضي: اجتماعي
}
