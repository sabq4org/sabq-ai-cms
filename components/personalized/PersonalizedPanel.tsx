'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getArticleLink } from '@/lib/utils'
import { 
  Sparkles, 
  Clock, 
  Eye, 
  TrendingUp,
  Heart,
  BookOpen,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface PersonalizedArticle {
  id: string
  title: string
  excerpt: string
  category: string
  publishedAt: string
  timeAgo: string
  imageUrl?: string
  readTime: number
  views: number
  score: number // درجة التخصيص
  reason: string // سبب الاقتراح
}

interface PersonalizedResponse {
  items: PersonalizedArticle[]
  recommendations: {
    trending: PersonalizedArticle[]
    similar: PersonalizedArticle[]
    categories: PersonalizedArticle[]
  }
  userPreferences: {
    topCategories: string[]
    readingHabits: string[]
  }
}

interface PersonalizedPanelProps {
  userId?: string
}

// Fetcher مع private cache
const fetcher = async (url: string): Promise<PersonalizedResponse> => {
  const startTime = performance.now()
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'private, no-cache', // لا cache مشترك
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: فشل في تحميل المحتوى المخصص`)
  }
  
  const data = await response.json()
  
  if (process.env.NODE_ENV === 'development') {
    const loadTime = performance.now() - startTime
    console.log(`تحميل المحتوى المخصص: ${loadTime.toFixed(2)}ms`)
  }
  
  return data
}

export default function PersonalizedPanel({ userId }: PersonalizedPanelProps) {
  const [activeTab, setActiveTab] = useState<'recommended' | 'trending' | 'similar'>('recommended')
  
  const { 
    data, 
    error, 
    isLoading,
    mutate 
  } = useSWR<PersonalizedResponse>(
    `/api/personalized${userId ? `?userId=${userId}` : ''}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 دقائق
      errorRetryCount: 2,
    }
  )

  const handleRefresh = () => {
    mutate()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="جاري تحميل المحتوى المخصص">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {['مقترح', 'رائج', 'مشابه'].map((_, i) => (
              <div key={i} className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Content skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-20 h-16 bg-gray-200 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-5 w-12 bg-gray-200 rounded" />
                    <div className="h-5 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h4 className="font-medium text-red-800 mb-2">تعذر تحميل المحتوى المخصص</h4>
          <p className="text-sm text-red-600 mb-4">
            حدث خطأ أثناء جلب المقترحات الشخصية
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentItems = activeTab === 'recommended' ? data?.items :
                      activeTab === 'trending' ? data?.recommendations.trending :
                      data?.recommendations.similar

  return (
    <div className="space-y-4">
      {/* User preferences summary */}
      {data?.userPreferences && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-2">اهتماماتك الرئيسية:</h4>
                <div className="flex flex-wrap gap-1">
                  {data.userPreferences.topCategories.slice(0, 4).map((category: string) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Button
            variant={activeTab === 'recommended' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('recommended')}
            className="text-xs gap-1"
          >
            <Sparkles className="h-3 w-3" />
            مقترح
          </Button>
          <Button
            variant={activeTab === 'trending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('trending')}
            className="text-xs gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            رائج
          </Button>
          <Button
            variant={activeTab === 'similar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('similar')}
            className="text-xs gap-1"
          >
            <BookOpen className="h-3 w-3" />
            مشابه
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="gap-1"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {/* Articles list */}
      {currentItems && currentItems.length > 0 ? (
        <div className="space-y-3">
          {currentItems.slice(0, 5).map((article: PersonalizedArticle) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-4">
                <Link href={getArticleLink(article)} className="block">
                  <div className="flex gap-3">
                    {/* Article image */}
                    {article.imageUrl && (
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="80px"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h4>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="outline" className="px-1 py-0 h-5 text-xs">
                          {article.category}
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime} د
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views}
                        </div>

                        {article.score > 0.8 && (
                          <Badge variant="secondary" className="px-1 py-0 h-5 text-xs bg-green-50 text-green-700">
                            مطابق جداً
                          </Badge>
                        )}
                      </div>
                      
                      {article.reason && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          💡 {article.reason}
                        </p>
                      )}
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors mt-1" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>لا توجد مقترحات متاحة حالياً</p>
            <p className="text-sm">تفاعل مع المزيد من المقالات لتحسين التوصيات</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
