/**
 * نظام الإشعارات الذكية - أنواع البيانات
 * Smart Notifications System - Type Definitions
 */

export interface SmartNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  status: NotificationStatus;
  data?: any; // بيانات إضافية
  actions?: NotificationAction[];
  delivery_config: DeliveryConfig;
  personalization: PersonalizationData;
  created_at: Date;
  scheduled_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
  expires_at?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title_template: string;
  message_template: string;
  type: NotificationType;
  category: NotificationCategory;
  default_priority: NotificationPriority;
  variables: TemplateVariable[];
  conditions: TemplateCondition[];
  personalization_rules: PersonalizationRule[];
  delivery_settings: DeliverySettings;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationAction {
  id: string;
  label: string;
  action_type: ActionType;
  url?: string;
  data?: any;
  style?: ActionStyle;
}

export interface DeliveryConfig {
  channels: DeliveryChannel[];
  timing: DeliveryTiming;
  frequency_limits: FrequencyLimits;
  user_preferences: UserPreferences;
  ai_optimization: AIOptimization;
}

export interface PersonalizationData {
  user_segment: string;
  interests: string[];
  behavior_patterns: BehaviorPattern[];
  engagement_score: number;
  preferred_content: string[];
  time_preferences: TimePreferences;
  language: string;
  location?: LocationData;
}

// أنواع الإشعارات
export const NOTIFICATION_TYPES = {
  BREAKING_NEWS: 'breaking_news',
  ARTICLE_RECOMMENDATION: 'article_recommendation',
  COMMENT_RESPONSE: 'comment_response',
  WEEKLY_DIGEST: 'weekly_digest',
  TRENDING_TOPIC: 'trending_topic',
  SYSTEM_UPDATE: 'system_update',
  USER_MILESTONE: 'user_milestone',
  CONTENT_INTERACTION: 'content_interaction',
  SECURITY_ALERT: 'security_alert',
  PROMOTION: 'promotion',
  REMINDER: 'reminder',
  SOCIAL_UPDATE: 'social_update'
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// أولويات الإشعارات
export const NOTIFICATION_PRIORITIES = {
  CRITICAL: 'critical',    // إشعارات حرجة فورية
  HIGH: 'high',           // مهمة وعاجلة
  MEDIUM: 'medium',       // متوسطة الأهمية
  LOW: 'low',            // منخفضة الأهمية
  BULK: 'bulk'           // إشعارات جماعية
} as const;

export type NotificationPriority = typeof NOTIFICATION_PRIORITIES[keyof typeof NOTIFICATION_PRIORITIES];

// فئات الإشعارات
export const NOTIFICATION_CATEGORIES = {
  NEWS: 'news',
  SOCIAL: 'social',
  SYSTEM: 'system',
  MARKETING: 'marketing',
  SECURITY: 'security',
  ENGAGEMENT: 'engagement',
  ANALYTICS: 'analytics',
  CONTENT: 'content'
} as const;

export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[keyof typeof NOTIFICATION_CATEGORIES];

// حالات الإشعارات
export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  DELIVERED: 'delivered',
  READ: 'read',
  DISMISSED: 'dismissed',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const;

export type NotificationStatus = typeof NOTIFICATION_STATUS[keyof typeof NOTIFICATION_STATUS];

// قنوات التوصيل
export const DELIVERY_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WHATSAPP: 'whatsapp',
  TELEGRAM: 'telegram',
  SLACK: 'slack',
  WEBHOOK: 'webhook'
} as const;

export type DeliveryChannel = typeof DELIVERY_CHANNELS[keyof typeof DELIVERY_CHANNELS];

// أنواع الإجراءات
export const ACTION_TYPES = {
  NAVIGATE: 'navigate',
  EXTERNAL_LINK: 'external_link',
  API_CALL: 'api_call',
  DISMISS: 'dismiss',
  SHARE: 'share',
  BOOKMARK: 'bookmark',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  CUSTOM: 'custom'
} as const;

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];

// أنماط الإجراءات
export const ACTION_STYLES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DESTRUCTIVE: 'destructive',
  GHOST: 'ghost'
} as const;

export type ActionStyle = typeof ACTION_STYLES[keyof typeof ACTION_STYLES];

// متغيرات القوالب
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  default_value?: any;
  validation?: VariableValidation;
}

export interface VariableValidation {
  min_length?: number;
  max_length?: number;
  pattern?: string;
  allowed_values?: any[];
}

// شروط القوالب
export interface TemplateCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logic?: 'and' | 'or';
}

