'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Bookmark, Heart, Share2, Grid3X3, List, Filter, 
  Search, X, RefreshCw, BookmarkX, HeartOff, 
  Calendar, Eye, Clock, ChevronDown, SortAsc, SortDesc
} from 'lucide-react'
import ArticleCard from '@/components/ArticleCard'
// Loading spinner component
const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
  )
}

interface Article {
  id: string
  title: string
  summary?: string
  excerpt?: string
  featured_image?: string
  category_id: number
  category_name?: string
  category?: {
    id: string
    name: string
    slug: string
    color: string | null
    icon: string | null
  } | null
  author_name?: string
  author?: {
    id: string
    name: string
    email: string
  } | null
  views_count?: number
  views?: number
  created_at: string
  published_at?: string
  reading_time?: number
  is_breaking?: boolean
  breaking?: boolean
  is_featured?: boolean
  featured?: boolean
  
  // خاص بالتفاعلات
  interaction_date?: string
  interaction_type?: 'like' | 'save' | 'share'
  reading_progress?: number
  last_read_at?: string
}

interface SavedArticlesManagerProps {
  userId: string
  initialTab?: 'saved' | 'liked' | 'shared'
}

type TabType = 'saved' | 'liked' | 'shared'
type ViewMode = 'grid' | 'list'
type SortOption = 'recent' | 'oldest' | 'popular' | 'title'

const TABS: { key: TabType; label: string; icon: React.ReactNode; color: string }[] = [
  { 
    key: 'saved', 
    label: 'المحفوظات', 
    icon: <Bookmark className="w-4 h-4" />, 
    color: 'blue' 
  },
  { 
    key: 'liked', 
    label: 'الإعجابات', 
    icon: <Heart className="w-4 h-4" />, 
    color: 'red' 
  },
  { 
    key: 'shared', 
    label: 'المشاركات', 
    icon: <Share2 className="w-4 h-4" />, 
    color: 'green' 
  }
]

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'recent', label: 'الأحدث أولاً' },
  { key: 'oldest', label: 'الأقدم أولاً' },
  { key: 'popular', label: 'الأكثر مشاهدة' },
  { key: 'title', label: 'حسب العنوان' }
]

export default function SavedArticlesManager({ 
  userId, 
  initialTab = 'saved' 
}: SavedArticlesManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  
  // Stats
  const [stats, setStats] = useState({
    saved: 0,
    liked: 0,
    shared: 0
  })

  // جلب المقالات المحفوظة/المفضلة
  const fetchArticles = useCallback(async (tab: TabType) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/user/interactions?userId=${userId}&type=${tab}&sort=${sortBy}&category=${selectedCategory}&search=${searchQuery}`
      )
      
      if (!response.ok) {
        throw new Error('فشل في جلب البيانات')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setArticles(data.data.articles || [])
        setStats(data.data.stats || stats)
        
        // استخراج التصنيفات المتاحة
        const uniqueCategories = Array.from(
          new Set(data.data.articles?.map((a: Article) => a.category_name).filter(Boolean))
        ) as string[]
        setCategories(uniqueCategories)
      } else {
        toast.error(data.error || 'خطأ في جلب البيانات')
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error)
      toast.error('فشل في تحميل المقالات')
    } finally {
      setLoading(false)
    }
  }, [userId, sortBy, selectedCategory, searchQuery, stats])

  // إزالة تفاعل
  const removeInteraction = async (articleId: string, type: TabType) => {
    setRemoving(articleId)
    try {
      const response = await fetch('/api/interactions/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          articleId,
          type,
          action: 'remove'
        })
      })

      if (!response.ok) {
        throw new Error('فشل في إزالة التفاعل')
      }

      const data = await response.json()
      
      if (data.success) {
        // إزالة المقال من القائمة
        setArticles(prev => prev.filter(article => article.id !== articleId))
        
        // تحديث الإحصائيات
        setStats(prev => ({
          ...prev,
          [type]: Math.max(0, prev[type] - 1)
        }))
        
        toast.success(
          type === 'saved' ? 'تمت إزالة المقال من المحفوظات' :
          type === 'liked' ? 'تمت إزالة الإعجاب' :
          'تمت إزالة المشاركة'
        )
      } else {
        toast.error(data.error || 'فشل في إزالة التفاعل')
      }
    } catch (error) {
      console.error('خطأ في إزالة التفاعل:', error)
      toast.error('فشل في إزالة التفاعل')
    } finally {
      setRemoving(null)
    }
  }

  // تحديث البحث والفلاتر
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchArticles(activeTab)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [activeTab, fetchArticles])

  // تغيير التبويب
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSearchQuery('')
    setSelectedCategory('')
  }

  // مسح الفلاتر
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSortBy('recent')
  }

  // فلترة وترتيب المقالات
  const filteredArticles = React.useMemo(() => {
    let filtered = articles

    // البحث
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // التصنيف
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category_name === selectedCategory)
    }

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.interaction_date || b.created_at).getTime() - 
                 new Date(a.interaction_date || a.created_at).getTime()
        case 'oldest':
          return new Date(a.interaction_date || a.created_at).getTime() - 
                 new Date(b.interaction_date || b.created_at).getTime()
        case 'popular':
          return (b.views_count || b.views || 0) - (a.views_count || a.views || 0)
        case 'title':
          return a.title.localeCompare(b.title, 'ar')
        default:
          return 0
      }
    })

    return filtered
  }, [articles, searchQuery, selectedCategory, sortBy])

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          مكتبتي الشخصية
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إدارة مقالاتك المحفوظة والمفضلة
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 lg:mb-0">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? `bg-${tab.color}-500 text-white shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {stats[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في المقالات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">جميع التصنيفات</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
          مسح الفلاتر
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            {activeTab === 'saved' && <Bookmark className="w-12 h-12 text-gray-400" />}
            {activeTab === 'liked' && <Heart className="w-12 h-12 text-gray-400" />}
            {activeTab === 'shared' && <Share2 className="w-12 h-12 text-gray-400" />}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {activeTab === 'saved' && 'لا توجد مقالات محفوظة'}
            {activeTab === 'liked' && 'لا توجد مقالات مفضلة'}
            {activeTab === 'shared' && 'لا توجد مقالات مشاركة'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || selectedCategory 
              ? 'لا توجد نتائج تطابق فلاترك'
              : 'ابدأ بتجميع مقالاتك المفضلة'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              عرض {filteredArticles.length} من {articles.length} مقال
            </p>
            <button
              onClick={() => fetchArticles(activeTab)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
          </div>

          {/* Articles Grid/List */}
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredArticles.map(article => (
              <div key={article.id} className="relative group">
                <ArticleCard 
                  article={article} 
                  viewMode={viewMode}
                />
                
                {/* Remove Button Overlay */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeInteraction(article.id, activeTab)
                    }}
                    disabled={removing === article.id}
                    className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                      activeTab === 'saved' 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : activeTab === 'liked'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    } ${removing === article.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={`إزالة من ${TABS.find(t => t.key === activeTab)?.label}`}
                  >
                    {removing === article.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : activeTab === 'saved' ? (
                      <BookmarkX className="w-4 h-4" />
                    ) : activeTab === 'liked' ? (
                      <HeartOff className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Interaction Info */}
                {(article.interaction_date || article.reading_progress) && (
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {article.interaction_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.interaction_date).toLocaleDateString('ar-SA')}
                      </div>
                    )}
                    {article.reading_progress && article.reading_progress > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        قُرئ {Math.round(article.reading_progress * 100)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 