/**
 * نظام التوصيات المتقدم - أنواع البيانات
 * Advanced Recommendations System - Type Definitions
 */

export interface RecommendationRequest {
  user_id: string;
  content_id?: string;
  context?: RecommendationContext;
  options?: RecommendationOptions;
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
  total_count: number;
  algorithm_used: RecommendationAlgorithm;
  confidence_score: number;
  explanation?: RecommendationExplanation;
  metadata: RecommendationMetadata;
  generated_at: Date;
  expires_at: Date;
}

export interface RecommendationItem {
  content_id: string;
  title: string;
  description: string;
  url: string;
  type: ContentType;
  category: string;
  tags: string[];
  author: AuthorInfo;
  published_at: Date;
  reading_time: number;
  popularity_score: number;
  relevance_score: number;
  confidence_score: number;
  recommendation_reason: RecommendationReason[];
  personalization_factors: PersonalizationFactor[];
  image_url?: string;
  sentiment_score?: number;
  engagement_prediction: EngagementPrediction;
}

export interface RecommendationContext {
  current_content?: string;
  session_history: string[];
  time_of_day: number;
  day_of_week: number;
  device_type: 'mobile' | 'desktop' | 'tablet';
  location?: LocationData;
  referrer?: string;
  search_query?: string;
}

export interface RecommendationOptions {
  algorithm: RecommendationAlgorithm;
  max_results: number;
  min_confidence: number;
  include_explanation: boolean;
  personalization_level: PersonalizationLevel;
  diversity_factor: number; // 0-1
  novelty_factor: number; // 0-1
  exclude_categories?: string[];
  exclude_content?: string[];
  boost_categories?: string[];
  time_sensitivity: boolean;
}

export interface RecommendationReason {
  type: ReasonType;
  description: string;
  confidence: number;
  factors: string[];
}

export interface PersonalizationFactor {
  factor_type: FactorType;
  weight: number;
  description: string;
  evidence: string[];
}

export interface EngagementPrediction {
  read_probability: number;
  like_probability: number;
  share_probability: number;
  comment_probability: number;
  completion_rate: number;
  dwell_time_estimate: number; // بالثواني
}

export interface RecommendationExplanation {
  primary_reason: string;
  contributing_factors: string[];
  user_profile_match: UserProfileMatch;
  content_similarity: ContentSimilarity;
  trending_factor: number;
  personalization_impact: number;
}

export interface UserProfileMatch {
  interest_alignment: number;
  reading_pattern_match: number;
  preference_alignment: number;
  behavioral_similarity: number;
}

export interface ContentSimilarity {
  topic_similarity: number;
  semantic_similarity: number;
  tag_overlap: number;
  category_match: boolean;
  author_familiarity: number;
}

export interface RecommendationMetadata {
  model_version: string;
  computation_time: number;
  cache_hit: boolean;
  data_freshness: number; // بالدقائق
  user_context_completeness: number;
  algorithm_mix: AlgorithmMix[];
}

export interface AlgorithmMix {
  algorithm: RecommendationAlgorithm;
  weight: number;
  contribution_score: number;
}

// أنواع خوارزميات التوصية
export const RECOMMENDATION_ALGORITHMS = {
  COLLABORATIVE_FILTERING: 'collaborative_filtering',
  CONTENT_BASED: 'content_based',
  HYBRID: 'hybrid',
  DEEP_LEARNING: 'deep_learning',
  MATRIX_FACTORIZATION: 'matrix_factorization',
  KNOWLEDGE_BASED: 'knowledge_based',
  DEMOGRAPHIC: 'demographic',
  CONTEXT_AWARE: 'context_aware',
  REINFORCEMENT_LEARNING: 'reinforcement_learning',
  ENSEMBLE: 'ensemble'
} as const;

export type RecommendationAlgorithm = typeof RECOMMENDATION_ALGORITHMS[keyof typeof RECOMMENDATION_ALGORITHMS];

// مستويات التخصيص
export const PERSONALIZATION_LEVELS = {
  MINIMAL: 'minimal',
  BASIC: 'basic',
  STANDARD: 'standard',
  ADVANCED: 'advanced',
  DEEP: 'deep'
} as const;

export type PersonalizationLevel = typeof PERSONALIZATION_LEVELS[keyof typeof PERSONALIZATION_LEVELS];

