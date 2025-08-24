/**
 * مجمع الإشعارات الذكي
 * Smart Notification Aggregator
 */

import { 
  SmartNotification, 
  NotificationType, 
  NotificationPriority,
  NotificationStatus,
  DeliveryChannel 
} from '../types';

// واجهة قواعد التجميع
export interface AggregationRule {
  ruleId: string;
  name: string;
  description: string;
  conditions: AggregationCondition[];
  groupingStrategy: GroupingStrategy;
  maxGroupSize: number;
  timeWindow: number; // بالدقائق
  active: boolean;
}

// شروط التجميع
export interface AggregationCondition {
  field: 'type' | 'category' | 'author' | 'tag' | 'custom';
  operator: 'equals' | 'contains' | 'startsWith' | 'in';
  value: any;
}

// استراتيجية التجميع
export enum GroupingStrategy {
  BY_TYPE = 'by_type',
  BY_CATEGORY = 'by_category',
  BY_AUTHOR = 'by_author',
  BY_TIME = 'by_time',
  SMART = 'smart'
}

// مجموعة الإشعارات
export interface NotificationGroup {
  groupId: string;
  notifications: SmartNotification[];
  groupType: GroupingStrategy;
  priority: NotificationPriority;
  summary: {
    title: string;
    message: string;
    count: number;
    categories?: string[];
    authors?: string[];
  };
  createdAt: Date;
  scheduledTime?: Date;
}

export class SmartNotificationAggregator {
  private aggregationRules: AggregationRule[] = [
    {
      ruleId: 'social_interactions',
      name: 'تجميع التفاعلات الاجتماعية',
      description: 'تجميع الإعجابات والتعليقات والمتابعات',
      conditions: [
        {
          field: 'type',
          operator: 'in',
          value: [NotificationType.SOCIAL_INTERACTION]
        }
      ],
      groupingStrategy: GroupingStrategy.BY_TYPE,
      maxGroupSize: 10,
      timeWindow: 30,
      active: true
    },
    {
      ruleId: 'author_updates',
      name: 'تحديثات الكُتّاب',
      description: 'تجميع المقالات الجديدة من نفس الكاتب',
      conditions: [
        {
          field: 'type',
          operator: 'equals',
          value: NotificationType.AUTHOR_UPDATE
        }
      ],
      groupingStrategy: GroupingStrategy.BY_AUTHOR,
      maxGroupSize: 5,
      timeWindow: 60,
      active: true
    },
    {
      ruleId: 'content_recommendations',
      name: 'توصيات المحتوى',
      description: 'تجميع توصيات المحتوى حسب الفئة',
      conditions: [
        {
          field: 'type',
          operator: 'equals',
          value: NotificationType.CONTENT_RECOMMENDATION
        }
      ],
      groupingStrategy: GroupingStrategy.BY_CATEGORY,
      maxGroupSize: 7,
      timeWindow: 120,
      active: true
    },
    {
      ruleId: 'breaking_news_burst',
      name: 'موجة الأخبار العاجلة',
      description: 'تجميع الأخبار العاجلة المتعددة',
      conditions: [
        {
          field: 'type',
          operator: 'equals',
          value: NotificationType.BREAKING_NEWS
        }
      ],
      groupingStrategy: GroupingStrategy.SMART,
      maxGroupSize: 3,
      timeWindow: 15,
      active: true
    }
  ];

  private notificationBuffer: Map<string, SmartNotification[]> = new Map();
  private groupCache: Map<string, NotificationGroup> = new Map();

