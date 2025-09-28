/**
 * SmartRecommendationEngine - محرك التوصيات الذكية لبوابة سبق الذكية
 * 
 * يوفر هذا المحرك خدمات متقدمة للتوصيات الذكية بناءً على:
 * 1. محتوى المقال
 * 2. سلوك المستخدم
 * 3. اتجاهات القراء
 * 4. الأحداث الجارية
 */

import { ContentRecommendation, UserPreference } from './SabqAIService';

// أنواع البيانات
export interface RecommendationSource {
  id: string;
  name: string;
  weight: number;
}

export interface RecommendationContext {
  userId?: string;
  articleId?: string;
  categories?: string[];
  tags?: string[];
  location?: string;
  device?: 'mobile' | 'desktop' | 'tablet';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface RecommendationOptions {
  count?: number;
  excludeIds?: string[];
  includeTypes?: ('article' | 'video' | 'podcast' | 'gallery')[];
  minRelevance?: number;
  maxAge?: number; // بالأيام
  sources?: RecommendationSource[];
}

export interface RecommendationResult {
  items: ContentRecommendation[];
  context: {
    personalized: boolean;
    basedOn: string[];
    generatedAt: Date;
  };
}

// محرك التوصيات الذكية
export class SmartRecommendationEngine {
  // مصادر التوصيات المتاحة
  private static readonly availableSources: RecommendationSource[] = [
    { id: 'content', name: 'محتوى المقال', weight: 0.4 },
    { id: 'user', name: 'سلوك المستخدم', weight: 0.3 },
    { id: 'trending', name: 'الأكثر قراءة', weight: 0.2 },
    { id: 'breaking', name: 'أخبار عاجلة', weight: 0.1 }
  ];

