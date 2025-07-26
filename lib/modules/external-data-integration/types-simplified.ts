/**
 * نظام التكامل مع البيانات الخارجية - أنواع البيانات المبسطة
 * External Data Integration System - Simplified Type Definitions
 */

// Base types
export type CompressionType = 'gzip' | 'deflate' | 'brotli' | 'none';
export type DataFormat = 'json' | 'xml' | 'csv' | 'excel' | 'binary';
export type AuthenticationType = 'api_key' | 'oauth2' | 'basic_auth' | 'bearer_token' | 'none';
export type SyncFrequency = 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual';
export type SyncMode = 'full_sync' | 'incremental' | 'merge' | 'replace';
export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type DataSourceStatus = 'active' | 'inactive' | 'error' | 'maintenance';
export type DataSourceType = 'rest_api' | 'database' | 'file_system' | 'webhook' | 'custom';
export type DataProvider = 'google' | 'facebook' | 'twitter' | 'stripe' | 'custom';
export type TransformationType = 'field_mapping' | 'data_conversion' | 'calculation' | 'filtering';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ValidationType = 'required' | 'format' | 'range' | 'custom';
export type ValidationSeverity = 'warning' | 'error' | 'critical';
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
export type ConflictResolutionStrategy = 'latest_wins' | 'highest_priority' | 'manual' | 'merge';
export type MergeStrategy = 'union' | 'intersection' | 'priority_based' | 'custom';
export type ErrorAction = 'retry' | 'skip' | 'fail' | 'notify';
export type ErrorType = 'connection' | 'authentication' | 'validation' | 'transformation' | 'system';
export type WarningType = 'data_quality' | 'performance' | 'deprecation' | 'configuration';

// Core interfaces
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
  created_at: Date;
  updated_at: Date;
  last_sync: Date | null;
}

export interface DataSourceConfiguration {
  endpoint_url: string;
  format: DataFormat;
  timeout: number;
  headers: Record<string, string>;
  query_parameters: Record<string, any>;
}

export interface AuthenticationConfig {
  type: AuthenticationType;
  api_key?: string;
  access_token?: string;
  client_id?: string;
  client_secret?: string;
}

export interface SyncSettings {
  frequency: SyncFrequency;
  mode: SyncMode;
  batch_size: number;
  timeout_ms: number;
  retry_attempts: number;
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
  records_failed: number;
  errors: SyncError[];
  performance_metrics: PerformanceMetrics;
}

export interface SyncError {
  id: string;
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context: Record<string, any>;
}

export interface PerformanceMetrics {
  duration_ms: number;
  throughput_rps: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
}

export interface DataMapping {
  source_field: string;
  target_field: string;
  transformation?: DataTransformation;
  required: boolean;
  default_value?: any;
}

export interface DataTransformation {
  id: string;
  name: string;
  type: TransformationType;
  source_field: string;
  target_field: string;
  parameters: Record<string, any>;
}

export interface ValidationRule {
  id: string;
  name: string;
  type: ValidationType;
  field: string;
  parameters: Record<string, any>;
  error_message: string;
  severity: ValidationSeverity;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value: any;
  rule: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value: any;
  rule: string;
}

export interface ProcessedData {
  records: any[];
  total_processed: number;
  total_valid: number;
  total_invalid: number;
  processing_time_ms: number;
  transformations_applied: string[];
}

export interface DataIntegrationPipeline {
  id: string;
  name: string;
  description: string;
  data_sources: string[];
  transformations: DataTransformation[];
  validation_rules: ValidationRule[];
  schedule: SyncSettings;
  status: DataSourceStatus;
  created_at: Date;
  updated_at: Date;
}

