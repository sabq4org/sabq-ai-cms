/**
 * نظام التكامل مع البيانات الخارجية - الخدمة الأساسية
 * External Data Integration Service Implementation
 */

import { 
  ExternalDataIntegrationService,
  ExternalDataSource,
  SyncResult,
  SyncOptions,
  ProcessedData,
  ValidationResult,
  DataTransformation,
  ValidationRule,
  HealthStatus,
  IntegrationReport,
  DataIntegrationPipeline,
  APIResponse,
  FetchParams,
  DataMapping,
  IntegrationConfiguration,
  DEFAULT_INTEGRATION_CONFIG,
  ConnectionTestResult,
  DataSourceFilters,
  DataSourceStatus,
  SyncStatus,
  PerformanceMetrics
} from './types-simplified';

export class ExternalDataIntegrationServiceImpl implements ExternalDataIntegrationService {
  private config: IntegrationConfiguration;
  private activeSyncs: Map<string, SyncResult> = new Map();
  private dataSourceCache: Map<string, ExternalDataSource> = new Map();
  private syncHistory: Map<string, SyncResult[]> = new Map();

  constructor(config: Partial<IntegrationConfiguration> = {}) {
    this.config = { ...DEFAULT_INTEGRATION_CONFIG, ...config };
  }

  // Data Source Management
  async create_data_source(config: Omit<ExternalDataSource, 'id' | 'created_at' | 'updated_at'>): Promise<ExternalDataSource> {
    const dataSource: ExternalDataSource = {
      ...config,
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date(),
      last_sync: null
    };

    this.dataSourceCache.set(dataSource.id, dataSource);
    
    // Test connection during creation
    try {
      await this.test_data_source_connection(dataSource.id);
      dataSource.status = 'active';
    } catch (error) {
      dataSource.status = 'error';
      console.error(`Failed to connect to data source ${dataSource.name}:`, error);
    }

    return dataSource;
  }

  async update_data_source(id: string, updates: Partial<ExternalDataSource>): Promise<ExternalDataSource> {
    const existing = this.dataSourceCache.get(id);
    if (!existing) {
      throw new Error(`Data source with id ${id} not found`);
    }

    const updated: ExternalDataSource = {
      ...existing,
      ...updates,
      id, // Preserve ID
      updated_at: new Date()
    };

    this.dataSourceCache.set(id, updated);
    return updated;
  }

  async delete_data_source(id: string): Promise<boolean> {
    if (!this.dataSourceCache.has(id)) {
      throw new Error(`Data source with id ${id} not found`);
    }

    // Cancel any active syncs
    const activeSync = Array.from(this.activeSyncs.values())
      .find(sync => sync.data_source_id === id && sync.status === 'running');
    
    if (activeSync) {
      await this.cancel_sync(activeSync.sync_id);
    }

    this.dataSourceCache.delete(id);
    this.syncHistory.delete(id);
    
    return true;
  }

  async get_data_source(id: string): Promise<ExternalDataSource | null> {
    return this.dataSourceCache.get(id) || null;
  }

