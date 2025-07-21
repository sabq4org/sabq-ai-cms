'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  SparklesIcon,
  NewspaperIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface SmartRecommendation {
  id: string
  type: 'similar' | 'analysis' | 'opinion' | 'tip' | 'question'
  title: string
  excerpt?: string
  image?: string
  url: string
  badge?: string
  author?: string
  createdAt?: string
}

interface SmartRecommendationsProps {
  articleId: string
  category: string
  tags: string[]
}

export default function SmartRecommendations({ 
  articleId, 
  category, 
  tags 
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchRecommendations()
  }, [articleId, category, tags])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/recommendations`)

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeConfig = (type: SmartRecommendation['type']) => {
    switch (type) {
      case 'similar':
        return {
          icon: NewspaperIcon,
          label: 'أخبار مشابهة',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      case 'analysis':
        return {
          icon: SparklesIcon,
          label: 'تحليل ذكي',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        }
      case 'opinion':
        return {
          icon: PencilSquareIcon,
          label: 'مقال رأي',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'tip':
        return {
          icon: LightBulbIcon,
          label: 'نصيحة ذكية',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'question':
        return {
          icon: ChatBubbleLeftRightIcon,
          label: 'سؤال تفاعلي',
          color: 'text-rose-600',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200'
        }
      default:
        return {
          icon: NewspaperIcon,
          label: 'محتوى',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev + 1 >= Math.ceil(recommendations.length / 3) ? 0 : prev + 1
    )
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev - 1 < 0 ? Math.ceil(recommendations.length / 3) - 1 : prev - 1
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 my-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 my-8"
    >
      {/* العنوان */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">محتوى مخصص لك</h3>
        </div>

        {/* أزرار التنقل للموبايل */}
        <div className="flex gap-2 md:hidden">
          <button
            onClick={prevSlide}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* التوصيات */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex transition-transform duration-300 ease-in-out md:grid md:grid-cols-3 md:gap-4"
          style={{
            transform: `translateX(${currentSlide * -100}%)`,
          }}
        >
          {recommendations.map((recommendation, index) => {
            const config = getTypeConfig(recommendation.type)
            
            return (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-full md:w-auto"
              >
                {recommendation.type === 'tip' || recommendation.type === 'question' ? (
                  // بطاقة النصيحة أو السؤال
                  <div className={`
                    ${config.bgColor} ${config.borderColor} border-2 rounded-lg p-6 text-center
                    hover:shadow-md transition-all duration-200
                  `}>
                    <config.icon className={`w-8 h-8 mx-auto mb-3 ${config.color}`} />
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 leading-tight">
                      {recommendation.title}
                    </h4>
                    {recommendation.excerpt && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {recommendation.excerpt}
                      </p>
                    )}
                    {recommendation.type === 'question' && (
                      <button className="mt-4 bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors">
                        شاركنا رأيك
                      </button>
                    )}
                  </div>
                ) : (
                  // بطاقة المقال العادية
                  <Link href={recommendation.url} className="block group">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group-hover:border-gray-300">
                      {/* الصورة */}
                      {recommendation.image && (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={recommendation.image}
                            alt={recommendation.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* الشارة */}
                          <div className={`absolute top-3 right-3 ${config.bgColor} ${config.color} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                            <config.icon className="w-3 h-3" />
                            {config.label}
                          </div>
                        </div>
                      )}

                      {/* المحتوى */}
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                          {recommendation.title}
                        </h4>
                        
                        {recommendation.excerpt && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {recommendation.excerpt}
                          </p>
                        )}

                        {/* معلومات إضافية */}
                        {(recommendation.author || recommendation.createdAt) && (
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            {recommendation.author && (
                              <span>{recommendation.author}</span>
                            )}
                            {recommendation.createdAt && (
                              <span>{new Date(recommendation.createdAt).toLocaleDateString('ar')}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* مؤشرات التنقل */}
      {recommendations.length > 3 && (
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {Array.from({ length: Math.ceil(recommendations.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-purple-600 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
