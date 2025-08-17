/**
 * نظام نماذج الذكاء الاصطناعي - أنواع البيانات
 * AI Models System - Type Definitions
 */

export interface MLModel {
  id: string;
  name: string;
  type: MLModelType;
  version: string;
  description?: string;
  status: MLModelStatus;
  config: MLModelConfig;
  performance_metrics?: PerformanceMetrics;
  training_data_path?: string;
  model_file_path?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MLTrainingJob {
  id: string;
  model_id: string;
  status: TrainingStatus;
  config: TrainingConfig;
  progress: number;
  started_at?: Date;
  completed_at?: Date;
  error_message?: string;
  metrics: TrainingMetrics;
  created_at: Date;
}

export interface MLPrediction {
  id: string;
  model_id: string;
  input_data: any;
  output_data: any;
  confidence_score?: number;
  processing_time?: number;
  user_id?: string;
  article_id?: string;
  created_at: Date;
}

// تكوين النماذج
export interface MLModelConfig {
  algorithm: string;
  hyperparameters: { [key: string]: any };
  preprocessing: PreprocessingConfig;
  postprocessing: PostprocessingConfig;
  validation: ValidationConfig;
}

export interface PreprocessingConfig {
  text_cleaning: {
    remove_punctuation: boolean;
    remove_stopwords: boolean;
    normalize_text: boolean;
    language: string;
  };
  feature_extraction: {
    method: 'tfidf' | 'word2vec' | 'bert' | 'custom';
    max_features?: number;
    ngram_range?: [number, number];
  };
  data_augmentation?: {
    enabled: boolean;
    techniques: string[];
  };
}

export interface PostprocessingConfig {
  output_format: 'probability' | 'classification' | 'regression';
  confidence_threshold?: number;
  aggregation_method?: 'average' | 'weighted' | 'voting';
}

export interface ValidationConfig {
  method: 'cross_validation' | 'holdout' | 'time_series';
  test_size: number;
  validation_splits: number;
  metrics: string[];
}

// إعدادات التدريب
export interface TrainingConfig {
  dataset_path: string;
  batch_size: number;
  epochs: number;
  learning_rate: number;
  validation_split: number;
  early_stopping: {
    enabled: boolean;
    patience?: number;
    monitor?: string;
  };
  data_augmentation: {
    enabled: boolean;
    techniques: string[];
  };
  hardware: {
    use_gpu: boolean;
    memory_limit?: number;
  };
}

// مقاييس الأداء
export interface PerformanceMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  auc_roc?: number;
  confusion_matrix?: number[][];
  loss?: number;
  training_time?: number;
  inference_time?: number;
  model_size?: number;
}

export interface TrainingMetrics {
  loss: number[];
  accuracy: number[];
  val_loss: number[];
  val_accuracy: number[];
  learning_rate: number[];
  epoch_times: number[];
}

// أنواع النماذج المدعومة
export const ML_MODEL_TYPES = {
  SENTIMENT_ANALYSIS: 'sentiment_analysis',
  TEXT_CLASSIFICATION: 'text_classification',
  CONTENT_RECOMMENDATION: 'content_recommendation',
  KEYWORD_EXTRACTION: 'keyword_extraction',
  SUMMARIZATION: 'summarization',
  TRANSLATION: 'translation',
  SPAM_DETECTION: 'spam_detection',
  USER_BEHAVIOR: 'user_behavior',
  TRENDING_PREDICTION: 'trending_prediction',
  CONTENT_SCORING: 'content_scoring'
} as const;

export type MLModelType = typeof ML_MODEL_TYPES[keyof typeof ML_MODEL_TYPES];

// حالات النماذج
export const ML_MODEL_STATUS = {
  DRAFT: 'draft',
  TRAINING: 'training',
  TRAINED: 'trained',
  DEPLOYED: 'deployed',
  DEPRECATED: 'deprecated',
  FAILED: 'failed'
} as const;

export type MLModelStatus = typeof ML_MODEL_STATUS[keyof typeof ML_MODEL_STATUS];

