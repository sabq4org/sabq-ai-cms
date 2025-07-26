/**
 * نظام التحليل العاطفي للنصوص العربية - أنواع البيانات
 * Arabic Sentiment Analysis System - Type Definitions
 */

export interface SentimentAnalysisRequest {
  text: string;
  language?: string;
  context?: AnalysisContext;
  options?: AnalysisOptions;
}

export interface SentimentAnalysisResponse {
  id: string;
  text: string;
  sentiment: SentimentResult;
  emotions: EmotionAnalysis;
  keywords: KeywordExtraction[];
  confidence: number;
  processing_time: number;
  language: string;
  metadata: AnalysisMetadata;
  created_at: Date;
}

export interface SentimentResult {
  label: SentimentLabel;
  score: number; // -1 (سلبي جداً) إلى +1 (إيجابي جداً)
  confidence: number; // 0 إلى 1
  intensity: SentimentIntensity;
  polarity: 'positive' | 'negative' | 'neutral';
}

export interface EmotionAnalysis {
  primary_emotion: EmotionType;
  emotions: {
    [key in EmotionType]: number; // قوة المشاعر من 0 إلى 1
  };
  emotional_state: EmotionalState;
  arousal: number; // مستوى الإثارة
  valence: number; // مستوى الإيجابية/السلبية
}

export interface KeywordExtraction {
  word: string;
  sentiment_impact: number;
  frequency: number;
  importance: number;
  category: KeywordCategory;
  position: number;
}

export interface AnalysisContext {
  domain?: string; // المجال (أخبار، تعليقات، مراجعات)
  source?: string; // المصدر
  author_info?: AuthorInfo;
  related_content?: string[];
  temporal_context?: TemporalContext;
}

export interface AnalysisOptions {
  include_emotions?: boolean;
  include_keywords?: boolean;
  detailed_analysis?: boolean;
  language_detection?: boolean;
  context_awareness?: boolean;
  real_time?: boolean;
}

export interface AnalysisMetadata {
  model_version: string;
  algorithm_used: string;
  preprocessing_steps: string[];
  analysis_depth: 'basic' | 'standard' | 'advanced';
  quality_score: number;
  reliability_indicator: number;
}

// أنواع المشاعر
export const SENTIMENT_LABELS = {
  VERY_POSITIVE: 'very_positive',
  POSITIVE: 'positive',
  SLIGHTLY_POSITIVE: 'slightly_positive',
  NEUTRAL: 'neutral',
  SLIGHTLY_NEGATIVE: 'slightly_negative',
  NEGATIVE: 'negative',
  VERY_NEGATIVE: 'very_negative'
} as const;

export type SentimentLabel = typeof SENTIMENT_LABELS[keyof typeof SENTIMENT_LABELS];

export const SENTIMENT_INTENSITY = {
  VERY_LOW: 'very_low',
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
} as const;

export type SentimentIntensity = typeof SENTIMENT_INTENSITY[keyof typeof SENTIMENT_INTENSITY];

// أنواع المشاعر التفصيلية
export const EMOTION_TYPES = {
  JOY: 'joy',           // فرح
  SADNESS: 'sadness',   // حزن
  ANGER: 'anger',       // غضب
  FEAR: 'fear',         // خوف
  SURPRISE: 'surprise', // مفاجأة
  DISGUST: 'disgust',   // اشمئزاز
  TRUST: 'trust',       // ثقة
  ANTICIPATION: 'anticipation', // ترقب
  LOVE: 'love',         // حب
  HATE: 'hate',         // كراهية
  PRIDE: 'pride',       // فخر
  SHAME: 'shame',       // خجل
  GUILT: 'guilt',       // ذنب
  HOPE: 'hope',         // أمل
  DESPAIR: 'despair',   // يأس
  EXCITEMENT: 'excitement', // إثارة
  BOREDOM: 'boredom',   // ملل
  CONFUSION: 'confusion', // حيرة
  RELIEF: 'relief',     // راحة
  NOSTALGIA: 'nostalgia' // حنين
} as const;

export type EmotionType = typeof EMOTION_TYPES[keyof typeof EMOTION_TYPES];

export const EMOTIONAL_STATES = {
  CALM: 'calm',
  EXCITED: 'excited',
  STRESSED: 'stressed',
  RELAXED: 'relaxed',
  ENERGETIC: 'energetic',
  TIRED: 'tired',
  FOCUSED: 'focused',
  DISTRACTED: 'distracted'
} as const;

export type EmotionalState = typeof EMOTIONAL_STATES[keyof typeof EMOTIONAL_STATES];

// فئات الكلمات المفتاحية
export const KEYWORD_CATEGORIES = {
  POSITIVE_INDICATOR: 'positive_indicator',
  NEGATIVE_INDICATOR: 'negative_indicator',
  EMOTION_TRIGGER: 'emotion_trigger',
  INTENSITY_MODIFIER: 'intensity_modifier',
  NEGATION: 'negation',
  CONTEXTUAL: 'contextual',
  DOMAIN_SPECIFIC: 'domain_specific'
} as const;

export type KeywordCategory = typeof KEYWORD_CATEGORIES[keyof typeof KEYWORD_CATEGORIES];

// معلومات الكاتب
export interface AuthorInfo {
  id?: string;
  writing_style?: WritingStyle;
  emotional_tendency?: SentimentLabel;
  historical_sentiment?: HistoricalSentiment;
}

export interface WritingStyle {
  formality_level: 'formal' | 'informal' | 'mixed';
  emotional_expression: 'explicit' | 'implicit' | 'balanced';
  cultural_context: 'traditional' | 'modern' | 'mixed';
}

