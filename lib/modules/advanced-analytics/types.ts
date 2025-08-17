/**
 * نظام التحليلات المتقدمة - أنواع البيانات
 * Advanced Analytics System - Type Definitions
 */

export interface AnalyticsQuery {
  metric: AnalyticsMetric;
  dimensions?: AnalyticsDimension[];
  filters?: AnalyticsFilter[];
  time_range?: TimeRange;
  aggregation?: AggregationType;
  granularity?: TimeGranularity;
  options?: AnalyticsOptions;
}

export interface AnalyticsResponse {
  data: AnalyticsDataPoint[];
  metadata: AnalyticsMetadata;
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
  computed_at: Date;
  cache_info: CacheInfo;
}

export interface AnalyticsDataPoint {
  dimensions: { [key: string]: any };
  metrics: { [key: string]: number };
  timestamp?: Date;
  confidence?: number;
  anomaly_score?: number;
}

export interface AnalyticsMetadata {
  total_records: number;
  data_freshness: number; // بالدقائق
  computation_time: number; // بالميلي ثانية
  data_quality_score: number;
  sampling_rate?: number;
  aggregation_method: string;
  time_zone: string;
}

export interface AnalyticsInsight {
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  impact_score: number;
  actionable: boolean;
  related_metrics: string[];
  supporting_data: any;
  generated_at: Date;
}

export interface AnalyticsRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  expected_impact: ExpectedImpact;
  implementation_effort: ImplementationEffort;
  suggested_actions: SuggestedAction[];
  success_metrics: string[];
  deadline?: Date;
}

export interface CacheInfo {
  cached: boolean;
  cache_key?: string;
  cache_ttl?: number;
  cache_created_at?: Date;
}

// مقاييس التحليلات
export const ANALYTICS_METRICS = {
  // مقاييس المحتوى
  CONTENT_VIEWS: 'content_views',
  UNIQUE_VISITORS: 'unique_visitors',
  PAGE_VIEWS: 'page_views',
  SESSION_DURATION: 'session_duration',
  BOUNCE_RATE: 'bounce_rate',
  TIME_ON_PAGE: 'time_on_page',
  SCROLL_DEPTH: 'scroll_depth',
  READING_COMPLETION: 'reading_completion',
  
  // مقاييس التفاعل
  LIKES: 'likes',
  SHARES: 'shares',
  COMMENTS: 'comments',
  BOOKMARKS: 'bookmarks',
  DOWNLOADS: 'downloads',
  ENGAGEMENT_RATE: 'engagement_rate',
  VIRAL_COEFFICIENT: 'viral_coefficient',
  
  // مقاييس المستخدمين
  ACTIVE_USERS: 'active_users',
  NEW_USERS: 'new_users',
  RETURNING_USERS: 'returning_users',
  USER_RETENTION: 'user_retention',
  USER_LIFETIME_VALUE: 'user_lifetime_value',
  CHURN_RATE: 'churn_rate',
  
  // مقاييس الأداء
  LOAD_TIME: 'load_time',
  ERROR_RATE: 'error_rate',
  CONVERSION_RATE: 'conversion_rate',
  REVENUE: 'revenue',
  
  // مقاييس البحث
  SEARCH_QUERIES: 'search_queries',
  SEARCH_SUCCESS_RATE: 'search_success_rate',
  SEARCH_ABANDONMENT: 'search_abandonment',
  
  // مقاييس الإشعارات
  NOTIFICATION_SENT: 'notification_sent',
  NOTIFICATION_OPENED: 'notification_opened',
  NOTIFICATION_CLICKED: 'notification_clicked',
  
  // مقاييس التوصيات
  RECOMMENDATIONS_SHOWN: 'recommendations_shown',
  RECOMMENDATIONS_CLICKED: 'recommendations_clicked',
  RECOMMENDATION_ACCURACY: 'recommendation_accuracy'
} as const;

export type AnalyticsMetric = typeof ANALYTICS_METRICS[keyof typeof ANALYTICS_METRICS];

// أبعاد التحليلات
export const ANALYTICS_DIMENSIONS = {
  TIME: 'time',
  DATE: 'date',
  HOUR: 'hour',
  DAY_OF_WEEK: 'day_of_week',
  
  CONTENT_ID: 'content_id',
  CONTENT_TYPE: 'content_type',
  CONTENT_CATEGORY: 'content_category',
  CONTENT_AUTHOR: 'content_author',
  CONTENT_TAGS: 'content_tags',
  
  USER_ID: 'user_id',
  USER_SEGMENT: 'user_segment',
  USER_TYPE: 'user_type',
  USER_LOCATION: 'user_location',
  
  DEVICE_TYPE: 'device_type',
  BROWSER: 'browser',
  OS: 'os',
  
  TRAFFIC_SOURCE: 'traffic_source',
  REFERRER: 'referrer',
  CAMPAIGN: 'campaign',
  
  LANGUAGE: 'language',
  COUNTRY: 'country',
  CITY: 'city'
} as const;

export type AnalyticsDimension = typeof ANALYTICS_DIMENSIONS[keyof typeof ANALYTICS_DIMENSIONS];

// أنواع التجميع
export const AGGREGATION_TYPES = {
  SUM: 'sum',
  COUNT: 'count',
  AVERAGE: 'average',
  MEDIAN: 'median',
  MIN: 'min',
  MAX: 'max',
  DISTINCT_COUNT: 'distinct_count',
  PERCENTILE: 'percentile',
  STANDARD_DEVIATION: 'standard_deviation'
} as const;