// أنواع أسباب التوصية
export const REASON_TYPES = {
  SIMILAR_USERS: 'similar_users',
  SIMILAR_CONTENT: 'similar_content',
  USER_INTEREST: 'user_interest',
  TRENDING: 'trending',
  RECENCY: 'recency',
  POPULARITY: 'popularity',
  DIVERSITY: 'diversity',
  SERENDIPITY: 'serendipity',
  BEHAVIORAL_PATTERN: 'behavioral_pattern',
  CONTEXTUAL: 'contextual'
} as const;

export type ReasonType = typeof REASON_TYPES[keyof typeof REASON_TYPES];

// أنواع عوامل التخصيص
export const FACTOR_TYPES = {
  READING_HISTORY: 'reading_history',
  INTEREST_PROFILE: 'interest_profile',
  BEHAVIORAL_PATTERN: 'behavioral_pattern',
  SOCIAL_SIGNAL: 'social_signal',
  TEMPORAL_PATTERN: 'temporal_pattern',
  CONTENT_PREFERENCE: 'content_preference',
  INTERACTION_HISTORY: 'interaction_history',
  DEMOGRAPHIC: 'demographic',
  CONTEXTUAL: 'contextual',
  FEEDBACK: 'feedback'
} as const;

export type FactorType = typeof FACTOR_TYPES[keyof typeof FACTOR_TYPES];

// أنواع المحتوى
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  NEWS: 'news',
  BLOG_POST: 'blog_post',
  VIDEO: 'video',
  PODCAST: 'podcast',
  INFOGRAPHIC: 'infographic',
  RESEARCH: 'research',
  OPINION: 'opinion',
  INTERVIEW: 'interview',
  ANALYSIS: 'analysis'
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

// ملف المستخدم للتوصيات
export interface UserRecommendationProfile {
  user_id: string;
  interests: UserInterest[];
  reading_patterns: ReadingPattern[];
  content_preferences: ContentPreference[];
  behavioral_signals: BehavioralSignal[];
  social_connections: SocialConnection[];
  feedback_history: FeedbackHistory[];
  demographic_info: DemographicInfo;
  context_patterns: ContextPattern[];
  updated_at: Date;
}

