/**
 * محرك منع التكرار الذكي
 * Anti-Duplication Engine
 */

import { 
  SmartNotification, 
  NotificationType,
  ContentItem 
} from '../types';
import crypto from 'crypto';

// واجهة سجل التكرار
interface DuplicationRecord {
  hash: string;
  notificationId: string;
  userId: string;
  type: NotificationType;
  contentId?: string;
  timestamp: Date;
  expiresAt: Date;
}

// واجهة قاعدة منع التكرار
interface DuplicationRule {
  ruleId: string;
  name: string;
  type: NotificationType;
  strategy: DuplicationStrategy;
  windowHours: number;
  similarityThreshold: number;
  fields: string[]; // الحقول المستخدمة في المقارنة
}

// استراتيجيات منع التكرار
export enum DuplicationStrategy {
  EXACT_MATCH = 'exact_match',        // تطابق تام
  CONTENT_SIMILARITY = 'content_similarity', // تشابه المحتوى
  SEMANTIC_SIMILARITY = 'semantic_similarity', // تشابه دلالي
  CATEGORY_BASED = 'category_based',   // بناءً على الفئة
  TIME_BASED = 'time_based'           // بناءً على الوقت
}

// نتيجة فحص التكرار
export interface DuplicationCheckResult {
  isDuplicate: boolean;
  reason?: string;
  similarNotifications?: Array<{
    notificationId: string;
    similarity: number;
    sentAt: Date;
  }>;
  suggestion?: string;
}

export class AntiDuplicationEngine {
  private duplicationRules: DuplicationRule[] = [
    {
      ruleId: 'exact_content',
      name: 'منع التكرار التام',
      type: NotificationType.CONTENT_RECOMMENDATION,
      strategy: DuplicationStrategy.EXACT_MATCH,
      windowHours: 24,
      similarityThreshold: 1.0,
      fields: ['contentId', 'title']
    },
    {
      ruleId: 'similar_articles',
      name: 'منع المقالات المتشابهة',
      type: NotificationType.CONTENT_RECOMMENDATION,
      strategy: DuplicationStrategy.CONTENT_SIMILARITY,
      windowHours: 12,
      similarityThreshold: 0.8,
      fields: ['title', 'message', 'category']
    },
    {
      ruleId: 'breaking_news_dedup',
      name: 'منع تكرار الأخبار العاجلة',
      type: NotificationType.BREAKING_NEWS,
      strategy: DuplicationStrategy.SEMANTIC_SIMILARITY,
      windowHours: 6,
      similarityThreshold: 0.7,
      fields: ['title', 'message']
    },
    {
      ruleId: 'social_interaction_throttle',
      name: 'تحديد التفاعلات الاجتماعية',
      type: NotificationType.SOCIAL_INTERACTION,
      strategy: DuplicationStrategy.TIME_BASED,
      windowHours: 1,
      similarityThreshold: 0.5,
      fields: ['contentId', 'type']
    },
    {
      ruleId: 'author_update_dedup',
      name: 'منع تكرار تحديثات الكاتب',
      type: NotificationType.AUTHOR_UPDATE,
      strategy: DuplicationStrategy.CATEGORY_BASED,
      windowHours: 24,
      similarityThreshold: 0.9,
      fields: ['author', 'category']
    }
  ];

  private duplicationHistory: Map<string, DuplicationRecord[]> = new Map();
  private contentCache: Map<string, ContentItem> = new Map();
  private hashCache: Map<string, string> = new Map();

  /**
   * فحص ما إذا كان الإشعار مكرراً
   */
  async isDuplicate(
    newNotification: SmartNotification,
    userHistory: SmartNotification[]
  ): Promise<DuplicationCheckResult> {
    console.log(`فحص التكرار للإشعار: ${newNotification.notificationId}`);

    // الحصول على القواعد المطبقة
    const applicableRules = this.getApplicableRules(newNotification.type);

    // فحص كل قاعدة
    for (const rule of applicableRules) {
      const result = await this.checkRule(rule, newNotification, userHistory);
      
      if (result.isDuplicate) {
        return result;
      }
    }

    // تسجيل الإشعار الجديد
    this.recordNotification(newNotification);

    return {
      isDuplicate: false
    };
  }

