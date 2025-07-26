/**
 * محرك البحث الذكي - أنواع البيانات
 * Intelligent Search Engine - Type Definitions
 */

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  pagination?: SearchPagination;
  options?: SearchOptions;
}

export interface SearchFilters {
  categories?: string[];
  tags?: string[];
  authors?: string[];
  date_range?: DateRange;
  content_type?: ContentType[];
  language?: string;
  sentiment?: SentimentFilter;
  reading_time?: RangeFilter;
  popularity?: RangeFilter;
  location?: LocationFilter;
  custom_filters?: CustomFilter[];
}

export interface SearchSort {
  field: SortField;
  direction: 'asc' | 'desc';
  secondary_sort?: {
    field: SortField;
    direction: 'asc' | 'desc';
  };
}

export interface SearchPagination {
  page: number;
  per_page: number;
  max_results?: number;
}

export interface SearchOptions {
  fuzzy_search?: boolean;
  semantic_search?: boolean;
  auto_complete?: boolean;
  spell_correction?: boolean;
  synonym_expansion?: boolean;
  personalization?: boolean;
  include_snippets?: boolean;
  include_highlights?: boolean;
  include_suggestions?: boolean;
  include_analytics?: boolean;
  boost_recent?: boolean;
  boost_popular?: boolean;
  boost_personal?: boolean;
}

export interface SearchResult {
  results: SearchResultItem[];
  total_count: number;
  total_pages: number;
  current_page: number;
  search_time: number;
  suggestions?: SearchSuggestion[];
  corrections?: SpellCorrection[];
  analytics?: SearchAnalytics;
  facets?: SearchFacets;
  related_queries?: string[];
  auto_complete?: AutoCompleteResult[];
}

export interface SearchResultItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  url: string;
  type: ContentType;
  category: string;
  tags: string[];
  author: AuthorInfo;
  published_at: Date;
  updated_at?: Date;
  reading_time: number;
  popularity_score: number;
  relevance_score: number;
  sentiment_score?: number;
  image_url?: string;
  highlights?: SearchHighlight[];
  snippet?: string;
  metadata?: SearchMetadata;
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
  matched_words: string[];
}