export type AggregationType = typeof AGGREGATION_TYPES[keyof typeof AGGREGATION_TYPES];

// دقة الوقت
export const TIME_GRANULARITIES = {
  MINUTE: 'minute',
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
} as const;

export type TimeGranularity = typeof TIME_GRANULARITIES[keyof typeof TIME_GRANULARITIES];

// مرشحات التحليلات
export interface AnalyticsFilter {
  dimension: AnalyticsDimension;
  operator: FilterOperator;
  value: any;
  logic?: 'AND' | 'OR';
}

export const FILTER_OPERATORS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  GREATER_EQUAL: 'greater_equal',
  LESS_EQUAL: 'less_equal',
  IN: 'in',
  NOT_IN: 'not_in',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  BETWEEN: 'between',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null'
} as const;

export type FilterOperator = typeof FILTER_OPERATORS[keyof typeof FILTER_OPERATORS];

// نطاق زمني
export interface TimeRange {
  start_date?: Date;
  end_date?: Date;
  relative_range?: RelativeTimeRange;
}

export interface RelativeTimeRange {
  unit: TimeUnit;
  amount: number;
  direction: 'past' | 'future';
}

export const TIME_UNITS = {
  MINUTE: 'minute',
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
} as const;

export type TimeUnit = typeof TIME_UNITS[keyof typeof TIME_UNITS];

// خيارات التحليلات
export interface AnalyticsOptions {
  include_comparisons?: boolean;
  comparison_period?: RelativeTimeRange;
  include_predictions?: boolean;
  prediction_horizon?: number; // بالأيام
  include_anomalies?: boolean;
  anomaly_sensitivity?: number; // 0-1
  include_insights?: boolean;
  insight_types?: InsightType[];
  include_recommendations?: boolean;
  max_recommendations?: number;
  segment_analysis?: boolean;
  cohort_analysis?: boolean;
  funnel_analysis?: boolean;
  attribution_analysis?: boolean;
}

// أنواع الرؤى
export const INSIGHT_TYPES = {
  TREND: 'trend',
  ANOMALY: 'anomaly',
  CORRELATION: 'correlation',
  SEASONALITY: 'seasonality',
  THRESHOLD: 'threshold',
  PERFORMANCE: 'performance',
  USER_BEHAVIOR: 'user_behavior',
  CONTENT_PERFORMANCE: 'content_performance',
  OPPORTUNITY: 'opportunity',
  RISK: 'risk',
  PREDICTION: 'prediction'
} as const;

export type InsightType = typeof INSIGHT_TYPES[keyof typeof INSIGHT_TYPES];

// أنواع التوصيات
export const RECOMMENDATION_TYPES = {
  OPTIMIZATION: 'optimization',
  CONTENT_STRATEGY: 'content_strategy',
  USER_ENGAGEMENT: 'user_engagement',
  PERFORMANCE_IMPROVEMENT: 'performance_improvement',
  RESOURCE_ALLOCATION: 'resource_allocation',
  FEATURE_ENHANCEMENT: 'feature_enhancement',
  MARKETING: 'marketing',
  MONETIZATION: 'monetization'
} as const;

export type RecommendationType = typeof RECOMMENDATION_TYPES[keyof typeof RECOMMENDATION_TYPES];

// أولوية التوصيات
export const RECOMMENDATION_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

export type RecommendationPriority = typeof RECOMMENDATION_PRIORITIES[keyof typeof RECOMMENDATION_PRIORITIES];

// التأثير المتوقع
export interface ExpectedImpact {
  metric: AnalyticsMetric;
  impact_type: 'increase' | 'decrease' | 'improve';
  estimated_change: number; // النسبة المئوية أو القيمة المطلقة
  confidence: number; // 0-1
  time_to_impact: number; // بالأيام
}

// جهد التنفيذ
export const IMPLEMENTATION_EFFORTS = {
  LOW: 'low',      // أقل من أسبوع
  MEDIUM: 'medium', // 1-4 أسابيع
  HIGH: 'high',    // 1-3 أشهر
  VERY_HIGH: 'very_high' // أكثر من 3 أشهر
} as const;

export type ImplementationEffort = typeof IMPLEMENTATION_EFFORTS[keyof typeof IMPLEMENTATION_EFFORTS];

// الإجراءات المقترحة
export interface SuggestedAction {
  title: string;
  description: string;
  priority: number;
  estimated_effort: ImplementationEffort;
  required_resources: string[];
  dependencies: string[];
  success_criteria: string[];
}

// تحليل المجموعات (Cohort Analysis)
export interface CohortAnalysis {
  cohort_definition: CohortDefinition;
  cohort_data: CohortData[];
  insights: CohortInsight[];
  retention_analysis: RetentionAnalysis;
}

export interface CohortDefinition {
  type: CohortType;
  period: TimeGranularity;
  criteria: CohortCriteria;
}

export interface CohortCriteria {
  event: string;
  properties?: { [key: string]: any };
  time_range?: TimeRange;
}

export interface CohortData {
  cohort_id: string;
  cohort_name: string;
  cohort_size: number;
  periods: CohortPeriodData[];
}

export interface CohortPeriodData {
  period: number;
  active_users: number;
  retention_rate: number;
  metric_value: number;
}

export interface CohortInsight {
  cohort_id: string;
  insight_type: string;
  description: string;
  significance: number;
}

export interface RetentionAnalysis {
  overall_retention: RetentionMetrics;
  cohort_retention: CohortRetentionData[];
  retention_trends: RetentionTrend[];
}

export interface RetentionMetrics {
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
  average_retention: number;
}

