// Opinion Article Types
export interface OpinionArticle {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  status: 'draft' | 'published' | 'pending_review' | 'scheduled'
  featured: boolean
  pinned: boolean
  opinion_type: 'short' | 'extended'
  mood: 'positive' | 'negative' | 'neutral' | 'analytical'
  
  // AI Generated Content
  ai_summary?: string
  ai_summary_audio_url?: string
  ai_generated_title_suggestions?: string[]
  ai_extracted_tags?: string[]
  ai_key_points?: string[]
  
  // SEO
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  
  // Engagement
  views_count: number
  likes_count: number
  comments_count: number
  shares_count: number
  reading_time_minutes: number
  
  // Publishing
  published_at?: Date
  scheduled_for?: Date
  
  // Author
  author_id: string
  author?: OpinionAuthor
  
  // Tags and Categories  
  tags?: string[]
  
  // Timestamps
  created_at: Date
  updated_at: Date
}

// Opinion Author Types
export interface OpinionAuthor {
  id: string
  name: string
  email: string
  bio?: string
  avatar_url?: string
  specialization?: string
  verified: boolean
  
  // Social Links
  twitter_url?: string
  linkedin_url?: string
  website_url?: string
  
  // Stats
  articles_count: number
  total_views: number
  total_likes: number
  
  // Timestamps
  created_at: Date
  updated_at: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Filter and Search Types
export interface OpinionFilters {
  status?: OpinionArticle['status'] | 'all'
  author_id?: string
  featured?: boolean
  pinned?: boolean
  mood?: OpinionArticle['mood']
  opinion_type?: OpinionArticle['opinion_type']
  tags?: string[]
  search?: string
  sort_by?: 'latest' | 'oldest' | 'views' | 'likes' | 'comments' | 'trending'
  has_audio?: boolean
  page?: number
  limit?: number
}

// Analytics Types
export interface OpinionAnalytics {
  summary: {
    total_articles: number
    published_articles: number
    draft_articles: number
    featured_articles: number
    total_views: number
    total_likes: number
    total_comments: number
    total_shares: number
    average_reading_time: number
  }
  
  performance: {
    top_articles: Array<{
      id: string
      title: string
      views: number
      likes: number
      engagement_score: number
    }>
    trending_articles: Array<{
      id: string
      title: string
      recent_views: number
      growth_rate: number
    }>
  }
  
  content_analysis: {
    mood_distribution: Record<OpinionArticle['mood'], number>
    type_distribution: Record<OpinionArticle['opinion_type'], number>
    popular_tags: Array<{
      tag: string
      count: number
    }>
  }
  
  authors: Array<{
    id: string
    name: string
    articles_count: number
    total_views: number
    average_engagement: number
  }>
  
  timeline: Array<{
    date: string
    articles_published: number
    total_views: number
    total_engagement: number
  }>
  
  insights: Array<{
    type: 'performance' | 'content' | 'engagement' | 'trending'
    title: string
    description: string
    trend: 'up' | 'down' | 'stable'
    percentage?: number
  }>
}

// Form Types
export interface CreateOpinionRequest {
  title: string
  content: string
  excerpt?: string
  author_id: string
  opinion_type: OpinionArticle['opinion_type']
  mood: OpinionArticle['mood']
  tags?: string[]
  featured?: boolean
  pinned?: boolean
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  ai_summary?: string
  ai_summary_audio_url?: string
  scheduled_for?: Date
  status: OpinionArticle['status']
}

export interface UpdateOpinionRequest extends Partial<CreateOpinionRequest> {
  id: string
}

export interface BulkOpinionAction {
  action: 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'pin' | 'unpin' | 'delete'
  article_ids: string[]
}

// Component Props Types
export interface OpinionCardProps {
  article: OpinionArticle
  variant?: 'default' | 'featured' | 'compact'
  showAuthor?: boolean
  showStats?: boolean
  showExcerpt?: boolean
  className?: string
}

export interface AuthorCardProps {
  author: OpinionAuthor
  showStats?: boolean
  showBio?: boolean
  className?: string
}

// Hook Types
export interface UseOpinionsOptions extends OpinionFilters {
  enabled?: boolean
  refetchInterval?: number
}

export interface UseOpinionsReturn {
  articles: OpinionArticle[]
  loading: boolean
  error: string | null
  pagination: PaginatedResponse<OpinionArticle>['pagination']
  refetch: () => Promise<void>
  hasMore: boolean
  loadMore: () => Promise<void>
}

// Dashboard Types
export interface DashboardStats {
  total_articles: number
  published_articles: number
  draft_articles: number
  featured_articles: number
  total_views: number
  total_likes: number
  average_reading_time: number
  recent_activity: Array<{
    id: string
    type: 'created' | 'published' | 'updated' | 'featured'
    article_title: string
    timestamp: Date
  }>
}
