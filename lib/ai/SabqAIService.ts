/**
 * SabqAIService - خدمة الذكاء الاصطناعي الأساسية لبوابة سبق الذكية
 * 
 * توفر هذه الخدمة واجهة موحدة للتفاعل مع خدمات الذكاء الاصطناعي المختلفة
 * وتدير الاتصال بالنماذج والخدمات الخارجية مع توفير واجهة برمجية بسيطة
 */

import { OpenAI } from 'openai';

// تكوين OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // للاستخدام في العميل، في الإنتاج يجب استخدام API routes
});

// أنواع البيانات
export interface ArticleSummary {
  shortSummary: string;
  bulletPoints: string[];
  keyInsights: string[];
}

export interface ArticleAnalysis {
  sentiment: 'إيجابي' | 'محايد' | 'سلبي';
  topics: string[];
  entities: { name: string; type: string }[];
  keywords: string[];
}

export interface ContentRecommendation {
  id: string;
  title: string;
  type: 'article' | 'video' | 'podcast' | 'gallery';
  category: string;
  relevanceScore: number;
  url: string;
}

export interface UserPreference {
  categories: { id: string; name: string; score: number }[];
  topics: { name: string; score: number }[];
  readingTime: 'short' | 'medium' | 'long';
  contentTypes: ('article' | 'video' | 'podcast' | 'gallery')[];
}

export interface SmartQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// خدمة الذكاء الاصطناعي
export class SabqAIService {
  /**
   * تلخيص مقال
   * @param content محتوى المقال
   * @param title عنوان المقال (اختياري)
   * @param maxLength الحد الأقصى لطول الملخص (اختياري)
   */
  static async summarizeArticle(
    content: string,
    title?: string,
    maxLength: number = 150
  ): Promise<ArticleSummary> {
    try {
      // في الإنتاج، استخدم API route بدلاً من الاتصال المباشر
      const prompt = `
        قم بتلخيص المقال التالي بأسلوب صحفي احترافي:
        
        العنوان: ${title || 'مقال إخباري'}
        
        المحتوى:
        ${content.substring(0, 4000)}
        
        المطلوب:
        1. ملخص قصير (${maxLength} حرف كحد أقصى)
        2. 3-5 نقاط رئيسية
        3. 2-3 رؤى أساسية من المقال
        
        قدم الإجابة بتنسيق JSON فقط بالشكل التالي:
        {
          "shortSummary": "الملخص القصير هنا",
          "bulletPoints": ["النقطة الأولى", "النقطة الثانية", "..."],
          "keyInsights": ["الرؤية الأولى", "الرؤية الثانية", "..."]
        }
      `;

      // استخدام نموذج GPT-4 للحصول على نتائج أفضل
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        response_format: { type: 'json_object' }
      });

