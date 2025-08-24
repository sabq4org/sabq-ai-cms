/**
 * تعريفات الأنواع لنظام الإشعارات الذكية المحسن
 * Enhanced Smart Notifications System Types
 */

// أنواع الإشعارات
export enum NotificationType {
  SOCIAL_INTERACTION = 'social_interaction',    // التفاعل الاجتماعي
  CONTENT_RECOMMENDATION = 'content_recommendation', // توصية المحتوى
  AUTHOR_UPDATE = 'author_update',              // تحديث الكاتب
  SIMILAR_CONTENT = 'similar_content',          // المحتوى المشابه
  BREAKING_NEWS = 'breaking_news',              // الأخبار العاجلة
  SYSTEM_ANNOUNCEMENT = 'system_announcement',  // إعلانات النظام
  REMINDER = 'reminder',                        // التذكيرات
  ACHIEVEMENT = 'achievement'                   // الإنجازات
}

// قنوات التسليم
export enum DeliveryChannel {
  WEB_PUSH = 'web_push',      // إشعارات المتصفح
  MOBILE_PUSH = 'mobile_push', // إشعارات الموبايل
  EMAIL = 'email',            // البريد الإلكتروني
  SMS = 'sms',                // الرسائل النصية
  IN_APP = 'in_app',          // داخل التطبيق
  WEBSOCKET = 'websocket'     // الوقت الفعلي
}

// أولويات الإشعارات
export enum NotificationPriority {
  CRITICAL = 'critical',  // حرجة
  HIGH = 'high',         // عالية
  MEDIUM = 'medium',     // متوسطة
  LOW = 'low'           // منخفضة
}

// حالات الإشعار
export enum NotificationStatus {
  PENDING = 'pending',       // في الانتظار
  SCHEDULED = 'scheduled',   // مجدولة
  SENT = 'sent',            // مرسلة
  DELIVERED = 'delivered',   // وصلت
  READ = 'read',            // مقروءة
  FAILED = 'failed',        // فشلت
  CANCELLED = 'cancelled'   // ملغاة
}

// ملف المستخدم الشامل
export interface UserProfile {
  userId: string;
  interests: Record<string, number>;         // الاهتمامات مع الأوزان
  readingPatterns: ReadingPattern;          // أنماط القراءة
  engagementHistory: EngagementEvent[];     // تاريخ التفاعل
  temporalPreferences: TemporalPreference;  // التفضيلات الزمنية
  devicePreferences: DevicePreference;      // تفضيلات الأجهزة
  sentimentPreferences: Record<string, number>; // تفضيلات المشاعر
  notificationPreferences: NotificationPreferences; // تفضيلات الإشعارات
  lastUpdated: Date;
}

// أنماط القراءة
export interface ReadingPattern {
  hourlyDistribution: number[];     // توزيع الساعات (24 ساعة)
  dailyDistribution: number[];      // توزيع الأيام (7 أيام)
  peakHours: number[];              // ساعات الذروة
  averageSessionDuration: number;   // متوسط مدة الجلسة
  averageReadingSpeed: number;      // سرعة القراءة
  averageCompletionRate: number;    // معدل الإكمال
  preferredContentLength: 'short' | 'medium' | 'long';
  readingConsistency: number;       // ثبات القراءة
}

// حدث التفاعل
export interface EngagementEvent {
  eventId: string;
  eventType: 'click' | 'read' | 'like' | 'share' | 'comment' | 'bookmark';
  contentId: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

// التفضيلات الزمنية
export interface TemporalPreference {
  preferredHours: number[];          // الساعات المفضلة
  quietHours: { start: number; end: number }[]; // ساعات الهدوء
  weekendPreferences: boolean;       // تفضيلات نهاية الأسبوع
  timezone: string;                  // المنطقة الزمنية
}

// تفضيلات الأجهزة
export interface DevicePreference {
  preferredDevices: string[];
  channelPreferences: Record<DeliveryChannel, number>;
  platformSpecificSettings: Record<string, any>;
}

// تفضيلات الإشعارات
export interface NotificationPreferences {
  enabled: boolean;
  frequency: 'high' | 'medium' | 'low' | 'minimal';
  maxDaily: number;
  enabledTypes: NotificationType[];
  enabledChannels: DeliveryChannel[];
  grouping: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// عنصر المحتوى
export interface ContentItem {
  contentId: string;
  title: string;
  content: string;
  category: string;
  entities: string[];               // الكيانات المذكورة
  sentimentScore: number;          // درجة المشاعر
  qualityScore: number;            // درجة الجودة
  publishTime: Date;
  author: string;
  tags: string[];
  engagementMetrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    completionRate: number;
    averageTimeSpent: number;
    urgencyScore: number;
  };
}

// الإشعار الذكي
export interface SmartNotification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  contentId?: string;
  scheduledTime?: Date;
  sentTime?: Date;
  deliveredTime?: Date;
  readTime?: Date;
  channels: DeliveryChannel[];
  metadata: NotificationMetadata;
  personalizationData?: PersonalizationData;
  aiScores: AIScores;
  createdAt: Date;
  updatedAt: Date;
}