export interface CohortRetentionData {
  cohort_id: string;
  retention_curve: number[];
  best_retention_period: number;
  worst_retention_period: number;
}

export interface RetentionTrend {
  period: string;
  trend: 'improving' | 'stable' | 'declining';
  change_rate: number;
}

export const COHORT_TYPES = {
  ACQUISITION: 'acquisition',
  BEHAVIORAL: 'behavioral',
  REVENUE: 'revenue',
  ENGAGEMENT: 'engagement'
} as const;

export type CohortType = typeof COHORT_TYPES[keyof typeof COHORT_TYPES];

// تحليل القمع (Funnel Analysis)
export interface FunnelAnalysis {
  funnel_definition: FunnelDefinition;
  funnel_data: FunnelStepData[];
  conversion_analysis: ConversionAnalysis;
  drop_off_analysis: DropOffAnalysis;
}

export interface FunnelDefinition {
  name: string;
  steps: FunnelStep[];
  time_window: number; // بالأيام
  filters?: AnalyticsFilter[];
}

export interface FunnelStep {
  step_number: number;
  step_name: string;
  event: string;
  properties?: { [key: string]: any };
}

export interface FunnelStepData {
  step_number: number;
  step_name: string;
  users_count: number;
  conversion_rate: number;
  drop_off_rate: number;
  average_time_to_convert: number;
}

export interface ConversionAnalysis {
  overall_conversion_rate: number;
  step_conversion_rates: number[];
  best_converting_segment: string;
  worst_converting_segment: string;
  conversion_trends: ConversionTrend[];
}

export interface ConversionTrend {
  period: string;
  conversion_rate: number;
  change_from_previous: number;
}

export interface DropOffAnalysis {
  highest_drop_off_step: number;
  drop_off_reasons: DropOffReason[];
  improvement_opportunities: string[];
}

export interface DropOffReason {
  step: number;
  reason: string;
  impact_score: number;
  users_affected: number;
}

// تحليل الإسناد (Attribution Analysis)
export interface AttributionAnalysis {
  attribution_model: AttributionModel;
  touchpoint_analysis: TouchpointAnalysis[];
  customer_journey: CustomerJourney[];
  channel_performance: ChannelPerformance[];
}

export interface TouchpointAnalysis {
  touchpoint: string;
  position: TouchpointPosition;
  influence_score: number;
  conversion_contribution: number;
  frequency: number;
}

export interface CustomerJourney {
  journey_id: string;
  touchpoints: JourneyTouchpoint[];
  conversion_value: number;
  journey_duration: number;
  success: boolean;
}

export interface JourneyTouchpoint {
  touchpoint: string;
  timestamp: Date;
  attribution_weight: number;
  channel: string;
  content_id?: string;
}

export interface ChannelPerformance {
  channel: string;
  first_touch_conversions: number;
  last_touch_conversions: number;
  assisted_conversions: number;
  total_attribution_value: number;
  roas: number; // Return on Ad Spend
}

export const ATTRIBUTION_MODELS = {
  FIRST_TOUCH: 'first_touch',
  LAST_TOUCH: 'last_touch',
  LINEAR: 'linear',
  TIME_DECAY: 'time_decay',
  POSITION_BASED: 'position_based',
  DATA_DRIVEN: 'data_driven'
} as const;

export type AttributionModel = typeof ATTRIBUTION_MODELS[keyof typeof ATTRIBUTION_MODELS];

export const TOUCHPOINT_POSITIONS = {
  FIRST: 'first',
  MIDDLE: 'middle',
  LAST: 'last',
  ONLY: 'only'
} as const;

export type TouchpointPosition = typeof TOUCHPOINT_POSITIONS[keyof typeof TOUCHPOINT_POSITIONS];

// التنبؤات والتوقعات
export interface PredictiveAnalysis {
  prediction_model: PredictionModel;
  forecasts: Forecast[];
  confidence_intervals: ConfidenceInterval[];
  scenario_analysis: ScenarioAnalysis[];
}

export interface PredictionModel {
  model_type: ModelType;
  model_name: string;
  accuracy_score: number;
  training_data_size: number;
  last_trained: Date;
  features: ModelFeature[];
}

export interface ModelFeature {
  name: string;
  importance: number;
  data_type: 'numerical' | 'categorical' | 'temporal';
  correlation: number;
}

export interface Forecast {
  metric: AnalyticsMetric;
  time_horizon: number; // بالأيام
  predicted_values: PredictedValue[];
  accuracy_metrics: AccuracyMetrics;
}

export interface PredictedValue {
  date: Date;
  predicted_value: number;
  confidence_score: number;
  prediction_interval: [number, number];
}

export interface AccuracyMetrics {
  mae: number; // Mean Absolute Error
  mse: number; // Mean Squared Error
  rmse: number; // Root Mean Squared Error
  mape: number; // Mean Absolute Percentage Error
  r_squared: number;
}

export interface ConfidenceInterval {
  metric: AnalyticsMetric;
  confidence_level: number; // 0.95 for 95%
  lower_bound: number;
  upper_bound: number;
  margin_of_error: number;
}

export interface ScenarioAnalysis {
  scenario_name: string;
  scenario_description: string;
  input_changes: ScenarioInput[];
  predicted_impact: ScenarioImpact[];
  probability: number;
}

export interface ScenarioInput {
  variable: string;
  change_type: 'absolute' | 'percentage';
  change_value: number;
}

export interface ScenarioImpact {
  metric: AnalyticsMetric;
  expected_change: number;
  confidence: number;
}