  /**
   * الحصول على القواعد المطبقة
   */
  private getApplicableRules(notificationType: NotificationType): DuplicationRule[] {
    return this.duplicationRules.filter(rule => 
      rule.type === notificationType || rule.type === null
    );
  }

  /**
   * فحص قاعدة واحدة
   */
  private async checkRule(
    rule: DuplicationRule,
    newNotification: SmartNotification,
    userHistory: SmartNotification[]
  ): Promise<DuplicationCheckResult> {
    // تصفية التاريخ حسب النافذة الزمنية
    const windowStart = new Date(Date.now() - rule.windowHours * 60 * 60 * 1000);
    const relevantHistory = userHistory.filter(n => 
      new Date(n.sentTime || n.createdAt) > windowStart
    );

    if (relevantHistory.length === 0) {
      return { isDuplicate: false };
    }

    // تطبيق الاستراتيجية
    switch (rule.strategy) {
      case DuplicationStrategy.EXACT_MATCH:
        return this.checkExactMatch(rule, newNotification, relevantHistory);
      
      case DuplicationStrategy.CONTENT_SIMILARITY:
        return this.checkContentSimilarity(rule, newNotification, relevantHistory);
      
      case DuplicationStrategy.SEMANTIC_SIMILARITY:
        return await this.checkSemanticSimilarity(rule, newNotification, relevantHistory);
      
      case DuplicationStrategy.CATEGORY_BASED:
        return this.checkCategoryBased(rule, newNotification, relevantHistory);
      
      case DuplicationStrategy.TIME_BASED:
        return this.checkTimeBased(rule, newNotification, relevantHistory);
      
      default:
        return { isDuplicate: false };
    }
  }

