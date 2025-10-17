/**
 * 🔗 خدمة الروابط الذكية (Smart Links Service)
 * 
 * هذه الخدمة مسؤولة عن:
 * 1. استخراج الكيانات من النصوص باستخدام OpenAI
 * 2. اقتراح الروابط الذكية
 * 3. إدارة الكيانات والصفحات التلقائية
 * 
 * @version 1.0.0
 * @author فريق سبق الذكية
 */

import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import { SABQ_SMART_LINKS_PROMPT } from '@/lib/ai/sabq-prompts-library';

// ========================================
// Types & Interfaces
// ========================================

export interface EntityExtraction {
  text: string;
  normalized: string;
  type: 'PERSON' | 'ORGANIZATION' | 'PLACE' | 'EVENT' | 'TERM' | 'TOPIC' | 'OTHER';
  start: number;
  end: number;
  confidence: number;
  candidateLinks: CandidateLink[];
  justification?: string;
}

export interface CandidateLink {
  title: string;
  url: string;
  description?: string;
  sourceType: 'article' | 'page' | 'tag' | 'category' | 'entity';
  matchScore: number;
}

export interface LinkSuggestion {
  mentionId?: string;
  text: string;
  normalized: string;
  type: string;
  position: number;
  endPosition: number;
  context: string;
  confidence: number;
  suggestedUrl?: string;
  suggestedEntity?: any;
  action: 'auto' | 'suggest' | 'skip';
  reason: string;
}

export interface AnalysisResult {
  articleId: string;
  entities: EntityExtraction[];
  suggestions: LinkSuggestion[];
  stats: {
    totalEntities: number;
    autoInsert: number;
    suggested: number;
    skipped: number;
    processingTime: number;
    cost?: number;
  };
}

// ========================================
// Configuration
// ========================================

const STOP_TERMS = [
  'اليوم', 'الخبر', 'الموعد', 'الوقت', 'المكان', 'الحدث',
  'قال', 'ذكر', 'أضاف', 'أوضح', 'أكد', 'أشار',
  'هذا', 'ذلك', 'هذه', 'تلك', 'هؤلاء', 'أولئك'
];

const DEFAULT_SETTINGS = {
  enableAutoLinks: true,
  confidenceThreshold: 0.7,
  autoInsertThreshold: 0.9,
  maxLinksPerParagraph: 1,
  maxLinksPerArticle: 20,
  stopTerms: STOP_TERMS,
  enableAutoPageCreation: false,
  autoPageThreshold: 3,
  enableSensitiveCheck: true
};

// ========================================
// Smart Links Service Class
// ========================================

