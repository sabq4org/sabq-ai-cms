/**
 * محدد المعدل الذكي للإشعارات
 * Smart Rate Limiter for Notifications
 */

import { 
  UserProfile, 
  NotificationType, 
  NotificationPriority,
  DeliveryChannel 
} from '../types';

// واجهة قواعد تحديد المعدل
export interface RateLimitRule {
  ruleId: string;
  name: string;
  description: string;
  scope: 'global' | 'user' | 'channel' | 'type';
  limits: {
    perSecond?: number;
    perMinute?: number;
    perHour?: number;
    perDay?: number;
  };
  conditions?: RateLimitCondition[];
  exceptions?: RateLimitException[];
  priority: number; // كلما زاد الرقم، زادت الأولوية
}

// شروط تطبيق القاعدة
export interface RateLimitCondition {
  field: string;
  operator: 'equals' | 'greater' | 'less' | 'in' | 'between';
  value: any;
}

// استثناءات القاعدة
export interface RateLimitException {
  type: 'priority' | 'type' | 'user' | 'time';
  value: any;
}

// نتيجة فحص المعدل
export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // بالثواني
  suggestedDelay?: number; // بالثواني
  quotaInfo: {
    used: number;
    limit: number;
    resetAt: Date;
  };
}

// سجل الإشعارات
interface NotificationRecord {
  timestamp: Date;
  type: NotificationType;
  priority: NotificationPriority;
  channel: DeliveryChannel;
  size: number; // حجم الإشعار (للتحكم في النطاق الترددي)
}

export class SmartRateLimiter {
  private rateLimitRules: RateLimitRule[] = [
    // قواعد عامة
    {
      ruleId: 'global_limit',
      name: 'الحد العام للنظام',
      description: 'الحد الأقصى لإجمالي الإشعارات',
      scope: 'global',
      limits: {
        perSecond: 1000,
        perMinute: 30000,
        perHour: 500000
      },
      priority: 1
    },
    // قواعد المستخدم
    {
      ruleId: 'user_default',
      name: 'الحد الافتراضي للمستخدم',
      description: 'الحد الأقصى للإشعارات لكل مستخدم',
      scope: 'user',
      limits: {
        perMinute: 5,
        perHour: 30,
        perDay: 100
      },
      exceptions: [
        {
          type: 'priority',
          value: NotificationPriority.CRITICAL
        }
      ],
      priority: 10
    },
    {
      ruleId: 'user_high_frequency',
      name: 'مستخدم عالي التكرار',
      description: 'للمستخدمين النشطين',
      scope: 'user',
      limits: {
        perMinute: 10,
        perHour: 60,
        perDay: 200
      },
      conditions: [
        {
          field: 'userProfile.notificationPreferences.frequency',
          operator: 'equals',
          value: 'high'
        }
      ],
      priority: 15
    },
    {
      ruleId: 'user_low_frequency',
      name: 'مستخدم منخفض التكرار',
      description: 'للمستخدمين الذين يفضلون إشعارات أقل',
      scope: 'user',
      limits: {
        perHour: 5,
        perDay: 20
      },
      conditions: [
        {
          field: 'userProfile.notificationPreferences.frequency',
          operator: 'in',
          value: ['low', 'minimal']
        }
      ],
      priority: 15
    },
    // قواعد القناة
    {
      ruleId: 'channel_email',
      name: 'حد البريد الإلكتروني',
      description: 'حماية من الإزعاج عبر البريد',
      scope: 'channel',
      limits: {
        perHour: 5,
        perDay: 20
      },
      conditions: [
        {
          field: 'channel',
          operator: 'equals',
          value: DeliveryChannel.EMAIL
        }
      ],
      priority: 20
    },
    {
      ruleId: 'channel_sms',
      name: 'حد الرسائل النصية',
      description: 'تحكم صارم في SMS بسبب التكلفة',
      scope: 'channel',
      limits: {
        perDay: 5
      },
      conditions: [
        {
          field: 'channel',
          operator: 'equals',
          value: DeliveryChannel.SMS
        }
      ],
      exceptions: [
        {
          type: 'priority',
          value: NotificationPriority.CRITICAL
        }
      ],
      priority: 25
    },
    // قواعد النوع
    {
      ruleId: 'type_breaking_news',
      name: 'حد الأخبار العاجلة',
      description: 'تجنب إغراق المستخدم بالأخبار العاجلة',
      scope: 'type',
      limits: {
        perHour: 3,
        perDay: 10
      },
      conditions: [
        {
          field: 'type',
          operator: 'equals',
          value: NotificationType.BREAKING_NEWS
        }
      ],
      priority: 30
    },
    {
      ruleId: 'type_social',
      name: 'حد التفاعلات الاجتماعية',
      description: 'منع الإزعاج من التفاعلات المتكررة',
      scope: 'type',
      limits: {
        perMinute: 3,
        perHour: 20
      },
      conditions: [
        {
          field: 'type',
          operator: 'equals',
          value: NotificationType.SOCIAL_INTERACTION
        }
      ],
      priority: 30
    }
  ];

