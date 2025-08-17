/**
 * نظام التكامل مع البيانات الخارجية - أنواع البيانات
 * External Data Integration System - Type Definitions
 */

export interface ExternalDataSource {
  id: string;
  name: string;
  type: DataSourceType;
  description: string;
  provider: DataProvider;
  configuration: DataSourceConfiguration;
  status: DataSourceStatus;
  authentication: AuthenticationConfig;
  sync_settings: SyncSettings;
  data_mapping: DataMapping;
  rate_limits: RateLimits;
  created_at: Date;
  updated_at: Date;
  last_sync: Date | null;
  next_sync: Date | null;
}

export interface DataSourceConfiguration {
  endpoint_url: string;
  version: string;
  format: DataFormat;
  compression: CompressionType;
  encryption: EncryptionConfig;
  timeout: number;
  retry_policy: RetryPolicy;
  batch_size: number;
  headers: Record<string, string>;
  query_parameters: Record<string, any>;
  webhook_settings?: WebhookSettings;
}

export interface AuthenticationConfig {
  type: AuthenticationType;
  credentials: AuthCredentials;
  token_refresh: TokenRefreshConfig;
  security_settings: SecuritySettings;
}

export interface AuthCredentials {
  api_key?: string;
  secret_key?: string;
  access_token?: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
  username?: string;
  password?: string;
  certificate?: string;
  private_key?: string;
}

export interface SyncSettings {
  frequency: SyncFrequency;
  schedule: SyncSchedule;
  mode: SyncMode;
  conflict_resolution: ConflictResolution;
  data_validation: DataValidation;
  error_handling: ErrorHandling;
  monitoring: SyncMonitoring;
}

export interface DataMapping {
  source_schema: SchemaDefinition;
  target_schema: SchemaDefinition;
  field_mappings: FieldMapping[];
  transformations: DataTransformation[];
  validation_rules: ValidationRule[];
  default_values: Record<string, any>;
}

export interface SyncResult {
  sync_id: string;
  data_source_id: string;
  started_at: Date;
  completed_at: Date | null;
  status: SyncStatus;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_deleted: number;
  records_failed: number;
  errors: SyncError[];
  warnings: SyncWarning[];
  performance_metrics: PerformanceMetrics;
  data_quality_report: DataQualityReport;
}

export interface DataIntegrationPipeline {
  id: string;
  name: string;
  description: string;
  data_sources: string[];
  stages: PipelineStage[];
  schedule: PipelineSchedule;
  dependencies: PipelineDependency[];
  monitoring: PipelineMonitoring;
  notifications: NotificationSettings;
  status: PipelineStatus;
  created_at: Date;
  updated_at: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  type: StageType;
  configuration: StageConfiguration;
  inputs: StageInput[];
  outputs: StageOutput[];
  transformations: DataTransformation[];
  validation: StageValidation;
  error_handling: StageErrorHandling;
  dependencies: string[];
}

export interface DataTransformation {
  id: string;
  name: string;
  type: TransformationType;
  source_field: string;
  target_field: string;
  transformation_logic: TransformationLogic;
  parameters: Record<string, any>;
  validation: TransformationValidation;
}

export interface DataValidator {
  validate_data_format(data: any, schema: SchemaDefinition): ValidationResult;
  validate_data_quality(data: any[], rules: DataQualityRule[]): QualityReport;
  validate_business_rules(data: any[], rules: BusinessRule[]): BusinessValidationResult;
  validate_data_integrity(data: any[], constraints: IntegrityConstraint[]): IntegrityReport;
}

export interface ExternalAPIClient {
  data_source: ExternalDataSource;
  fetch_data(params: FetchParams): Promise<APIResponse>;
  authenticate(): Promise<AuthenticationResult>;
  refresh_token(): Promise<TokenRefreshResult>;
  handle_rate_limits(): Promise<void>;
  monitor_api_health(): Promise<HealthStatus>;
}