  /**
   * فحص التطابق التام
   */
  private checkExactMatch(
    rule: DuplicationRule,
    newNotification: SmartNotification,
    history: SmartNotification[]
  ): DuplicationCheckResult {
    const newHash = this.generateHash(newNotification, rule.fields);

    for (const historicalNotification of history) {
      const historicalHash = this.generateHash(historicalNotification, rule.fields);
      
      if (newHash === historicalHash) {
        return {
          isDuplicate: true,
          reason: 'تم إرسال نفس الإشعار مسبقاً',
          similarNotifications: [{
            notificationId: historicalNotification.notificationId,
            similarity: 1.0,
            sentAt: new Date(historicalNotification.sentTime || historicalNotification.createdAt)
          }],
          suggestion: 'تجاهل هذا الإشعار أو قم بتحديث المحتوى'
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * فحص تشابه المحتوى
   */
  private checkContentSimilarity(
    rule: DuplicationRule,
    newNotification: SmartNotification,
    history: SmartNotification[]
  ): DuplicationCheckResult {
    const similarNotifications: Array<{
      notificationId: string;
      similarity: number;
      sentAt: Date;
    }> = [];

    for (const historicalNotification of history) {
      const similarity = this.calculateContentSimilarity(
        newNotification,
        historicalNotification,
        rule.fields
      );

      if (similarity >= rule.similarityThreshold) {
        similarNotifications.push({
          notificationId: historicalNotification.notificationId,
          similarity,
          sentAt: new Date(historicalNotification.sentTime || historicalNotification.createdAt)
        });
      }
    }

    if (similarNotifications.length > 0) {
      // ترتيب حسب التشابه
      similarNotifications.sort((a, b) => b.similarity - a.similarity);

      return {
        isDuplicate: true,
        reason: `تم العثور على ${similarNotifications.length} إشعارات مشابهة`,
        similarNotifications: similarNotifications.slice(0, 3),
        suggestion: 'قم بتجميع الإشعارات أو تأجيل الإرسال'
      };
    }

    return { isDuplicate: false };
  }

  /**
   * فحص التشابه الدلالي
   */
  private async checkSemanticSimilarity(
    rule: DuplicationRule,
    newNotification: SmartNotification,
    history: SmartNotification[]
  ): Promise<DuplicationCheckResult> {
    // في تطبيق حقيقي، سنستخدم نموذج NLP للتشابه الدلالي
    // هنا نستخدم مقارنة بسيطة للتوضيح

    const newText = this.extractText(newNotification, rule.fields);
    const newTokens = this.tokenizeArabic(newText);
    const similarNotifications: Array<{
      notificationId: string;
      similarity: number;
      sentAt: Date;
    }> = [];

    for (const historicalNotification of history) {
      const historicalText = this.extractText(historicalNotification, rule.fields);
      const historicalTokens = this.tokenizeArabic(historicalText);
      
      const similarity = this.calculateTokenSimilarity(newTokens, historicalTokens);

      if (similarity >= rule.similarityThreshold) {
        similarNotifications.push({
          notificationId: historicalNotification.notificationId,
          similarity,
          sentAt: new Date(historicalNotification.sentTime || historicalNotification.createdAt)
        });
      }
    }

    if (similarNotifications.length > 0) {
      return {
        isDuplicate: true,
        reason: 'محتوى مشابه دلالياً تم إرساله مؤخراً',
        similarNotifications: similarNotifications.slice(0, 3),
        suggestion: 'اختر محتوى مختلف أو انتظر فترة أطول'
      };
    }

    return { isDuplicate: false };
  }

  /**
   * فحص بناءً على الفئة
   */
  private checkCategoryBased(
    rule: DuplicationRule,
    newNotification: SmartNotification,
    history: SmartNotification[]
  ): DuplicationCheckResult {
    const newCategory = newNotification.metadata.customData?.category;
    const newAuthor = newNotification.metadata.customData?.author;

    if (!newCategory) {
      return { isDuplicate: false };
    }

    // عد الإشعارات من نفس الفئة/الكاتب
    const sameCategoryCount = history.filter(n => {
      const category = n.metadata.customData?.category;
      const author = n.metadata.customData?.author;
      
      return category === newCategory && 
             (!newAuthor || author === newAuthor);
    }).length;

    if (sameCategoryCount >= 3) { // حد أقصى 3 من نفس الفئة
      return {
        isDuplicate: true,
        reason: `تم إرسال ${sameCategoryCount} إشعارات من نفس الفئة مؤخراً`,
        suggestion: 'نوّع في الفئات أو قم بتجميع الإشعارات'
      };
    }

    return { isDuplicate: false };
  }

  /**
   * فحص بناءً على الوقت
   */
  private checkTimeBased(
    rule: DuplicationRule,
    newNotification: SmartNotification,
    history: SmartNotification[]
  ): DuplicationCheckResult {
    const recentCount = history.filter(n => 
      n.type === newNotification.type &&
      n.contentId === newNotification.contentId
    ).length;

    if (recentCount >= 1) {
      const lastNotification = history
        .filter(n => n.contentId === newNotification.contentId)
        .sort((a, b) => 
          new Date(b.sentTime || b.createdAt).getTime() - 
          new Date(a.sentTime || a.createdAt).getTime()
        )[0];

      const timeSinceLastMs = Date.now() - new Date(lastNotification.sentTime || lastNotification.createdAt).getTime();
      const hoursSinceLast = timeSinceLastMs / (1000 * 60 * 60);

      return {
        isDuplicate: true,
        reason: `تم إرسال إشعار مماثل قبل ${hoursSinceLast.toFixed(1)} ساعة`,
        similarNotifications: [{
          notificationId: lastNotification.notificationId,
          similarity: 1.0,
          sentAt: new Date(lastNotification.sentTime || lastNotification.createdAt)
        }],
        suggestion: `انتظر ${(rule.windowHours - hoursSinceLast).toFixed(1)} ساعة إضافية`
      };
    }

    return { isDuplicate: false };
  }

  /**
   * توليد هاش للمقارنة
   */
  private generateHash(notification: SmartNotification, fields: string[]): string {
    const cacheKey = `${notification.notificationId}_${fields.join(',')}`;
    
    if (this.hashCache.has(cacheKey)) {
      return this.hashCache.get(cacheKey)!;
    }

    const data: any = {};
    
    for (const field of fields) {
      if (field === 'contentId') {
        data[field] = notification.contentId;
      } else if (field === 'title') {
        data[field] = notification.title;
      } else if (field === 'message') {
        data[field] = notification.message;
      } else if (field === 'type') {
        data[field] = notification.type;
      } else if (field.startsWith('metadata.')) {
        const metaField = field.replace('metadata.', '');
        data[field] = notification.metadata.customData?.[metaField];
      }
    }

    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');

    this.hashCache.set(cacheKey, hash);
    return hash;
  }

  /**
   * حساب تشابه المحتوى
   */
  private calculateContentSimilarity(
    notification1: SmartNotification,
    notification2: SmartNotification,
    fields: string[]
  ): number {
    let totalSimilarity = 0;
    let fieldCount = 0;

    for (const field of fields) {
      const value1 = this.getFieldValue(notification1, field);
      const value2 = this.getFieldValue(notification2, field);

      if (value1 && value2) {
        const similarity = this.calculateStringSimilarity(
          String(value1),
          String(value2)
        );
        totalSimilarity += similarity;
        fieldCount++;
      }
    }

    return fieldCount > 0 ? totalSimilarity / fieldCount : 0;
  }

  /**
   * حساب تشابه النصوص
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    // خوارزمية Jaccard Similarity
    const tokens1 = new Set(this.tokenizeArabic(str1.toLowerCase()));
    const tokens2 = new Set(this.tokenizeArabic(str2.toLowerCase()));

    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * تقطيع النص العربي
   */
  private tokenizeArabic(text: string): string[] {
    // إزالة علامات الترقيم والأرقام
    const cleaned = text.replace(/[^\u0600-\u06FF\s]/g, '');
    
    // تقسيم على المسافات
    const tokens = cleaned.split(/\s+/).filter(token => token.length > 2);
    
    // إزالة كلمات الإيقاف البسيطة
    const stopWords = ['في', 'من', 'إلى', 'على', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي'];
    
    return tokens.filter(token => !stopWords.includes(token));
  }

  /**
   * حساب تشابه الرموز
   */
  private calculateTokenSimilarity(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    const intersection = [...set1].filter(token => set2.has(token)).length;
    const union = new Set([...set1, ...set2]).size;

    return union > 0 ? intersection / union : 0;
  }

  /**
   * استخراج النص من الإشعار
   */
  private extractText(notification: SmartNotification, fields: string[]): string {
    const textParts: string[] = [];

    for (const field of fields) {
      const value = this.getFieldValue(notification, field);
      if (value) {
        textParts.push(String(value));
      }
    }

    return textParts.join(' ');
  }

  /**
   * الحصول على قيمة الحقل
   */
  private getFieldValue(notification: SmartNotification, field: string): any {
    if (field === 'title') return notification.title;
    if (field === 'message') return notification.message;
    if (field === 'contentId') return notification.contentId;
    if (field === 'type') return notification.type;
    
    if (field.includes('.')) {
      const parts = field.split('.');
      let value: any = notification;
      
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          return undefined;
        }
      }
      
      return value;
    }

    return notification.metadata.customData?.[field];
  }

  /**
   * تسجيل الإشعار
   */
  private recordNotification(notification: SmartNotification): void {
    const userId = notification.userId;
    
    if (!this.duplicationHistory.has(userId)) {
      this.duplicationHistory.set(userId, []);
    }

    const record: DuplicationRecord = {
      hash: this.generateHash(notification, ['contentId', 'title', 'message']),
      notificationId: notification.notificationId,
      userId,
      type: notification.type,
      contentId: notification.contentId,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 أيام
    };

    this.duplicationHistory.get(userId)!.push(record);

    // تنظيف السجلات المنتهية
    this.cleanupExpiredRecords(userId);
  }

  /**
   * تنظيف السجلات المنتهية
   */
  private cleanupExpiredRecords(userId: string): void {
    const userHistory = this.duplicationHistory.get(userId);
    if (!userHistory) return;

    const now = new Date();
    const validRecords = userHistory.filter(record => record.expiresAt > now);
    
    this.duplicationHistory.set(userId, validRecords);
  }

  /**
   * الحصول على إحصائيات التكرار
   */
  getDuplicationStats(userId: string): DuplicationStats {
    const userHistory = this.duplicationHistory.get(userId) || [];
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recent24h = userHistory.filter(r => r.timestamp > last24Hours);
    const recent7d = userHistory.filter(r => r.timestamp > last7Days);

    const typeDistribution: Record<NotificationType, number> = {} as any;
    for (const record of recent7d) {
      typeDistribution[record.type] = (typeDistribution[record.type] || 0) + 1;
    }

    return {
      userId,
      totalRecords: userHistory.length,
      duplicatesDetected24h: recent24h.length,
      duplicatesDetected7d: recent7d.length,
      typeDistribution,
      oldestRecord: userHistory.length > 0 ? userHistory[0].timestamp : null,
      newestRecord: userHistory.length > 0 ? userHistory[userHistory.length - 1].timestamp : null
    };
  }

  /**
   * مسح سجل المستخدم
   */
  clearUserHistory(userId: string): void {
    this.duplicationHistory.delete(userId);
    console.log(`تم مسح سجل التكرار للمستخدم: ${userId}`);
  }

  /**
   * إضافة قاعدة مخصصة
   */
  addCustomRule(rule: DuplicationRule): void {
    const existingRule = this.duplicationRules.find(r => r.ruleId === rule.ruleId);
    if (existingRule) {
      throw new Error(`القاعدة ${rule.ruleId} موجودة بالفعل`);
    }

    this.duplicationRules.push(rule);
    console.log(`تمت إضافة قاعدة منع التكرار: ${rule.name}`);
  }

  /**
   * تحديث قاعدة
   */
  updateRule(ruleId: string, updates: Partial<DuplicationRule>): void {
    const ruleIndex = this.duplicationRules.findIndex(r => r.ruleId === ruleId);
    if (ruleIndex === -1) {
      throw new Error(`القاعدة ${ruleId} غير موجودة`);
    }

    this.duplicationRules[ruleIndex] = {
      ...this.duplicationRules[ruleIndex],
      ...updates
    };
  }

  /**
   * الحصول على القواعد النشطة
   */
  getActiveRules(): DuplicationRule[] {
    return [...this.duplicationRules];
  }

  /**
   * اقتراح محتوى بديل
   */
  async suggestAlternativeContent(
    duplicateNotification: SmartNotification,
    availableContent: ContentItem[]
  ): Promise<ContentItem[]> {
    // تصفية المحتوى المشابه
    const category = duplicateNotification.metadata.customData?.category;
    const alternatives = availableContent.filter(content => {
      // نفس الفئة لكن محتوى مختلف
      return content.category === category && 
             content.contentId !== duplicateNotification.contentId;
    });

    // ترتيب حسب الجودة والحداثة
    alternatives.sort((a, b) => {
      const scoreA = a.qualityScore * 0.7 + (1 - this.getAgeScore(a)) * 0.3;
      const scoreB = b.qualityScore * 0.7 + (1 - this.getAgeScore(b)) * 0.3;
      return scoreB - scoreA;
    });

    return alternatives.slice(0, 5);
  }

  /**
   * حساب درجة العمر
   */
  private getAgeScore(content: ContentItem): number {
    const ageInHours = (Date.now() - new Date(content.publishTime).getTime()) / (1000 * 60 * 60);
    const maxAge = 7 * 24; // 7 أيام
    return Math.min(ageInHours / maxAge, 1);
  }
}

// واجهات مساعدة
interface DuplicationStats {
  userId: string;
  totalRecords: number;
  duplicatesDetected24h: number;
  duplicatesDetected7d: number;
  typeDistribution: Record<NotificationType, number>;
  oldestRecord: Date | null;
  newestRecord: Date | null;
}