export const MODEL_TYPES = {
  LINEAR_REGRESSION: 'linear_regression',
  POLYNOMIAL_REGRESSION: 'polynomial_regression',
  ARIMA: 'arima',
  LSTM: 'lstm',
  PROPHET: 'prophet',
  ENSEMBLE: 'ensemble',
  RANDOM_FOREST: 'random_forest',
  GRADIENT_BOOSTING: 'gradient_boosting'
} as const;

export type ModelType = typeof MODEL_TYPES[keyof typeof MODEL_TYPES];

// اكتشاف الشذوذ
export interface AnomalyDetection {
  detection_method: AnomalyDetectionMethod;
  anomalies: DetectedAnomaly[];
  normal_patterns: NormalPattern[];
  alerts: AnomalyAlert[];
}

export interface DetectedAnomaly {
  metric: AnalyticsMetric;
  timestamp: Date;
  actual_value: number;
  expected_value: number;
  anomaly_score: number;
  severity: AnomalySeverity;
  possible_causes: string[];
  impact_assessment: ImpactAssessment;
}

export interface NormalPattern {
  metric: AnalyticsMetric;
  pattern_type: PatternType;
  pattern_description: string;
  confidence: number;
  historical_data: HistoricalDataPoint[];
}

export interface HistoricalDataPoint {
  timestamp: Date;
  value: number;
  is_normal: boolean;
}

export interface AnomalyAlert {
  alert_id: string;
  anomaly_id: string;
  alert_level: AlertLevel;
  message: string;
  suggested_actions: string[];
  auto_resolved: boolean;
  created_at: Date;
  resolved_at?: Date;
}

export interface ImpactAssessment {
  business_impact: BusinessImpact;
  user_impact: UserImpact;
  system_impact: SystemImpact;
  financial_impact?: FinancialImpact;
}

export interface BusinessImpact {
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_areas: string[];
  estimated_duration: number; // بالساعات
}

export interface UserImpact {
  affected_user_count: number;
  user_segments_affected: string[];
  experience_degradation: 'minimal' | 'moderate' | 'severe';
}

export interface SystemImpact {
  affected_components: string[];
  performance_degradation: number; // نسبة مئوية
  availability_impact: boolean;
}

export interface FinancialImpact {
  revenue_impact: number;
  cost_impact: number;
  estimated_loss: number;
  impact_duration: number; // بالساعات
}

export const ANOMALY_DETECTION_METHODS = {
  STATISTICAL: 'statistical',
  MACHINE_LEARNING: 'machine_learning',
  ISOLATION_FOREST: 'isolation_forest',
  CLUSTERING: 'clustering',
  TIME_SERIES: 'time_series',
  ENSEMBLE: 'ensemble'
} as const;

export type AnomalyDetectionMethod = typeof ANOMALY_DETECTION_METHODS[keyof typeof ANOMALY_DETECTION_METHODS];

export const ANOMALY_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export type AnomalySeverity = typeof ANOMALY_SEVERITIES[keyof typeof ANOMALY_SEVERITIES];

export const PATTERN_TYPES = {
  SEASONAL: 'seasonal',
  TREND: 'trend',
  CYCLICAL: 'cyclical',
  RANDOM: 'random',
  LEVEL_SHIFT: 'level_shift'
} as const;

export type PatternType = typeof PATTERN_TYPES[keyof typeof PATTERN_TYPES];

export const ALERT_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
} as const;

export type AlertLevel = typeof ALERT_LEVELS[keyof typeof ALERT_LEVELS];

// تكوين النظام
export interface AnalyticsConfiguration {
  data_collection: DataCollectionConfig;
  processing: ProcessingConfig;
  storage: StorageConfig;
  analysis: AnalysisConfig;
  reporting: ReportingConfig;
  alerting: AlertingConfig;
  privacy: PrivacyConfig;
}

export interface DataCollectionConfig {
  enabled_sources: DataSource[];
  sampling_rate: number;
  real_time_processing: boolean;
  batch_processing: BatchProcessingConfig;
  data_quality_checks: DataQualityCheck[];
}

export interface DataSource {
  name: string;
  type: DataSourceType;
  enabled: boolean;
  configuration: any;
  collection_frequency: number; // بالثواني
}

export interface BatchProcessingConfig {
  enabled: boolean;
  batch_size: number;
  processing_interval: number; // بالدقائق
  max_processing_time: number; // بالدقائق
  retry_policy: RetryPolicy;
}

export interface DataQualityCheck {
  name: string;
  type: QualityCheckType;
  threshold: number;
  action: QualityCheckAction;
}

export interface RetryPolicy {
  max_retries: number;
  retry_delay: number; // بالثواني
  exponential_backoff: boolean;
}

export const DATA_SOURCE_TYPES = {
  WEB_ANALYTICS: 'web_analytics',
  MOBILE_ANALYTICS: 'mobile_analytics',
  SERVER_LOGS: 'server_logs',
  DATABASE_EVENTS: 'database_events',
  API_EVENTS: 'api_events',
  USER_INTERACTIONS: 'user_interactions',
  BUSINESS_EVENTS: 'business_events',
  EXTERNAL_APIS: 'external_apis'
} as const;

export type DataSourceType = typeof DATA_SOURCE_TYPES[keyof typeof DATA_SOURCE_TYPES];

export const QUALITY_CHECK_TYPES = {
  COMPLETENESS: 'completeness',
  ACCURACY: 'accuracy',
  CONSISTENCY: 'consistency',
  TIMELINESS: 'timeliness',
  VALIDITY: 'validity',
  UNIQUENESS: 'uniqueness'
} as const;