export interface DataSynchronizer {
  sync_data_source(source_id: string, options?: SyncOptions): Promise<SyncResult>;
  bulk_sync(source_ids: string[], options?: BulkSyncOptions): Promise<BulkSyncResult>;
  schedule_sync(source_id: string, schedule: SyncSchedule): Promise<ScheduleResult>;
  cancel_sync(sync_id: string): Promise<CancelResult>;
  monitor_sync_progress(sync_id: string): Promise<SyncProgress>;
}

export interface DataProcessor {
  process_raw_data(data: any[], mapping: DataMapping): Promise<ProcessedData>;
  apply_transformations(data: any[], transformations: DataTransformation[]): Promise<TransformedData>;
  validate_processed_data(data: ProcessedData, rules: ValidationRule[]): Promise<ValidationResult>;
  merge_data_sources(datasets: ProcessedData[], strategy: MergeStrategy): Promise<MergedData>;
}

export interface ConflictResolver {
  resolve_conflicts(conflicts: DataConflict[]): Promise<ConflictResolution>;
  detect_duplicates(data: any[], rules: DuplicationRule[]): Promise<DuplicateReport>;
  merge_duplicates(duplicates: DuplicateGroup[], strategy: MergeStrategy): Promise<MergedData>;
  handle_schema_conflicts(schemas: SchemaDefinition[]): Promise<UnifiedSchema>;
}

// Enums and Constants
export const DATA_SOURCE_TYPES = {
  REST_API: 'rest_api',
  GRAPHQL_API: 'graphql_api',
  SOAP_API: 'soap_api',
  DATABASE: 'database',
  FILE_SYSTEM: 'file_system',
  CLOUD_STORAGE: 'cloud_storage',
  MESSAGE_QUEUE: 'message_queue',
  WEBHOOK: 'webhook',
  FTP: 'ftp',
  EMAIL: 'email',
  RSS_FEED: 'rss_feed',
  CSV_FILE: 'csv_file',
  JSON_FILE: 'json_file',
  XML_FILE: 'xml_file',
  EXCEL_FILE: 'excel_file'
} as const;

export const DATA_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  SALESFORCE: 'salesforce',
  HUBSPOT: 'hubspot',
  MAILCHIMP: 'mailchimp',
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  SHOPIFY: 'shopify',
  WORDPRESS: 'wordpress',
  ZAPIER: 'zapier',
  CUSTOM: 'custom'
} as const;

export const SYNC_FREQUENCIES = {
  REAL_TIME: 'real_time',
  EVERY_MINUTE: 'every_minute',
  EVERY_5_MINUTES: 'every_5_minutes',
  EVERY_15_MINUTES: 'every_15_minutes',
  EVERY_30_MINUTES: 'every_30_minutes',
  HOURLY: 'hourly',
  EVERY_6_HOURS: 'every_6_hours',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  MANUAL: 'manual'
} as const;

export const SYNC_MODES = {
  FULL_SYNC: 'full_sync',
  INCREMENTAL: 'incremental',
  DIFFERENTIAL: 'differential',
  MERGE: 'merge',
  REPLACE: 'replace',
  APPEND: 'append'
} as const;

export const AUTHENTICATION_TYPES = {
  API_KEY: 'api_key',
  OAUTH1: 'oauth1',
  OAUTH2: 'oauth2',
  BASIC_AUTH: 'basic_auth',
  BEARER_TOKEN: 'bearer_token',
  JWT: 'jwt',
  CERTIFICATE: 'certificate',
  CUSTOM: 'custom',
  NONE: 'none'
} as const;

export const DATA_FORMATS = {
  JSON: 'json',
  XML: 'xml',
  CSV: 'csv',
  TSV: 'tsv',
  EXCEL: 'excel',
  PARQUET: 'parquet',
  AVRO: 'avro',
  PROTOBUF: 'protobuf',
  BINARY: 'binary'
} as const;