export interface UserInterest {
  topic: string;
  category: string;
  interest_score: number;
  confidence: number;
  evidence_count: number;
  last_activity: Date;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ReadingPattern {
  pattern_type: ReadingPatternType;
  pattern_data: any;
  strength: number;
  frequency: number;
  time_windows: TimeWindow[];
  last_observed: Date;
}

export interface ContentPreference {
  attribute: string;
  value: string;
  preference_score: number;
  evidence_count: number;
  context_dependent: boolean;
}

export interface BehavioralSignal {
  signal_type: BehavioralSignalType;
  signal_value: number;
  context: any;
  timestamp: Date;
  weight: number;
}

export interface SocialConnection {
  connected_user_id: string;
  connection_type: ConnectionType;
  similarity_score: number;
  influence_weight: number;
  activity_overlap: number;
}

export interface FeedbackHistory {
  content_id: string;
  feedback_type: FeedbackType;
  rating?: number;
  timestamp: Date;
  context: any;
}

export interface DemographicInfo {
  age_group?: string;
  location?: string;
  education_level?: string;
  profession?: string;
  interests_declared?: string[];
}

export interface ContextPattern {
  context_type: ContextType;
  pattern_description: string;
  occurrence_frequency: number;
  typical_content_types: ContentType[];
  engagement_rates: number;
}

// أنواع أنماط القراءة
export const READING_PATTERN_TYPES = {
  TIME_BASED: 'time_based',
  CONTENT_LENGTH: 'content_length',
  TOPIC_SEQUENCE: 'topic_sequence',
  ENGAGEMENT_PATTERN: 'engagement_pattern',
  DISCOVERY_PATTERN: 'discovery_pattern',
  COMPLETION_PATTERN: 'completion_pattern'
} as const;

export type ReadingPatternType = typeof READING_PATTERN_TYPES[keyof typeof READING_PATTERN_TYPES];

// أنواع الإشارات السلوكية
export const BEHAVIORAL_SIGNAL_TYPES = {
  CLICK: 'click',
  VIEW: 'view',
  READ: 'read',
  LIKE: 'like',
  SHARE: 'share',
  COMMENT: 'comment',
  BOOKMARK: 'bookmark',
  SEARCH: 'search',
  SCROLL: 'scroll',
  DWELL_TIME: 'dwell_time',
  RETURN_VISIT: 'return_visit',
  COMPLETION: 'completion'
} as const;

export type BehavioralSignalType = typeof BEHAVIORAL_SIGNAL_TYPES[keyof typeof BEHAVIORAL_SIGNAL_TYPES];

// أنواع الاتصالات الاجتماعية
export const CONNECTION_TYPES = {
  FOLLOWER: 'follower',
  FOLLOWING: 'following',
  MUTUAL: 'mutual',
  SIMILAR_INTERESTS: 'similar_interests',
  SIMILAR_BEHAVIOR: 'similar_behavior',
  EXPERT_FOLLOWER: 'expert_follower'
} as const;

export type ConnectionType = typeof CONNECTION_TYPES[keyof typeof CONNECTION_TYPES];

// أنواع الملاحظات
export const FEEDBACK_TYPES = {
  EXPLICIT_RATING: 'explicit_rating',
  IMPLICIT_POSITIVE: 'implicit_positive',
  IMPLICIT_NEGATIVE: 'implicit_negative',
  ENGAGEMENT: 'engagement',
  DISMISSAL: 'dismissal',
  REPORT: 'report'
} as const;

export type FeedbackType = typeof FEEDBACK_TYPES[keyof typeof FEEDBACK_TYPES];

// أنواع السياق
export const CONTEXT_TYPES = {
  TEMPORAL: 'temporal',
  LOCATION: 'location',
  DEVICE: 'device',
  SESSION: 'session',
  ACTIVITY: 'activity',
  MOOD: 'mood',
  GOAL: 'goal'
} as const;

export type ContextType = typeof CONTEXT_TYPES[keyof typeof CONTEXT_TYPES];

// نوافذ زمنية
export interface TimeWindow {
  start_hour: number;
  end_hour: number;
  days_of_week: number[];
  activity_score: number;
}

// معلومات المؤلف
export interface AuthorInfo {
  id: string;
  name: string;
  username?: string;
  bio?: string;
  expertise_areas: string[];
  follower_count: number;
  article_count: number;
  engagement_rate: number;
  credibility_score: number;
}

// بيانات الموقع
export interface LocationData {
  country: string;
  city?: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// خوارزمية التصفية التعاونية
export interface CollaborativeFilteringModel {
  user_similarity_matrix: UserSimilarity[];
  item_similarity_matrix: ItemSimilarity[];
  user_item_matrix: UserItemInteraction[];
  model_parameters: CFModelParameters;
  last_trained: Date;
}

export interface UserSimilarity {
  user_1: string;
  user_2: string;
  similarity_score: number;
  common_items: number;
  confidence: number;
}

export interface ItemSimilarity {
  item_1: string;
  item_2: string;
  similarity_score: number;
  common_users: number;
  feature_similarity: number;
}

export interface UserItemInteraction {
  user_id: string;
  item_id: string;
  interaction_score: number;
  interaction_type: string;
  timestamp: Date;
  context: any;
}

export interface CFModelParameters {
  similarity_metric: 'cosine' | 'pearson' | 'jaccard' | 'euclidean';
  neighborhood_size: number;
  min_common_items: number;
  regularization_factor: number;
  learning_rate: number;
}

// نموذج المحتوى
export interface ContentBasedModel {
  content_features: ContentFeature[];
  user_profiles: UserContentProfile[];
  feature_weights: FeatureWeight[];
  model_parameters: CBModelParameters;
  last_trained: Date;
}

export interface ContentFeature {
  content_id: string;
  features: { [feature: string]: number };
  feature_vector: number[];
  metadata: ContentMetadata;
}

export interface UserContentProfile {
  user_id: string;
  feature_preferences: { [feature: string]: number };
  preference_vector: number[];
  confidence_scores: { [feature: string]: number };
  last_updated: Date;
}

export interface FeatureWeight {
  feature_name: string;
  global_weight: number;
  category_weights: { [category: string]: number };
  importance_score: number;
}

export interface CBModelParameters {
  feature_extraction_method: string;
  similarity_threshold: number;
  profile_update_rate: number;
  feature_decay_rate: number;
  normalization_method: string;
}

export interface ContentMetadata {
  title: string;
  category: string;
  tags: string[];
  author_id: string;
  publication_date: Date;
  content_type: ContentType;
  language: string;
  reading_time: number;
  complexity_level: number;
}

// نموذج التعلم العميق
export interface DeepLearningModel {
  model_type: DeepModelType;
  architecture: ModelArchitecture;
  training_data: TrainingDataset;
  model_weights: ModelWeights;
  performance_metrics: ModelPerformance;
  last_trained: Date;
}

export interface ModelArchitecture {
  layers: LayerConfig[];
  input_dimension: number;
  output_dimension: number;
  embedding_dimension: number;
  hidden_dimensions: number[];
  activation_functions: string[];
  dropout_rates: number[];
}

export interface LayerConfig {
  layer_type: string;
  dimension: number;
  activation: string;
  regularization: any;
}

export interface TrainingDataset {
  size: number;
  features: string[];
  train_test_split: number;
  validation_split: number;
  preprocessing_steps: string[];
}

export interface ModelWeights {
  version: string;
  checksum: string;
  size_mb: number;
  compression: string;
  storage_path: string;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  loss: number;
  training_time: number;
  inference_time: number;
}

// أنواع النماذج العميقة
export const DEEP_MODEL_TYPES = {
  NEURAL_COLLABORATIVE_FILTERING: 'neural_cf',
  AUTOENCODER: 'autoencoder',
  DEEP_FM: 'deep_fm',
  WIDE_AND_DEEP: 'wide_and_deep',
  TRANSFORMER: 'transformer',
  GRAPH_NEURAL_NETWORK: 'gnn',
  VARIATIONAL_AUTOENCODER: 'vae',
  GENERATIVE_ADVERSARIAL: 'gan'
} as const;

export type DeepModelType = typeof DEEP_MODEL_TYPES[keyof typeof DEEP_MODEL_TYPES];

// تكوين نظام التوصيات
export interface RecommendationSystemConfig {
  algorithms: AlgorithmConfig[];
  data_processing: DataProcessingConfig;
  model_training: ModelTrainingConfig;
  serving: ServingConfig;
  evaluation: EvaluationConfig;
  monitoring: MonitoringConfig;
}

export interface AlgorithmConfig {
  name: RecommendationAlgorithm;
  enabled: boolean;
  weight: number;
  parameters: any;
  fallback_algorithm?: RecommendationAlgorithm;
}

export interface DataProcessingConfig {
  batch_size: number;
  update_frequency: number; // بالساعات
  feature_engineering: FeatureEngineeringConfig;
  data_quality: DataQualityConfig;
}

export interface FeatureEngineeringConfig {
  text_processing: TextProcessingConfig;
  numerical_features: NumericalFeatureConfig;
  categorical_features: CategoricalFeatureConfig;
  temporal_features: TemporalFeatureConfig;
}

export interface TextProcessingConfig {
  tokenization: boolean;
  stemming: boolean;
  stop_words: boolean;
  n_grams: [number, number];
  embedding_dimension: number;
}

export interface NumericalFeatureConfig {
  normalization: 'min_max' | 'z_score' | 'robust';
  outlier_handling: 'clip' | 'remove' | 'winsorize';
  missing_value_strategy: 'mean' | 'median' | 'mode' | 'interpolate';
}

export interface CategoricalFeatureConfig {
  encoding: 'one_hot' | 'label' | 'target' | 'embedding';
  max_categories: number;
  rare_category_threshold: number;
}

export interface TemporalFeatureConfig {
  time_windows: number[]; // بالأيام
  seasonal_features: boolean;
  trend_features: boolean;
  cyclical_features: boolean;
}

export interface DataQualityConfig {
  min_interactions_per_user: number;
  min_interactions_per_item: number;
  max_sparsity_ratio: number;
  outlier_detection: boolean;
  data_validation_rules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule_type: 'range' | 'pattern' | 'custom';
  parameters: any;
  severity: 'warning' | 'error';
}

export interface ModelTrainingConfig {
  training_schedule: TrainingSchedule;
  hyperparameter_tuning: HyperparameterConfig;
  validation: ValidationConfig;
  deployment: DeploymentConfig;
}

export interface TrainingSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'on_demand';
  time_of_day: string;
  incremental_training: boolean;
  full_retrain_frequency: number; // في دورات
}

export interface HyperparameterConfig {
  optimization_method: 'grid_search' | 'random_search' | 'bayesian' | 'genetic';
  parameter_space: ParameterSpace;
  max_iterations: number;
  early_stopping: EarlyStoppingConfig;
}

export interface ParameterSpace {
  [parameter: string]: {
    type: 'continuous' | 'discrete' | 'categorical';
    range?: [number, number];
    values?: any[];
    distribution?: 'uniform' | 'log_uniform' | 'normal';
  };
}

export interface EarlyStoppingConfig {
  enabled: boolean;
  patience: number;
  min_delta: number;
  monitor_metric: string;
}

export interface ValidationConfig {
  cross_validation: CrossValidationConfig;
  test_split: number;
  evaluation_metrics: EvaluationMetric[];
  significance_tests: boolean;
}

export interface CrossValidationConfig {
  method: 'k_fold' | 'stratified' | 'time_series' | 'leave_one_out';
  folds: number;
  shuffle: boolean;
  random_state: number;
}

export interface EvaluationMetric {
  name: string;
  type: 'ranking' | 'rating' | 'classification' | 'diversity';
  parameters?: any;
  weight: number;
}

export interface DeploymentConfig {
  deployment_strategy: 'blue_green' | 'canary' | 'rolling';
  rollback_threshold: number;
  performance_monitoring: boolean;
  a_b_testing: ABTestingConfig;
}

export interface ABTestingConfig {
  enabled: boolean;
  traffic_split: number; // النسبة المئوية للنموذج الجديد
  success_metrics: string[];
  min_sample_size: number;
  significance_level: number;
}

export interface ServingConfig {
  latency_requirements: LatencyConfig;
  scalability: ScalabilityConfig;
  caching: CachingConfig;
  fallback: FallbackConfig;
}

export interface LatencyConfig {
  max_response_time: number; // بالميلي ثانية
  percentile_targets: PercentileTarget[];
  timeout_handling: TimeoutHandling;
}

export interface PercentileTarget {
  percentile: number;
  target_latency: number;
}

export interface TimeoutHandling {
  strategy: 'default_recommendations' | 'cached_results' | 'simplified_algorithm';
  timeout_threshold: number;
}

export interface ScalabilityConfig {
  auto_scaling: AutoScalingConfig;
  load_balancing: LoadBalancingConfig;
  resource_limits: ResourceLimits;
}

export interface AutoScalingConfig {
  enabled: boolean;
  min_instances: number;
  max_instances: number;
  target_cpu_utilization: number;
  scale_up_threshold: number;
  scale_down_threshold: number;
}

export interface LoadBalancingConfig {
  algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'sticky_session';
  health_check_interval: number;
  failure_threshold: number;
}

export interface ResourceLimits {
  max_memory_mb: number;
  max_cpu_cores: number;
  max_concurrent_requests: number;
  request_queue_size: number;
}

export interface CachingConfig {
  enabled: boolean;
  cache_levels: CacheLevel[];
  invalidation_strategy: InvalidationStrategy;
  warming_strategy: WarmingStrategy;
}

export interface CacheLevel {
  name: string;
  ttl: number; // بالثواني
  max_size: number;
  eviction_policy: 'lru' | 'lfu' | 'fifo' | 'random';
}

export interface InvalidationStrategy {
  on_model_update: boolean;
  on_data_update: boolean;
  time_based: boolean;
  event_based: string[];
}

export interface WarmingStrategy {
  enabled: boolean;
  popular_users: boolean;
  new_content: boolean;
  scheduled_warming: boolean;
}

export interface FallbackConfig {
  strategies: FallbackStrategy[];
  quality_threshold: number;
  performance_threshold: number;
}

export interface FallbackStrategy {
  condition: string;
  action: 'simple_algorithm' | 'popular_items' | 'random_items' | 'cached_results';
  parameters?: any;
}

export interface EvaluationConfig {
  online_evaluation: OnlineEvaluationConfig;
  offline_evaluation: OfflineEvaluationConfig;
  business_metrics: BusinessMetricConfig[];
}

export interface OnlineEvaluationConfig {
  enabled: boolean;
  sample_rate: number;
  metrics: OnlineMetric[];
  reporting_frequency: number; // بالساعات
}

export interface OnlineMetric {
  name: string;
  type: 'engagement' | 'conversion' | 'satisfaction' | 'diversity';
  calculation_method: string;
  aggregation_window: number; // بالساعات
}

export interface OfflineEvaluationConfig {
  enabled: boolean;
  evaluation_frequency: number; // بالأيام
  test_set_size: number;
  evaluation_metrics: OfflineMetric[];
  benchmarking: BenchmarkingConfig;
}

export interface OfflineMetric {
  name: string;
  type: 'precision' | 'recall' | 'ndcg' | 'map' | 'auc' | 'diversity' | 'novelty';
  k_values: number[]; // لمقاييس top-k
  threshold?: number;
}

export interface BenchmarkingConfig {
  baseline_algorithms: string[];
  comparison_metrics: string[];
  statistical_tests: string[];
  reporting_format: 'detailed' | 'summary' | 'dashboard';
}

export interface BusinessMetricConfig {
  name: string;
  description: string;
  calculation_formula: string;
  target_value: number;
  weight: number;
}

export interface MonitoringConfig {
  system_monitoring: SystemMonitoringConfig;
  model_monitoring: ModelMonitoringConfig;
  data_monitoring: DataMonitoringConfig;
  alerting: AlertingConfig;
}

export interface SystemMonitoringConfig {
  enabled: boolean;
  metrics: SystemMetric[];
  collection_interval: number; // بالثواني
  retention_period: number; // بالأيام
}

export interface SystemMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  labels?: string[];
  thresholds?: MetricThreshold[];
}

