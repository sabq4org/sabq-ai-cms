/**
 * نظام تحسين الأداء - أنواع البيانات
 * Performance Optimization System - Type Definitions
 */

// Base types
export type PerformanceMetricType = 'response_time' | 'throughput' | 'memory_usage' | 'cpu_usage' | 'disk_io' | 'network_io' | 'database_queries' | 'cache_hit_rate';
export type OptimizationLevel = 'low' | 'medium' | 'high' | 'aggressive';
export type OptimizationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export type ResourceType = 'cpu' | 'memory' | 'disk' | 'network' | 'database' | 'cache';
export type OptimizationType = 'caching' | 'compression' | 'minification' | 'database_optimization' | 'image_optimization' | 'code_splitting' | 'lazy_loading';
export type MonitoringFrequency = 'real_time' | 'every_minute' | 'every_5_minutes' | 'every_15_minutes' | 'hourly';
export type ThresholdComparison = 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'greater_than_or_equal' | 'less_than_or_equal';

// Core interfaces
export interface PerformanceMetric {
  id: string;
  type: PerformanceMetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  component: string;
  category: string;
  threshold_warning?: number;
  threshold_critical?: number;
  tags: Record<string, string>;
}

export interface PerformanceSnapshot {
  id: string;
  timestamp: Date;
  metrics: PerformanceMetric[];
  overall_score: number;
  recommendations: OptimizationRecommendation[];
  alerts: PerformanceAlert[];
  system_info: SystemInfo;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  architecture: string;
  node_version: string;
  memory_total: number;
  memory_used: number;
  cpu_cores: number;
  cpu_usage: number;
  disk_space_total: number;
  disk_space_used: number;
  uptime: number;
  load_average: number[];
}

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  type: OptimizationType;
  enabled: boolean;
  priority: number;
  conditions: OptimizationCondition[];
  actions: OptimizationAction[];
  schedule: OptimizationSchedule;
  created_at: Date;
  updated_at: Date;
}

export interface OptimizationCondition {
  metric_type: PerformanceMetricType;
  comparison: ThresholdComparison;
  threshold: number;
  duration_minutes?: number;
  logical_operator?: 'AND' | 'OR';
}

export interface OptimizationAction {
  type: OptimizationType;
  parameters: Record<string, any>;
  rollback_enabled: boolean;
  max_impact_level: OptimizationLevel;
}

export interface OptimizationSchedule {
  enabled: boolean;
  frequency: MonitoringFrequency;
  time_windows: TimeWindow[];
  exclude_dates: string[];
  max_concurrent_optimizations: number;
}

export interface TimeWindow {
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
  days_of_week: number[]; // 0-6, Sunday to Saturday
  timezone: string;
}

export interface OptimizationError {
  id: string;
  type: 'configuration' | 'execution' | 'validation' | 'system';
  message: string;
  details: string;
  timestamp: Date;
  recoverable: boolean;
}

export interface OptimizationResult {
  id: string;
  rule_id: string;
  started_at: Date;
  completed_at: Date | null;
  status: OptimizationStatus;
  actions_performed: PerformedAction[];
  metrics_before: PerformanceMetric[];
  metrics_after: PerformanceMetric[];
  improvement_percentage: number;
  errors: OptimizationError[];
  rollback_info?: RollbackInfo;
}

export interface PerformedAction {
  action_type: OptimizationType;
  description: string;
  parameters: Record<string, any>;
  duration_ms: number;
  success: boolean;
  impact_level: OptimizationLevel;
  measurable_impact: MeasurableImpact;
}

export interface MeasurableImpact {
  response_time_improvement: number;
  memory_reduction: number;
  cpu_reduction: number;
  bandwidth_savings: number;
  cache_hit_improvement: number;
}

export interface RollbackInfo {
  enabled: boolean;
  rollback_point: Date;
  original_state: Record<string, any>;
  auto_rollback_conditions: RollbackCondition[];
}

export interface RollbackCondition {
  metric_type: PerformanceMetricType;
  threshold: number;
  comparison: ThresholdComparison;
  duration_minutes: number;
}

export interface PerformanceAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  metric_type: PerformanceMetricType;
  current_value: number;
  threshold_value: number;
  component: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  resolution_notes?: string;
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  type: OptimizationType;
  priority: number;
  estimated_impact: EstimatedImpact;
  effort_level: 'low' | 'medium' | 'high';
  risk_level: 'low' | 'medium' | 'high';
  implementation_steps: string[];
  related_metrics: PerformanceMetricType[];
  auto_implementable: boolean;
}

