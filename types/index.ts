export * from './deep-analysis';
export * from './team';
export * from './roles';
export * from './smart-block';
export * from './reader-profile';
export * from './opinions';

// Additional utility types
export type Status = 'loading' | 'success' | 'error' | 'idle'

export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

export interface BaseEntity {
  id: string
  created_at: Date
  updated_at: Date
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sort_by?: string
  order?: 'asc' | 'desc'
}

export interface SearchParams {
  search?: string
  filters?: Record<string, any>
} 