export interface MetricThreshold {
  level: 'warning' | 'critical';
  condition: 'greater_than' | 'less_than' | 'equals';
  value: number;
  duration: number; // بالثواني
}

export interface ModelMonitoringConfig {
  enabled: boolean;
  drift_detection: DriftDetectionConfig;
  performance_tracking: PerformanceTrackingConfig;
  bias_monitoring: BiasMonitoringConfig;
}

export interface DriftDetectionConfig {
  enabled: boolean;
  detection_methods: DriftDetectionMethod[];
  monitoring_frequency: number; // بالساعات
  alert_threshold: number;
}

export interface DriftDetectionMethod {
  name: string;
  type: 'statistical' | 'ml_based' | 'domain_specific';
  parameters: any;
  sensitivity: number;
}

export interface PerformanceTrackingConfig {
  enabled: boolean;
  baseline_period: number; // بالأيام
  comparison_metrics: string[];
  degradation_threshold: number;
}

export interface BiasMonitoringConfig {
  enabled: boolean;
  protected_attributes: string[];
  fairness_metrics: FairnessMetric[];
  monitoring_frequency: number; // بالساعات
}

export interface FairnessMetric {
  name: string;
  type: 'demographic_parity' | 'equalized_odds' | 'calibration';
  threshold: number;
  weight: number;
}