export type QualityCheckType = typeof QUALITY_CHECK_TYPES[keyof typeof QUALITY_CHECK_TYPES];

export const QUALITY_CHECK_ACTIONS = {
  LOG_WARNING: 'log_warning',
  REJECT_DATA: 'reject_data',
  QUARANTINE_DATA: 'quarantine_data',
  AUTO_CORRECT: 'auto_correct',
  SEND_ALERT: 'send_alert'
} as const;

export type QualityCheckAction = typeof QUALITY_CHECK_ACTIONS[keyof typeof QUALITY_CHECK_ACTIONS];

export interface ProcessingConfig {
  real_time_processing: RealTimeProcessingConfig;
  stream_processing: StreamProcessingConfig;
  complex_event_processing: CEPConfig;
  data_enrichment: DataEnrichmentConfig;
}

export interface RealTimeProcessingConfig {
  enabled: boolean;
  processing_latency_target: number; // بالميلي ثانية
  throughput_target: number; // events per second
  scaling_config: ProcessingScalingConfig;
}

export interface ProcessingScalingConfig {
  auto_scaling: boolean;
  min_instances: number;
  max_instances: number;
  scale_up_threshold: number;
  scale_down_threshold: number;
  scaling_cooldown: number; // بالثواني
}

export interface StreamProcessingConfig {
  enabled: boolean;
  stream_processors: StreamProcessor[];
  windowing: WindowingConfig;
  state_management: StateManagementConfig;
}

export interface StreamProcessor {
  name: string;
  type: 'map' | 'filter' | 'aggregate' | 'join' | 'custom';
  configuration: any;
  parallelism: number;
}

export interface WindowingConfig {
  window_type: 'tumbling' | 'sliding' | 'session';
  window_size: number; // بالثواني
  slide_interval?: number; // بالثواني
  session_timeout?: number; // بالثواني
}

export interface StateManagementConfig {
  backend: 'memory' | 'redis' | 'database';
  checkpointing: CheckpointingConfig;
  state_ttl: number; // بالثواني
}

export interface CheckpointingConfig {
  enabled: boolean;
  interval: number; // بالثواني
  retention_count: number;
  compression_enabled: boolean;
}

export interface CEPConfig {
  enabled: boolean;
  pattern_definitions: PatternDefinition[];
  event_correlation: EventCorrelationConfig;
}

export interface PatternDefinition {
  name: string;
  pattern: string; // Pattern expression
  time_window: number; // بالثواني
  actions: PatternAction[];
}

export interface PatternAction {
  type: 'alert' | 'metric' | 'trigger' | 'custom';
  configuration: any;
}

export interface EventCorrelationConfig {
  correlation_keys: string[];
  correlation_window: number; // بالثواني
  max_events_per_correlation: number;
}

export interface DataEnrichmentConfig {
  enabled: boolean;
  enrichment_sources: EnrichmentSource[];
  caching: EnrichmentCachingConfig;
}

export interface EnrichmentSource {
  name: string;
  type: 'database' | 'api' | 'file' | 'ml_model';
  configuration: any;
  latency_sla: number; // بالميلي ثانية
}

export interface EnrichmentCachingConfig {
  enabled: boolean;
  cache_ttl: number; // بالثواني
  cache_size: number; // عدد العناصر
  eviction_policy: 'lru' | 'lfu' | 'ttl';
}

export interface StorageConfig {
  primary_storage: PrimaryStorageConfig;
  archival_storage: ArchivalStorageConfig;
  backup_storage: BackupStorageConfig;
  retention_policies: RetentionPolicy[];
}

export interface PrimaryStorageConfig {
  storage_type: 'postgresql' | 'clickhouse' | 'bigquery' | 'elasticsearch';
  connection_config: any;
  partitioning: PartitioningConfig;
  indexing: IndexingConfig;
}

export interface PartitioningConfig {
  enabled: boolean;
  partition_key: string;
  partition_type: 'time' | 'hash' | 'range';
  partition_size: string;
}

export interface IndexingConfig {
  auto_indexing: boolean;
  custom_indexes: CustomIndex[];
  index_optimization: boolean;
}

export interface CustomIndex {
  name: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  unique: boolean;
}

export interface ArchivalStorageConfig {
  enabled: boolean;
  storage_type: 's3' | 'gcs' | 'azure_blob';
  compression_enabled: boolean;
  encryption_enabled: boolean;
  archive_schedule: ArchiveSchedule;
}

export interface ArchiveSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day: string;
  data_age_threshold: number; // بالأيام
}

export interface BackupStorageConfig {
  enabled: boolean;
  backup_frequency: 'hourly' | 'daily' | 'weekly';
  retention_count: number;
  incremental_backup: boolean;
  verification_enabled: boolean;
}

export interface RetentionPolicy {
  name: string;
  data_type: string;
  retention_period: number; // بالأيام
  deletion_schedule: DeletionSchedule;
}

export interface DeletionSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day: string;
  batch_size: number;
}

export interface AnalysisConfig {
  real_time_analysis: RealTimeAnalysisConfig;
  batch_analysis: BatchAnalysisConfig;
  predictive_analysis: PredictiveAnalysisConfig;
  anomaly_detection: AnomalyDetectionConfig;
}

export interface RealTimeAnalysisConfig {
  enabled: boolean;
  analysis_rules: AnalysisRule[];
  alert_thresholds: AlertThreshold[];
  dashboard_updates: DashboardUpdateConfig;
}