export interface EstimatedImpact {
  response_time_improvement: number;
  memory_savings: number;
  cpu_savings: number;
  bandwidth_savings: number;
  user_experience_score: number;
}

export interface CacheConfiguration {
  enabled: boolean;
  strategy: CacheStrategy;
  ttl_seconds: number;
  max_size_mb: number;
  compression_enabled: boolean;
  cache_headers: CacheHeaders;
  invalidation_rules: CacheInvalidationRule[];
}

export interface CacheStrategy {
  type: 'memory' | 'redis' | 'filesystem' | 'cdn';
  eviction_policy: 'lru' | 'lfu' | 'fifo' | 'ttl';
  warm_up_enabled: boolean;
  prefetch_patterns: string[];
}

export interface CacheHeaders {
  cache_control: string;
  max_age: number;
  etag_enabled: boolean;
  vary_headers: string[];
}

export interface CacheInvalidationRule {
  pattern: string;
  events: string[];
  cascade: boolean;
}

export interface CompressionConfiguration {
  enabled: boolean;
  algorithms: CompressionAlgorithm[];
  min_file_size: number;
  file_types: string[];
  compression_level: number;
  dynamic_compression: boolean;
}

export interface CompressionAlgorithm {
  name: 'gzip' | 'brotli' | 'deflate';
  enabled: boolean;
  priority: number;
  compression_level: number;
}

export interface DatabaseOptimization {
  enabled: boolean;
  query_optimization: QueryOptimization;
  indexing: IndexOptimization;
  connection_pooling: ConnectionPooling;
  caching: DatabaseCaching;
}

export interface QueryOptimization {
  enabled: boolean;
  slow_query_threshold_ms: number;
  explain_plan_analysis: boolean;
  query_rewriting: boolean;
  batch_optimization: boolean;
}

export interface IndexOptimization {
  enabled: boolean;
  auto_index_creation: boolean;
  unused_index_removal: boolean;
  index_fragmentation_threshold: number;
  composite_index_suggestions: boolean;
}

export interface ConnectionPooling {
  enabled: boolean;
  min_connections: number;
  max_connections: number;
  idle_timeout_ms: number;
  connection_validation: boolean;
}

export interface DatabaseCaching {
  enabled: boolean;
  query_result_cache: boolean;
  prepared_statement_cache: boolean;
  metadata_cache: boolean;
  cache_size_mb: number;
}

export interface ImageOptimization {
  enabled: boolean;
  formats: ImageFormat[];
  quality_settings: QualitySettings;
  responsive_images: ResponsiveImageConfig;
  lazy_loading: LazyLoadingConfig;
}

export interface ImageFormat {
  name: 'webp' | 'avif' | 'jpeg' | 'png' | 'svg';
  enabled: boolean;
  fallback_format?: string;
  quality: number;
}

export interface QualitySettings {
  high_quality: number;
  medium_quality: number;
  low_quality: number;
  thumbnail_quality: number;
}

export interface ResponsiveImageConfig {
  enabled: boolean;
  breakpoints: number[];
  sizes_attribute: string;
  auto_webp: boolean;
}

export interface LazyLoadingConfig {
  enabled: boolean;
  threshold: number;
  placeholder_type: 'blur' | 'skeleton' | 'color';
  fade_in_animation: boolean;
}

export interface CodeOptimization {
  enabled: boolean;
  minification: MinificationConfig;
  bundling: BundlingConfig;
  tree_shaking: boolean;
  dead_code_elimination: boolean;
  code_splitting: CodeSplittingConfig;
}

export interface MinificationConfig {
  javascript: boolean;
  css: boolean;
  html: boolean;
  remove_comments: boolean;
  remove_whitespace: boolean;
  mangle_names: boolean;
}

export interface BundlingConfig {
  enabled: boolean;
  strategy: 'single' | 'vendor' | 'route_based' | 'component_based';
  chunk_size_limit: number;
  common_chunks: boolean;
}

export interface CodeSplittingConfig {
  enabled: boolean;
  route_based: boolean;
  component_based: boolean;
  dynamic_imports: boolean;
  lazy_components: string[];
}

export interface MonitoringConfiguration {
  enabled: boolean;
  frequency: MonitoringFrequency;
  metrics_retention_days: number;
  real_time_alerts: boolean;
  alert_channels: AlertChannel[];
  dashboard_refresh_interval: number;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  enabled: boolean;
  configuration: Record<string, any>;
  severity_filter: AlertSeverity[];
}

export interface PerformanceBudget {
  id: string;
  name: string;
  description: string;
  metrics: BudgetMetric[];
  enforcement_level: 'warning' | 'error' | 'blocking';
  created_at: Date;
  updated_at: Date;
}