// بيانات ما وراء الإشعار
export interface NotificationMetadata {
  campaign?: string;
  templateId?: string;
  groupId?: string;
  dedupKey?: string;
  ttl?: number;                    // Time to live
  retryCount?: number;
  failureReason?: string;
  customData?: Record<string, any>;
}

// بيانات التخصيص
export interface PersonalizationData {
  userInterests: string[];
  recommendationScore: number;
  timingScore: number;
  channelScore: Record<DeliveryChannel, number>;
  customization: {
    titleVariables?: Record<string, string>;
    messageVariables?: Record<string, string>;
    ctaText?: string;
    ctaUrl?: string;
  };
}

// نتائج الذكاء الاصطناعي
export interface AIScores {
  engagementScore: number;         // درجة التفاعل المتوقعة
  relevanceScore: number;          // درجة الصلة
  timingScore: number;             // درجة التوقيت
  qualityScore: number;            // درجة الجودة
  noveltyScore: number;            // درجة الجدة
  sentimentAlignment: number;      // توافق المشاعر
  socialSignals: number;           // الإشارات الاجتماعية
}

// قالب الإشعار
export interface NotificationTemplate {
  templateId: string;
  name: string;
  type: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  variables: string[];
  channels: DeliveryChannel[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// حملة الإشعارات
export interface NotificationCampaign {
  campaignId: string;
  name: string;
  description: string;
  targetAudience: AudienceSegment;
  templates: NotificationTemplate[];
  schedule: CampaignSchedule;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: CampaignMetrics;
  createdAt: Date;
  updatedAt: Date;
}

// شريحة الجمهور
export interface AudienceSegment {
  segmentId: string;
  name: string;
  criteria: {
    interests?: string[];
    behaviors?: string[];
    demographics?: Record<string, any>;
    customRules?: any[];
  };
  estimatedSize: number;
}

// جدول الحملة
export interface CampaignSchedule {
  startDate: Date;
  endDate?: Date;
  timezone: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  deliveryWindows?: { start: string; end: string }[];
}

// مقاييس الحملة
export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  failed: number;
  revenue?: number;
}

// إحصائيات الإشعارات
export interface NotificationStatistics {
  totalSent: number;
  totalDelivered: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  byType: Record<NotificationType, TypeStatistics>;
  byChannel: Record<DeliveryChannel, ChannelStatistics>;
  hourlyDistribution: number[];
  responseTime: {
    average: number;
    median: number;
    p95: number;
    p99: number;
  };
}

// إحصائيات النوع
export interface TypeStatistics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  performance: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
}

// إحصائيات القناة
export interface ChannelStatistics {
  sent: number;
  delivered: number;
  failed: number;
  performance: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    avgDeliveryTime: number;
  };
}

// إعدادات التسليم
export interface DeliveryConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  batchSize: number;
  rateLimit: {
    perSecond: number;
    perMinute: number;
    perHour: number;
  };
  channelConfig: Record<DeliveryChannel, ChannelConfig>;
}

// إعدادات القناة
export interface ChannelConfig {
  enabled: boolean;
  priority: number;
  provider: string;
  credentials: Record<string, any>;
  options: Record<string, any>;
}

// نتيجة التسليم
export interface DeliveryResult {
  notificationId: string;
  channel: DeliveryChannel;
  status: 'success' | 'failed' | 'pending';
  deliveredAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

// طلب تتبع السلوك
export interface BehaviorTrackingRequest {
  userId: string;
  sessionId: string;
  eventType: string;
  eventData: {
    contentId?: string;
    action?: string;
    duration?: number;
    scrollDepth?: number;
    metadata?: Record<string, any>;
  };
  timestamp: Date;
  deviceInfo: {
    type: string;
    os: string;
    browser: string;
    screenSize: string;
  };
}

// استجابة تحليل السلوك
export interface BehaviorAnalysisResponse {
  userId: string;
  insights: {
    interests: string[];
    engagementLevel: 'high' | 'medium' | 'low';
    preferredContentTypes: string[];
    optimalNotificationTimes: string[];
    riskOfChurn: number;
  };
  recommendations: {
    contentIds: string[];
    notificationStrategies: string[];
  };
}