export const TRANSFORMATION_TYPES = {
  FIELD_MAPPING: 'field_mapping',
  DATA_TYPE_CONVERSION: 'data_type_conversion',
  VALUE_TRANSFORMATION: 'value_transformation',
  AGGREGATION: 'aggregation',
  FILTERING: 'filtering',
  SORTING: 'sorting',
  GROUPING: 'grouping',
  CALCULATION: 'calculation',
  LOOKUP: 'lookup',
  CUSTOM_FUNCTION: 'custom_function'
} as const;

export const SYNC_STATUSES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PAUSED: 'paused',
  SCHEDULED: 'scheduled'
} as const;

export const DATA_SOURCE_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
  MAINTENANCE: 'maintenance',
  DEPRECATED: 'deprecated'
} as const;

export const PIPELINE_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused'
} as const;

// Additional interfaces for complex operations
export interface WebhookSettings {
  enabled: boolean;
  endpoint_url: string;
  secret_key: string;
  events: WebhookEvent[];
  retry_policy: RetryPolicy;
  security: WebhookSecurity;
}

export interface TokenRefreshConfig {
  enabled: boolean;
  threshold_minutes: number;
  refresh_endpoint: string;
  auto_refresh: boolean;
}

export interface SecuritySettings {
  ip_whitelist: string[];
  user_agent: string;
  ssl_verification: boolean;
  encryption_at_rest: boolean;
  encryption_in_transit: boolean;
}

export interface SyncSchedule {
  enabled: boolean;
  timezone: string;
  start_time: string;
  end_time?: string;
  days_of_week: number[];
  days_of_month: number[];
  exclude_dates: string[];
}

export interface DataValidation {
  enabled: boolean;
  schema_validation: boolean;
  data_quality_checks: boolean;
  business_rules: boolean;
  custom_validators: string[];
}

export interface ErrorHandling {
  on_error: ErrorAction;
  max_retries: number;
  retry_delay: number;
  exponential_backoff: boolean;
  dead_letter_queue: boolean;
  notification_settings: NotificationSettings;
}

export interface SyncMonitoring {
  enabled: boolean;
  metrics_collection: boolean;
  performance_tracking: boolean;
  error_tracking: boolean;
  audit_logging: boolean;
}

export interface PerformanceMetrics {
  duration_ms: number;
  throughput_rps: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  network_io_bytes: number;
  disk_io_bytes: number;
}

export interface DataQualityReport {
  total_records: number;
  valid_records: number;
  invalid_records: number;
  duplicate_records: number;
  missing_required_fields: number;
  data_type_errors: number;
  business_rule_violations: number;
  quality_score: number;
}

export interface SyncError {
  id: string;
  type: ErrorType;
  message: string;
  field: string;
  record_id: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context: Record<string, any>;
}

export interface SyncWarning {
  id: string;
  type: WarningType;
  message: string;
  field: string;
  record_id: string;
  timestamp: Date;
  context: Record<string, any>;
}

export interface FieldMapping {
  source_field: string;
  target_field: string;
  transformation?: DataTransformation;
  required: boolean;
  default_value?: any;
  validation_rules: ValidationRule[];
}

export interface ValidationRule {
  id: string;
  name: string;
  type: ValidationType;
  parameters: Record<string, any>;
  error_message: string;
  severity: ValidationSeverity;
}

export interface SchemaDefinition {
  fields: FieldDefinition[];
  relationships: RelationshipDefinition[];
  constraints: ConstraintDefinition[];
  indexes: IndexDefinition[];
}

export interface FieldDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  default_value?: any;
  constraints: FieldConstraint[];
  description: string;
}

export interface RetryPolicy {
  max_retries: number;
  initial_delay_ms: number;
  max_delay_ms: number;
  exponential_backoff: boolean;
  jitter: boolean;
}

export interface RateLimits {
  requests_per_second: number;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  burst_limit: number;
  concurrent_requests: number;
}

