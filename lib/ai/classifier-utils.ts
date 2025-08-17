/**
 * 🛠️ أدوات مساعدة لنظام التصنيف الذكي
 * مجموعة من الوظائف المساعدة والأدوات المفيدة
 */

import { ClassificationResult } from './ArabicContentClassifier';
import { getConfig, getCategoryColor } from './classifier-config';

/**
 * أدوات تحليل النصوص العربية
 */
export class ArabicTextUtils {
  /**
   * إزالة التشكيل من النص العربي
   */
  static removeDiacritics(text: string): string {
    return text.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
  }

  /**
   * تنظيف النص العربي
   */
  static cleanText(text: string): string {
    return text
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // إزالة التشكيل
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\p{P}]/gu, '') // الاحتفاظ بالعربية والأرقام والترقيم
      .replace(/\s+/g, ' ') // توحيد المسافات
      .trim();
  }

  /**
   * عد الكلمات في النص العربي
   */
  static countWords(text: string): number {
    const cleaned = this.cleanText(text);
    return cleaned.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * استخراج الكلمات المفتاحية
   */
  static extractKeywords(text: string, maxKeywords = 10): string[] {
    const cleaned = this.cleanText(text);
    const words = cleaned.split(/\s+/);
    
    // كلمات الاستبعاد (stop words)
    const stopWords = new Set([
      'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
      'التي', 'الذي', 'التي', 'اللذان', 'اللتان', 'اللواتي', 'اللاتي',
      'أن', 'إن', 'كان', 'كانت', 'يكون', 'تكون', 'سوف', 'قد', 'لقد',
      'وقد', 'وقال', 'قال', 'قالت', 'أضاف', 'أشار', 'أوضح', 'بين',
      'ضد', 'نحو', 'حول', 'خلال', 'بعد', 'قبل', 'أثناء', 'لدى', 'منذ'
    ]);

    // فلترة وعد الكلمات
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 2 && !stopWords.has(word)) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });

    // ترتيب حسب التكرار
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  /**
   * البحث عن كلمات معينة في النص
   */
  static findKeywords(text: string, keywords: string[]): string[] {
    const cleaned = this.cleanText(text.toLowerCase());
    return keywords.filter(keyword => 
      cleaned.includes(keyword.toLowerCase())
    );
  }

  /**
   * حساب التشابه بين النصوص (مبسط)
   */
  static calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.cleanText(text1.toLowerCase()).split(/\s+/));
    const words2 = new Set(this.cleanText(text2.toLowerCase()).split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
}

/**
 * أدوات معالجة نتائج التصنيف
 */
export class ClassificationUtils {
  /**
   * تحويل نتيجة التصنيف إلى نص قابل للقراءة
   */
  static formatResult(result: ClassificationResult): string {
    const confidence = (result.confidence * 100).toFixed(1);
    const quality = result.qualityScore;
    const region = (result.regionRelevance * 100).toFixed(1);
    
    return `التصنيف: ${result.mainCategory}${result.subCategory ? ` (${result.subCategory})` : ''}\n` +
           `الثقة: ${confidence}% | الجودة: ${quality}/100 | المنطقة: ${region}%`;
  }

  /**
   * التحقق من جودة التصنيف
   */
  static isGoodClassification(result: ClassificationResult): boolean {
    const minConfidence = getConfig('CLASSIFICATION.MIN_CONFIDENCE_THRESHOLD', 0.6);
    const minQuality = getConfig('QUALITY_ANALYSIS.MIN_QUALITY_SCORE', 50);
    
    return result.confidence >= minConfidence && result.qualityScore >= minQuality;
  }

  /**
   * مقارنة نتائج التصنيف
   */
  static compareResults(result1: ClassificationResult, result2: ClassificationResult): {
    better: 'first' | 'second' | 'equal';
    score: number;
  } {
    const score1 = (result1.confidence * 0.4) + (result1.qualityScore / 100 * 0.6);
    const score2 = (result2.confidence * 0.4) + (result2.qualityScore / 100 * 0.6);
    
    const diff = Math.abs(score1 - score2);
    
    if (diff < 0.05) return { better: 'equal', score: diff };
    return { 
      better: score1 > score2 ? 'first' : 'second', 
      score: diff 
    };
  }

  /**
   * دمج عدة نتائج تصنيف
   */
  static mergeResults(results: ClassificationResult[]): ClassificationResult | null {
    if (results.length === 0) return null;
    if (results.length === 1) return results[0];

    // العثور على التصنيف الأكثر تكراراً
    const categoryCount = new Map<string, number>();
    results.forEach(result => {
      const count = categoryCount.get(result.mainCategory) || 0;
      categoryCount.set(result.mainCategory, count + 1);
    });

    const mostCommonCategory = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])[0][0];

    // الحصول على النتائج من نفس الفئة
    const sameCategory = results.filter(r => r.mainCategory === mostCommonCategory);
    
    // حساب المتوسطات
    const avgConfidence = sameCategory.reduce((sum, r) => sum + r.confidence, 0) / sameCategory.length;
    const avgQuality = sameCategory.reduce((sum, r) => sum + r.qualityScore, 0) / sameCategory.length;
    const avgRegion = sameCategory.reduce((sum, r) => sum + r.regionRelevance, 0) / sameCategory.length;
    
    // دمج الاقتراحات
    const allSuggestions = Array.from(new Set(sameCategory.flatMap(r => r.suggestions)));

    return {
      mainCategory: mostCommonCategory,
      subCategory: sameCategory[0].subCategory,
      confidence: avgConfidence,
      qualityScore: Math.round(avgQuality),
      regionRelevance: avgRegion,
      suggestions: allSuggestions.slice(0, 5)
    };
  }
}