// حالات التدريب
export const TRAINING_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

export type TrainingStatus = typeof TRAINING_STATUS[keyof typeof TRAINING_STATUS];

// خوارزميات مدعومة
export const SUPPORTED_ALGORITHMS = {
  // التصنيف النصي
  NAIVE_BAYES: 'naive_bayes',
  SVM: 'svm',
  RANDOM_FOREST: 'random_forest',
  LOGISTIC_REGRESSION: 'logistic_regression',
  
  // التعلم العميق
  LSTM: 'lstm',
  GRU: 'gru',
  TRANSFORMER: 'transformer',
  BERT: 'bert',
  
  // التوصيات
  COLLABORATIVE_FILTERING: 'collaborative_filtering',
  CONTENT_BASED: 'content_based',
  MATRIX_FACTORIZATION: 'matrix_factorization',
  
  // التجميع
  KMEANS: 'kmeans',
  DBSCAN: 'dbscan',
  HIERARCHICAL: 'hierarchical'
} as const;

export type SupportedAlgorithm = typeof SUPPORTED_ALGORITHMS[keyof typeof SUPPORTED_ALGORITHMS];

// قوالب النماذج الجاهزة
export interface ModelTemplate {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  type: MLModelType;
  algorithm: SupportedAlgorithm;
  default_config: MLModelConfig;
  required_data_format: DataFormat;
  estimated_training_time: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  use_cases: string[];
}

export interface DataFormat {
  input_columns: string[];
  output_columns: string[];
  data_types: { [column: string]: string };
  required_preprocessing: string[];
  sample_data?: any[];
}

// إعدادات النشر
export interface DeploymentConfig {
  endpoint_name: string;
  auto_scaling: {
    enabled: boolean;
    min_instances: number;
    max_instances: number;
    target_cpu: number;
  };
  monitoring: {
    enabled: boolean;
    alert_thresholds: {
      latency_ms: number;
      error_rate: number;
      throughput_rps: number;
    };
  };
  caching: {
    enabled: boolean;
    ttl_seconds: number;
    max_cache_size: number;
  };
}

// أداء النموذج في الإنتاج
export interface ProductionMetrics {
  requests_per_minute: number;
  average_latency: number;
  error_rate: number;
  cache_hit_rate: number;
  model_accuracy: number;
  uptime_percentage: number;
  last_updated: Date;
}

// تحديث النماذج
export interface ModelUpdate {
  id: string;
  model_id: string;
  version: string;
  changes: string[];
  performance_improvement?: number;
  breaking_changes: boolean;
  rollback_plan: string;
  created_by: string;
  created_at: Date;
}

// مراقبة النماذج
export interface ModelMonitoring {
  model_id: string;
  drift_detection: {
    enabled: boolean;
    threshold: number;
    current_score: number;
    alert_triggered: boolean;
  };
  performance_degradation: {
    enabled: boolean;
    baseline_accuracy: number;
    current_accuracy: number;
    threshold: number;
  };
  data_quality: {
    missing_values_ratio: number;
    outliers_detected: number;
    schema_violations: number;
  };
  last_check: Date;
}

// طلبات التدريب
export interface TrainingRequest {
  model_id: string;
  config: TrainingConfig;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimated_duration: number;
  required_resources: {
    cpu_cores: number;
    memory_gb: number;
    gpu_required: boolean;
    storage_gb: number;
  };
  notification_settings: {
    email: boolean;
    webhook?: string;
    slack_channel?: string;
  };
}

// نتائج التقييم
export interface ModelEvaluation {
  id: string;
  model_id: string;
  test_dataset_path: string;
  metrics: PerformanceMetrics;
  confusion_matrix: number[][];
  feature_importance?: { [feature: string]: number };
  error_analysis: {
    common_errors: string[];
    misclassified_samples: any[];
  };
  recommendations: string[];
  evaluator: string;
  evaluated_at: Date;
}

export default {
  ML_MODEL_TYPES,
  ML_MODEL_STATUS,
  TRAINING_STATUS,
  SUPPORTED_ALGORITHMS
};