export interface BudgetMetric {
  type: PerformanceMetricType;
  threshold: number;
  unit: string;
  tolerance_percentage: number;
}

export interface PerformanceReport {
  id: string;
  period_start: Date;
  period_end: Date;
  summary: PerformanceSummary;
  metrics_trend: MetricsTrend[];
  optimizations_performed: OptimizationSummary[];
  alerts_summary: AlertsSummary;
  recommendations: OptimizationRecommendation[];
  budget_compliance: BudgetCompliance[];
}

export interface PerformanceSummary {
  overall_score: number;
  score_change: number;
  total_optimizations: number;
  performance_improvement: number;
  cost_savings: CostSavings;
  user_experience_metrics: UserExperienceMetrics;
}

export interface CostSavings {
  bandwidth_savings_gb: number;
  server_cost_reduction: number;
  cdn_cost_reduction: number;
  estimated_monthly_savings: number;
}

export interface UserExperienceMetrics {
  page_load_time: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
  cumulative_layout_shift: number;
  first_input_delay: number;
}

export interface MetricsTrend {
  metric_type: PerformanceMetricType;
  values: TrendDataPoint[];
  trend_direction: 'improving' | 'degrading' | 'stable';
  change_percentage: number;
}

export interface TrendDataPoint {
  timestamp: Date;
  value: number;
  annotation?: string;
}

export interface OptimizationSummary {
  type: OptimizationType;
  count: number;
  success_rate: number;
  average_improvement: number;
  total_impact: MeasurableImpact;
}

export interface AlertsSummary {
  total_alerts: number;
  critical_alerts: number;
  warning_alerts: number;
  resolved_alerts: number;
  average_resolution_time: number;
}

export interface BudgetCompliance {
  budget_id: string;
  budget_name: string;
  compliance_percentage: number;
  violations: BudgetViolation[];
}

export interface BudgetViolation {
  metric_type: PerformanceMetricType;
  actual_value: number;
  budget_value: number;
  violation_percentage: number;
  timestamp: Date;
}

// Service interfaces
export interface PerformanceMonitor {
  start_monitoring(): Promise<void>;
  stop_monitoring(): Promise<void>;
  get_current_metrics(): Promise<PerformanceMetric[]>;
  get_system_info(): Promise<SystemInfo>;
  take_snapshot(): Promise<PerformanceSnapshot>;
  get_metrics_history(start_date: Date, end_date: Date): Promise<PerformanceMetric[]>;
}

export interface OptimizationEngine {
  evaluate_optimization_opportunities(): Promise<OptimizationRecommendation[]>;
  execute_optimization(rule_id: string): Promise<OptimizationResult>;
  rollback_optimization(result_id: string): Promise<boolean>;
  get_optimization_history(): Promise<OptimizationResult[]>;
  validate_optimization_rule(rule: OptimizationRule): Promise<ValidationResult>;
}

export interface CacheManager {
  configure_cache(config: CacheConfiguration): Promise<void>;
  invalidate_cache(pattern: string): Promise<void>;
  get_cache_stats(): Promise<CacheStats>;
  warm_up_cache(urls: string[]): Promise<void>;
  optimize_cache_performance(): Promise<CacheOptimizationResult>;
}

export interface CacheStats {
  hit_rate: number;
  miss_rate: number;
  eviction_rate: number;
  memory_usage: number;
  total_requests: number;
  cache_size: number;
}

export interface CacheOptimizationResult {
  optimizations_applied: string[];
  performance_improvement: number;
  memory_savings: number;
  recommendations: string[];
}

export interface DatabaseOptimizer {
  analyze_query_performance(): Promise<QueryAnalysis[]>;
  optimize_indexes(): Promise<IndexOptimizationResult>;
  configure_connection_pool(config: ConnectionPooling): Promise<void>;
  get_database_metrics(): Promise<DatabaseMetrics>;
}

export interface QueryAnalysis {
  query: string;
  execution_time_ms: number;
  rows_examined: number;
  rows_returned: number;
  optimization_suggestions: string[];
  index_recommendations: string[];
}

export interface IndexOptimizationResult {
  indexes_created: string[];
  indexes_removed: string[];
  performance_improvement: number;
  space_savings: number;
}

export interface DatabaseMetrics {
  query_count: number;
  slow_queries: number;
  average_response_time: number;
  connection_pool_utilization: number;
  cache_hit_rate: number;
  index_efficiency: number;
}