/**
 * أدوات الواجهة والعرض
 */
export class UIUtils {
  /**
   * الحصول على لون التصنيف
   */
  static getCategoryColor(category: string): string {
    return getCategoryColor(category);
  }

  /**
   * تحويل النسبة إلى وصف نصي
   */
  static getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.9) return 'عالية جداً';
    if (confidence >= 0.8) return 'عالية';
    if (confidence >= 0.7) return 'جيدة';
    if (confidence >= 0.6) return 'متوسطة';
    if (confidence >= 0.5) return 'منخفضة';
    return 'ضعيفة جداً';
  }

  /**
   * تحويل نقاط الجودة إلى وصف
   */
  static getQualityLabel(score: number): string {
    if (score >= 90) return 'ممتازة';
    if (score >= 80) return 'جيدة جداً';
    if (score >= 70) return 'جيدة';
    if (score >= 60) return 'مقبولة';
    if (score >= 50) return 'ضعيفة';
    return 'سيئة';
  }

  /**
   * تنسيق التاريخ والوقت بالعربية
   */
  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * تحويل الأرقام إلى العربية
   */
  static toArabicNumbers(text: string): string {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return text.replace(/\d/g, digit => arabicNumbers[parseInt(digit)]);
  }

  /**
   * إنشاء رمز مميز قصير
   */
  static generateShortId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

/**
 * أدوات الإحصائيات والتحليل
 */
export class AnalyticsUtils {
  /**
   * حساب توزيع التصنيفات
   */
  static calculateCategoryDistribution(results: ClassificationResult[]): Map<string, number> {
    const distribution = new Map<string, number>();
    
    results.forEach(result => {
      const count = distribution.get(result.mainCategory) || 0;
      distribution.set(result.mainCategory, count + 1);
    });
    
    return distribution;
  }

  /**
   * حساب متوسط الثقة
   */
  static calculateAverageConfidence(results: ClassificationResult[]): number {
    if (results.length === 0) return 0;
    
    const total = results.reduce((sum, result) => sum + result.confidence, 0);
    return total / results.length;
  }

  /**
   * حساب متوسط الجودة
   */
  static calculateAverageQuality(results: ClassificationResult[]): number {
    if (results.length === 0) return 0;
    
    const total = results.reduce((sum, result) => sum + result.qualityScore, 0);
    return total / results.length;
  }

  /**
   * العثور على أكثر الاقتراحات شيوعاً
   */
  static getMostCommonSuggestions(results: ClassificationResult[], limit = 5): string[] {
    const suggestionCount = new Map<string, number>();
    
    results.forEach(result => {
      result.suggestions.forEach(suggestion => {
        const count = suggestionCount.get(suggestion) || 0;
        suggestionCount.set(suggestion, count + 1);
      });
    });
    
    return Array.from(suggestionCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([suggestion]) => suggestion);
  }

  /**
   * إنشاء تقرير إحصائي
   */
  static generateReport(results: ClassificationResult[]): {
    totalArticles: number;
    categoryDistribution: Map<string, number>;
    averageConfidence: number;
    averageQuality: number;
    topSuggestions: string[];
    performanceGrade: string;
  } {
    const distribution = this.calculateCategoryDistribution(results);
    const avgConfidence = this.calculateAverageConfidence(results);
    const avgQuality = this.calculateAverageQuality(results);
    const topSuggestions = this.getMostCommonSuggestions(results);
    
    // تقييم الأداء العام
    let performanceGrade = 'ضعيف';
    const overallScore = (avgConfidence * 50) + (avgQuality / 2);
    
    if (overallScore >= 85) performanceGrade = 'ممتاز';
    else if (overallScore >= 75) performanceGrade = 'جيد جداً';
    else if (overallScore >= 65) performanceGrade = 'جيد';
    else if (overallScore >= 55) performanceGrade = 'مقبول';
    
    return {
      totalArticles: results.length,
      categoryDistribution: distribution,
      averageConfidence: avgConfidence,
      averageQuality: avgQuality,
      topSuggestions,
      performanceGrade
    };
  }
}

/**
 * أدوات التصدير والاستيراد
 */
export class DataUtils {
  /**
   * تصدير النتائج إلى JSON
   */
  static exportToJSON(results: ClassificationResult[]): string {
    return JSON.stringify(results, null, 2);
  }

  /**
   * تصدير النتائج إلى CSV
   */
  static exportToCSV(results: ClassificationResult[]): string {
    const headers = ['التصنيف الرئيسي', 'التصنيف الفرعي', 'الثقة', 'الجودة', 'الصلة الإقليمية', 'الاقتراحات'];
    const rows = results.map(result => [
      result.mainCategory,
      result.subCategory || '',
      (result.confidence * 100).toFixed(1) + '%',
      result.qualityScore.toString(),
      (result.regionRelevance * 100).toFixed(1) + '%',
      result.suggestions.join('; ')
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * استيراد النتائج من JSON
   */
  static importFromJSON(jsonString: string): ClassificationResult[] {
    try {
      const data = JSON.parse(jsonString);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('خطأ في استيراد البيانات:', error);
      return [];
    }
  }

  /**
   * حفظ البيانات في localStorage
   */
  static saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
    }
  }

  /**
   * قراءة البيانات من localStorage
   */
  static loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('خطأ في قراءة البيانات:', error);
      return defaultValue;
    }
  }
}

// تصدير جميع الأدوات
export {
  ArabicTextUtils as TextUtils
};