export interface SearchMetadata {
  word_count: number;
  language: string;
  complexity_level: 'basic' | 'intermediate' | 'advanced';
  topics: string[];
  entities: NamedEntity[];
  sentiment: {
    polarity: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
}

export interface NamedEntity {
  text: string;
  label: EntityType;
  confidence: number;
  start_pos: number;
  end_pos: number;
}

export interface SearchSuggestion {
  text: string;
  type: SuggestionType;
  score: number;
  context?: string;
}

export interface SpellCorrection {
  original: string;
  corrected: string;
  confidence: number;
  suggestion_type: 'spelling' | 'grammar' | 'vocabulary';
}

export interface SearchAnalytics {
  search_id: string;
  query_analysis: QueryAnalysis;
  performance_metrics: PerformanceMetrics;
  user_context: UserContext;
  relevance_feedback?: RelevanceFeedback;
}

export interface SearchFacets {
  categories: FacetResult[];
  authors: FacetResult[];
  tags: FacetResult[];
  date_ranges: FacetResult[];
  content_types: FacetResult[];
  languages: FacetResult[];
  sentiments: FacetResult[];
}

export interface FacetResult {
  value: string;
  count: number;
  selected: boolean;
}

export interface AutoCompleteResult {
  suggestion: string;
  type: AutoCompleteType;
  frequency: number;
  category?: string;
  description?: string;
}

// أنواع المحتوى
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  NEWS: 'news',
  BLOG_POST: 'blog_post',
  COMMENT: 'comment',
  PAGE: 'page',
  DOCUMENT: 'document',
  VIDEO: 'video',
  PODCAST: 'podcast',
  IMAGE: 'image',
  INFOGRAPHIC: 'infographic'
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

// حقول الترتيب
export const SORT_FIELDS = {
  RELEVANCE: 'relevance',
  DATE: 'date',
  POPULARITY: 'popularity',
  TITLE: 'title',
  AUTHOR: 'author',
  READING_TIME: 'reading_time',
  SENTIMENT: 'sentiment',
  ENGAGEMENT: 'engagement'
} as const;

export type SortField = typeof SORT_FIELDS[keyof typeof SORT_FIELDS];

// أنواع الاقتراحات
export const SUGGESTION_TYPES = {
  QUERY_COMPLETION: 'query_completion',
  QUERY_EXPANSION: 'query_expansion',
  RELATED_QUERY: 'related_query',
  TRENDING_QUERY: 'trending_query',
  PERSONALIZED: 'personalized'
} as const;

export type SuggestionType = typeof SUGGESTION_TYPES[keyof typeof SUGGESTION_TYPES];

// أنواع الكيانات المسماة
export const ENTITY_TYPES = {
  PERSON: 'person',
  ORGANIZATION: 'organization',
  LOCATION: 'location',
  DATE: 'date',
  MONEY: 'money',
  PERCENT: 'percent',
  PRODUCT: 'product',
  EVENT: 'event',
  TOPIC: 'topic'
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

// أنواع الإكمال التلقائي
export const AUTO_COMPLETE_TYPES = {
  QUERY: 'query',
  ENTITY: 'entity',
  CATEGORY: 'category',
  TAG: 'tag',
  AUTHOR: 'author',
  TRENDING: 'trending'
} as const;

export type AutoCompleteType = typeof AUTO_COMPLETE_TYPES[keyof typeof AUTO_COMPLETE_TYPES];

// مرشحات النطاق
export interface RangeFilter {
  min?: number;
  max?: number;
}

export interface DateRange {
  start_date?: Date;
  end_date?: Date;
  relative_range?: RelativeRange;
}

export interface RelativeRange {
  unit: 'hour' | 'day' | 'week' | 'month' | 'year';
  amount: number;
  direction: 'past' | 'future';
}

export interface SentimentFilter {
  polarity?: 'positive' | 'negative' | 'neutral';
  min_confidence?: number;
}

export interface LocationFilter {
  country?: string;
  city?: string;
  radius?: number; // بالكيلومتر
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface CustomFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  boost?: number;
}

export const FILTER_OPERATORS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  GREATER_EQUAL: 'greater_equal',
  LESS_EQUAL: 'less_equal',
  IN: 'in',
  NOT_IN: 'not_in',
  BETWEEN: 'between',
  REGEX: 'regex'
} as const;

export type FilterOperator = typeof FILTER_OPERATORS[keyof typeof FILTER_OPERATORS];

// معلومات المؤلف
export interface AuthorInfo {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  verified: boolean;
  follower_count?: number;
  article_count?: number;
}

// تحليل الاستعلام
export interface QueryAnalysis {
  original_query: string;
  processed_query: string;
  detected_language: string;
  query_type: QueryType;
  intent: SearchIntent;
  entities: NamedEntity[];
  keywords: QueryKeyword[];
  sentiment: QuerySentiment;
  complexity: QueryComplexity;
  corrections: SpellCorrection[];
}

export interface QueryKeyword {
  word: string;
  importance: number;
  type: 'noun' | 'verb' | 'adjective' | 'entity' | 'modifier';
  boost_factor: number;
}

export interface QuerySentiment {
  polarity: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotional_intent: string[];
}

export interface QueryComplexity {
  level: 'simple' | 'medium' | 'complex';
  factors: string[];
  score: number;
}

// أنواع الاستعلامات
export const QUERY_TYPES = {
  KEYWORD: 'keyword',
  PHRASE: 'phrase',
  QUESTION: 'question',
  BOOLEAN: 'boolean',
  SEMANTIC: 'semantic',
  NATURAL_LANGUAGE: 'natural_language'
} as const;

export type QueryType = typeof QUERY_TYPES[keyof typeof QUERY_TYPES];

// نوايا البحث
export const SEARCH_INTENTS = {
  INFORMATIONAL: 'informational',
  NAVIGATIONAL: 'navigational',
  TRANSACTIONAL: 'transactional',
  ENTERTAINMENT: 'entertainment',
  NEWS: 'news',
  RESEARCH: 'research'
} as const;

export type SearchIntent = typeof SEARCH_INTENTS[keyof typeof SEARCH_INTENTS];

// مقاييس الأداء
export interface PerformanceMetrics {
  total_time: number;
  query_time: number;
  index_time: number;
  post_processing_time: number;
  cache_hit: boolean;
  results_count: number;
  index_size: number;
  memory_usage: number;
}

// سياق المستخدم
export interface UserContext {
  user_id?: string;
  session_id: string;
  search_history: string[];
  preferences: UserSearchPreferences;
  location?: LocationData;
  device_info: DeviceInfo;
  timestamp: Date;
}

export interface UserSearchPreferences {
  preferred_categories: string[];
  preferred_authors: string[];
  preferred_languages: string[];
  content_difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  reading_time_preference: RangeFilter;
  personalization_enabled: boolean;
  search_suggestions_enabled: boolean;
  safe_search: boolean;
}

export interface LocationData {
  country: string;
  country_code: string;
  city?: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  screen_size: {
    width: number;
    height: number;
  };
}

// ردود فعل الصلة
export interface RelevanceFeedback {
  search_id: string;
  user_id?: string;
  feedback_items: FeedbackItem[];
  timestamp: Date;
}

export interface FeedbackItem {
  result_id: string;
  action: FeedbackAction;
  relevance_score?: number;
  dwell_time?: number;
  clicked: boolean;
  bookmarked: boolean;
  shared: boolean;
}

export const FEEDBACK_ACTIONS = {
  CLICK: 'click',
  VIEW: 'view',
  BOOKMARK: 'bookmark',
  SHARE: 'share',
  LIKE: 'like',
  DISLIKE: 'dislike',
  REPORT: 'report',
  IGNORE: 'ignore'
} as const;

export type FeedbackAction = typeof FEEDBACK_ACTIONS[keyof typeof FEEDBACK_ACTIONS];

// تكوين البحث
export interface SearchConfiguration {
  indexing: IndexingConfig;
  query_processing: QueryProcessingConfig;
  ranking: RankingConfig;
  personalization: PersonalizationConfig;
  performance: PerformanceConfig;
  analytics: AnalyticsConfig;
}

export interface IndexingConfig {
  enabled: boolean;
  batch_size: number;
  update_frequency: number; // بالدقائق
  full_reindex_interval: number; // بالساعات
  content_processors: ContentProcessor[];
  language_analyzers: LanguageAnalyzer[];
  custom_fields: CustomField[];
}

export interface ContentProcessor {
  name: string;
  type: 'text' | 'html' | 'markdown' | 'pdf' | 'image';
  enabled: boolean;
  config: any;
}

export interface LanguageAnalyzer {
  language: string;
  analyzer_type: 'standard' | 'arabic' | 'custom';
  stemming: boolean;
  stop_words: boolean;
  synonyms: boolean;
  custom_rules: string[];
}

export interface CustomField {
  name: string;
  type: 'text' | 'keyword' | 'number' | 'date' | 'geo_point';
  searchable: boolean;
  facetable: boolean;
  sortable: boolean;
  boost: number;
}

export interface QueryProcessingConfig {
  fuzzy_search: FuzzySearchConfig;
  semantic_search: SemanticSearchConfig;
  spell_correction: SpellCorrectionConfig;
  auto_complete: AutoCompleteConfig;
  query_expansion: QueryExpansionConfig;
}

export interface FuzzySearchConfig {
  enabled: boolean;
  max_edits: number;
  prefix_length: number;
  max_expansions: number;
  transpositions: boolean;
}

export interface SemanticSearchConfig {
  enabled: boolean;
  model: string;
  similarity_threshold: number;
  weight: number; // نسبة الوزن مقابل البحث النصي
  vector_dimensions: number;
}

export interface SpellCorrectionConfig {
  enabled: boolean;
  confidence_threshold: number;
  max_corrections: number;
  arabic_support: boolean;
  custom_dictionary: boolean;
}

export interface AutoCompleteConfig {
  enabled: boolean;
  max_suggestions: number;
  min_query_length: number;
  fuzzy_suggestions: boolean;
  trending_boost: number;
  personalization_boost: number;
}

export interface QueryExpansionConfig {
  enabled: boolean;
  synonym_expansion: boolean;
  related_terms: boolean;
  max_expansions: number;
  expansion_weight: number;
}

export interface RankingConfig {
  relevance_factors: RelevanceFactor[];
  boost_functions: BoostFunction[];
  personalization_weight: number;
  freshness_decay: FreshnessDecayConfig;
  popularity_boost: PopularityBoostConfig;
}

export interface RelevanceFactor {
  field: string;
  weight: number;
  boost_type: 'linear' | 'exponential' | 'logarithmic';
  normalization: boolean;
}

export interface BoostFunction {
  name: string;
  type: 'field_value' | 'recency' | 'popularity' | 'personalization';
  function: 'linear' | 'exponential' | 'gaussian' | 'custom';
  parameters: any;
  weight: number;
}

export interface FreshnessDecayConfig {
  enabled: boolean;
  decay_function: 'exponential' | 'linear' | 'step';
  half_life: number; // بالأيام
  max_age: number; // بالأيام
}

export interface PopularityBoostConfig {
  enabled: boolean;
  metrics: PopularityMetric[];
  normalization: boolean;
  time_window: number; // بالأيام
}

export interface PopularityMetric {
  name: string;
  field: string;
  weight: number;
  decay_rate: number;
}

export interface PersonalizationConfig {
  enabled: boolean;
  user_profile_weight: number;
  behavior_weight: number;
  preference_weight: number;
  collaborative_filtering: boolean;
  content_based_filtering: boolean;
  hybrid_approach: boolean;
}

export interface PerformanceConfig {
  caching: CachingConfig;
  indexing_performance: IndexingPerformanceConfig;
  query_performance: QueryPerformanceConfig;
}

export interface CachingConfig {
  enabled: boolean;
  query_cache_size: number;
  result_cache_ttl: number; // بالثواني
  facet_cache_ttl: number;
  auto_complete_cache_ttl: number;
  cache_warming: boolean;
}

export interface IndexingPerformanceConfig {
  thread_count: number;
  batch_size: number;
  commit_interval: number; // بالثواني
  memory_buffer_size: number; // بالميجابايت
  compression_enabled: boolean;
}

export interface QueryPerformanceConfig {
  timeout: number; // بالثواني
  max_results: number;
  early_termination: boolean;
  parallel_execution: boolean;
  result_window_limit: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  track_queries: boolean;
  track_results: boolean;
  track_user_behavior: boolean;
  track_performance: boolean;
  aggregation_interval: number; // بالدقائق
  retention_period: number; // بالأيام
}

// إحصائيات البحث
export interface SearchStatistics {
  query_statistics: QueryStatistics;
  result_statistics: ResultStatistics;
  user_statistics: UserStatistics;
  performance_statistics: PerformanceStatistics;
  trend_analysis: TrendAnalysis;
}

export interface QueryStatistics {
  total_queries: number;
  unique_queries: number;
  average_query_length: number;
  most_popular_queries: PopularQuery[];
  query_distribution: QueryDistribution;
  language_distribution: LanguageDistribution[];
  intent_distribution: IntentDistribution[];
}

export interface PopularQuery {
  query: string;
  frequency: number;
  trend: 'up' | 'down' | 'stable';
  categories: string[];
}

export interface QueryDistribution {
  by_length: { [length: number]: number };
  by_type: { [type: string]: number };
  by_complexity: { [complexity: string]: number };
}

export interface LanguageDistribution {
  language: string;
  percentage: number;
  query_count: number;
}

export interface IntentDistribution {
  intent: SearchIntent;
  percentage: number;
  success_rate: number;
}

export interface ResultStatistics {
  total_results_returned: number;
  average_results_per_query: number;
  zero_result_queries: number;
  click_through_rate: number;
  result_satisfaction: number;
  category_performance: CategoryPerformance[];
}

export interface CategoryPerformance {
  category: string;
  result_count: number;
  click_rate: number;
  dwell_time: number;
  satisfaction_score: number;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  repeat_users: number;
  average_queries_per_user: number;
  user_satisfaction: number;
  search_success_rate: number;
}

export interface PerformanceStatistics {
  average_response_time: number;
  cache_hit_rate: number;
  index_size: number;
  memory_usage: number;
  cpu_usage: number;
  error_rate: number;
}

export interface TrendAnalysis {
  daily_trends: DailyTrend[];
  weekly_patterns: WeeklyPattern[];
  seasonal_trends: SeasonalTrend[];
  emerging_topics: EmergingTopic[];
}

export interface DailyTrend {
  date: string;
  query_count: number;
  unique_queries: number;
  top_queries: string[];
}

export interface WeeklyPattern {
  day_of_week: number;
  average_queries: number;
  peak_hours: number[];
  popular_categories: string[];
}

export interface SeasonalTrend {
  period: 'monthly' | 'quarterly' | 'yearly';
  trend_data: any;
  insights: string[];
}

export interface EmergingTopic {
  topic: string;
  growth_rate: number;
  related_queries: string[];
  confidence: number;
}
