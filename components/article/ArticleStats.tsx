'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  HeartIcon, 
  BookmarkIcon, 
  ShareIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid'

interface ArticleStatsProps {
  articleId: string
  initialStats?: {
    views: number
    likes: number
    saves: number
    shares: number
    comments: number
    category: string
    growthRate?: number
  }
}

interface StatsData {
  views: number
  likes: number
  saves: number
  shares: number
  comments: number
  category: string
  growthRate: number
  userInteractions: {
    hasLiked: boolean
    hasSaved: boolean
  }
}

export default function ArticleStats({ articleId, initialStats }: ArticleStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    views: initialStats?.views || 0,
    likes: initialStats?.likes || 0,
    saves: initialStats?.saves || 0,
    shares: initialStats?.shares || 0,
    comments: initialStats?.comments || 0,
    category: initialStats?.category || '',
    growthRate: initialStats?.growthRate || 0,
    userInteractions: {
      hasLiked: false,
      hasSaved: false
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  // جلب الإحصائيات من API
  useEffect(() => {
    fetchStats()
  }, [articleId])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // تسجيل الإعجاب
  const handleLike = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const newStats = await response.json()
        setStats(prev => ({
          ...prev,
          likes: newStats.likes,
          userInteractions: {
            ...prev.userInteractions,
            hasLiked: newStats.hasLiked
          }
        }))
      }
    } catch (error) {
      console.error('Error liking article:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // حفظ المقال
  const handleSave = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/articles/${articleId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const newStats = await response.json()
        setStats(prev => ({
          ...prev,
          saves: newStats.saves,
          userInteractions: {
            ...prev.userInteractions,
            hasSaved: newStats.hasSaved
          }
        }))
      }
    } catch (error) {
      console.error('Error saving article:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // مشاركة المقال
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href
        })
      } else {
        // نسخ الرابط
        await navigator.clipboard.writeText(window.location.href)
        alert('تم نسخ الرابط!')
      }

      // تسجيل المشاركة
      await fetch(`/api/articles/${articleId}/share`, {
        method: 'POST'
      })

      setStats(prev => ({ ...prev, shares: prev.shares + 1 }))
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const statItems = [
    {
      icon: EyeIcon,
      value: stats.views.toLocaleString('ar'),
      label: 'مشاهدة',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      icon: stats.userInteractions.hasLiked ? HeartSolidIcon : HeartIcon,
      value: stats.likes.toLocaleString('ar'),
      label: 'إعجاب',
      color: stats.userInteractions.hasLiked ? 'text-red-500' : 'text-gray-600',
      bgColor: stats.userInteractions.hasLiked ? 'bg-red-50' : 'bg-gray-50',
      onClick: handleLike,
      interactive: true
    },
    {
      icon: stats.userInteractions.hasSaved ? BookmarkSolidIcon : BookmarkIcon,
      value: stats.saves.toLocaleString('ar'),
      label: 'حفظ',
      color: stats.userInteractions.hasSaved ? 'text-blue-500' : 'text-gray-600',
      bgColor: stats.userInteractions.hasSaved ? 'bg-blue-50' : 'bg-gray-50',
      onClick: handleSave,
      interactive: true
    },
    {
      icon: ShareIcon,
      value: stats.shares.toLocaleString('ar'),
      label: 'مشاركة',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      onClick: handleShare,
      interactive: true
    },
    {
      icon: ChatBubbleLeftIcon,
      value: stats.comments.toLocaleString('ar'),
      label: 'تعليق',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 my-8"
    >
      {/* العنوان */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">إحصائيات المقال</h3>
        
        {/* معدل النمو */}
        {stats.growthRate > 0 && (
          <div className="mr-auto bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              <ArrowTrendingUpIcon className="w-4 h-4 inline ml-1" />
            نمو {stats.growthRate}%
          </div>
        )}
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              ${item.bgColor} rounded-lg p-4 text-center transition-all duration-200
              ${item.interactive ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
              ${isLoading && item.interactive ? 'opacity-50 pointer-events-none' : ''}
            `}
            onClick={item.onClick}
          >
            <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
            <div className="text-xl font-bold text-gray-900 mb-1">
              {item.value}
            </div>
            <div className="text-sm text-gray-600">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* التصنيف */}
      {stats.category && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
          <TagIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">التصنيف:</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {stats.category}
          </span>
        </div>
      )}
    </motion.div>
  )
}