  /**
   * تجميع الإشعارات للمستخدم
   */
  async aggregateNotifications(
    userId: string,
    notifications: SmartNotification[]
  ): Promise<NotificationGroup[]> {
    console.log(`تجميع ${notifications.length} إشعار للمستخدم: ${userId}`);

    // تحديث المخزن المؤقت
    this.updateBuffer(userId, notifications);

    // تطبيق قواعد التجميع
    const groups = await this.applyAggregationRules(userId);

    // تحسين المجموعات
    const optimizedGroups = this.optimizeGroups(groups);

    // إنشاء ملخصات ذكية
    const finalGroups = optimizedGroups.map(group => 
      this.createSmartSummary(group)
    );

    // حفظ المجموعات في الذاكرة المؤقتة
    this.cacheGroups(userId, finalGroups);

    return finalGroups;
  }

  /**
   * تحديث المخزن المؤقت
   */
  private updateBuffer(userId: string, notifications: SmartNotification[]): void {
    const userBuffer = this.notificationBuffer.get(userId) || [];
    
    // إضافة الإشعارات الجديدة
    userBuffer.push(...notifications);
    
    // إزالة الإشعارات القديمة (أكثر من 4 ساعات)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const filteredBuffer = userBuffer.filter(n => 
      new Date(n.createdAt) > fourHoursAgo
    );
    