  private notificationHistory: Map<string, NotificationRecord[]> = new Map();
  private quotaTrackers: Map<string, QuotaTracker> = new Map();
  private adaptiveLimits: Map<string, AdaptiveLimit> = new Map();

  /**
   * فحص ما إذا كان يجب إرسال الإشعار
   */
  async shouldSendNotification(
    userId: string,
    notificationType: NotificationType,
    priority: NotificationPriority,
    channel: DeliveryChannel,
    userProfile?: UserProfile
  ): Promise<RateLimitResult> {
    console.log(`فحص حدود المعدل للمستخدم: ${userId}`);

    // جمع جميع القواعد المطبقة
    const applicableRules = this.getApplicableRules(
      userId,
      notificationType,
      channel,
      userProfile
    );

    // ترتيب القواعد حسب الأولوية
    applicableRules.sort((a, b) => b.priority - a.priority);

    // فحص كل قاعدة
    for (const rule of applicableRules) {
      const result = await this.checkRule(
        rule,
        userId,
        notificationType,
        priority,
        channel
      );

      if (!result.allowed) {
        // إذا كانت هناك استثناءات، تحقق منها
        if (rule.exceptions && this.checkExceptions(rule.exceptions, priority, notificationType)) {
          continue; // تجاوز هذه القاعدة
        }

        return result;
      }
    }

    // التحقق من الحدود التكيفية
    const adaptiveResult = this.checkAdaptiveLimits(userId, userProfile);
    if (!adaptiveResult.allowed) {
      return adaptiveResult;
    }

    // السماح بالإرسال
    this.recordNotification(userId, notificationType, priority, channel);
    
    return {
      allowed: true,
      quotaInfo: this.getQuotaInfo(userId)
    };
  }

  /**
   * الحصول على القواعد المطبقة
   */
  private getApplicableRules(
    userId: string,
    notificationType: NotificationType,
    channel: DeliveryChannel,
    userProfile?: UserProfile
  ): RateLimitRule[] {
    const applicable: RateLimitRule[] = [];

    for (const rule of this.rateLimitRules) {
      // فحص النطاق
      if (rule.scope === 'global') {
        applicable.push(rule);
        continue;
      }

      // فحص الشروط
      if (rule.conditions) {
        const context = {
          userId,
          type: notificationType,
          channel,
          userProfile
        };

        if (this.evaluateConditions(rule.conditions, context)) {
          applicable.push(rule);
        }
      } else if (rule.scope === 'user') {
        applicable.push(rule);
      }
    }

    return applicable;
  }

