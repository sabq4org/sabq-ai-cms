/**
 * مكتبة حساب شعبية الكلمات المفتاحية
 * Word Cloud Popularity Calculation Library
 */

export interface TagMetrics {
  articleCount: number;
  totalViews: number;
  recentUsage: number;
  growthRate: number;
  priority?: number;
  ageInDays: number;
  interactionCount?: number;
  clickCount?: number;
}

export interface PopularityConfig {
  usageWeight: number;      // وزن الاستخدام (0.4)
  viewsWeight: number;      // وزن المشاهدات (0.3)  
  recencyWeight: number;    // وزن الحداثة (0.2)
  growthWeight: number;     // وزن النمو (0.1)
  decayFactor: number;      // معامل التلاشي (0.95)
  priorityMultiplier: number; // مضاعف الأولوية (0.1)
  viewsDivisor: number;     // مقسم المشاهدات (100)
  maxAge: number;           // العمر الأقصى للاعتبار (90 يوم)
}

export const DEFAULT_CONFIG: PopularityConfig = {
  usageWeight: 0.4,
  viewsWeight: 0.3,
  recencyWeight: 0.2,
  growthWeight: 0.1,
  decayFactor: 0.95,
  priorityMultiplier: 0.1,
  viewsDivisor: 100,
  maxAge: 90
};

/**
 * حساب نقاط الشعبية للكلمة المفتاحية
 * Calculate popularity score for a keyword
 */
export function calculatePopularityScore(
  metrics: TagMetrics, 
  config: PopularityConfig = DEFAULT_CONFIG
): number {
  // التحقق من صحة البيانات
  if (metrics.articleCount < 0 || metrics.totalViews < 0) {
    return 0;
  }

  // حساب النقاط الأساسية
  let score = 0;

  // 1. نقاط الاستخدام (40%)
  const usageScore = metrics.articleCount * config.usageWeight;
  score += usageScore;

  // 2. نقاط المشاهدات (30%)
  const viewsScore = (metrics.totalViews / config.viewsDivisor) * config.viewsWeight;
  score += viewsScore;

  // 3. نقاط الحداثة (20%) - معامل التلاشي الزمني
  const recencyFactor = Math.pow(config.decayFactor, Math.min(metrics.ageInDays, config.maxAge));
  const recencyScore = metrics.recentUsage * recencyFactor * config.recencyWeight;
  score += recencyScore;

  // 4. نقاط النمو (10%)
  const growthScore = Math.max(0, metrics.growthRate / 100) * config.growthWeight;
  score += growthScore;

  // 5. مكافأة التفاعل (إضافية)
  if (metrics.interactionCount && metrics.clickCount) {
    const interactionBonus = (metrics.interactionCount + metrics.clickCount) * 0.01;
    score += interactionBonus;
  }

  // 6. تطبيق مضاعف الأولوية
  if (metrics.priority && metrics.priority !== 5) {
    const priorityMultiplier = 1 + (metrics.priority - 5) * config.priorityMultiplier;
    score *= priorityMultiplier;
  }

  // تقريب النتيجة لأقرب منزلتين عشريتين
  return Math.round(score * 100) / 100;
}

/**
 * حساب معامل النمو
 * Calculate growth rate
 */
export function calculateGrowthRate(
  currentPeriodCount: number,
  previousPeriodCount: number
): number {
  if (previousPeriodCount === 0) {
    return currentPeriodCount > 0 ? 100 : 0;
  }
  
  const growth = ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;
  return Math.round(growth * 100) / 100;
}

/**
 * حساب معامل الحداثة
 * Calculate recency factor
 */
export function calculateRecencyFactor(
  daysSinceLastUse: number,
  decayFactor: number = DEFAULT_CONFIG.decayFactor
): number {
  return Math.pow(decayFactor, Math.max(1, daysSinceLastUse));
}

/**
 * تصنيف مستوى الشعبية
 * Categorize popularity level
 */
export function getPopularityLevel(score: number): {
  level: string;
  color: string;
  description: string;
} {
  if (score >= 50) {
    return {
      level: 'عالية جداً',
      color: '#dc2626', // red-600
      description: 'كلمة مفتاحية شائعة جداً'
    };
  } else if (score >= 20) {
    return {
      level: 'عالية',
      color: '#ea580c', // orange-600
      description: 'كلمة مفتاحية شائعة'
    };
  } else if (score >= 10) {
    return {
      level: 'متوسطة',
      color: '#ca8a04', // yellow-600
      description: 'كلمة مفتاحية متوسطة الاستخدام'
    };
  } else if (score >= 5) {
    return {
      level: 'منخفضة',
      color: '#16a34a', // green-600
      description: 'كلمة مفتاحية قليلة الاستخدام'
    };
  } else {
    return {
      level: 'نادرة',
      color: '#9333ea', // purple-600
      description: 'كلمة مفتاحية نادرة الاستخدام'
    };
  }
}