  /**
   * الحصول على توصيات ذكية
   * @param context سياق التوصية
   * @param options خيارات التوصية
   */
  static async getRecommendations(
    context: RecommendationContext,
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult> {
    // تعيين القيم الافتراضية
    const count = options.count || 5;
    const excludeIds = options.excludeIds || [];
    const includeTypes = options.includeTypes || ['article', 'video', 'podcast', 'gallery'];
    const minRelevance = options.minRelevance || 0.5;
    const maxAge = options.maxAge || 30; // 30 يوم كحد أقصى
    const sources = options.sources || this.availableSources;

    // في التطبيق الحقيقي، هذه الدالة ستجمع توصيات من مصادر مختلفة
    // وتدمجها وترتبها حسب الأهمية
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // توليد توصيات وهمية
    const mockRecommendations: ContentRecommendation[] = [];
    const basedOn: string[] = [];
    
    // إضافة مصادر التوصية المستخدمة
    if (context.articleId) {
      basedOn.push('محتوى المقال الحالي');
    }
    
    if (context.userId) {
      basedOn.push('سجل القراءة الخاص بك');
    }
    
    if (context.categories && context.categories.length > 0) {
      basedOn.push('التصنيفات المفضلة');
    }
    
    if (context.location) {
      basedOn.push('موقعك الجغرافي');
    }
    
    // إذا لم يتم تحديد أي مصدر، استخدم "الأكثر قراءة"
    if (basedOn.length === 0) {
      basedOn.push('الأكثر قراءة');
    }
    
    // توليد التوصيات
    for (let i = 1; i <= count; i++) {
      // اختيار نوع المحتوى
      const type = includeTypes[Math.floor(Math.random() * includeTypes.length)];
      
      // اختيار التصنيف
      const category = context.categories && context.categories.length > 0
        ? context.categories[Math.floor(Math.random() * context.categories.length)]
        : ['أخبار', 'رياضة', 'اقتصاد', 'تقنية', 'ثقافة'][Math.floor(Math.random() * 5)];
      
      // اختيار مصدر التوصية
      const source = sources[Math.floor(Math.random() * sources.length)];
      
      // حساب درجة الصلة
      const relevanceScore = Math.max(
        minRelevance,
        0.95 - (i * 0.05) + (Math.random() * 0.1 - 0.05)
      );
      
      // إنشاء عنوان مناسب حسب نوع المحتوى
      let title = '';
      switch (type) {
        case 'article':
          title = `${category}: ${this.generateRandomTitle()}`;
          break;
        case 'video':
          title = `فيديو: ${this.generateRandomTitle()}`;
          break;
        case 'podcast':
          title = `بودكاست: ${this.generateRandomTitle()}`;
          break;
        case 'gallery':
          title = `معرض صور: ${this.generateRandomTitle()}`;
          break;
      }
      
      mockRecommendations.push({
        id: `rec-${Date.now()}-${i}`,
        title,
        type,
        category,
        relevanceScore,
        url: `/content/${type}/${i}`
      });
    }
    
    // ترتيب التوصيات حسب درجة الصلة
    mockRecommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return {
      items: mockRecommendations,
      context: {
        personalized: !!context.userId,
        basedOn,
        generatedAt: new Date()
      }
    };
  }

  /**
   * الحصول على توصيات مخصصة للمستخدم
   * @param userId معرف المستخدم
   * @param preferences تفضيلات المستخدم
   * @param options خيارات التوصية
   */
  static async getPersonalizedRecommendations(
    userId: string,
    preferences: UserPreference,
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult> {
    // إنشاء سياق التوصية
    const context: RecommendationContext = {
      userId,
      categories: preferences.categories.map(c => c.name),
      device: this.detectDevice(),
      timeOfDay: this.getTimeOfDay()
    };
    
    // تعديل الخيارات
    const updatedOptions: RecommendationOptions = {
      ...options,
      includeTypes: options.includeTypes || preferences.contentTypes,
      sources: [
        { id: 'user', name: 'سلوك المستخدم', weight: 0.6 },
        { id: 'trending', name: 'الأكثر قراءة', weight: 0.2 },
        { id: 'breaking', name: 'أخبار عاجلة', weight: 0.2 }
      ]
    };
    
    // الحصول على التوصيات
    return this.getRecommendations(context, updatedOptions);
  }

  /**
   * الحصول على توصيات متعلقة بمقال
   * @param articleId معرف المقال
   * @param categories تصنيفات المقال
   * @param tags وسوم المقال
   * @param options خيارات التوصية
   */
  static async getRelatedRecommendations(
    articleId: string,
    categories: string[],
    tags: string[],
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult> {
    // إنشاء سياق التوصية
    const context: RecommendationContext = {
      articleId,
      categories,
      tags,
      device: this.detectDevice(),
      timeOfDay: this.getTimeOfDay()
    };
    
    // تعديل الخيارات
    const updatedOptions: RecommendationOptions = {
      ...options,
      excludeIds: [...(options.excludeIds || []), articleId],
      sources: [
        { id: 'content', name: 'محتوى المقال', weight: 0.7 },
        { id: 'trending', name: 'الأكثر قراءة', weight: 0.3 }
      ]
    };
    
    // الحصول على التوصيات
    return this.getRecommendations(context, updatedOptions);
  }

  /**
   * الحصول على الأخبار العاجلة
   * @param count عدد الأخبار المطلوبة
   */
  static async getBreakingNews(count: number = 3): Promise<ContentRecommendation[]> {
    // في التطبيق الحقيقي، هذه الدالة ستجلب الأخبار العاجلة من قاعدة البيانات
    // هنا نقوم بمحاكاة النتائج
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // توليد أخبار عاجلة وهمية
    const mockNews: ContentRecommendation[] = [];
    
    for (let i = 1; i <= count; i++) {
      mockNews.push({
        id: `breaking-${i}`,
        title: `عاجل: ${this.generateRandomTitle()}`,
        type: 'article',
        category: 'أخبار عاجلة',
        relevanceScore: 1.0,
        url: `/news/breaking/${i}`
      });
    }
    
    return mockNews;
  }

  /**
   * الحصول على الأكثر قراءة
   * @param count عدد العناصر المطلوبة
   * @param period الفترة الزمنية ('day' | 'week' | 'month')
   */
  static async getTrendingContent(
    count: number = 5,
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<ContentRecommendation[]> {
    // في التطبيق الحقيقي، هذه الدالة ستجلب المحتوى الأكثر قراءة من قاعدة البيانات
    // هنا نقوم بمحاكاة النتائج
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // توليد محتوى وهمي
    const mockContent: ContentRecommendation[] = [];
    
    for (let i = 1; i <= count; i++) {
      const type = ['article', 'video', 'article', 'podcast', 'article'][Math.floor(Math.random() * 5)];
      const category = ['أخبار', 'رياضة', 'اقتصاد', 'تقنية', 'ثقافة'][Math.floor(Math.random() * 5)];
      
      mockContent.push({
        id: `trending-${period}-${i}`,
        title: `${this.generateRandomTitle()}`,
        type: type as any,
        category,
        relevanceScore: 0.95 - ((i - 1) * 0.05),
        url: `/content/${type}/${i}`
      });
    }
    
    return mockContent;
  }

  // وظائف مساعدة

  /**
   * اكتشاف نوع الجهاز
   */
  private static detectDevice(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof window === 'undefined') {
      return 'desktop'; // افتراضي للخادم
    }
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  /**
   * الحصول على وقت اليوم
   */
  private static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 17) {
      return 'afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'evening';
    } else {
      return 'night';
    }
  }

  /**
   * توليد عنوان عشوائي
   */
  private static generateRandomTitle(): string {
    const titles = [
      "تطورات جديدة في العلاقات الدولية بين المملكة وشركائها الاستراتيجيين",
      "إطلاق مبادرة وطنية لدعم الابتكار في قطاع التقنية",
      "ارتفاع مؤشرات الاقتصاد المحلي بنسبة 5% خلال الربع الأخير",
      "افتتاح أكبر مشروع للطاقة المتجددة في المنطقة",
      "توقيع اتفاقيات استثمارية بقيمة 10 مليارات ريال",
      "إنجاز جديد للمملكة في مؤشرات التنافسية العالمية",
      "تدشين مشروع سياحي ضخم ضمن رؤية 2030",
      "نجاح باهر للمنتخب السعودي في البطولة الدولية",
      "إعلان نتائج دراسة علمية رائدة أجريت في جامعات المملكة",
      "تكريم المبدعين السعوديين في مهرجان عالمي للفنون"
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }
}