  async list_data_sources(filters?: DataSourceFilters): Promise<ExternalDataSource[]> {
    let sources = Array.from(this.dataSourceCache.values());

    if (filters) {
      sources = sources.filter(source => {
        if (filters.type && source.type !== filters.type) return false;
        if (filters.provider && source.provider !== filters.provider) return false;
        if (filters.status && source.status !== filters.status) return false;
        if (filters.name && !source.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
        return true;
      });
    }

    return sources;
  }

  // Synchronization
  async sync_data_source(source_id: string, options: SyncOptions = {}): Promise<SyncResult> {
    const dataSource = await this.get_data_source(source_id);
    if (!dataSource) {
      throw new Error(`Data source with id ${source_id} not found`);
    }

    if (dataSource.status !== 'active') {
      throw new Error(`Data source ${dataSource.name} is not active`);
    }

    const syncId = this.generateId();
    const syncResult: SyncResult = {
      sync_id: syncId,
      data_source_id: source_id,
      started_at: new Date(),
      completed_at: null,
      status: 'running',
      records_processed: 0,
      records_created: 0,
      records_updated: 0,
      records_failed: 0,
      errors: [],
      performance_metrics: {
        duration_ms: 0,
        throughput_rps: 0,
        memory_usage_mb: 0,
        cpu_usage_percent: 0
      }
    };

    this.activeSyncs.set(syncId, syncResult);

    try {
      // Simulate sync process
      const startTime = Date.now();
      
      if (options.dry_run) {
        // Dry run - just validate without processing
        syncResult.status = 'completed';
        syncResult.completed_at = new Date();
        console.log(`Dry run completed for data source ${dataSource.name}`);
      } else {
        // Actual sync process
        const fetchedData = await this.fetchDataFromSource(dataSource, options);
        const processedData = await this.processDataInternal(fetchedData, dataSource);
        
        syncResult.records_processed = processedData.total_processed;
        syncResult.records_created = processedData.total_valid;
        syncResult.records_failed = processedData.total_invalid;
        syncResult.status = 'completed';
        syncResult.completed_at = new Date();

        // Update last sync time
        dataSource.last_sync = new Date();
        await this.update_data_source(source_id, { last_sync: dataSource.last_sync });
      }

      const endTime = Date.now();
      syncResult.performance_metrics.duration_ms = endTime - startTime;
      syncResult.performance_metrics.throughput_rps = 
        syncResult.records_processed / (syncResult.performance_metrics.duration_ms / 1000);

      // Add to history
      this.addToSyncHistory(source_id, syncResult);

    } catch (error) {
      syncResult.status = 'failed';
      syncResult.completed_at = new Date();
      syncResult.errors.push({
        id: this.generateId(),
        type: 'system',
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'critical',
        timestamp: new Date(),
        context: { source_id, options }
      });

      console.error(`Sync failed for data source ${dataSource.name}:`, error);
    } finally {
      this.activeSyncs.delete(syncId);
    }

    return syncResult;
  }

  async get_sync_status(sync_id: string): Promise<SyncResult | null> {
    // Check active syncs first
    const activeSync = this.activeSyncs.get(sync_id);
    if (activeSync) {
      return activeSync;
    }

    // Check history
    for (const history of this.syncHistory.values()) {
      const found = history.find(sync => sync.sync_id === sync_id);
      if (found) {
        return found;
      }
    }

    return null;
  }

  async cancel_sync(sync_id: string): Promise<boolean> {
    const activeSync = this.activeSyncs.get(sync_id);
    if (!activeSync) {
      return false;
    }

    activeSync.status = 'cancelled';
    activeSync.completed_at = new Date();
    this.activeSyncs.delete(sync_id);

    // Add to history
    this.addToSyncHistory(activeSync.data_source_id, activeSync);

    return true;
  }

  async get_sync_history(source_id: string, limit: number = 50): Promise<SyncResult[]> {
    const history = this.syncHistory.get(source_id) || [];
    return history
      .sort((a, b) => b.started_at.getTime() - a.started_at.getTime())
      .slice(0, limit);
  }

  // Data Processing
  async process_data(source_id: string, data: any[]): Promise<ProcessedData> {
    const dataSource = await this.get_data_source(source_id);
    if (!dataSource) {
      throw new Error(`Data source with id ${source_id} not found`);
    }

    return this.processDataInternal(data, dataSource);
  }

  async validate_data(data: any[], rules: ValidationRule[]): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    for (const item of data) {
      for (const rule of rules) {
        const validation = this.validateFieldValue(item[rule.field], rule);
        if (!validation.valid) {
          if (rule.severity === 'error' || rule.severity === 'critical') {
            errors.push({
              field: rule.field,
              message: rule.error_message,
              value: item[rule.field],
              rule: rule.name
            });
          } else {
            warnings.push({
              field: rule.field,
              message: rule.error_message,
              value: item[rule.field],
              rule: rule.name
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async transform_data(data: any[], transformations: DataTransformation[]): Promise<any[]> {
    return data.map(item => {
      const transformed = { ...item };
      
      for (const transformation of transformations) {
        transformed[transformation.target_field] = this.applyTransformation(
          item[transformation.source_field], 
          transformation
        );
      }
      
      return transformed;
    });
  }

  // Health and Monitoring
  async test_data_source_connection(source_id: string): Promise<HealthStatus> {
    const dataSource = await this.get_data_source(source_id);
    if (!dataSource) {
      throw new Error(`Data source with id ${source_id} not found`);
    }

    const startTime = Date.now();
    
    try {
      // Simulate connection test
      await this.simulateConnectionTest(dataSource);
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        response_time_ms: responseTime,
        last_check: new Date(),
        error_count: 0,
        uptime_percentage: 99.9
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        response_time_ms: responseTime,
        last_check: new Date(),
        error_count: 1,
        uptime_percentage: 0
      };
    }
  }

  async get_integration_health(): Promise<HealthStatus> {
    const sources = await this.list_data_sources();
    const healthChecks = await Promise.allSettled(
      sources.map(source => this.test_data_source_connection(source.id))
    );

    const healthyCount = healthChecks.filter(
      result => result.status === 'fulfilled' && result.value.status === 'healthy'
    ).length;

    const averageResponseTime = healthChecks
      .filter(result => result.status === 'fulfilled')
      .reduce((sum, result) => sum + (result as any).value.response_time_ms, 0) / healthChecks.length;

    const uptime = sources.length > 0 ? (healthyCount / sources.length) * 100 : 100;

    return {
      status: uptime > 80 ? 'healthy' : uptime > 50 ? 'degraded' : 'unhealthy',
      response_time_ms: averageResponseTime || 0,
      last_check: new Date(),
      error_count: sources.length - healthyCount,
      uptime_percentage: uptime
    };
  }

  async generate_integration_report(start_date: Date, end_date: Date): Promise<IntegrationReport> {
    const sources = await this.list_data_sources();
    const sourceReports = await Promise.all(
      sources.map(async source => {
        const history = await this.get_sync_history(source.id);
        const periodHistory = history.filter(
          sync => sync.started_at >= start_date && sync.started_at <= end_date
        );

        const successfulSyncs = periodHistory.filter(sync => sync.status === 'completed');
        const successRate = periodHistory.length > 0 ? 
          (successfulSyncs.length / periodHistory.length) * 100 : 0;

        const totalRecords = periodHistory.reduce(
          (sum, sync) => sum + sync.records_processed, 0
        );

        const averageDuration = periodHistory.length > 0 ?
          periodHistory.reduce((sum, sync) => sum + sync.performance_metrics.duration_ms, 0) / periodHistory.length : 0;

        return {
          source_id: source.id,
          source_name: source.name,
          sync_count: periodHistory.length,
          success_rate: successRate,
          records_processed: totalRecords,
          average_duration_ms: averageDuration,
          last_sync: source.last_sync || new Date(0),
          status: source.status
        };
      })
    );

    const totalSyncs = sourceReports.reduce((sum, report) => sum + report.sync_count, 0);
    const successfulSyncs = sourceReports.reduce(
      (sum, report) => sum + Math.round(report.sync_count * report.success_rate / 100), 0
    );
    const totalRecords = sourceReports.reduce((sum, report) => sum + report.records_processed, 0);
    const averageDuration = sourceReports.length > 0 ?
      sourceReports.reduce((sum, report) => sum + report.average_duration_ms, 0) / sourceReports.length : 0;

    return {
      period_start: start_date,
      period_end: end_date,
      total_syncs: totalSyncs,
      successful_syncs: successfulSyncs,
      failed_syncs: totalSyncs - successfulSyncs,
      total_records_processed: totalRecords,
      average_sync_duration_ms: averageDuration,
      data_sources: sourceReports,
      performance_summary: {
        duration_ms: averageDuration,
        throughput_rps: totalRecords / ((end_date.getTime() - start_date.getTime()) / 1000),
        memory_usage_mb: 0,
        cpu_usage_percent: 0
      }
    };
  }

  // Pipeline Management
  async create_pipeline(config: Omit<DataIntegrationPipeline, 'id' | 'created_at' | 'updated_at'>): Promise<DataIntegrationPipeline> {
    const pipeline: DataIntegrationPipeline = {
      ...config,
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date()
    };

    // Store pipeline (in real implementation, this would be saved to database)
    console.log(`Pipeline created: ${pipeline.name}`);
    
    return pipeline;
  }

  async run_pipeline(pipeline_id: string): Promise<SyncResult> {
    // For now, simulate pipeline execution by syncing the first data source
    // In a real implementation, this would execute the entire pipeline
    const mockSourceId = 'mock-source';
    
    return this.sync_data_source(mockSourceId, { dry_run: true });
  }

  async get_pipeline_status(pipeline_id: string): Promise<DataSourceStatus> {
    // Mock implementation - in reality would check actual pipeline status
    return 'active';
  }

  // Private helper methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async fetchDataFromSource(dataSource: ExternalDataSource, options: SyncOptions): Promise<any[]> {
    // Mock data fetching - in real implementation, this would call actual APIs
    const batchSize = options.batch_size || dataSource.sync_settings.batch_size;
    
    // Simulate fetching data
    const mockData = Array.from({ length: batchSize }, (_, index) => ({
      id: index + 1,
      name: `Record ${index + 1}`,
      value: Math.random() * 100,
      timestamp: new Date(),
      source: dataSource.name
    }));

    console.log(`Fetched ${mockData.length} records from ${dataSource.name}`);
    return mockData;
  }

  private async processDataInternal(data: any[], dataSource: ExternalDataSource): Promise<ProcessedData> {
    const startTime = Date.now();
    
    // Mock processing - validate and transform data
    let validRecords = 0;
    let invalidRecords = 0;

    for (const record of data) {
      if (this.isValidRecord(record)) {
        validRecords++;
      } else {
        invalidRecords++;
      }
    }

    const processingTime = Date.now() - startTime;

    return {
      records: data,
      total_processed: data.length,
      total_valid: validRecords,
      total_invalid: invalidRecords,
      processing_time_ms: processingTime,
      transformations_applied: ['validation', 'formatting']
    };
  }

  private validateFieldValue(value: any, rule: ValidationRule): { valid: boolean; message?: string } {
    switch (rule.type) {
      case 'required':
        return { valid: value !== null && value !== undefined && value !== '' };
      
      case 'format':
        if (rule.parameters.pattern) {
          const regex = new RegExp(rule.parameters.pattern);
          return { valid: regex.test(String(value)) };
        }
        return { valid: true };
      
      case 'range':
        if (typeof value === 'number') {
          const min = rule.parameters.min;
          const max = rule.parameters.max;
          return { 
            valid: (min === undefined || value >= min) && (max === undefined || value <= max) 
          };
        }
        return { valid: true };
      
      default:
        return { valid: true };
    }
  }

  private applyTransformation(value: any, transformation: DataTransformation): any {
    switch (transformation.type) {
      case 'field_mapping':
        return value;
      
      case 'data_conversion':
        if (transformation.parameters.target_type === 'string') {
          return String(value);
        } else if (transformation.parameters.target_type === 'number') {
          return Number(value);
        }
        return value;
      
      case 'calculation':
        if (transformation.parameters.operation === 'multiply') {
          return value * (transformation.parameters.factor || 1);
        }
        return value;
      
      default:
        return value;
    }
  }

  private async simulateConnectionTest(dataSource: ExternalDataSource): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Connection timeout');
    }
  }

  private isValidRecord(record: any): boolean {
    // Basic validation - ensure record has required fields
    return record && typeof record === 'object' && record.id;
  }

  private addToSyncHistory(sourceId: string, syncResult: SyncResult): void {
    if (!this.syncHistory.has(sourceId)) {
      this.syncHistory.set(sourceId, []);
    }
    
    const history = this.syncHistory.get(sourceId)!;
    history.push(syncResult);
    
    // Keep only last 100 sync results per source
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }
}

// Export singleton instance
export const externalDataIntegrationService = new ExternalDataIntegrationServiceImpl();