export class SmartLinksService {
  private openai: OpenAI;
  private settings: typeof DEFAULT_SETTINGS;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.settings = DEFAULT_SETTINGS;
  }

  /**
   * تحميل الإعدادات من قاعدة البيانات
   */
  async loadSettings(): Promise<void> {
    try {
      const settingsRecord = await prisma.smartLinkSettings.findFirst();
      if (settingsRecord) {
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...settingsRecord
        };
      }
    } catch (error) {
      console.error('خطأ في تحميل إعدادات الروابط الذكية:', error);
    }
  }

  /**
   * تحليل مقال واستخراج الكيانات
   */
  async analyzeArticle(
    articleId: string,
    content: string
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      // إنشاء سجل التحليل
      await prisma.smartLinkAnalysis.create({
        data: {
          articleId,
          content,
          status: 'PROCESSING'
        }
      });

      // استخراج الكيانات باستخدام OpenAI
      const entities = await this.extractEntities(content);

      // البحث عن روابط مرشحة لكل كيان
      const entitiesWithLinks = await Promise.all(
        entities.map(entity => this.findCandidateLinks(entity))
      );

      // توليد اقتراحات الروابط
      const suggestions = await this.generateSuggestions(
        articleId,
        entitiesWithLinks,
        content
      );

      const processingTime = Date.now() - startTime;

      // إحصائيات
      const stats = {
        totalEntities: entities.length,
        autoInsert: suggestions.filter(s => s.action === 'auto').length,
        suggested: suggestions.filter(s => s.action === 'suggest').length,
        skipped: suggestions.filter(s => s.action === 'skip').length,
        processingTime
      };

      // تحديث سجل التحليل
      await prisma.smartLinkAnalysis.update({
        where: { articleId },
        data: {
          rawResponse: { entities: entitiesWithLinks },
          entityCount: stats.totalEntities,
          suggestedCount: stats.suggested,
          processingTime,
          status: 'COMPLETED'
        }
      });

      // تسجيل النشاط
      await this.logActivity({
        articleId,
        action: 'ANALYZE',
        metadata: { stats }
      });

      return {
        articleId,
        entities: entitiesWithLinks,
        suggestions,
        stats
      };

    } catch (error) {
      console.error('خطأ في تحليل المقال:', error);

      // تحديث سجل التحليل بالخطأ
      await prisma.smartLinkAnalysis.update({
        where: { articleId },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'خطأ غير معروف'
        }
      });

      throw error;
    }
  }

  /**
   * استخراج الكيانات من النص باستخدام OpenAI
   */
  private async extractEntities(content: string): Promise<EntityExtraction[]> {
    const userPrompt = SABQ_SMART_LINKS_PROMPT.userPromptTemplate(content);

    const response = await this.openai.chat.completions.create({
      model: SABQ_SMART_LINKS_PROMPT.settings.model,
      messages: [
        { role: 'system', content: SABQ_SMART_LINKS_PROMPT.systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: SABQ_SMART_LINKS_PROMPT.settings.temperature,
      max_tokens: SABQ_SMART_LINKS_PROMPT.settings.max_tokens,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // تصفية المصطلحات الممنوعة
    const filteredEntities = (result.entities || []).filter((entity: EntityExtraction) => {
      const normalized = entity.normalized.toLowerCase();
      return !this.settings.stopTerms.some(term => 
        normalized === term.toLowerCase() || normalized.startsWith(term.toLowerCase() + ' ')
      );
    });

    return filteredEntities.slice(0, 60); // حد أقصى 60 كيان
  }

  /**
   * البحث عن روابط مرشحة للكيان
   */
  private async findCandidateLinks(
    entity: EntityExtraction
  ): Promise<EntityExtraction> {
    const candidateLinks: CandidateLink[] = [];

    try {
      // البحث في الكيانات الموجودة
      const existingEntity = await prisma.smartEntity.findFirst({
        where: {
          OR: [
            { name: { equals: entity.normalized, mode: 'insensitive' } },
            { aliases: { has: entity.normalized } },
            { slug: this.generateSlug(entity.normalized) }
          ],
          isActive: true
        }
      });

      if (existingEntity && existingEntity.canonicalUrl) {
        candidateLinks.push({
          title: existingEntity.name,
          url: existingEntity.canonicalUrl,
          description: existingEntity.description || undefined,
          sourceType: 'entity',
          matchScore: 1.0
        });
      }

      // البحث في المقالات
      const relatedArticles = await prisma.articles.findMany({
        where: {
          OR: [
            { title: { contains: entity.normalized, mode: 'insensitive' } },
            { content: { contains: entity.normalized, mode: 'insensitive' } }
          ],
          status: 'published'
        },
        take: 3,
        orderBy: { views: 'desc' }
      });

      relatedArticles.forEach(article => {
        candidateLinks.push({
          title: article.title,
          url: `/article/${article.id}`,
          description: article.excerpt || undefined,
          sourceType: 'article',
          matchScore: 0.8
        });
      });

      // البحث في الوسوم
      const relatedTags = await prisma.tags.findMany({
        where: {
          name: { contains: entity.normalized, mode: 'insensitive' }
        },
        take: 2
      });

      relatedTags.forEach(tag => {
        candidateLinks.push({
          title: tag.name,
          url: `/tag/${tag.slug}`,
          sourceType: 'tag',
          matchScore: 0.7
        });
      });

    } catch (error) {
      console.error('خطأ في البحث عن روابط مرشحة:', error);
    }

    return {
      ...entity,
      candidateLinks: candidateLinks.sort((a, b) => b.matchScore - a.matchScore)
    };
  }

  /**
   * توليد اقتراحات الروابط
   */
  private async generateSuggestions(
    articleId: string,
    entities: EntityExtraction[],
    content: string
  ): Promise<LinkSuggestion[]> {
    const suggestions: LinkSuggestion[] = [];
    const linkedTerms = new Map<string, number>(); // لتتبع التكرارات

    for (const entity of entities) {
      const normalized = entity.normalized.toLowerCase();

      // تحقق من حد التكرار
      const occurrences = linkedTerms.get(normalized) || 0;
      if (occurrences >= this.settings.maxLinksPerParagraph) {
        continue;
      }

      // استخراج السياق
      const context = this.extractContext(content, entity.start, entity.end);

      // تحديد الإجراء بناءً على الثقة
      let action: 'auto' | 'suggest' | 'skip' = 'skip';
      let reason = '';

      if (entity.confidence >= this.settings.autoInsertThreshold) {
        action = 'auto';
        reason = 'ثقة عالية جداً - إدراج تلقائي';
      } else if (entity.confidence >= this.settings.confidenceThreshold) {
        action = 'suggest';
        reason = 'ثقة جيدة - اقتراح للمحرر';
      } else {
        action = 'skip';
        reason = 'ثقة منخفضة - تجاهل';
      }

      // اختيار أفضل رابط مرشح
      const bestLink = entity.candidateLinks[0];

      suggestions.push({
        text: entity.text,
        normalized: entity.normalized,
        type: entity.type,
        position: entity.start,
        endPosition: entity.end,
        context,
        confidence: entity.confidence,
        suggestedUrl: bestLink?.url,
        suggestedEntity: bestLink ? {
          title: bestLink.title,
          description: bestLink.description,
          sourceType: bestLink.sourceType
        } : undefined,
        action,
        reason
      });

      linkedTerms.set(normalized, occurrences + 1);

      // حد أقصى للروابط في المقال
      if (suggestions.length >= this.settings.maxLinksPerArticle) {
        break;
      }
    }

    return suggestions;
  }

  /**
   * إدراج الروابط في المقال
   */
  async insertLinks(
    articleId: string,
    mentions: Array<{
      start: number;
      end: number;
      entityId?: string;
      linkType: string;
      linkUrl: string;
      text: string;
      normalized: string;
      confidence: number;
    }>,
    userId?: string
  ): Promise<{ success: boolean; insertedCount: number }> {
    try {
      let insertedCount = 0;

      for (const mention of mentions) {
        // البحث عن الكيان أو إنشاؤه
        let entityId = mention.entityId;

        if (!entityId) {
          // إنشاء كيان جديد
          const entity = await prisma.smartEntity.create({
            data: {
              name: mention.normalized,
              slug: this.generateSlug(mention.normalized),
              type: 'TERM',
              canonicalUrl: mention.linkUrl,
              sourceCount: 1
            }
          });
          entityId = entity.id;
        } else {
          // تحديث عداد الاستخدام
          await prisma.smartEntity.update({
            where: { id: entityId },
            data: { sourceCount: { increment: 1 } }
          });
        }

        // إنشاء سجل الإشارة
        await prisma.smartEntityMention.create({
          data: {
            articleId,
            entityId,
            text: mention.text,
            normalized: mention.normalized,
            position: mention.start,
            endPosition: mention.end,
            context: '', // سيتم ملؤه لاحقاً
            confidence: mention.confidence,
            linkType: mention.linkType as any,
            linkUrl: mention.linkUrl,
            status: 'AUTO_INSERTED',
            createdBy: userId,
            approvedBy: userId,
            approvedAt: new Date()
          }
        });

        insertedCount++;
      }

      // تحديث إحصائيات التحليل
      await prisma.smartLinkAnalysis.update({
        where: { articleId },
        data: {
          acceptedCount: { increment: insertedCount }
        }
      });

      // تسجيل النشاط
      await this.logActivity({
        articleId,
        action: 'INSERT',
        userId,
        metadata: { insertedCount }
      });

      return { success: true, insertedCount };

    } catch (error) {
      console.error('خطأ في إدراج الروابط:', error);
      throw error;
    }
  }

  /**
   * إنشاء صفحة كيان تلقائياً
   */
  async createEntityPage(
    entityId: string,
    userId?: string
  ): Promise<{ success: boolean; pageUrl?: string }> {
    try {
      const entity = await prisma.smartEntity.findUnique({
        where: { id: entityId },
        include: {
          mentions: {
            include: {
              article: {
                select: {
                  id: true,
                  title: true,
                  excerpt: true,
                  published_at: true
                }
              }
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!entity) {
        throw new Error('الكيان غير موجود');
      }

      // توليد محتوى الصفحة باستخدام AI
      const pageContent = await this.generateEntityPageContent(entity);

      // إنشاء الصفحة (يمكن استخدام نظام الصفحات الموجود)
      const pageUrl = `/entity/${entity.slug}`;

      // تحديث الكيان
      await prisma.smartEntity.update({
        where: { id: entityId },
        data: {
          canonicalUrl: pageUrl,
          description: pageContent.description
        }
      });

      // تسجيل النشاط
      await this.logActivity({
        entityId,
        action: 'CREATE_PAGE',
        userId,
        metadata: { pageUrl }
      });

      return { success: true, pageUrl };

    } catch (error) {
      console.error('خطأ في إنشاء صفحة الكيان:', error);
      throw error;
    }
  }

  /**
   * توليد محتوى صفحة الكيان
   */
  private async generateEntityPageContent(entity: any): Promise<{
    title: string;
    description: string;
    relatedArticles: any[];
  }> {
    // يمكن استخدام OpenAI لتوليد وصف ذكي
    const relatedArticles = entity.mentions.map((m: any) => m.article);

    return {
      title: entity.name,
      description: entity.description || `صفحة تعريفية عن ${entity.name}`,
      relatedArticles
    };
  }

  /**
   * استخراج السياق المحيط بالكيان
   */
  private extractContext(content: string, start: number, end: number): string {
    const contextLength = 50;
    const contextStart = Math.max(0, start - contextLength);
    const contextEnd = Math.min(content.length, end + contextLength);
    
    return content.substring(contextStart, contextEnd).trim();
  }

  /**
   * توليد slug من النص
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  }

  /**
   * تسجيل النشاط
   */
  private async logActivity(data: {
    articleId?: string;
    entityId?: string;
    mentionId?: string;
    action: string;
    userId?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await prisma.smartLinkActivityLog.create({
        data: {
          ...data,
          action: data.action as any,
          metadata: data.metadata || {}
        }
      });
    } catch (error) {
      console.error('خطأ في تسجيل النشاط:', error);
    }
  }
}

// ========================================
// Singleton Instance
// ========================================

let smartLinksServiceInstance: SmartLinksService | null = null;

export function getSmartLinksService(apiKey?: string): SmartLinksService {
  if (!smartLinksServiceInstance) {
    const key = apiKey || process.env.OPENAI_API_KEY || '';
    smartLinksServiceInstance = new SmartLinksService(key);
  }
  return smartLinksServiceInstance;
}

export default SmartLinksService;