      const result = response.choices[0]?.message?.content || '';
      return JSON.parse(result) as ArticleSummary;
    } catch (error) {
      console.error('خطأ في تلخيص المقال:', error);
      // إرجاع بيانات افتراضية في حالة الخطأ
      return {
        shortSummary: 'لا يمكن تلخيص المقال حالياً.',
        bulletPoints: ['غير متاح'],
        keyInsights: ['غير متاح']
      };
    }
  }

  /**
   * تحليل محتوى المقال
   * @param content محتوى المقال
   * @param title عنوان المقال (اختياري)
   */
  static async analyzeArticle(
    content: string,
    title?: string
  ): Promise<ArticleAnalysis> {
    try {
      const prompt = `
        قم بتحليل المقال التالي وتقديم معلومات عن المشاعر والمواضيع والكيانات والكلمات المفتاحية:
        
        العنوان: ${title || 'مقال إخباري'}
        
        المحتوى:
        ${content.substring(0, 4000)}
        
        المطلوب:
        1. تحليل المشاعر (إيجابي، محايد، سلبي)
        2. المواضيع الرئيسية (3-5 مواضيع)
        3. الكيانات المذكورة (أشخاص، منظمات، أماكن، إلخ)
        4. الكلمات المفتاحية (5-10 كلمات)
        
        قدم الإجابة بتنسيق JSON فقط بالشكل التالي:
        {
          "sentiment": "إيجابي" أو "محايد" أو "سلبي",
          "topics": ["موضوع 1", "موضوع 2", "..."],
          "entities": [{"name": "اسم الكيان", "type": "نوع الكيان"}, ...],
          "keywords": ["كلمة 1", "كلمة 2", "..."]
        }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const result = response.choices[0]?.message?.content || '';
      return JSON.parse(result) as ArticleAnalysis;
    } catch (error) {
      console.error('خطأ في تحليل المقال:', error);
      // إرجاع بيانات افتراضية في حالة الخطأ
      return {
        sentiment: 'محايد',
        topics: ['غير متاح'],
        entities: [],
        keywords: []
      };
    }
  }

  /**
   * توليد أسئلة ذكية حول المقال
   * @param content محتوى المقال
   * @param title عنوان المقال
   * @param count عدد الأسئلة المطلوبة
   */
  static async generateSmartQuestions(
    content: string,
    title: string,
    count: number = 5
  ): Promise<SmartQuestion[]> {
    try {
      const prompt = `
        اقرأ المقال التالي وقم بتوليد ${count} أسئلة ذكية مع إجاباتها:
        
        العنوان: ${title}
        
        المحتوى:
        ${content.substring(0, 4000)}
        
        المطلوب:
        - ${count} أسئلة متنوعة حول المقال
        - إجابة مفصلة لكل سؤال (3-5 جمل)
        - تصنيف لكل سؤال (معلومات، تحليل، رأي، توضيح، إلخ)
        
        قدم الإجابة بتنسيق JSON فقط بالشكل التالي:
        [
          {
            "id": "1",
            "question": "السؤال الأول هنا؟",
            "answer": "الإجابة المفصلة للسؤال الأول.",
            "category": "تصنيف السؤال"
          },
          ...
        ]
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const result = response.choices[0]?.message?.content || '';
      return JSON.parse(result) as SmartQuestion[];
    } catch (error) {
      console.error('خطأ في توليد الأسئلة الذكية:', error);
      // إرجاع بيانات افتراضية في حالة الخطأ
      return [
        {
          id: '1',
          question: 'ما هي النقاط الرئيسية في هذا المقال؟',
          answer: 'يتناول المقال عدة نقاط رئيسية تتعلق بالموضوع المطروح.',
          category: 'معلومات'
        }
      ];
    }
  }

  /**
   * توصية محتوى مشابه بناءً على المقال
   * @param articleId معرف المقال
   * @param title عنوان المقال
   * @param content محتوى المقال
   * @param categories تصنيفات المقال
   * @param tags وسوم المقال
   * @param count عدد التوصيات المطلوبة
   */
  static async getRelatedContent(
    articleId: string,
    title: string,
    content: string,
    categories: string[],
    tags: string[],
    count: number = 5
  ): Promise<ContentRecommendation[]> {
    // في التطبيق الحقيقي، هذه الدالة ستتصل بقاعدة البيانات للبحث عن محتوى مشابه
    // هنا نقوم بمحاكاة النتائج
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // توليد توصيات وهمية
    const mockRecommendations: ContentRecommendation[] = [];
    const types = ['article', 'video', 'podcast', 'gallery'] as const;
    
    for (let i = 1; i <= count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories.length > 0 
        ? categories[Math.floor(Math.random() * categories.length)]
        : 'أخبار';
      
      mockRecommendations.push({
        id: `rec-${i}`,
        title: `محتوى مشابه ${i}: ${title.substring(0, 30)}...`,
        type: type,
        category: category,
        relevanceScore: 0.95 - (i * 0.05),
        url: `/content/${type}/${i}`
      });
    }
    
    return mockRecommendations;
  }

  /**
   * تحويل النص إلى صوت
   * @param text النص المراد تحويله
   * @param voice نوع الصوت (ذكر/أنثى)
   */
  static async textToSpeech(
    text: string,
    voice: 'male' | 'female' = 'male'
  ): Promise<string> {
    // في التطبيق الحقيقي، هذه الدالة ستتصل بخدمة تحويل النص إلى صوت
    // هنا نقوم بإرجاع رابط وهمي
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // إرجاع رابط وهمي
    return `/api/audio/speech-${Date.now()}.mp3`;
  }

  /**
   * تحليل تفضيلات المستخدم بناءً على سلوكه
   * @param userId معرف المستخدم
   * @param readArticles المقالات التي قرأها
   * @param interactions التفاعلات (إعجابات، تعليقات، مشاركات)
   */
  static async analyzeUserPreferences(
    userId: string,
    readArticles: { id: string; category: string; readTime: number }[],
    interactions: { articleId: string; type: 'like' | 'comment' | 'share' }[]
  ): Promise<UserPreference> {
    // في التطبيق الحقيقي، هذه الدالة ستحلل سلوك المستخدم بشكل متقدم
    // هنا نقوم بمحاكاة النتائج
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // تحليل التصنيفات المفضلة
    const categoryScores: Record<string, number> = {};
    readArticles.forEach(article => {
      categoryScores[article.category] = (categoryScores[article.category] || 0) + 1;
    });
    
    // تحويل إلى مصفوفة وترتيب تنازلياً
    const categories = Object.entries(categoryScores)
      .map(([name, score]) => ({ id: name.toLowerCase(), name, score }))
      .sort((a, b) => b.score - a.score);
    
    // تحليل وقت القراءة المفضل
    const totalReadTime = readArticles.reduce((sum, article) => sum + article.readTime, 0);
    const avgReadTime = totalReadTime / (readArticles.length || 1);
    let readingTime: 'short' | 'medium' | 'long' = 'medium';
    
    if (avgReadTime < 3) {
      readingTime = 'short';
    } else if (avgReadTime > 7) {
      readingTime = 'long';
    }
    
    // إرجاع التفضيلات
    return {
      categories,
      topics: [
        { name: 'تقنية', score: 0.8 },
        { name: 'اقتصاد', score: 0.7 },
        { name: 'رياضة', score: 0.5 }
      ],
      readingTime,
      contentTypes: ['article', 'video']
    };
  }

  /**
   * إنشاء محتوى ذكي بناءً على بيانات المستخدم
   * @param userId معرف المستخدم
   * @param preferences تفضيلات المستخدم
   * @param count عدد العناصر المطلوبة
   */
  static async generatePersonalizedContent(
    userId: string,
    preferences: UserPreference,
    count: number = 5
  ): Promise<ContentRecommendation[]> {
    // في التطبيق الحقيقي، هذه الدالة ستولد محتوى مخصص للمستخدم
    // هنا نقوم بمحاكاة النتائج
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // توليد توصيات وهمية
    const mockRecommendations: ContentRecommendation[] = [];
    
    for (let i = 1; i <= count; i++) {
      // اختيار نوع المحتوى من التفضيلات
      const type = preferences.contentTypes[
        Math.floor(Math.random() * preferences.contentTypes.length)
      ];
      
      // اختيار التصنيف من التفضيلات
      const categoryObj = preferences.categories[
        Math.floor(Math.random() * Math.min(preferences.categories.length, 3))
      ];
      
      const category = categoryObj?.name || 'أخبار';
      
      // اختيار موضوع من التفضيلات
      const topic = preferences.topics[
        Math.floor(Math.random() * preferences.topics.length)
      ];
      
      mockRecommendations.push({
        id: `pers-${i}`,
        title: `محتوى مخصص: ${topic.name} في ${category}`,
        type: type,
        category: category,
        relevanceScore: 0.9 - (i * 0.03),
        url: `/content/${type}/${i}`
      });
    }
    
    return mockRecommendations;
  }
}