export interface DataMonitoringConfig {
  enabled: boolean;
  quality_checks: DataQualityCheck[];
  freshness_monitoring: FreshnessMonitoringConfig;
  volume_monitoring: VolumeMonitoringConfig;
}

export interface DataQualityCheck {
  name: string;
  type: 'completeness' | 'uniqueness' | 'validity' | 'consistency';
  fields: string[];
  threshold: number;
  frequency: number; // بالساعات
}

export interface FreshnessMonitoringConfig {
  enabled: boolean;
  max_age_hours: number;
  check_frequency: number; // بالساعات
  critical_datasets: string[];
}

export interface VolumeMonitoringConfig {
  enabled: boolean;
  expected_volume_range: [number, number];
  check_frequency: number; // بالساعات
  anomaly_detection: boolean;
}

export interface AlertingConfig {
  enabled: boolean;
  channels: AlertingChannel[];
  escalation_rules: EscalationRule[];
  notification_templates: NotificationTemplate[];
}

export interface AlertingChannel {
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  configuration: any;
  enabled: boolean;
}

export interface EscalationRule {
  condition: string;
  delay: number; // بالدقائق
  escalate_to: string[];
  max_escalations: number;
}

export interface NotificationTemplate {
  alert_type: string;
  template: string;
  variables: string[];
  format: 'text' | 'html' | 'markdown';
}