// قواعد التخصيص
export interface PersonalizationRule {
  id: string;
  name: string;
  condition: TemplateCondition[];
  modifications: PersonalizationModification[];
  priority: number;
  active: boolean;
}

export interface PersonalizationModification {
  field: 'title' | 'message' | 'priority' | 'delivery_time' | 'channels';
  action: 'replace' | 'append' | 'prepend' | 'modify';
  value: any;
}

// إعدادات التوصيل
export interface DeliverySettings {
  default_channels: DeliveryChannel[];
  priority_channel_mapping: { [key in NotificationPriority]: DeliveryChannel[] };
  retry_policy: RetryPolicy;
  rate_limits: RateLimits;
  quiet_hours: QuietHours;
}

// توقيت التوصيل
export interface DeliveryTiming {
  send_immediately: boolean;
  optimal_time: boolean; // استخدام AI لتحديد أفضل وقت
  scheduled_time?: Date;
  time_zone?: string;
  respect_quiet_hours: boolean;
  batch_delivery: boolean;
  batch_size?: number;
  batch_interval?: number; // بالدقائق
}

// حدود التكرار
export interface FrequencyLimits {
  max_per_hour: number;
  max_per_day: number;
  max_per_week: number;
  priority_override: boolean; // تجاهل الحدود للإشعارات عالية الأولوية
  category_limits: { [key in NotificationCategory]?: number };
}

// تفضيلات المستخدم
export interface UserPreferences {
  enabled_channels: DeliveryChannel[];
  disabled_categories: NotificationCategory[];
  quiet_hours: QuietHours;
  frequency_preference: 'immediate' | 'batched' | 'digest';
  language: string;
  time_zone: string;
}

// تحسين الذكاء الاصطناعي
export interface AIOptimization {
  enabled: boolean;
  optimal_timing: boolean;
  content_optimization: boolean;
  channel_selection: boolean;
  frequency_optimization: boolean;
  personalization_level: 'basic' | 'advanced' | 'ml_powered';
}

// أنماط السلوك
export interface BehaviorPattern {
  pattern_type: 'reading_time' | 'interaction_frequency' | 'content_preference' | 'engagement_time';
  pattern_data: any;
  confidence: number;
  last_updated: Date;
}

// تفضيلات الوقت
export interface TimePreferences {
  preferred_hours: number[]; // ساعات اليوم المفضلة (0-23)
  preferred_days: number[]; // أيام الأسبوع المفضلة (0-6)
  time_zone: string;
  last_active_pattern: ActivePattern[];
}

export interface ActivePattern {
  hour: number;
  activity_score: number;
  engagement_rate: number;
}

// بيانات الموقع
export interface LocationData {
  country: string;
  city?: string;
  time_zone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// ساعات الهدوء
export interface QuietHours {
  enabled: boolean;
  start_time: string; // "22:00"
  end_time: string;   // "08:00"
  time_zone: string;
  override_critical: boolean; // السماح بالإشعارات الحرجة
}

// سياسة إعادة المحاولة
export interface RetryPolicy {
  enabled: boolean;
  max_attempts: number;
  retry_intervals: number[]; // بالدقائق
  exponential_backoff: boolean;
  failure_channels: DeliveryChannel[]; // قنوات بديلة عند الفشل
}

// حدود المعدل
export interface RateLimits {
  global_limit: number; // إشعارات في الثانية
  per_user_limit: number;
  per_channel_limit: { [key in DeliveryChannel]?: number };
  burst_limit: number;
}

// إحصائيات الإشعارات
export interface NotificationStatistics {
  total_sent: number;
  total_delivered: number;
  total_read: number;
  total_clicked: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  channel_performance: ChannelPerformance[];
  category_performance: CategoryPerformance[];
  time_analysis: TimeAnalysis;
  user_engagement: UserEngagement;
}

export interface ChannelPerformance {
  channel: DeliveryChannel;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  delivery_rate: number;
  engagement_rate: number;
  average_delivery_time: number;
}

export interface CategoryPerformance {
  category: NotificationCategory;
  sent: number;
  engagement_rate: number;
  unsubscribe_rate: number;
  user_satisfaction: number;
}

export interface TimeAnalysis {
  best_sending_hours: number[];
  worst_sending_hours: number[];
  hourly_engagement: { [hour: number]: number };
  daily_engagement: { [day: number]: number };
  seasonal_patterns: SeasonalPattern[];
}

export interface SeasonalPattern {
  period: 'weekly' | 'monthly' | 'yearly';
  pattern_data: any;
  confidence: number;
}

export interface UserEngagement {
  active_users: number;
  engaged_users: number;
  churned_users: number;
  average_engagement_score: number;
  top_engaging_content: string[];
}

// تكوين الحملة
export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  template_id: string;
  target_audience: AudienceTarget;
  scheduling: CampaignScheduling;
  personalization: CampaignPersonalization;
  tracking: CampaignTracking;
  status: CampaignStatus;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

export interface AudienceTarget {
  user_segments: string[];
  filters: AudienceFilter[];
  exclude_filters: AudienceFilter[];
  estimated_reach: number;
  max_recipients?: number;
}

export interface AudienceFilter {
  field: string;
  operator: string;
  value: any;
  logic?: 'and' | 'or';
}

export interface CampaignScheduling {
  type: 'immediate' | 'scheduled' | 'recurring';
  start_time?: Date;
  end_time?: Date;
  recurrence?: RecurrencePattern;
  time_zone: string;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  days_of_week?: number[];
  day_of_month?: number;
  end_date?: Date;
  max_occurrences?: number;
}

export interface CampaignPersonalization {
  enabled: boolean;
  personalization_level: 'basic' | 'advanced' | 'ai_powered';
  content_variations: ContentVariation[];
  audience_segments: PersonalizationSegment[];
}

export interface ContentVariation {
  id: string;
  name: string;
  title_template: string;
  message_template: string;
  target_conditions: TemplateCondition[];
  weight: number; // للتوزيع العشوائي
}

export interface PersonalizationSegment {
  segment_id: string;
  personalization_rules: PersonalizationRule[];
  content_variation_id?: string;
}

export interface CampaignTracking {
  track_delivery: boolean;
  track_opens: boolean;
  track_clicks: boolean;
  track_conversions: boolean;
  conversion_goals: ConversionGoal[];
  attribution_window: number; // بالساعات
}

export interface ConversionGoal {
  id: string;
  name: string;
  type: 'page_visit' | 'action_completion' | 'time_spent' | 'custom';
  target_value?: any;
  weight: number;
}

export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed'
} as const;