export interface FetchParams {
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface APIResponse {
  data: any[];
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
  request_id: string;
  timestamp: Date;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  response_time_ms: number;
  last_check: Date;
  error_count: number;
  uptime_percentage: number;
}

export interface IntegrationReport {
  period_start: Date;
  period_end: Date;
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  total_records_processed: number;
  average_sync_duration_ms: number;
  data_sources: DataSourceReport[];
  performance_summary: PerformanceMetrics;
}

export interface DataSourceReport {
  source_id: string;
  source_name: string;
  sync_count: number;
  success_rate: number;
  records_processed: number;
  average_duration_ms: number;
  last_sync: Date;
  status: DataSourceStatus;
}

// Service interfaces
export interface ExternalAPIClient {
  authenticate(): Promise<boolean>;
  fetch_data(params: FetchParams): Promise<APIResponse>;
  test_connection(): Promise<HealthStatus>;
  get_rate_limits(): Promise<RateLimitInfo>;
}

export interface RateLimitInfo {
  remaining: number;
  reset_time: Date;
  limit: number;
}

export interface DataSynchronizer {
  sync_data_source(source_id: string): Promise<SyncResult>;
  get_sync_status(sync_id: string): Promise<SyncResult>;
  cancel_sync(sync_id: string): Promise<boolean>;
  get_sync_history(source_id: string, limit?: number): Promise<SyncResult[]>;
}

export interface DataProcessor {
  process_raw_data(data: any[], mappings: DataMapping[]): Promise<ProcessedData>;
  apply_transformations(data: any[], transformations: DataTransformation[]): Promise<any[]>;
  validate_data(data: any[], rules: ValidationRule[]): Promise<ValidationResult>;
}

export interface DataValidator {
  validate_format(data: any): ValidationResult;
  validate_required_fields(data: any, required_fields: string[]): ValidationResult;
  validate_data_types(data: any, field_types: Record<string, FieldType>): ValidationResult;
  validate_business_rules(data: any, rules: ValidationRule[]): ValidationResult;
}

// Configuration interfaces
export interface IntegrationConfiguration {
  max_concurrent_syncs: number;
  default_timeout_ms: number;
  default_retry_attempts: number;
  enable_caching: boolean;
  cache_duration_seconds: number;
  enable_compression: boolean;
  log_level: 'debug' | 'info' | 'warn' | 'error';
}

export interface SyncOptions {
  force?: boolean;
  dry_run?: boolean;
  batch_size?: number;
  timeout_ms?: number;
  retry_attempts?: number;
}

// Provider-specific configurations
export interface GoogleAnalyticsConfig extends DataSourceConfiguration {
  view_id: string;
  property_id: string;
  metrics: string[];
  dimensions: string[];
  start_date: string;
  end_date: string;
}

export interface FacebookConfig extends DataSourceConfiguration {
  page_id: string;
  app_id: string;
  fields: string[];
  since?: string;
  until?: string;
}

export interface StripeConfig extends DataSourceConfiguration {
  webhook_secret?: string;
  event_types: string[];
  expand_objects: string[];
}

export interface DatabaseConfig extends DataSourceConfiguration {
  host: string;
  port: number;
  database: string;
  table: string;
  query?: string;
  connection_pool_size: number;
}

// Main service interface
export interface ExternalDataIntegrationService {
  // Data source management
  create_data_source(config: Omit<ExternalDataSource, 'id' | 'created_at' | 'updated_at'>): Promise<ExternalDataSource>;
  update_data_source(id: string, config: Partial<ExternalDataSource>): Promise<ExternalDataSource>;
  delete_data_source(id: string): Promise<boolean>;
  get_data_source(id: string): Promise<ExternalDataSource | null>;
  list_data_sources(): Promise<ExternalDataSource[]>;

  // Synchronization
  sync_data_source(source_id: string, options?: SyncOptions): Promise<SyncResult>;
  get_sync_status(sync_id: string): Promise<SyncResult | null>;
  cancel_sync(sync_id: string): Promise<boolean>;
  get_sync_history(source_id: string, limit?: number): Promise<SyncResult[]>;

  // Data processing
  process_data(source_id: string, data: any[]): Promise<ProcessedData>;
  validate_data(data: any[], rules: ValidationRule[]): Promise<ValidationResult>;
  transform_data(data: any[], transformations: DataTransformation[]): Promise<any[]>;

  // Health and monitoring
  test_data_source_connection(source_id: string): Promise<HealthStatus>;
  get_integration_health(): Promise<HealthStatus>;
  generate_integration_report(start_date: Date, end_date: Date): Promise<IntegrationReport>;

  // Pipeline management
  create_pipeline(config: Omit<DataIntegrationPipeline, 'id' | 'created_at' | 'updated_at'>): Promise<DataIntegrationPipeline>;
  run_pipeline(pipeline_id: string): Promise<SyncResult>;
  get_pipeline_status(pipeline_id: string): Promise<DataSourceStatus>;
}

// Event types for real-time updates
export interface IntegrationEvent {
  type: IntegrationEventType;
  data: any;
  timestamp: Date;
  source: string;
}

export type IntegrationEventType = 
  | 'sync_started' 
  | 'sync_completed' 
  | 'sync_failed' 
  | 'data_received' 
  | 'error_occurred'
  | 'health_check';

// Webhook support
export interface WebhookConfig {
  url: string;
  secret: string;
  events: IntegrationEventType[];
  retry_policy: {
    max_retries: number;
    retry_delay_ms: number;
  };
}

export interface WebhookPayload {
  event: IntegrationEvent;
  signature: string;
  timestamp: Date;
}

// Testing and validation
export interface ConnectionTestResult {
  success: boolean;
  response_time_ms: number;
  error_message?: string;
  api_version?: string;
}

export interface DataSourceFilters {
  type?: DataSourceType;
  provider?: DataProvider;
  status?: DataSourceStatus;
  name?: string;
}

// Export constants
export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  frequency: 'daily',
  mode: 'incremental',
  batch_size: 1000,
  timeout_ms: 30000,
  retry_attempts: 3
};

export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfiguration = {
  max_concurrent_syncs: 5,
  default_timeout_ms: 30000,
  default_retry_attempts: 3,
  enable_caching: true,
  cache_duration_seconds: 300,
  enable_compression: true,
  log_level: 'info'
};