/**
 * حساب الحجم للعرض في سحابة الكلمات
 * Calculate display size for word cloud
 */
export function calculateWordSize(
  popularityScore: number,
  minSize: number = 12,
  maxSize: number = 72
): number {
  // تطبيع النقاط إلى نطاق الحجم
  const normalizedScore = Math.max(0, Math.min(100, popularityScore));
  const sizeRange = maxSize - minSize;
  const size = minSize + (normalizedScore / 100) * sizeRange;
  
  return Math.round(size);
}

/**
 * اختيار لون ديناميكي حسب الشعبية
 * Select dynamic color based on popularity
 */
export function getPopularityColor(
  popularityScore: number,
  colorScheme: 'heat' | 'cool' | 'rainbow' = 'heat'
): string {
  const normalizedScore = Math.max(0, Math.min(100, popularityScore)) / 100;
  
  switch (colorScheme) {
    case 'heat':
      // من الأزرق (باردة) إلى الأحمر (ساخنة)
      const red = Math.round(255 * normalizedScore);
      const blue = Math.round(255 * (1 - normalizedScore));
      return `rgb(${red}, 0, ${blue})`;
      
    case 'cool':
      // تدرجات باردة
      const green = Math.round(200 * normalizedScore);
      const blueValue = Math.round(255 - 100 * normalizedScore);
      return `rgb(0, ${green}, ${blueValue})`;
      
    case 'rainbow':
      // ألوان قوس قزح
      const hue = Math.round(240 * (1 - normalizedScore)); // من الأزرق إلى الأحمر
      return `hsl(${hue}, 80%, 50%)`;
      
    default:
      return '#374151'; // gray-700
  }
}

/**
 * تجميع البيانات للتحليل
 * Aggregate data for analysis
 */
export function aggregateTagAnalytics(tags: Array<{
  popularityScore: number;
  growthRate: number;
  totalUsage: number;
  views: number;
}>): {
  totalTags: number;
  averagePopularity: number;
  averageGrowth: number;
  totalUsage: number;
  totalViews: number;
  distribution: Record<string, number>;
} {
  const totalTags = tags.length;
  
  if (totalTags === 0) {
    return {
      totalTags: 0,
      averagePopularity: 0,
      averageGrowth: 0,
      totalUsage: 0,
      totalViews: 0,
      distribution: {}
    };
  }

  const totalPopularity = tags.reduce((sum, tag) => sum + tag.popularityScore, 0);
  const totalGrowth = tags.reduce((sum, tag) => sum + tag.growthRate, 0);
  const totalUsage = tags.reduce((sum, tag) => sum + tag.totalUsage, 0);
  const totalViews = tags.reduce((sum, tag) => sum + tag.views, 0);

  // توزيع مستويات الشعبية
  const distribution: Record<string, number> = {};
  tags.forEach(tag => {
    const level = getPopularityLevel(tag.popularityScore).level;
    distribution[level] = (distribution[level] || 0) + 1;
  });

  return {
    totalTags,
    averagePopularity: Math.round((totalPopularity / totalTags) * 100) / 100,
    averageGrowth: Math.round((totalGrowth / totalTags) * 100) / 100,
    totalUsage,
    totalViews,
    distribution
  };
}

/**
 * فلترة الكلمات حسب معايير متقدمة
 * Filter words by advanced criteria
 */
export function filterWordsByAdvancedCriteria(
  words: Array<{
    name: string;
    popularityScore: number;
    growthRate: number;
    lastUsed: Date | null;
  }>,
  criteria: {
    minPopularity?: number;
    maxPopularity?: number;
    minGrowth?: number;
    maxGrowth?: number;
    daysAgo?: number;
    trending?: boolean;
  }
): typeof words {
  return words.filter(word => {
    // فلترة الشعبية
    if (criteria.minPopularity !== undefined && word.popularityScore < criteria.minPopularity) {
      return false;
    }
    if (criteria.maxPopularity !== undefined && word.popularityScore > criteria.maxPopularity) {
      return false;
    }

    // فلترة النمو
    if (criteria.minGrowth !== undefined && word.growthRate < criteria.minGrowth) {
      return false;
    }
    if (criteria.maxGrowth !== undefined && word.growthRate > criteria.maxGrowth) {
      return false;
    }

    // فلترة الحداثة
    if (criteria.daysAgo && word.lastUsed) {
      const daysSince = (Date.now() - word.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > criteria.daysAgo) {
        return false;
      }
    }

    // فلترة الكلمات الرائجة
    if (criteria.trending && word.growthRate <= 0) {
      return false;
    }

    return true;
  });
}