// إحصائيات نظام التوصيات
export interface RecommendationStatistics {
  usage_statistics: UsageStatistics;
  performance_statistics: PerformanceStatistics;
  quality_statistics: QualityStatistics;
  business_statistics: BusinessStatistics;
  user_statistics: UserStatistics;
}

export interface UsageStatistics {
  total_recommendations_served: number;
  unique_users_served: number;
  recommendations_per_user: number;
  algorithm_usage_distribution: AlgorithmUsage[];
  request_volume_trends: VolumeData[];
}

export interface AlgorithmUsage {
  algorithm: RecommendationAlgorithm;
  usage_count: number;
  success_rate: number;
  average_latency: number;
  user_satisfaction: number;
}

export interface VolumeData {
  timestamp: Date;
  request_count: number;
  unique_users: number;
  peak_concurrent_requests: number;
}

export interface PerformanceStatistics {
  average_response_time: number;
  percentile_response_times: PercentileData[];
  cache_hit_rates: CacheHitData[];
  error_rates: ErrorRateData[];
  throughput: ThroughputData[];
}

export interface PercentileData {
  percentile: number;
  response_time: number;
}

export interface CacheHitData {
  cache_level: string;
  hit_rate: number;
  miss_rate: number;
  eviction_rate: number;
}

export interface ErrorRateData {
  error_type: string;
  rate: number;
  count: number;
  impact_severity: 'low' | 'medium' | 'high';
}