    this.notificationBuffer.set(userId, filteredBuffer);
  }

  /**
   * تطبيق قواعد التجميع
   */
  private async applyAggregationRules(userId: string): Promise<NotificationGroup[]> {
    const userNotifications = this.notificationBuffer.get(userId) || [];
    const groups: NotificationGroup[] = [];
    const processedNotifications = new Set<string>();

    for (const rule of this.aggregationRules) {
      if (!rule.active) continue;

      // العثور على الإشعارات المطابقة
      const matchingNotifications = userNotifications.filter(n => 
        !processedNotifications.has(n.notificationId) &&
        this.matchesConditions(n, rule.conditions)
      );

      if (matchingNotifications.length === 0) continue;

      // تجميع الإشعارات حسب الاستراتيجية
      const ruleGroups = this.groupByStrategy(
        matchingNotifications,
        rule.groupingStrategy,
        rule.maxGroupSize,
        rule.timeWindow
      );

      // إضافة المجموعات وتحديد الإشعارات المعالجة
      for (const group of ruleGroups) {
        groups.push(group);
        group.notifications.forEach(n => 
          processedNotifications.add(n.notificationId)
        );
      }
    }

    // إضافة الإشعارات غير المجمعة كمجموعات فردية
    const ungroupedNotifications = userNotifications.filter(n =>
      !processedNotifications.has(n.notificationId)
    );

    for (const notification of ungroupedNotifications) {
      groups.push(this.createSingleNotificationGroup(notification));
    }

    return groups;
  }

  /**
   * التحقق من مطابقة الشروط
   */
  private matchesConditions(
    notification: SmartNotification,
    conditions: AggregationCondition[]
  ): boolean {
    return conditions.every(condition => {
      let fieldValue: any;

      switch (condition.field) {
        case 'type':
          fieldValue = notification.type;
          break;
        case 'category':
          fieldValue = notification.metadata.customData?.category;
          break;
        case 'author':
          fieldValue = notification.metadata.customData?.author;
          break;
        case 'tag':
          fieldValue = notification.metadata.customData?.tags || [];
          break;
        case 'custom':
          fieldValue = notification.metadata.customData;
          break;
        default:
          return false;
      }

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'startsWith':
          return String(fieldValue).startsWith(String(condition.value));
        case 'in':
          return Array.isArray(condition.value) && 
                 condition.value.includes(fieldValue);
        default:
          return false;
      }
    });
  }

  /**
   * التجميع حسب الاستراتيجية
   */
  private groupByStrategy(
    notifications: SmartNotification[],
    strategy: GroupingStrategy,
    maxGroupSize: number,
    timeWindow: number
  ): NotificationGroup[] {
    const groups: NotificationGroup[] = [];

    switch (strategy) {
      case GroupingStrategy.BY_TYPE:
        groups.push(...this.groupByType(notifications, maxGroupSize, timeWindow));
        break;
      
      case GroupingStrategy.BY_CATEGORY:
        groups.push(...this.groupByCategory(notifications, maxGroupSize, timeWindow));
        break;
      
      case GroupingStrategy.BY_AUTHOR:
        groups.push(...this.groupByAuthor(notifications, maxGroupSize, timeWindow));
        break;
      
      case GroupingStrategy.BY_TIME:
        groups.push(...this.groupByTime(notifications, maxGroupSize, timeWindow));
        break;
      
      case GroupingStrategy.SMART:
        groups.push(...this.smartGrouping(notifications, maxGroupSize, timeWindow));
        break;
    }

    return groups;
  }

  /**
   * التجميع حسب النوع
   */
  private groupByType(
    notifications: SmartNotification[],
    maxGroupSize: number,
    timeWindow: number
  ): NotificationGroup[] {
    const typeGroups = new Map<NotificationType, SmartNotification[]>();

    // تجميع حسب النوع
    for (const notification of notifications) {
      if (!typeGroups.has(notification.type)) {
        typeGroups.set(notification.type, []);
      }
      typeGroups.get(notification.type)!.push(notification);
    }

    // إنشاء مجموعات مع احترام الحد الأقصى والنافذة الزمنية
    const groups: NotificationGroup[] = [];
    
    for (const [type, typeNotifications] of typeGroups) {
      const sortedNotifications = this.sortByTime(typeNotifications);
      const timeGroups = this.splitByTimeWindow(sortedNotifications, timeWindow);
      
      for (const timeGroup of timeGroups) {
        const chunks = this.chunkArray(timeGroup, maxGroupSize);
        
        for (const chunk of chunks) {
          if (chunk.length >= 2) { // تجميع فقط إذا كان هناك إشعاران أو أكثر
            groups.push(this.createGroup(chunk, GroupingStrategy.BY_TYPE));
          } else {
            groups.push(this.createSingleNotificationGroup(chunk[0]));
          }
        }
      }
    }

    return groups;
  }

  /**
   * التجميع حسب الفئة
   */
  private groupByCategory(
    notifications: SmartNotification[],
    maxGroupSize: number,
    timeWindow: number
  ): NotificationGroup[] {
    const categoryGroups = new Map<string, SmartNotification[]>();

    // تجميع حسب الفئة
    for (const notification of notifications) {
      const category = notification.metadata.customData?.category || 'uncategorized';
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(notification);
    }

    // إنشاء مجموعات
    const groups: NotificationGroup[] = [];
    
    for (const [category, categoryNotifications] of categoryGroups) {
      const sortedNotifications = this.sortByTime(categoryNotifications);
      const timeGroups = this.splitByTimeWindow(sortedNotifications, timeWindow);
      
      for (const timeGroup of timeGroups) {
        const chunks = this.chunkArray(timeGroup, maxGroupSize);
        
        for (const chunk of chunks) {
          if (chunk.length >= 2) {
            groups.push(this.createGroup(chunk, GroupingStrategy.BY_CATEGORY));
          } else {
            groups.push(this.createSingleNotificationGroup(chunk[0]));
          }
        }
      }
    }

    return groups;
  }

  /**
   * التجميع حسب الكاتب
   */
  private groupByAuthor(
    notifications: SmartNotification[],
    maxGroupSize: number,
    timeWindow: number
  ): NotificationGroup[] {
    const authorGroups = new Map<string, SmartNotification[]>();

    // تجميع حسب الكاتب
    for (const notification of notifications) {
      const author = notification.metadata.customData?.author;
      if (author) {
        if (!authorGroups.has(author)) {
          authorGroups.set(author, []);
        }
        authorGroups.get(author)!.push(notification);
      }
    }

    // إنشاء مجموعات
    const groups: NotificationGroup[] = [];
    
    for (const [author, authorNotifications] of authorGroups) {
      if (authorNotifications.length >= 2) {
        const sortedNotifications = this.sortByTime(authorNotifications);
        const chunks = this.chunkArray(sortedNotifications, maxGroupSize);
        
        for (const chunk of chunks) {
          groups.push(this.createGroup(chunk, GroupingStrategy.BY_AUTHOR));
        }
      } else {
        groups.push(this.createSingleNotificationGroup(authorNotifications[0]));
      }
    }

    return groups;
  }

  /**
   * التجميع حسب الوقت
   */
  private groupByTime(
    notifications: SmartNotification[],
    maxGroupSize: number,
    timeWindow: number
  ): NotificationGroup[] {
    const sortedNotifications = this.sortByTime(notifications);
    const timeGroups = this.splitByTimeWindow(sortedNotifications, timeWindow);
    const groups: NotificationGroup[] = [];

    for (const timeGroup of timeGroups) {
      if (timeGroup.length >= 2) {
        const chunks = this.chunkArray(timeGroup, maxGroupSize);
        for (const chunk of chunks) {
          groups.push(this.createGroup(chunk, GroupingStrategy.BY_TIME));
        }
      } else {
        groups.push(this.createSingleNotificationGroup(timeGroup[0]));
      }
    }

    return groups;
  }

  /**
   * التجميع الذكي
   */
  private smartGrouping(
    notifications: SmartNotification[],
    maxGroupSize: number,
    timeWindow: number
  ): NotificationGroup[] {
    // خوارزمية ذكية تجمع بين عوامل متعددة
    const groups: NotificationGroup[] = [];
    const processed = new Set<string>();

    // المرحلة 1: تجميع الأخبار العاجلة ذات الصلة
    const breakingNews = notifications.filter(n => 
      n.type === NotificationType.BREAKING_NEWS && 
      !processed.has(n.notificationId)
    );

    if (breakingNews.length >= 2) {
      // تجميع الأخبار العاجلة المترابطة
      const relatedGroups = this.findRelatedContent(breakingNews, maxGroupSize);
      for (const group of relatedGroups) {
        groups.push(this.createGroup(group, GroupingStrategy.SMART));
        group.forEach(n => processed.add(n.notificationId));
      }
    }

    // المرحلة 2: تجميع التفاعلات الاجتماعية من نفس المحتوى
    const socialInteractions = notifications.filter(n =>
      n.type === NotificationType.SOCIAL_INTERACTION &&
      !processed.has(n.notificationId)
    );

    const contentGroups = this.groupByContent(socialInteractions, maxGroupSize);
    for (const group of contentGroups) {
      if (group.length >= 2) {
        groups.push(this.createGroup(group, GroupingStrategy.SMART));
        group.forEach(n => processed.add(n.notificationId));
      }
    }

    // المرحلة 3: تجميع التوصيات ذات التشابه العالي
    const recommendations = notifications.filter(n =>
      n.type === NotificationType.CONTENT_RECOMMENDATION &&
      !processed.has(n.notificationId)
    );

    const similarGroups = this.findSimilarContent(recommendations, maxGroupSize);
    for (const group of similarGroups) {
      groups.push(this.createGroup(group, GroupingStrategy.SMART));
      group.forEach(n => processed.add(n.notificationId));
    }

    // إضافة الإشعارات المتبقية كإشعارات فردية
    const remaining = notifications.filter(n => !processed.has(n.notificationId));
    for (const notification of remaining) {
      groups.push(this.createSingleNotificationGroup(notification));
    }

    return groups;
  }

  /**
   * تحسين المجموعات
   */
  private optimizeGroups(groups: NotificationGroup[]): NotificationGroup[] {
    // دمج المجموعات الصغيرة جداً
    const optimized = this.mergeSmallGroups(groups);
    
    // ترتيب المجموعات حسب الأولوية
    optimized.sort((a, b) => {
      const priorityOrder = {
        [NotificationPriority.CRITICAL]: 4,
        [NotificationPriority.HIGH]: 3,
        [NotificationPriority.MEDIUM]: 2,
        [NotificationPriority.LOW]: 1
      };
      
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    return optimized;
  }

  /**
   * إنشاء ملخص ذكي للمجموعة
   */
  private createSmartSummary(group: NotificationGroup): NotificationGroup {
    const { notifications } = group;
    
    if (notifications.length === 1) {
      // إشعار واحد، لا نحتاج لملخص
      return group;
    }

    // إنشاء عنوان ذكي
    let title = '';
    let message = '';

    switch (group.groupType) {
      case GroupingStrategy.BY_TYPE:
        const type = notifications[0].type;
        title = this.getGroupTitleByType(type, notifications.length);
        message = this.getGroupMessageByType(type, notifications);
        break;
      
      case GroupingStrategy.BY_CATEGORY:
        const category = notifications[0].metadata.customData?.category || 'عام';
        title = `${notifications.length} إشعارات في ${category}`;
        message = this.summarizeNotifications(notifications);
        break;
      
      case GroupingStrategy.BY_AUTHOR:
        const author = notifications[0].metadata.customData?.author;
        title = `${notifications.length} مقالات جديدة من ${author}`;
        message = this.listArticleTitles(notifications);
        break;
      
      case GroupingStrategy.BY_TIME:
        title = `${notifications.length} إشعارات جديدة`;
        message = this.summarizeByType(notifications);
        break;
      
      case GroupingStrategy.SMART:
        title = this.generateSmartTitle(notifications);
        message = this.generateSmartMessage(notifications);
        break;
    }

    group.summary = {
      title,
      message,
      count: notifications.length,
      categories: this.extractCategories(notifications),
      authors: this.extractAuthors(notifications)
    };

    return group;
  }

  /**
   * مساعدات التجميع
   */
  private sortByTime(notifications: SmartNotification[]): SmartNotification[] {
    return [...notifications].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  private splitByTimeWindow(
    notifications: SmartNotification[],
    windowMinutes: number
  ): SmartNotification[][] {
    if (notifications.length === 0) return [];
    
    const groups: SmartNotification[][] = [];
    let currentGroup: SmartNotification[] = [notifications[0]];
    
    for (let i = 1; i < notifications.length; i++) {
      const timeDiff = new Date(notifications[i].createdAt).getTime() - 
                      new Date(notifications[i-1].createdAt).getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      if (minutesDiff <= windowMinutes) {
        currentGroup.push(notifications[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [notifications[i]];
      }
    }
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private createGroup(
    notifications: SmartNotification[],
    groupType: GroupingStrategy
  ): NotificationGroup {
    // تحديد أعلى أولوية في المجموعة
    const highestPriority = notifications.reduce((highest, n) => {
      const priorityOrder = {
        [NotificationPriority.CRITICAL]: 4,
        [NotificationPriority.HIGH]: 3,
        [NotificationPriority.MEDIUM]: 2,
        [NotificationPriority.LOW]: 1
      };
      
      return priorityOrder[n.priority] > priorityOrder[highest] ? n.priority : highest;
    }, NotificationPriority.LOW);

    return {
      groupId: this.generateGroupId(),
      notifications,
      groupType,
      priority: highestPriority,
      summary: {
        title: '',
        message: '',
        count: notifications.length
      },
      createdAt: new Date()
    };
  }

  private createSingleNotificationGroup(notification: SmartNotification): NotificationGroup {
    return {
      groupId: this.generateGroupId(),
      notifications: [notification],
      groupType: GroupingStrategy.BY_TYPE,
      priority: notification.priority,
      summary: {
        title: notification.title,
        message: notification.message,
        count: 1
      },
      createdAt: new Date()
    };
  }

  private generateGroupId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * مساعدات الملخص
   */
  private getGroupTitleByType(type: NotificationType, count: number): string {
    const titles: Record<NotificationType, string> = {
      [NotificationType.SOCIAL_INTERACTION]: `${count} تفاعلات جديدة`,
      [NotificationType.CONTENT_RECOMMENDATION]: `${count} توصيات محتوى`,
      [NotificationType.AUTHOR_UPDATE]: `${count} مقالات جديدة`,
      [NotificationType.SIMILAR_CONTENT]: `${count} مقالات مشابهة`,
      [NotificationType.BREAKING_NEWS]: `${count} أخبار عاجلة`,
      [NotificationType.SYSTEM_ANNOUNCEMENT]: `${count} إعلانات نظام`,
      [NotificationType.REMINDER]: `${count} تذكيرات`,
      [NotificationType.ACHIEVEMENT]: `${count} إنجازات جديدة`
    };
    
    return titles[type] || `${count} إشعارات`;
  }

  private getGroupMessageByType(
    type: NotificationType,
    notifications: SmartNotification[]
  ): string {
    switch (type) {
      case NotificationType.SOCIAL_INTERACTION:
        const interactions = notifications.map(n => n.message).slice(0, 3);
        const moreCount = notifications.length - 3;
        return interactions.join('، ') + (moreCount > 0 ? ` و${moreCount} أخرى` : '');
      
      case NotificationType.CONTENT_RECOMMENDATION:
        const titles = notifications.map(n => 
          n.metadata.customData?.articleTitle || n.title
        ).slice(0, 3);
        return `مقالات مقترحة: ${titles.join('، ')}`;
      
      case NotificationType.AUTHOR_UPDATE:
        const articles = notifications.map(n => 
          n.metadata.customData?.articleTitle || n.title
        );
        return articles.join('، ');
      
      default:
        return this.summarizeNotifications(notifications);
    }
  }

  private summarizeNotifications(notifications: SmartNotification[]): string {
    if (notifications.length <= 3) {
      return notifications.map(n => n.title).join('، ');
    }
    
    const first3 = notifications.slice(0, 3).map(n => n.title);
    const remaining = notifications.length - 3;
    
    return `${first3.join('، ')} و${remaining} إشعارات أخرى`;
  }

  private listArticleTitles(notifications: SmartNotification[]): string {
    const titles = notifications.map(n => 
      n.metadata.customData?.articleTitle || n.title
    );
    
    if (titles.length <= 3) {
      return titles.join('، ');
    }
    
    return `${titles.slice(0, 3).join('، ')} و${titles.length - 3} مقالات أخرى`;
  }

  private summarizeByType(notifications: SmartNotification[]): string {
    const typeCounts = new Map<NotificationType, number>();
    
    for (const n of notifications) {
      typeCounts.set(n.type, (typeCounts.get(n.type) || 0) + 1);
    }
    
    const summaries: string[] = [];
    for (const [type, count] of typeCounts) {
      summaries.push(this.getTypeSummary(type, count));
    }
    
    return summaries.join('، ');
  }

  private getTypeSummary(type: NotificationType, count: number): string {
    const summaries: Record<NotificationType, (count: number) => string> = {
      [NotificationType.SOCIAL_INTERACTION]: (c) => `${c} تفاعل`,
      [NotificationType.CONTENT_RECOMMENDATION]: (c) => `${c} توصية`,
      [NotificationType.AUTHOR_UPDATE]: (c) => `${c} تحديث`,
      [NotificationType.SIMILAR_CONTENT]: (c) => `${c} محتوى مشابه`,
      [NotificationType.BREAKING_NEWS]: (c) => `${c} خبر عاجل`,
      [NotificationType.SYSTEM_ANNOUNCEMENT]: (c) => `${c} إعلان`,
      [NotificationType.REMINDER]: (c) => `${c} تذكير`,
      [NotificationType.ACHIEVEMENT]: (c) => `${c} إنجاز`
    };
    
    return summaries[type]?.(count) || `${count} إشعار`;
  }

  private generateSmartTitle(notifications: SmartNotification[]): string {
    // تحليل المحتوى وإنشاء عنوان ذكي
    const types = new Set(notifications.map(n => n.type));
    
    if (types.size === 1) {
      const type = notifications[0].type;
      return this.getGroupTitleByType(type, notifications.length);
    }
    
    // إشعارات متنوعة
    const hasBreaking = notifications.some(n => n.type === NotificationType.BREAKING_NEWS);
    if (hasBreaking) {
      return `أخبار عاجلة و${notifications.length - 1} إشعارات مهمة`;
    }
    
    return `${notifications.length} إشعارات متنوعة لك`;
  }

  private generateSmartMessage(notifications: SmartNotification[]): string {
    // تحليل وإنشاء رسالة ذكية
    const priorityNotifications = notifications
      .filter(n => n.priority === NotificationPriority.HIGH || 
                   n.priority === NotificationPriority.CRITICAL)
      .slice(0, 2);
    
    if (priorityNotifications.length > 0) {
      const titles = priorityNotifications.map(n => n.title);
      const others = notifications.length - priorityNotifications.length;
      
      return titles.join(' • ') + (others > 0 ? ` و${others} إشعارات أخرى` : '');
    }
    
    return this.summarizeNotifications(notifications);
  }

  private extractCategories(notifications: SmartNotification[]): string[] {
    const categories = new Set<string>();
    
    for (const n of notifications) {
      const category = n.metadata.customData?.category;
      if (category) {
        categories.add(category);
      }
    }
    
    return Array.from(categories);
  }

  private extractAuthors(notifications: SmartNotification[]): string[] {
    const authors = new Set<string>();
    
    for (const n of notifications) {
      const author = n.metadata.customData?.author;
      if (author) {
        authors.add(author);
      }
    }
    
    return Array.from(authors);
  }

  /**
   * مساعدات التجميع الذكي
   */
  private findRelatedContent(
    notifications: SmartNotification[],
    maxGroupSize: number
  ): SmartNotification[][] {
    // خوارزمية بسيطة للعثور على المحتوى المترابط
    const groups: SmartNotification[][] = [];
    const processed = new Set<string>();
    
    for (const notification of notifications) {
      if (processed.has(notification.notificationId)) continue;
      
      const related = [notification];
      processed.add(notification.notificationId);
      
      // البحث عن إشعارات مشابهة
      for (const other of notifications) {
        if (processed.has(other.notificationId)) continue;
        if (related.length >= maxGroupSize) break;
        
        if (this.areRelated(notification, other)) {
          related.push(other);
          processed.add(other.notificationId);
        }
      }
      
      if (related.length >= 2) {
        groups.push(related);
      }
    }
    
    return groups;
  }

  private groupByContent(
    notifications: SmartNotification[],
    maxGroupSize: number
  ): SmartNotification[][] {
    const contentGroups = new Map<string, SmartNotification[]>();
    
    for (const notification of notifications) {
      const contentId = notification.contentId || 'unknown';
      if (!contentGroups.has(contentId)) {
        contentGroups.set(contentId, []);
      }
      contentGroups.get(contentId)!.push(notification);
    }
    
    const groups: SmartNotification[][] = [];
    for (const [, group] of contentGroups) {
      if (group.length >= 2) {
        const chunks = this.chunkArray(group, maxGroupSize);
        groups.push(...chunks);
      }
    }
    
    return groups;
  }

  private findSimilarContent(
    notifications: SmartNotification[],
    maxGroupSize: number
  ): SmartNotification[][] {
    // خوارزمية للعثور على محتوى مشابه
    const groups: SmartNotification[][] = [];
    const processed = new Set<string>();
    
    for (const notification of notifications) {
      if (processed.has(notification.notificationId)) continue;
      
      const similar = [notification];
      processed.add(notification.notificationId);
      
      // البحث عن محتوى مشابه
      for (const other of notifications) {
        if (processed.has(other.notificationId)) continue;
        if (similar.length >= maxGroupSize) break;
        
        if (this.areSimilar(notification, other)) {
          similar.push(other);
          processed.add(other.notificationId);
        }
      }
      
      if (similar.length >= 2) {
        groups.push(similar);
      }
    }
    
    return groups;
  }

  private areRelated(n1: SmartNotification, n2: SmartNotification): boolean {
    // التحقق من الترابط بين إشعارين
    if (n1.type !== n2.type) return false;
    
    // نفس الفئة
    const category1 = n1.metadata.customData?.category;
    const category2 = n2.metadata.customData?.category;
    if (category1 && category2 && category1 === category2) return true;
    
    // كلمات مشتركة في العنوان
    const words1 = new Set(n1.title.split(' '));
    const words2 = new Set(n2.title.split(' '));
    const commonWords = [...words1].filter(w => words2.has(w));
    
    return commonWords.length > 2;
  }

  private areSimilar(n1: SmartNotification, n2: SmartNotification): boolean {
    // التحقق من التشابه بين إشعارين
    const category1 = n1.metadata.customData?.category;
    const category2 = n2.metadata.customData?.category;
    
    if (category1 && category2 && category1 === category2) {
      // نفس الفئة، تحقق من التشابه في المحتوى
      const title1Words = new Set(n1.title.toLowerCase().split(' '));
      const title2Words = new Set(n2.title.toLowerCase().split(' '));
      
      const intersection = [...title1Words].filter(w => title2Words.has(w));
      const union = new Set([...title1Words, ...title2Words]);
      
      const similarity = intersection.length / union.size;
      return similarity > 0.3; // 30% تشابه على الأقل
    }
    
    return false;
  }

  private mergeSmallGroups(groups: NotificationGroup[]): NotificationGroup[] {
    // دمج المجموعات الصغيرة من نفس النوع
    const typeGroups = new Map<NotificationType, NotificationGroup[]>();
    const merged: NotificationGroup[] = [];
    
    // تصنيف المجموعات حسب النوع
    for (const group of groups) {
      if (group.notifications.length === 1) {
        const type = group.notifications[0].type;
        if (!typeGroups.has(type)) {
          typeGroups.set(type, []);
        }
        typeGroups.get(type)!.push(group);
      } else {
        merged.push(group); // الاحتفاظ بالمجموعات الكبيرة
      }
    }
    
    // دمج المجموعات الصغيرة
    for (const [type, smallGroups] of typeGroups) {
      if (smallGroups.length >= 2) {
        // دمج في مجموعة واحدة
        const notifications = smallGroups.flatMap(g => g.notifications);
        const mergedGroup = this.createGroup(notifications, GroupingStrategy.BY_TYPE);
        merged.push(this.createSmartSummary(mergedGroup));
      } else {
        // الاحتفاظ بالمجموعات الفردية
        merged.push(...smallGroups);
      }
    }
    
    return merged;
  }

  /**
   * حفظ المجموعات في الذاكرة المؤقتة
   */
  private cacheGroups(userId: string, groups: NotificationGroup[]): void {
    for (const group of groups) {
      this.groupCache.set(group.groupId, group);
    }
    
    // تنظيف الذاكرة المؤقتة القديمة
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [groupId, group] of this.groupCache) {
      if (group.createdAt < oneHourAgo) {
        this.groupCache.delete(groupId);
      }
    }
  }

  /**
   * الحصول على مجموعة من الذاكرة المؤقتة
   */
  getGroup(groupId: string): NotificationGroup | undefined {
    return this.groupCache.get(groupId);
  }

  /**
   * تحديث حالة مجموعة
   */
  updateGroupStatus(groupId: string, updates: Partial<NotificationGroup>): void {
    const group = this.groupCache.get(groupId);
    if (group) {
      Object.assign(group, updates);
    }
  }
}