export interface ImageProcessor {
  optimize_image(image_path: string, options: ImageOptimizationOptions): Promise<ImageOptimizationResult>;
  batch_optimize_images(paths: string[]): Promise<BatchOptimizationResult>;
  configure_responsive_images(config: ResponsiveImageConfig): Promise<void>;
  get_image_stats(): Promise<ImageStats>;
}

export interface ImageOptimizationOptions {
  format?: string;
  quality?: number;
  width?: number;
  height?: number;
  progressive?: boolean;
  lossless?: boolean;
}

export interface ImageOptimizationResult {
  original_size: number;
  optimized_size: number;
  compression_ratio: number;
  format_used: string;
  processing_time_ms: number;
}

export interface BatchOptimizationResult {
  total_images: number;
  processed_images: number;
  failed_images: number;
  total_size_reduction: number;
  average_compression_ratio: number;
  processing_time_ms: number;
}

export interface ImageStats {
  total_images: number;
  total_size_mb: number;
  average_size_kb: number;
  format_distribution: Record<string, number>;
  optimization_potential_mb: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Main service interface
export interface PerformanceOptimizationService {
  // Monitoring
  start_performance_monitoring(): Promise<void>;
  stop_performance_monitoring(): Promise<void>;
  get_current_performance(): Promise<PerformanceSnapshot>;
  get_performance_history(start_date: Date, end_date: Date): Promise<PerformanceSnapshot[]>;

  // Optimization Rules
  create_optimization_rule(rule: Omit<OptimizationRule, 'id' | 'created_at' | 'updated_at'>): Promise<OptimizationRule>;
  update_optimization_rule(id: string, updates: Partial<OptimizationRule>): Promise<OptimizationRule>;
  delete_optimization_rule(id: string): Promise<boolean>;
  get_optimization_rules(): Promise<OptimizationRule[]>;

  // Optimization Execution
  execute_optimization(rule_id: string): Promise<OptimizationResult>;
  get_optimization_results(): Promise<OptimizationResult[]>;
  rollback_optimization(result_id: string): Promise<boolean>;

  // Recommendations
  get_optimization_recommendations(): Promise<OptimizationRecommendation[]>;
  implement_recommendation(recommendation_id: string): Promise<OptimizationResult>;

  // Alerts
  get_active_alerts(): Promise<PerformanceAlert[]>;
  acknowledge_alert(alert_id: string): Promise<void>;
  resolve_alert(alert_id: string, notes: string): Promise<void>;

  // Caching
  configure_caching(config: CacheConfiguration): Promise<void>;
  get_cache_performance(): Promise<CacheStats>;
  invalidate_cache(pattern: string): Promise<void>;

  // Database optimization
  optimize_database(): Promise<DatabaseOptimizationResult>;
  get_database_performance(): Promise<DatabaseMetrics>;

  // Image optimization
  optimize_images(paths: string[]): Promise<BatchOptimizationResult>;
  get_image_optimization_stats(): Promise<ImageStats>;

  // Reports
  generate_performance_report(start_date: Date, end_date: Date): Promise<PerformanceReport>;
  export_performance_data(format: 'json' | 'csv' | 'excel'): Promise<string>;

  // Configuration
  get_optimization_config(): Promise<OptimizationConfiguration>;
  update_optimization_config(config: Partial<OptimizationConfiguration>): Promise<OptimizationConfiguration>;
}

export interface OptimizationConfiguration {
  monitoring: MonitoringConfiguration;
  caching: CacheConfiguration;
  compression: CompressionConfiguration;
  database: DatabaseOptimization;
  images: ImageOptimization;
  code: CodeOptimization;
  performance_budgets: PerformanceBudget[];
}

export interface DatabaseOptimizationResult {
  query_optimizations: number;
  indexes_optimized: number;
  performance_improvement: number;
  recommendations: string[];
}

// Constants
export const DEFAULT_PERFORMANCE_THRESHOLDS = {
  response_time_warning: 1000,    // 1 second
  response_time_critical: 3000,   // 3 seconds
  memory_usage_warning: 80,       // 80%
  memory_usage_critical: 95,      // 95%
  cpu_usage_warning: 70,          // 70%
  cpu_usage_critical: 90,         // 90%
  cache_hit_rate_warning: 70,     // 70%
  cache_hit_rate_critical: 50,    // 50%
} as const;

export const OPTIMIZATION_PRIORITIES = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4
} as const;

export const METRIC_UNITS = {
  response_time: 'ms',
  throughput: 'req/s',
  memory_usage: 'MB',
  cpu_usage: '%',
  disk_io: 'MB/s',
  network_io: 'MB/s',
  database_queries: 'queries/s',
  cache_hit_rate: '%'
} as const;