export interface FetchParams {
  filters?: Record<string, any>;
  pagination?: PaginationParams;
  sorting?: SortingParams;
  fields?: string[];
  include_metadata?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface SortingParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface APIResponse {
  data: any[];
  metadata: ResponseMetadata;
  pagination?: PaginationInfo;
  errors?: APIError[];
  warnings?: APIWarning[];
}

export interface ResponseMetadata {
  total_count: number;
  request_id: string;
  timestamp: Date;
  api_version: string;
  rate_limit: RateLimitInfo;
}

export interface RateLimitInfo {
  remaining: number;
  reset_time: Date;
  limit: number;
}

export interface SyncOptions {
  mode?: SyncMode;
  force?: boolean;
  dry_run?: boolean;
  batch_size?: number;
  parallel_threads?: number;
  timeout_ms?: number;
}

export interface BulkSyncOptions extends SyncOptions {
  priority_order?: string[];
  fail_fast?: boolean;
  max_concurrent_syncs?: number;
}

export interface ProcessedData {
  records: any[];
  metadata: ProcessingMetadata;
  transformations_applied: string[];
  validation_results: ValidationResult[];
}

export interface ProcessingMetadata {
  source_count: number;
  processed_count: number;
  filtered_count: number;
  transformed_count: number;
  processing_time_ms: number;
}

export interface TransformedData extends ProcessedData {
  transformation_log: TransformationLog[];
}

export interface MergedData extends ProcessedData {
  merge_strategy: MergeStrategy;
  conflict_resolutions: ConflictResolution[];
  source_weights: Record<string, number>;
}

export interface DataConflict {
  field: string;
  record_id: string;
  values: ConflictValue[];
  resolution_strategy: ConflictResolutionStrategy;
}

export interface ConflictValue {
  source: string;
  value: any;
  confidence: number;
  timestamp: Date;
}

export interface DuplicateGroup {
  records: any[];
  similarity_score: number;
  matching_fields: string[];
  merge_strategy: MergeStrategy;
}

export interface IntegrationConfiguration {
  data_sources: ExternalDataSource[];
  pipelines: DataIntegrationPipeline[];
  global_settings: GlobalIntegrationSettings;
  monitoring: IntegrationMonitoring;
  security: IntegrationSecurity;
}

export interface GlobalIntegrationSettings {
  default_timeout: number;
  max_concurrent_syncs: number;
  default_retry_policy: RetryPolicy;
  default_rate_limits: RateLimits;
  enable_caching: boolean;
  cache_duration: number;
  enable_compression: boolean;
  enable_encryption: boolean;
}

export interface IntegrationMonitoring {
  metrics_retention_days: number;
  alert_thresholds: AlertThreshold[];
  notification_channels: NotificationChannel[];
  dashboard_settings: DashboardSettings;
}

export interface IntegrationSecurity {
  encryption_key: string;
  api_key_rotation_days: number;
  audit_logging: boolean;
  access_control: AccessControlSettings;
  compliance_settings: ComplianceSettings;
}

// Type aliases for cleaner code
export type DataSourceType = typeof DATA_SOURCE_TYPES[keyof typeof DATA_SOURCE_TYPES];
export type DataProvider = typeof DATA_PROVIDERS[keyof typeof DATA_PROVIDERS];
export type SyncFrequency = typeof SYNC_FREQUENCIES[keyof typeof SYNC_FREQUENCIES];
export type SyncMode = typeof SYNC_MODES[keyof typeof SYNC_MODES];
export type AuthenticationType = typeof AUTHENTICATION_TYPES[keyof typeof AUTHENTICATION_TYPES];
export type DataFormat = typeof DATA_FORMATS[keyof typeof DATA_FORMATS];
export type TransformationType = typeof TRANSFORMATION_TYPES[keyof typeof TRANSFORMATION_TYPES];
export type SyncStatus = typeof SYNC_STATUSES[keyof typeof SYNC_STATUSES];
export type DataSourceStatus = typeof DATA_SOURCE_STATUSES[keyof typeof DATA_SOURCE_STATUSES];
export type PipelineStatus = typeof PIPELINE_STATUSES[keyof typeof PIPELINE_STATUSES];

// Additional type definitions for specific providers
export interface GoogleAnalyticsConfig extends DataSourceConfiguration {
  view_id: string;
  property_id: string;
  metrics: string[];
  dimensions: string[];
  date_ranges: DateRange[];
}

export interface FacebookConfig extends DataSourceConfiguration {
  page_id: string;
  app_id: string;
  fields: string[];
  insights_metrics: string[];
}

export interface TwitterConfig extends DataSourceConfiguration {
  user_id: string;
  tweet_fields: string[];
  user_fields: string[];
  expansions: string[];
}

export interface StripeConfig extends DataSourceConfiguration {
  webhook_endpoints: string[];
  event_types: string[];
  expand_objects: string[];
}

export interface DatabaseConfig extends DataSourceConfiguration {
  host: string;
  port: number;
  database: string;
  schema?: string;
  table: string;
  query?: string;
  connection_pool_size: number;
}

export interface FileSystemConfig extends DataSourceConfiguration {
  path: string;
  file_pattern: string;
  recursive: boolean;
  watch_mode: boolean;
  compression_format?: CompressionType;
}

export interface CloudStorageConfig extends DataSourceConfiguration {
  bucket: string;
  prefix?: string;
  region: string;
  storage_class?: string;
  lifecycle_policy?: any;
}

// Advanced types for machine learning integration
export interface MLDataProcessor {
  feature_extraction: FeatureExtractionConfig;
  data_preprocessing: DataPreprocessingConfig;
  model_prediction: ModelPredictionConfig;
  anomaly_detection: AnomalyDetectionConfig;
}

export interface FeatureExtractionConfig {
  enabled: boolean;
  extractors: FeatureExtractor[];
  output_format: DataFormat;
  normalization: NormalizationConfig;
}

export interface DataPreprocessingConfig {
  cleaning_rules: CleaningRule[];
  transformation_pipeline: TransformationPipeline;
  validation_pipeline: ValidationPipeline;
  quality_thresholds: QualityThreshold[];
}

export interface ModelPredictionConfig {
  models: PredictionModel[];
  ensemble_method: EnsembleMethod;
  confidence_threshold: number;
  output_schema: SchemaDefinition;
}

export interface AnomalyDetectionConfig {
  algorithms: AnomalyDetectionAlgorithm[];
  sensitivity: number;
  training_period_days: number;
  alert_thresholds: AlertThreshold[];
}

// Comprehensive error handling and monitoring
export interface IntegrationHealthMonitor {
  check_data_source_health(source_id: string): Promise<HealthStatus>;
  monitor_sync_performance(sync_id: string): Promise<PerformanceReport>;
  detect_data_quality_issues(data: any[]): Promise<QualityIssueReport>;
  generate_integration_report(): Promise<IntegrationReport>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  response_time_ms: number;
  error_rate: number;
  last_successful_sync: Date;
  issues: HealthIssue[];
}

export interface PerformanceReport {
  sync_id: string;
  duration_ms: number;
  records_per_second: number;
  memory_usage: MemoryUsage;
  cpu_usage: number;
  network_stats: NetworkStats;
  bottlenecks: PerformanceBottleneck[];
}

export interface QualityIssueReport {
  total_issues: number;
  critical_issues: number;
  warning_issues: number;
  issue_categories: QualityIssueCategory[];
  recommendations: QualityRecommendation[];
}

export interface IntegrationReport {
  period: ReportPeriod;
  summary: IntegrationSummary;
  data_sources: DataSourceReport[];
  pipelines: PipelineReport[];
  performance: OverallPerformance;
  issues: IssuesSummary;
  recommendations: SystemRecommendation[];
}

// Real-time streaming support
export interface StreamingDataProcessor {
  start_stream(source_id: string, config: StreamConfig): Promise<StreamSession>;
  stop_stream(session_id: string): Promise<void>;
  process_stream_event(event: StreamEvent): Promise<ProcessingResult>;
  handle_stream_error(error: StreamError): Promise<void>;
}

export interface StreamConfig {
  buffer_size: number;
  batch_interval_ms: number;
  max_retries: number;
  checkpointing: CheckpointConfig;
  backpressure_handling: BackpressureConfig;
}

export interface StreamEvent {
  id: string;
  source: string;
  timestamp: Date;
  data: any;
  metadata: EventMetadata;
}

export interface StreamSession {
  id: string;
  source_id: string;
  started_at: Date;
  status: StreamStatus;
  events_processed: number;
  last_checkpoint: Date;
}

// Advanced caching and optimization
export interface DataCacheManager {
  cache_data(key: string, data: any, ttl?: number): Promise<void>;
  get_cached_data(key: string): Promise<any | null>;
  invalidate_cache(pattern: string): Promise<void>;
  optimize_cache_performance(): Promise<CacheOptimizationReport>;
}

export interface CacheOptimizationReport {
  hit_rate: number;
  miss_rate: number;
  eviction_rate: number;
  memory_usage: number;
  recommendations: CacheRecommendation[];
}

// Integration testing and validation
export interface IntegrationTester {
  test_data_source_connection(source_id: string): Promise<ConnectionTestResult>;
  validate_data_mapping(mapping: DataMapping): Promise<MappingValidationResult>;
  run_integration_test_suite(): Promise<TestSuiteResult>;
  simulate_sync_scenario(scenario: SyncScenario): Promise<SimulationResult>;
}

export interface ConnectionTestResult {
  success: boolean;
  response_time_ms: number;
  error_message?: string;
  api_version?: string;
  rate_limit_info?: RateLimitInfo;
}

export interface MappingValidationResult {
  valid: boolean;
  errors: MappingError[];
  warnings: MappingWarning[];
  coverage_percentage: number;
}

export interface TestSuiteResult {
  tests_run: number;
  tests_passed: number;
  tests_failed: number;
  coverage_percentage: number;
  test_results: TestResult[];
  execution_time_ms: number;
}

// Export main service interface
export interface ExternalDataIntegrationService {
  // Data source management
  create_data_source(config: ExternalDataSource): Promise<ExternalDataSource>;
  update_data_source(id: string, config: Partial<ExternalDataSource>): Promise<ExternalDataSource>;
  delete_data_source(id: string): Promise<void>;
  get_data_source(id: string): Promise<ExternalDataSource>;
  list_data_sources(filters?: DataSourceFilters): Promise<ExternalDataSource[]>;

  // Synchronization operations
  sync_data_source(source_id: string, options?: SyncOptions): Promise<SyncResult>;
  schedule_sync(source_id: string, schedule: SyncSchedule): Promise<ScheduleResult>;
  cancel_sync(sync_id: string): Promise<void>;
  get_sync_status(sync_id: string): Promise<SyncProgress>;
  get_sync_history(source_id: string, limit?: number): Promise<SyncResult[]>;

  // Pipeline management
  create_pipeline(config: DataIntegrationPipeline): Promise<DataIntegrationPipeline>;
  run_pipeline(pipeline_id: string): Promise<PipelineResult>;
  monitor_pipeline(pipeline_id: string): Promise<PipelineStatus>;

  // Data processing
  transform_data(data: any[], transformations: DataTransformation[]): Promise<TransformedData>;
  validate_data(data: any[], rules: ValidationRule[]): Promise<ValidationResult>;
  merge_data_sources(source_ids: string[], strategy: MergeStrategy): Promise<MergedData>;

  // Monitoring and health
  get_integration_health(): Promise<IntegrationHealthReport>;
  get_performance_metrics(period: TimePeriod): Promise<PerformanceMetrics>;
  generate_integration_report(period: ReportPeriod): Promise<IntegrationReport>;
}