export interface HistoricalSentiment {
  average_sentiment: number;
  sentiment_variance: number;
  dominant_emotions: EmotionType[];
  typical_patterns: string[];
}

// السياق الزمني
export interface TemporalContext {
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night';
  day_of_week?: string;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  special_events?: string[];
  trending_topics?: string[];
}

// إعدادات النموذج
export interface SentimentModelConfig {
  model_type: 'rule_based' | 'machine_learning' | 'deep_learning' | 'hybrid';
  language_model: 'basic' | 'advanced' | 'transformer';
  preprocessing: PreprocessingConfig;
  feature_extraction: FeatureExtractionConfig;
  classification: ClassificationConfig;
  postprocessing: PostprocessingConfig;
}

export interface PreprocessingConfig {
  normalization: {
    remove_diacritics: boolean;
    normalize_alef: boolean;
    normalize_yaa: boolean;
    normalize_taa_marbuta: boolean;
  };
  cleaning: {
    remove_urls: boolean;
    remove_mentions: boolean;
    remove_hashtags: boolean;
    remove_emojis: boolean;
    remove_punctuation: boolean;
  };
  tokenization: {
    method: 'whitespace' | 'morphological' | 'subword';
    handle_compounds: boolean;
    preserve_entities: boolean;
  };
  stopwords: {
    remove_stopwords: boolean;
    custom_stopwords: string[];
    preserve_negations: boolean;
  };
}

export interface FeatureExtractionConfig {
  method: 'bow' | 'tfidf' | 'word2vec' | 'fasttext' | 'bert';
  n_grams: [number, number];
  max_features: number;
  context_window: number;
  semantic_features: boolean;
  syntactic_features: boolean;
}

export interface ClassificationConfig {
  algorithm: 'svm' | 'naive_bayes' | 'random_forest' | 'neural_network' | 'transformer';
  ensemble_methods: string[];
  confidence_threshold: number;
  multi_label: boolean;
}

export interface PostprocessingConfig {
  emotion_mapping: boolean;
  intensity_scaling: boolean;
  context_adjustment: boolean;
  cultural_calibration: boolean;
}

// نتائج التقييم
export interface SentimentEvaluation {
  id: string;
  model_version: string;
  test_dataset: string;
  metrics: EvaluationMetrics;
  confusion_matrix: number[][];
  error_analysis: ErrorAnalysis;
  recommendations: string[];
  evaluated_at: Date;
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: { [label: string]: number };
  recall: { [label: string]: number };
  f1_score: { [label: string]: number };
  macro_f1: number;
  weighted_f1: number;
  kappa_score: number;
  auc_roc: number;
}

export interface ErrorAnalysis {
  common_misclassifications: MisclassificationPattern[];
  challenging_cases: ChallengingCase[];
  improvement_areas: string[];
  linguistic_challenges: string[];
}

export interface MisclassificationPattern {
  true_label: SentimentLabel;
  predicted_label: SentimentLabel;
  frequency: number;
  typical_examples: string[];
  potential_causes: string[];
}

export interface ChallengingCase {
  text: string;
  true_sentiment: SentimentLabel;
  predicted_sentiment: SentimentLabel;
  confidence: number;
  linguistic_features: string[];
  challenge_type: string;
}

// إحصائيات وتحليلات
export interface SentimentStatistics {
  total_analyses: number;
  sentiment_distribution: { [label: string]: number };
  emotion_distribution: { [emotion: string]: number };
  average_confidence: number;
  processing_performance: ProcessingPerformance;
  trend_analysis: TrendAnalysis;
}

export interface ProcessingPerformance {
  average_processing_time: number;
  throughput: number; // تحليلات في الثانية
  cache_hit_ratio: number;
  error_rate: number;
}

export interface TrendAnalysis {
  hourly_sentiment: { [hour: string]: number };
  daily_sentiment: { [day: string]: number };
  trending_emotions: EmotionTrend[];
  sentiment_velocity: number; // معدل تغير المشاعر
}

export interface EmotionTrend {
  emotion: EmotionType;
  change_rate: number;
  current_level: number;
  prediction: number;
}

// تكامل مع المحتوى
export interface ContentSentimentAnalysis {
  content_id: string;
  content_type: 'article' | 'comment' | 'review' | 'social_post';
  title_sentiment?: SentimentResult;
  body_sentiment: SentimentResult;
  overall_sentiment: SentimentResult;
  section_analysis?: SectionSentiment[];
  reader_response_prediction: ReaderResponsePrediction;
}

export interface SectionSentiment {
  section_id: string;
  section_type: 'introduction' | 'body' | 'conclusion' | 'quote';
  text: string;
  sentiment: SentimentResult;
  key_phrases: string[];
}

export interface ReaderResponsePrediction {
  predicted_engagement: EngagementPrediction;
  emotional_impact: EmotionalImpact;
  virality_score: number;
  controversy_level: number;
}

export interface EngagementPrediction {
  likes_probability: number;
  shares_probability: number;
  comments_probability: number;
  reading_completion: number;
}

export interface EmotionalImpact {
  intensity: number;
  duration: 'short' | 'medium' | 'long';
  type: 'inspiring' | 'disturbing' | 'calming' | 'exciting';
  audience_resonance: number;
}

// إعدادات API
export interface SentimentAPIConfig {
  rate_limiting: {
    requests_per_minute: number;
    burst_limit: number;
  };
  caching: {
    enabled: boolean;
    ttl_seconds: number;
    max_cache_size: number;
  };
  monitoring: {
    log_requests: boolean;
    track_performance: boolean;
    alert_thresholds: AlertThresholds;
  };
}

export interface AlertThresholds {
  high_error_rate: number;
  slow_response_time: number;
  low_confidence_rate: number;
  unusual_sentiment_pattern: number;
}