  /**
   * تقييم الشروط
   */
  private evaluateConditions(
    conditions: RateLimitCondition[],
    context: any
  ): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(condition.field, context);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'greater':
          return fieldValue > condition.value;
        case 'less':
          return fieldValue < condition.value;
        case 'in':
          return Array.isArray(condition.value) && 
                 condition.value.includes(fieldValue);
        case 'between':
          return Array.isArray(condition.value) && 
                 fieldValue >= condition.value[0] && 
                 fieldValue <= condition.value[1];
        default:
          return false;
      }
    });
  }

  /**
   * الحصول على قيمة الحقل
   */
  private getFieldValue(field: string, context: any): any {
    const parts = field.split('.');
    let value = context;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * فحص قاعدة واحدة
   */
  private async checkRule(
    rule: RateLimitRule,
    userId: string,
    notificationType: NotificationType,
    priority: NotificationPriority,
    channel: DeliveryChannel
  ): Promise<RateLimitResult> {
    const key = this.getRateLimitKey(rule, userId, notificationType, channel);
    const history = this.getNotificationHistory(key);
    const now = new Date();

    // فحص كل حد
    for (const [period, limit] of Object.entries(rule.limits)) {
      if (!limit) continue;

      const windowStart = this.getWindowStart(now, period as keyof typeof rule.limits);
      const count = history.filter(record => record.timestamp >= windowStart).length;

      if (count >= limit) {
        const resetAt = this.getResetTime(now, period as keyof typeof rule.limits);
        const retryAfter = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);

        return {
          allowed: false,
          reason: `تجاوز الحد الأقصى: ${count}/${limit} في ${this.getPeriodName(period)}`,
          retryAfter,
          suggestedDelay: this.calculateSuggestedDelay(rule, history),
          quotaInfo: {
            used: count,
            limit,
            resetAt
          }
        };
      }
    }

    return {
      allowed: true,
      quotaInfo: this.getQuotaInfoForRule(rule, history)
    };
  }

  /**
   * فحص الاستثناءات
   */
  private checkExceptions(
    exceptions: RateLimitException[],
    priority: NotificationPriority,
    type: NotificationType
  ): boolean {
    return exceptions.some(exception => {
      switch (exception.type) {
        case 'priority':
          return priority === exception.value;
        case 'type':
          return type === exception.value;
        case 'time':
          const now = new Date();
          const hour = now.getHours();
          return hour >= exception.value.start && hour < exception.value.end;
        default:
          return false;
      }
    });
  }

  /**
   * فحص الحدود التكيفية
   */
  private checkAdaptiveLimits(
    userId: string,
    userProfile?: UserProfile
  ): RateLimitResult {
    const adaptiveLimit = this.getAdaptiveLimit(userId);
    
    if (!adaptiveLimit.enabled) {
      return { allowed: true, quotaInfo: this.getQuotaInfo(userId) };
    }

    // حساب معدل التفاعل
    const engagementRate = this.calculateEngagementRate(userId);
    
    // تعديل الحدود بناءً على التفاعل
    if (engagementRate < 0.2) { // تفاعل منخفض
      const reduction = 0.5; // تقليل 50%
      const currentLimit = adaptiveLimit.currentLimit * reduction;
      
      const userHistory = this.getNotificationHistory(`user:${userId}`);
      const recentCount = userHistory.filter(r => 
        r.timestamp > new Date(Date.now() - 60 * 60 * 1000)
      ).length;
      
      if (recentCount >= currentLimit) {
        return {
          allowed: false,
          reason: 'تم تقليل الحد بسبب انخفاض معدل التفاعل',
          suggestedDelay: 3600, // ساعة واحدة
          quotaInfo: {
            used: recentCount,
            limit: Math.floor(currentLimit),
            resetAt: new Date(Date.now() + 60 * 60 * 1000)
          }
        };
      }
    } else if (engagementRate > 0.7) { // تفاعل عالي
      // زيادة الحد للمستخدمين النشطين
      adaptiveLimit.currentLimit = Math.min(
        adaptiveLimit.currentLimit * 1.2,
        adaptiveLimit.maxLimit
      );
    }

    return { allowed: true, quotaInfo: this.getQuotaInfo(userId) };
  }

  /**
   * تسجيل الإشعار
   */
  private recordNotification(
    userId: string,
    type: NotificationType,
    priority: NotificationPriority,
    channel: DeliveryChannel
  ): void {
    const record: NotificationRecord = {
      timestamp: new Date(),
      type,
      priority,
      channel,
      size: 1 // يمكن حساب الحجم الفعلي
    };

    // تسجيل في التاريخ العام
    this.addToHistory(`global`, record);
    
    // تسجيل للمستخدم
    this.addToHistory(`user:${userId}`, record);
    
    // تسجيل للقناة
    this.addToHistory(`channel:${channel}`, record);
    
    // تسجيل للنوع
    this.addToHistory(`type:${type}`, record);

    // تحديث الإحصائيات التكيفية
    this.updateAdaptiveStats(userId, record);
  }

  /**
   * إضافة إلى التاريخ
   */
  private addToHistory(key: string, record: NotificationRecord): void {
    if (!this.notificationHistory.has(key)) {
      this.notificationHistory.set(key, []);
    }

    const history = this.notificationHistory.get(key)!;
    history.push(record);

    // تنظيف السجلات القديمة (أكثر من 24 ساعة)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filtered = history.filter(r => r.timestamp > dayAgo);
    this.notificationHistory.set(key, filtered);
  }

  /**
   * الحصول على تاريخ الإشعارات
   */
  private getNotificationHistory(key: string): NotificationRecord[] {
    return this.notificationHistory.get(key) || [];
  }

  /**
   * إنشاء مفتاح تحديد المعدل
   */
  private getRateLimitKey(
    rule: RateLimitRule,
    userId: string,
    type: NotificationType,
    channel: DeliveryChannel
  ): string {
    switch (rule.scope) {
      case 'global':
        return 'global';
      case 'user':
        return `user:${userId}`;
      case 'channel':
        return `channel:${channel}`;
      case 'type':
        return `type:${type}`;
      default:
        return `user:${userId}`;
    }
  }

  /**
   * الحصول على بداية النافذة الزمنية
   */
  private getWindowStart(now: Date, period: keyof RateLimitRule['limits']): Date {
    const windowStart = new Date(now);

    switch (period) {
      case 'perSecond':
        windowStart.setSeconds(windowStart.getSeconds() - 1);
        break;
      case 'perMinute':
        windowStart.setMinutes(windowStart.getMinutes() - 1);
        break;
      case 'perHour':
        windowStart.setHours(windowStart.getHours() - 1);
        break;
      case 'perDay':
        windowStart.setDate(windowStart.getDate() - 1);
        break;
    }

    return windowStart;
  }

  /**
   * الحصول على وقت إعادة التعيين
   */
  private getResetTime(now: Date, period: keyof RateLimitRule['limits']): Date {
    const resetTime = new Date(now);

    switch (period) {
      case 'perSecond':
        resetTime.setSeconds(resetTime.getSeconds() + 1);
        resetTime.setMilliseconds(0);
        break;
      case 'perMinute':
        resetTime.setMinutes(resetTime.getMinutes() + 1);
        resetTime.setSeconds(0);
        resetTime.setMilliseconds(0);
        break;
      case 'perHour':
        resetTime.setHours(resetTime.getHours() + 1);
        resetTime.setMinutes(0);
        resetTime.setSeconds(0);
        resetTime.setMilliseconds(0);
        break;
      case 'perDay':
        resetTime.setDate(resetTime.getDate() + 1);
        resetTime.setHours(0);
        resetTime.setMinutes(0);
        resetTime.setSeconds(0);
        resetTime.setMilliseconds(0);
        break;
    }

    return resetTime;
  }

  /**
   * الحصول على اسم الفترة
   */
  private getPeriodName(period: string): string {
    const names: Record<string, string> = {
      perSecond: 'الثانية',
      perMinute: 'الدقيقة',
      perHour: 'الساعة',
      perDay: 'اليوم'
    };
    return names[period] || period;
  }

  /**
   * حساب التأخير المقترح
   */
  private calculateSuggestedDelay(
    rule: RateLimitRule,
    history: NotificationRecord[]
  ): number {
    if (history.length === 0) return 0;

    // حساب معدل الإرسال الحالي
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentNotifications = history.filter(r => r.timestamp > hourAgo);
    
    if (recentNotifications.length === 0) return 0;

    // حساب الفترة المثلى بين الإشعارات
    const hourlyLimit = rule.limits.perHour || 30;
    const optimalInterval = (60 * 60) / hourlyLimit; // بالثواني
    
    // حساب الوقت منذ آخر إشعار
    const lastNotification = history[history.length - 1];
    const timeSinceLastMs = now.getTime() - lastNotification.timestamp.getTime();
    const timeSinceLastSeconds = timeSinceLastMs / 1000;
    
    // إذا كان الوقت أقل من الفترة المثلى، اقترح الانتظار
    if (timeSinceLastSeconds < optimalInterval) {
      return Math.ceil(optimalInterval - timeSinceLastSeconds);
    }

    return 0;
  }

  /**
   * الحصول على معلومات الحصة
   */
  private getQuotaInfo(userId: string): RateLimitResult['quotaInfo'] {
    const userHistory = this.getNotificationHistory(`user:${userId}`);
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const hourlyCount = userHistory.filter(r => r.timestamp > hourAgo).length;

    return {
      used: hourlyCount,
      limit: 30, // الحد الافتراضي للساعة
      resetAt: this.getResetTime(now, 'perHour')
    };
  }

  /**
   * الحصول على معلومات الحصة لقاعدة معينة
   */
  private getQuotaInfoForRule(
    rule: RateLimitRule,
    history: NotificationRecord[]
  ): RateLimitResult['quotaInfo'] {
    const now = new Date();
    let used = 0;
    let limit = 0;
    let resetAt = now;

    // البحث عن أصغر نافذة زمنية
    for (const [period, periodLimit] of Object.entries(rule.limits)) {
      if (!periodLimit) continue;

      const windowStart = this.getWindowStart(now, period as keyof typeof rule.limits);
      const count = history.filter(r => r.timestamp >= windowStart).length;
      
      if (limit === 0 || count / periodLimit > used / limit) {
        used = count;
        limit = periodLimit;
        resetAt = this.getResetTime(now, period as keyof typeof rule.limits);
      }
    }

    return { used, limit, resetAt };
  }

  /**
   * الحصول على الحد التكيفي
   */
  private getAdaptiveLimit(userId: string): AdaptiveLimit {
    if (!this.adaptiveLimits.has(userId)) {
      this.adaptiveLimits.set(userId, {
        enabled: true,
        currentLimit: 30, // الحد الافتراضي للساعة
        minLimit: 10,
        maxLimit: 100,
        engagementHistory: [],
        lastAdjustment: new Date()
      });
    }
    return this.adaptiveLimits.get(userId)!;
  }

  /**
   * حساب معدل التفاعل
   */
  private calculateEngagementRate(userId: string): number {
    const adaptiveLimit = this.getAdaptiveLimit(userId);
    const history = adaptiveLimit.engagementHistory.slice(-20); // آخر 20 إشعار
    
    if (history.length === 0) return 0.5; // افتراضي

    const engaged = history.filter(e => e.engaged).length;
    return engaged / history.length;
  }

  /**
   * تحديث الإحصائيات التكيفية
   */
  private updateAdaptiveStats(userId: string, record: NotificationRecord): void {
    const adaptiveLimit = this.getAdaptiveLimit(userId);
    
    // سنحتاج لتحديث هذا بناءً على التفاعل الفعلي
    adaptiveLimit.engagementHistory.push({
      timestamp: record.timestamp,
      engaged: false // سيتم تحديثه لاحقاً
    });

    // الاحتفاظ بآخر 100 سجل فقط
    if (adaptiveLimit.engagementHistory.length > 100) {
      adaptiveLimit.engagementHistory = adaptiveLimit.engagementHistory.slice(-100);
    }
  }

  /**
   * تحديث التفاعل
   */
  updateEngagement(userId: string, notificationId: string, engaged: boolean): void {
    const adaptiveLimit = this.getAdaptiveLimit(userId);
    
    // البحث عن الإشعار وتحديث حالة التفاعل
    // في تطبيق حقيقي، سنحتاج لربط الإشعارات بالسجلات
    const recentEntry = adaptiveLimit.engagementHistory[adaptiveLimit.engagementHistory.length - 1];
    if (recentEntry) {
      recentEntry.engaged = engaged;
    }

    // إعادة حساب الحدود إذا لزم الأمر
    const now = new Date();
    const hoursSinceLastAdjustment = (now.getTime() - adaptiveLimit.lastAdjustment.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastAdjustment > 24) { // تعديل يومي
      this.adjustAdaptiveLimits(userId);
      adaptiveLimit.lastAdjustment = now;
    }
  }

  /**
   * تعديل الحدود التكيفية
   */
  private adjustAdaptiveLimits(userId: string): void {
    const adaptiveLimit = this.getAdaptiveLimit(userId);
    const engagementRate = this.calculateEngagementRate(userId);
    
    // تعديل الحدود بناءً على معدل التفاعل
    if (engagementRate > 0.7) {
      // زيادة الحد للمستخدمين النشطين
      adaptiveLimit.currentLimit = Math.min(
        adaptiveLimit.currentLimit * 1.1,
        adaptiveLimit.maxLimit
      );
    } else if (engagementRate < 0.3) {
      // تقليل الحد للمستخدمين غير النشطين
      adaptiveLimit.currentLimit = Math.max(
        adaptiveLimit.currentLimit * 0.9,
        adaptiveLimit.minLimit
      );
    }
  }

  /**
   * الحصول على إحصائيات المعدل
   */
  getRateLimitStats(userId: string): RateLimitStats {
    const userHistory = this.getNotificationHistory(`user:${userId}`);
    const now = new Date();
    
    return {
      userId,
      currentUsage: {
        lastMinute: userHistory.filter(r => r.timestamp > new Date(now.getTime() - 60 * 1000)).length,
        lastHour: userHistory.filter(r => r.timestamp > new Date(now.getTime() - 60 * 60 * 1000)).length,
        lastDay: userHistory.filter(r => r.timestamp > new Date(now.getTime() - 24 * 60 * 60 * 1000)).length
      },
      limits: {
        perMinute: 5,
        perHour: 30,
        perDay: 100
      },
      adaptiveInfo: {
        enabled: true,
        currentLimit: this.getAdaptiveLimit(userId).currentLimit,
        engagementRate: this.calculateEngagementRate(userId)
      }
    };
  }

  /**
   * إعادة تعيين حدود المستخدم
   */
  resetUserLimits(userId: string): void {
    // مسح التاريخ
    this.notificationHistory.delete(`user:${userId}`);
    
    // إعادة تعيين الحدود التكيفية
    this.adaptiveLimits.delete(userId);
    
    console.log(`تم إعادة تعيين حدود المستخدم: ${userId}`);
  }

  /**
   * تكوين قاعدة مخصصة
   */
  addCustomRule(rule: RateLimitRule): void {
    // التحقق من عدم وجود تعارض
    const existingRule = this.rateLimitRules.find(r => r.ruleId === rule.ruleId);
    if (existingRule) {
      throw new Error(`القاعدة ${rule.ruleId} موجودة بالفعل`);
    }

    this.rateLimitRules.push(rule);
    console.log(`تمت إضافة قاعدة مخصصة: ${rule.name}`);
  }

  /**
   * تعطيل/تمكين قاعدة
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rateLimitRules.find(r => r.ruleId === ruleId);
    if (!rule) {
      throw new Error(`القاعدة ${ruleId} غير موجودة`);
    }

    // في تطبيق حقيقي، سنضيف خاصية enabled للقاعدة
    console.log(`تم ${enabled ? 'تمكين' : 'تعطيل'} القاعدة: ${rule.name}`);
  }
}

// واجهات مساعدة
interface QuotaTracker {
  count: number;
  windowStart: Date;
  windowEnd: Date;
}

interface AdaptiveLimit {
  enabled: boolean;
  currentLimit: number;
  minLimit: number;
  maxLimit: number;
  engagementHistory: Array<{
    timestamp: Date;
    engaged: boolean;
  }>;
  lastAdjustment: Date;
}

interface RateLimitStats {
  userId: string;
  currentUsage: {
    lastMinute: number;
    lastHour: number;
    lastDay: number;
  };
  limits: {
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  adaptiveInfo: {
    enabled: boolean;
    currentLimit: number;
    engagementRate: number;
  };
}