export interface AnalysisRule {
  name: string;
  condition: string; // SQL-like expression
  action: AnalysisAction;
  frequency: number; // بالثواني
}

export interface AnalysisAction {
  type: 'alert' | 'metric_update' | 'dashboard_refresh' | 'custom';
  configuration: any;
}

export interface AlertThreshold {
  metric: AnalyticsMetric;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  value: number;
  duration: number; // بالثواني
  severity: AlertLevel;
}

export interface DashboardUpdateConfig {
  auto_refresh: boolean;
  refresh_interval: number; // بالثواني
  real_time_widgets: string[];
}

export interface BatchAnalysisConfig {
  enabled: boolean;
  analysis_jobs: AnalysisJob[];
  scheduling: JobSchedulingConfig;
  resource_allocation: ResourceAllocationConfig;
}

export interface AnalysisJob {
  name: string;
  type: 'aggregation' | 'ml_training' | 'report_generation' | 'custom';
  configuration: any;
  dependencies: string[];
  priority: JobPriority;
}

export interface JobSchedulingConfig {
  scheduler_type: 'cron' | 'interval' | 'event_driven';
  max_concurrent_jobs: number;
  job_timeout: number; // بالدقائق
  retry_policy: RetryPolicy;
}

export interface ResourceAllocationConfig {
  cpu_allocation: ResourceAllocation;
  memory_allocation: ResourceAllocation;
  disk_allocation: ResourceAllocation;
}

export interface ResourceAllocation {
  min_allocation: number;
  max_allocation: number;
  scaling_policy: 'manual' | 'auto';
}

export const JOB_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export type JobPriority = typeof JOB_PRIORITIES[keyof typeof JOB_PRIORITIES];

export interface PredictiveAnalysisConfig {
  enabled: boolean;
  models: PredictiveModelConfig[];
  training_schedule: TrainingScheduleConfig;
  model_evaluation: ModelEvaluationConfig;
}

export interface PredictiveModelConfig {
  name: string;
  model_type: ModelType;
  target_metric: AnalyticsMetric;
  features: string[];
  hyperparameters: any;
  performance_requirements: PerformanceRequirements;
}

export interface PerformanceRequirements {
  min_accuracy: number;
  max_training_time: number; // بالدقائق
  max_prediction_latency: number; // بالميلي ثانية
  max_model_size: number; // بالميجابايت
}

export interface TrainingScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'on_demand';
  time_of_day: string;
  incremental_training: boolean;
  auto_deployment: boolean;
}

export interface ModelEvaluationConfig {
  evaluation_metrics: EvaluationMetric[];
  test_set_size: number; // نسبة مئوية
  cross_validation: CrossValidationConfig;
  performance_monitoring: ModelPerformanceMonitoringConfig;
}

export interface EvaluationMetric {
  name: string;
  type: 'regression' | 'classification' | 'ranking';
  weight: number;
  threshold?: number;
}

export interface CrossValidationConfig {
  enabled: boolean;
  k_folds: number;
  stratified: boolean;
  time_series_split: boolean;
}

export interface ModelPerformanceMonitoringConfig {
  enabled: boolean;
  monitoring_frequency: number; // بالساعات
  drift_detection: DriftDetectionConfig;
  auto_retrain_threshold: number;
}

export interface DriftDetectionConfig {
  enabled: boolean;
  detection_methods: string[];
  alert_threshold: number;
  monitoring_window: number; // بالأيام
}

export interface AnomalyDetectionConfig {
  enabled: boolean;
  detection_methods: AnomalyDetectionMethod[];
  sensitivity: number; // 0-1
  alert_configuration: AnomalyAlertConfig;
}

export interface AnomalyAlertConfig {
  enabled: boolean;
  severity_thresholds: SeverityThreshold[];
  notification_channels: string[];
  auto_resolution: AutoResolutionConfig;
}

export interface SeverityThreshold {
  severity: AnomalySeverity;
  threshold: number;
  duration: number; // بالثواني
}

export interface AutoResolutionConfig {
  enabled: boolean;
  resolution_criteria: ResolutionCriteria[];
  max_resolution_time: number; // بالساعات
}

export interface ResolutionCriteria {
  condition: string;
  confidence_threshold: number;
  consecutive_checks: number;
}

export interface ReportingConfig {
  automated_reports: AutomatedReportConfig[];
  dashboard_config: DashboardConfig;
  export_config: ExportConfig;
  subscription_config: SubscriptionConfig;
}

export interface AutomatedReportConfig {
  name: string;
  report_type: ReportType;
  schedule: ReportSchedule;
  recipients: ReportRecipient[];
  content: ReportContentConfig;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time_of_day: string;
  day_of_week?: number;
  day_of_month?: number;
  timezone: string;
}

export interface ReportRecipient {
  email: string;
  name?: string;
  role?: string;
  customizations?: ReportCustomization[];
}

export interface ReportCustomization {
  section: string;
  visible: boolean;
  priority: number;
}

export interface ReportContentConfig {
  sections: ReportSection[];
  formatting: ReportFormatting;
  data_filters: AnalyticsFilter[];
}

export interface ReportSection {
  name: string;
  type: SectionType;
  content: SectionContent;
  display_options: DisplayOptions;
}

export interface SectionContent {
  metrics: AnalyticsMetric[];
  dimensions: AnalyticsDimension[];
  visualizations: VisualizationConfig[];
  narrative?: NarrativeConfig;
}

export interface VisualizationConfig {
  type: VisualizationType;
  title: string;
  description?: string;
  data_query: AnalyticsQuery;
  styling: VisualizationStyling;
}

