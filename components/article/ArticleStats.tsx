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
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
      borderColor: 'border-indigo-200 dark:border-indigo-700/50',
      iconBg: 'bg-indigo-500'
    },
    {
      icon: stats.userInteractions.hasLiked ? HeartSolidIcon : HeartIcon,
      value: stats.likes.toLocaleString('ar'),
      label: 'إعجاب',
      color: stats.userInteractions.hasLiked ? 'text-red-600 dark:text-red-400' : 'text-rose-600 dark:text-rose-400',
      bgColor: stats.userInteractions.hasLiked 
        ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20' 
        : 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20',
      borderColor: stats.userInteractions.hasLiked 
        ? 'border-red-200 dark:border-red-700/50' 
        : 'border-rose-200 dark:border-rose-700/50',
      iconBg: 'bg-red-500',
      onClick: handleLike,
      interactive: true
    },
    {
      icon: stats.userInteractions.hasSaved ? BookmarkSolidIcon : BookmarkIcon,
      value: stats.saves.toLocaleString('ar'),
      label: 'حفظ',
      color: stats.userInteractions.hasSaved ? 'text-blue-600 dark:text-blue-400' : 'text-cyan-600 dark:text-cyan-400',
      bgColor: stats.userInteractions.hasSaved 
        ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' 
        : 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20',
      borderColor: stats.userInteractions.hasSaved 
        ? 'border-blue-200 dark:border-blue-700/50' 
        : 'border-cyan-200 dark:border-cyan-700/50',
      iconBg: 'bg-blue-500',
      onClick: handleSave,
      interactive: true
    },
    {
      icon: ShareIcon,
      value: stats.shares.toLocaleString('ar'),
      label: 'مشاركة',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
      borderColor: 'border-emerald-200 dark:border-emerald-700/50',
      iconBg: 'bg-emerald-500',
      onClick: handleShare,
      interactive: true
    },
    {
      icon: ChatBubbleLeftIcon,
      value: stats.comments.toLocaleString('ar'),
      label: 'تعليق',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
      borderColor: 'border-amber-200 dark:border-amber-700/50',
      iconBg: 'bg-amber-500'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 my-8 backdrop-blur-sm"
    >
      {/* العنوان */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 via-purple-600/20 to-pink-500/20 rounded-2xl blur-lg -z-10"></div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">إحصائيات المقال</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">تفاعل القراء مع المحتوى</p>
        </div>
        
        {/* معدل النمو */}
        {stats.growthRate > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
          >
            <ArrowTrendingUpIcon className="w-4 h-4 inline ml-1" />
            نمو {stats.growthRate}%
          </motion.div>
        )}
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {statItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            whileHover={item.interactive ? { 
              scale: 1.05, 
              y: -2,
              transition: { duration: 0.2 }
            } : {}}
            whileTap={item.interactive ? { scale: 0.95 } : {}}
            className={`
              ${item.bgColor} ${item.borderColor} 
              rounded-2xl p-6 text-center transition-all duration-300
              border-2 relative overflow-hidden group
              ${item.interactive ? 'cursor-pointer hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50' : ''}
              ${isLoading && item.interactive ? 'opacity-50 pointer-events-none' : ''}
            `}
            onClick={item.onClick}
          >
            {/* خلفية متحركة */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* الأيقونة */}
            <div className="relative mb-4">
              <div className={`w-12 h-12 ${item.iconBg} rounded-xl mx-auto flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* الرقم */}
            <div className={`text-2xl font-bold ${item.color} mb-2 relative`}>
              {item.value}
            </div>
            
            {/* التسمية */}
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium relative">
              {item.label}
            </div>

            {/* تأثير النقر */}
            {item.interactive && (
              <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/20 opacity-0 group-active:opacity-100 transition-opacity duration-150 rounded-2xl"></div>
            )}
          </motion.div>
        ))}
      </div>

      {/* التصنيف */}
      {stats.category && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <TagIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">التصنيف:</span>
          <span className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-700/50">
            {stats.category}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