export interface ThroughputData {
  timestamp: Date;
  requests_per_second: number;
  recommendations_per_second: number;
}

export interface QualityStatistics {
  precision_at_k: PrecisionData[];
  recall_at_k: RecallData[];
  ndcg_scores: NDCGData[];
  diversity_scores: DiversityData[];
  novelty_scores: NoveltyData[];
  coverage_statistics: CoverageData;
}

export interface PrecisionData {
  k: number;
  precision: number;
  algorithm: RecommendationAlgorithm;
  user_segment?: string;
}

export interface RecallData {
  k: number;
  recall: number;
  algorithm: RecommendationAlgorithm;
  user_segment?: string;
}

export interface NDCGData {
  k: number;
  ndcg: number;
  algorithm: RecommendationAlgorithm;
  user_segment?: string;
}

export interface DiversityData {
  diversity_type: 'intra_list' | 'temporal' | 'topical';
  score: number;
  algorithm: RecommendationAlgorithm;
}

export interface NoveltyData {
  novelty_type: 'popularity_based' | 'temporal' | 'user_specific';
  score: number;
  algorithm: RecommendationAlgorithm;
}

export interface CoverageData {
  item_coverage: number; // نسبة العناصر التي تم التوصية بها
  user_coverage: number; // نسبة المستخدمين الذين حصلوا على توصيات
  category_coverage: number; // نسبة الفئات المغطاة
  long_tail_coverage: number; // تغطية العناصر الأقل شعبية
}

export interface BusinessStatistics {
  engagement_metrics: EngagementMetrics;
  conversion_metrics: ConversionMetrics;
  revenue_impact: RevenueImpact;
  user_satisfaction: UserSatisfactionMetrics;
}

export interface EngagementMetrics {
  click_through_rate: number;
  view_through_rate: number;
  engagement_rate: number;
  time_spent: number;
  interaction_rate: number;
}

export interface ConversionMetrics {
  conversion_rate: number;
  conversion_value: number;
  conversion_attribution: AttributionData[];
  funnel_progression: FunnelData[];
}

export interface AttributionData {
  attribution_model: string;
  conversion_credit: number;
  time_to_conversion: number;
}

export interface FunnelData {
  stage: string;
  conversion_rate: number;
  drop_off_rate: number;
  stage_value: number;
}

export interface RevenueImpact {
  direct_revenue: number;
  attributed_revenue: number;
  revenue_per_recommendation: number;
  roi: number;
  revenue_growth: number;
}

export interface UserSatisfactionMetrics {
  satisfaction_score: number;
  nps_score: number;
  recommendation_acceptance_rate: number;
  user_feedback_scores: FeedbackScore[];
  retention_impact: RetentionData;
}

export interface FeedbackScore {
  feedback_type: string;
  average_score: number;
  response_count: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface RetentionData {
  retention_rate: number;
  churn_rate: number;
  lifetime_value_impact: number;
  engagement_correlation: number;
}

export interface UserStatistics {
  total_active_users: number;
  new_users: number;
  returning_users: number;
  user_segments: UserSegmentData[];
  user_journey_analytics: UserJourneyData[];
}

export interface UserSegmentData {
  segment_name: string;
  user_count: number;
  engagement_rate: number;
  satisfaction_score: number;
  conversion_rate: number;
}

export interface UserJourneyData {
  journey_stage: string;
  user_count: number;
  average_recommendations: number;
  success_rate: number;
  next_action_prediction: NextActionData[];
}

export interface NextActionData {
  action: string;
  probability: number;
  value_score: number;
}