export interface NarrativeConfig {
  enabled: boolean;
  template: string;
  auto_insights: boolean;
  custom_insights: string[];
}

export interface DisplayOptions {
  visible: boolean;
  order: number;
  collapsible: boolean;
  export_enabled: boolean;
}

export interface ReportFormatting {
  theme: 'light' | 'dark' | 'corporate';
  color_scheme: string;
  font_family: string;
  page_size: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
}

export const REPORT_TYPES = {
  EXECUTIVE_SUMMARY: 'executive_summary',
  DETAILED_ANALYTICS: 'detailed_analytics',
  PERFORMANCE_REPORT: 'performance_report',
  USER_BEHAVIOR: 'user_behavior',
  CONTENT_ANALYSIS: 'content_analysis',
  FINANCIAL_REPORT: 'financial_report',
  CUSTOM: 'custom'
} as const;

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];

export const SECTION_TYPES = {
  METRICS_SUMMARY: 'metrics_summary',
  TREND_ANALYSIS: 'trend_analysis',
  COMPARISON: 'comparison',
  TOP_PERFORMERS: 'top_performers',
  INSIGHTS: 'insights',
  RECOMMENDATIONS: 'recommendations',
  DETAILED_TABLE: 'detailed_table',
  VISUALIZATION: 'visualization'
} as const;

export type SectionType = typeof SECTION_TYPES[keyof typeof SECTION_TYPES];

export const VISUALIZATION_TYPES = {
  LINE_CHART: 'line_chart',
  BAR_CHART: 'bar_chart',
  PIE_CHART: 'pie_chart',
  AREA_CHART: 'area_chart',
  SCATTER_PLOT: 'scatter_plot',
  HEATMAP: 'heatmap',
  FUNNEL_CHART: 'funnel_chart',
  GAUGE_CHART: 'gauge_chart',
  TABLE: 'table',
  METRIC_CARD: 'metric_card'
} as const;

export type VisualizationType = typeof VISUALIZATION_TYPES[keyof typeof VISUALIZATION_TYPES];

export interface VisualizationStyling {
  colors: string[];
  width?: number;
  height?: number;
  responsive: boolean;
  animations: boolean;
  interactions: boolean;
}

export interface DashboardConfig {
  default_dashboards: DefaultDashboard[];
  custom_dashboards: CustomDashboard[];
  sharing_config: SharingConfig;
  performance_config: DashboardPerformanceConfig;
}

export interface DefaultDashboard {
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: AnalyticsFilter[];
}

export interface CustomDashboard {
  id: string;
  name: string;
  created_by: string;
  shared: boolean;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  data_query: AnalyticsQuery;
  visualization: VisualizationConfig;
  refresh_interval?: number; // بالثواني
  position: WidgetPosition;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardLayout {
  type: 'grid' | 'flow' | 'custom';
  grid_size?: GridSize;
  responsive: boolean;
  mobile_optimized: boolean;
}

export interface GridSize {
  columns: number;
  row_height: number;
  margin: [number, number];
  padding: [number, number];
}

export const WIDGET_TYPES = {
  METRIC: 'metric',
  CHART: 'chart',
  TABLE: 'table',
  TEXT: 'text',
  IMAGE: 'image',
  FILTER: 'filter',
  MAP: 'map',
  IFRAME: 'iframe'
} as const;

export type WidgetType = typeof WIDGET_TYPES[keyof typeof WIDGET_TYPES];

export interface SharingConfig {
  public_dashboards: boolean;
  share_links: boolean;
  embed_support: boolean;
  access_controls: ShareAccessControl[];
}

export interface ShareAccessControl {
  dashboard_id: string;
  access_type: 'view' | 'edit' | 'admin';
  users: string[];
  roles: string[];
  expiration?: Date;
}

export interface DashboardPerformanceConfig {
  caching: DashboardCachingConfig;
  lazy_loading: boolean;
  pagination: PaginationConfig;
  compression: boolean;
}

export interface DashboardCachingConfig {
  enabled: boolean;
  cache_duration: number; // بالثواني
  cache_invalidation: CacheInvalidationConfig;
}

export interface CacheInvalidationConfig {
  on_data_update: boolean;
  scheduled_invalidation: boolean;
  manual_invalidation: boolean;
}

export interface PaginationConfig {
  enabled: boolean;
  page_size: number;
  max_pages: number;
  virtual_scrolling: boolean;
}

export interface ExportConfig {
  supported_formats: ExportFormat[];
  max_export_size: number; // عدد الصفوف
  async_export: AsyncExportConfig;
  security: ExportSecurityConfig;
}

export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
  JSON: 'json',
  XML: 'xml',
  PNG: 'png',
  JPEG: 'jpeg',
  SVG: 'svg'
} as const;

export type ExportFormat = typeof EXPORT_FORMATS[keyof typeof EXPORT_FORMATS];

export interface AsyncExportConfig {
  enabled: boolean;
  queue_size: number;
  max_processing_time: number; // بالدقائق
  notification_enabled: boolean;
}

export interface ExportSecurityConfig {
  encryption_enabled: boolean;
  access_controls: boolean;
  audit_logging: boolean;
  watermarking: boolean;
}

export interface SubscriptionConfig {
  enabled: boolean;
  subscription_types: SubscriptionType[];
  delivery_channels: DeliveryChannel[];
  personalization: SubscriptionPersonalization;
}

export interface SubscriptionType {
  name: string;
  description: string;
  content_type: 'dashboard' | 'report' | 'alert' | 'insight';
  frequency_options: string[];
  customization_options: CustomizationOption[];
}