export type CampaignStatus = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS];

// إعدادات النظام
export interface NotificationSystemConfig {
  global_settings: GlobalSettings;
  channel_configs: { [key in DeliveryChannel]?: ChannelConfig };
  ai_settings: AISettings;
  security_settings: SecuritySettings;
  monitoring: MonitoringConfig;
}

export interface GlobalSettings {
  enabled: boolean;
  default_language: string;
  default_time_zone: string;
  max_notification_age: number; // بالأيام
  cleanup_interval: number; // بالساعات
  rate_limiting: GlobalRateLimiting;
}

export interface ChannelConfig {
  enabled: boolean;
  provider_config: any;
  rate_limits: RateLimits;
  retry_policy: RetryPolicy;
  template_config: TemplateConfig;
}

export interface TemplateConfig {
  max_title_length: number;
  max_message_length: number;
  allowed_html_tags: string[];
  emoji_support: boolean;
  rtl_support: boolean;
}

export interface AISettings {
  enabled: boolean;
  optimal_timing_model: string;
  personalization_model: string;
  content_optimization: boolean;
  predictive_analytics: boolean;
  auto_optimization: boolean;
  learning_rate: number;
}

export interface SecuritySettings {
  encryption_enabled: boolean;
  pii_protection: boolean;
  audit_logging: boolean;
  access_controls: AccessControl[];
  data_retention: DataRetention;
}

export interface AccessControl {
  role: string;
  permissions: Permission[];
  restrictions: Restriction[];
}

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'send';
  resource: 'notification' | 'template' | 'campaign' | 'statistics';
  conditions?: any;
}

export interface Restriction {
  type: 'rate_limit' | 'time_window' | 'ip_filter' | 'geo_filter';
  config: any;
}

export interface DataRetention {
  notification_data: number; // بالأيام
  analytics_data: number;
  user_preferences: number;
  logs: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics_collection: boolean;
  alerting: AlertingConfig;
  performance_monitoring: boolean;
  error_tracking: boolean;
}

export interface AlertingConfig {
  enabled: boolean;
  thresholds: AlertThreshold[];
  notification_channels: string[];
  escalation_rules: EscalationRule[];
}

export interface AlertThreshold {
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals';
  value: number;
  duration: number; // بالدقائق
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface EscalationRule {
  severity: string;
  wait_time: number; // بالدقائق
  escalate_to: string[];
  max_escalations: number;
}

export interface GlobalRateLimiting {
  enabled: boolean;
  requests_per_second: number;
  burst_capacity: number;
  queue_size: number;
  priority_queuing: boolean;
}
