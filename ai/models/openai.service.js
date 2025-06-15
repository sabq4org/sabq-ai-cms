// 🤖 خدمة OpenAI لصحيفة سبق
const OpenAI = require('openai');
const titlePrompts = require('../prompts/titles.prompt');
const summaryPrompts = require('../prompts/summaries.prompt');
const analysisPrompts = require('../prompts/tags-analysis.prompt');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'YOUR_API_KEY'
    });
    
    this.defaultModel = 'gpt-3.5-turbo';
    this.advancedModel = 'gpt-4';
  }

  /**
   * دالة عامة لاستدعاء OpenAI
   */
  async callOpenAI(prompt, model = this.defaultModel, temperature = 0.7) {
    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد ذكي لصحيفة سبق الإلكترونية السعودية. تتحدث بالعربية الفصحى وتلتزم بأعلى معايير الصحافة المهنية.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: 1000,
        language: 'ar'
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('خطأ في استدعاء OpenAI:', error);
      throw new Error('فشل في معالجة الطلب بواسطة الذكاء الاصطناعي');
    }
  }

  // ========== خدمات العناوين ==========

  /**
   * توليد عنوان جذاب
   */
  async generateHeadline(articleContent) {
    const prompt = titlePrompts.generateHeadlinePrompt(articleContent);
    return await this.callOpenAI(prompt, this.defaultModel, 0.8);
  }

  /**
   * توليد عناوين متعددة
   */
  async generateMultipleHeadlines(articleContent) {
    const prompt = titlePrompts.generateMultipleHeadlinesPrompt(articleContent);
    const response = await this.callOpenAI(prompt, this.defaultModel, 0.9);
    
    // تحويل النص إلى مصفوفة من العناوين
    return response.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, ''));
  }

  /**
   * تحسين عنوان موجود
   */
  async improveHeadline(currentTitle, articleContent) {
    const prompt = titlePrompts.improveHeadlinePrompt(currentTitle, articleContent);
    return await this.callOpenAI(prompt, this.defaultModel, 0.7);
  }

  /**
   * توليد عنوان عاجل
   */
  async generateBreakingHeadline(articleContent) {
    const prompt = titlePrompts.generateBreakingNewsHeadlinePrompt(articleContent);
    return await this.callOpenAI(prompt, this.defaultModel, 0.6);
  }

  // ========== خدمات الملخصات ==========

  /**
   * توليد ملخص احترافي
   */
  async generateSummary(articleContent) {
    const prompt = summaryPrompts.generateSummaryPrompt(articleContent);
    return await this.callOpenAI(prompt, this.defaultModel, 0.7);
  }

  /**
   * توليد ملخص تنفيذي
   */
  async generateExecutiveSummary(articleContent) {
    const prompt = summaryPrompts.generateExecutiveSummaryPrompt(articleContent);
    return await this.callOpenAI(prompt, this.advancedModel, 0.6);
  }

  /**
   * توليد نقاط رئيسية
   */
  async generateBulletPoints(articleContent) {
    const prompt = summaryPrompts.generateBulletPointsPrompt(articleContent);
    const response = await this.callOpenAI(prompt, this.defaultModel, 0.6);
    
    return response.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[•◈]\s*/, ''));
  }

  /**
   * توليد وصف SEO
   */
  async generateSEODescription(articleContent, keywords = []) {
    const prompt = summaryPrompts.generateSEODescriptionPrompt(articleContent, keywords);
    return await this.callOpenAI(prompt, this.defaultModel, 0.5);
  }

  // ========== خدمات التحليل والوسوم ==========

  /**
   * توليد الوسوم
   */
  async generateTags(articleContent) {
    const prompt = analysisPrompts.generateTagsPrompt(articleContent);
    const response = await this.callOpenAI(prompt, this.defaultModel, 0.6);
    
    return response.split('،')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  /**
   * تحليل المشاعر
   */
  async analyzeSentiment(articleContent) {
    const prompt = analysisPrompts.analyzeSentimentPrompt(articleContent);
    const response = await this.callOpenAI(prompt, this.defaultModel, 0.5);
    
    // محاولة تحليل النص المُرجع وتحويله لكائن
    try {
      const lines = response.split('\n');
      const sentiment = {};
      
      lines.forEach(line => {
        if (line.includes('المشاعر العامة:')) {
          sentiment.general = line.split(':')[1].trim();
        } else if (line.includes('درجة الشدة:')) {
          sentiment.intensity = parseInt(line.split(':')[1].trim());
        } else if (line.includes('المشاعر التفصيلية:')) {
          sentiment.detailed = line.split(':')[1].trim();
        } else if (line.includes('التبرير:')) {
          sentiment.justification = line.split(':')[1].trim();
        }
      });
      
      return sentiment;
    } catch {
      return { raw: response };
    }
  }

  /**
   * تحليل النبرة
   */
  async analyzeTone(articleContent) {
    const prompt = analysisPrompts.analyzeTonePrompt(articleContent);
    return await this.callOpenAI(prompt, this.defaultModel, 0.5);
  }

  /**
   * التحليل العميق
   */
  async generateDeepAnalysis(articleContent) {
    const prompt = analysisPrompts.generateDeepAnalysisPrompt(articleContent);
    return await this.callOpenAI(prompt, this.advancedModel, 0.6);
  }

  /**
   * استخراج الكيانات
   */
  async extractEntities(articleContent) {
    const prompt = analysisPrompts.extractEntitiesPrompt(articleContent);
    const response = await this.callOpenAI(prompt, this.defaultModel, 0.3);
    
    // محاولة تنظيم الكيانات
    try {
      const entities = {
        people: [],
        organizations: [],
        locations: [],
        dates: [],
        numbers: [],
        money: [],
        events: []
      };
      
      const lines = response.split('\n');
      let currentCategory = null;
      
      lines.forEach(line => {
        if (line.includes('الأشخاص:')) currentCategory = 'people';
        else if (line.includes('المنظمات:')) currentCategory = 'organizations';
        else if (line.includes('الأماكن:')) currentCategory = 'locations';
        else if (line.includes('التواريخ:')) currentCategory = 'dates';
        else if (line.includes('الأرقام:')) currentCategory = 'numbers';
        else if (line.includes('العملات:')) currentCategory = 'money';
        else if (line.includes('الأحداث:')) currentCategory = 'events';
        else if (currentCategory && line.trim()) {
          entities[currentCategory].push(line.trim().replace(/^-\s*/, ''));
        }
      });
      
      return entities;
    } catch {
      return { raw: response };
    }
  }

  /**
   * توليد كلمات مفتاحية SEO
   */
  async generateSEOKeywords(articleContent) {
    const prompt = analysisPrompts.generateSEOKeywordsPrompt(articleContent);
    return await this.callOpenAI(prompt, this.defaultModel, 0.5);
  }

  // ========== خدمات متقدمة ==========

  /**
   * معالجة مقال كامل
   */
  async processArticle(articleContent) {
    try {
      // تشغيل جميع العمليات بالتوازي لتسريع المعالجة
      const [
        headline,
        summary,
        tags,
        sentiment,
        bulletPoints
      ] = await Promise.all([
        this.generateHeadline(articleContent),
        this.generateSummary(articleContent),
        this.generateTags(articleContent),
        this.analyzeSentiment(articleContent),
        this.generateBulletPoints(articleContent)
      ]);

      return {
        headline,
        summary,
        tags,
        sentiment,
        bulletPoints,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('خطأ في معالجة المقال:', error);
      throw error;
    }
  }

  /**
   * معالجة دفعة من المقالات
   */
  async processBatch(articles, options = {}) {
    const batchSize = options.batchSize || 5;
    const results = [];
    
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(article => this.processArticle(article.content))
      );
      
      results.push(...batchResults);
      
      // تأخير بسيط لتجنب تجاوز حدود API
      if (i + batchSize < articles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * تقييم جودة المحتوى
   */
  async evaluateContent(articleContent) {
    const prompt = `قيّم جودة هذا المحتوى الإخباري من حيث:
    1. الوضوح والتماسك
    2. الدقة اللغوية
    3. الشمولية
    4. الموضوعية
    5. القيمة الإخبارية
    
    قدم تقييماً من 10 لكل معيار مع ملاحظات مختصرة.
    
    المحتوى:
    ${articleContent}`;
    
    return await this.callOpenAI(prompt, this.advancedModel, 0.3);
  }
}

// تصدير نسخة واحدة من الخدمة
module.exports = new OpenAIService(); 