export interface CustomizationOption {
  name: string;
  type: 'boolean' | 'select' | 'multiselect' | 'text' | 'number';
  options?: string[];
  default_value?: any;
}

export interface DeliveryChannel {
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack';
  configuration: any;
  enabled: boolean;
}

export interface SubscriptionPersonalization {
  enabled: boolean;
  personalization_factors: PersonalizationFactor[];
  recommendation_engine: boolean;
  adaptive_scheduling: boolean;
}

export interface PersonalizationFactor {
  name: string;
  weight: number;
  data_source: string;
}

export interface AlertingConfig {
  enabled: boolean;
  alert_rules: AlertRule[];
  notification_channels: NotificationChannel[];
  escalation_policies: EscalationPolicy[];
  suppression_rules: SuppressionRule[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  severity: AlertLevel;
  actions: AlertAction[];
  enabled: boolean;
}

export interface AlertCondition {
  metric: AnalyticsMetric;
  operator: FilterOperator;
  threshold: number;
  duration: number; // بالثواني
  evaluation_frequency: number; // بالثواني
}

export interface AlertAction {
  type: 'notification' | 'webhook' | 'auto_scaling' | 'custom';
  configuration: any;
  delay?: number; // بالثواني
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'pagerduty';
  configuration: any;
  enabled: boolean;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  escalation_rules: EscalationRule[];
  max_escalations: number;
}

export interface EscalationRule {
  delay: number; // بالدقائق
  escalate_to: string[]; // notification channel IDs
  condition?: string; // optional condition for escalation
}

export interface SuppressionRule {
  id: string;
  name: string;
  condition: string;
  duration: number; // بالثواني
  suppression_type: 'mute' | 'delay' | 'modify';
}

export interface PrivacyConfig {
  data_anonymization: DataAnonymizationConfig;
  consent_management: ConsentManagementConfig;
  data_retention: DataRetentionConfig;
  access_controls: AccessControlConfig;
}

export interface DataAnonymizationConfig {
  enabled: boolean;
  anonymization_techniques: AnonymizationTechnique[];
  sensitive_fields: SensitiveField[];
  anonymization_schedule: AnonymizationSchedule;
}

export interface AnonymizationTechnique {
  name: string;
  type: 'masking' | 'generalization' | 'suppression' | 'perturbation';
  configuration: any;
  fields: string[];
}

export interface SensitiveField {
  field_name: string;
  sensitivity_level: 'low' | 'medium' | 'high' | 'critical';
  anonymization_method: string;
  retention_period: number; // بالأيام
}

export interface AnonymizationSchedule {
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly';
  batch_size: number;
  time_of_day?: string;
}

export interface ConsentManagementConfig {
  enabled: boolean;
  consent_types: ConsentType[];
  opt_out_mechanisms: OptOutMechanism[];
  consent_tracking: ConsentTrackingConfig;
}

export interface ConsentType {
  name: string;
  description: string;
  required: boolean;
  data_categories: string[];
  processing_purposes: string[];
}

export interface OptOutMechanism {
  type: 'global' | 'category_specific' | 'granular';
  implementation: string;
  retroactive: boolean;
}

export interface ConsentTrackingConfig {
  track_consent_changes: boolean;
  consent_expiration: number; // بالأيام
  periodic_reconfirmation: boolean;
  audit_logging: boolean;
}

export interface DataRetentionConfig {
  default_retention_period: number; // بالأيام
  retention_policies: DataRetentionPolicy[];
  automated_deletion: AutomatedDeletionConfig;
  backup_retention: BackupRetentionConfig;
}

export interface DataRetentionPolicy {
  data_type: string;
  retention_period: number; // بالأيام
  deletion_method: 'hard_delete' | 'soft_delete' | 'anonymize';
  legal_hold_support: boolean;
}

export interface AutomatedDeletionConfig {
  enabled: boolean;
  deletion_schedule: DeletionSchedule;
  safety_checks: SafetyCheck[];
  notification_before_deletion: boolean;
}

export interface SafetyCheck {
  name: string;
  type: 'reference_check' | 'backup_verification' | 'consent_check';
  configuration: any;
}

export interface BackupRetentionConfig {
  backup_retention_period: number; // بالأيام
  backup_encryption: boolean;
  backup_compression: boolean;
  offsite_backup: boolean;
}

export interface AccessControlConfig {
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  audit_logging: AuditLoggingConfig;
  session_management: SessionManagementConfig;
}

export interface AuthenticationConfig {
  multi_factor_auth: boolean;
  password_policy: PasswordPolicy;
  session_timeout: number; // بالدقائق
  login_attempt_limits: LoginAttemptLimits;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  password_expiration: number; // بالأيام
}

export interface LoginAttemptLimits {
  max_attempts: number;
  lockout_duration: number; // بالدقائق
  progressive_delays: boolean;
}

export interface AuthorizationConfig {
  role_based_access: boolean;
  resource_based_access: boolean;
  fine_grained_permissions: boolean;
  permission_inheritance: boolean;
}

export interface AuditLoggingConfig {
  enabled: boolean;
  logged_events: AuditEvent[];
  log_retention_period: number; // بالأيام
  log_encryption: boolean;
  real_time_monitoring: boolean;
}

export interface AuditEvent {
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  log_details: string[];
  alert_on_event: boolean;
}

export interface SessionManagementConfig {
  session_storage: 'memory' | 'database' | 'redis';
  concurrent_sessions: number;
  session_encryption: boolean;
  secure_cookies: boolean;
}
