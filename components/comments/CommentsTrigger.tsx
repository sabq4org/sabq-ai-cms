'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentsTriggerProps {
  articleId: string
  initialCount: number
  className?: string
}

export default function CommentsTrigger({ 
  articleId, 
  initialCount, 
  className 
}: CommentsTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [CommentsPanel, setCommentsPanel] = useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Dynamic import للمكون
  const loadCommentsPanel = async () => {
    if (CommentsPanel) return // Already loaded
    
    setIsLoading(true)
    try {
      const { default: PanelComponent } = await import('./CommentsPanel')
      setCommentsPanel(() => PanelComponent)
    } catch (error) {
      console.error('فشل في تحميل التعليقات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenComments = async () => {
    await loadCommentsPanel()
    setIsOpen(true)
    
    // Track analytics
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'open_comments',
            articleId,
            timestamp: Date.now()
          })
        })
      } catch (e) {
        // Silent fail for analytics
      }
    }
  }

  // Prefetch على المرور القريب (optimization ذكية)
  useEffect(() => {
    const prefetchOnHover = () => {
      if (!CommentsPanel && !isLoading) {
        loadCommentsPanel()
      }
    }

    const triggerElement = document.querySelector('[data-comments-trigger]')
    if (triggerElement) {
      triggerElement.addEventListener('mouseenter', prefetchOnHover)
      return () => triggerElement.removeEventListener('mouseenter', prefetchOnHover)
    }
  }, [CommentsPanel, isLoading])

  if (isOpen && CommentsPanel) {
    return (
      <section 
        className={cn("mt-6 space-y-4", className)}
        role="region"
        aria-label="قسم التعليقات"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            التعليقات ({initialCount})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق التعليقات"
          >
            إغلاق ×
          </Button>
        </div>
        <CommentsPanel articleId={articleId} />
      </section>
    )
  }

  return (
    <section className={cn("mt-6", className)}>
      <Button
        variant="outline"
        size="lg"
        className="w-full h-auto p-4 justify-start gap-3 text-right"
        onClick={handleOpenComments}
        disabled={isLoading}
        data-comments-trigger
        aria-expanded={isOpen}
        aria-controls="comments-panel"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-sm">
            {initialCount}
          </Badge>
        </div>
        <div className="flex-1">
          <div className="font-medium text-base">
            {isLoading ? 'جاري التحميل...' : 'اعرض التعليقات'}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            اضغط للاطلاع على آراء القراء
          </div>
        </div>
        <Eye className="h-4 w-4 text-gray-400" />
      </Button>
      
      {/* Skeleton محجوز للمساحة */}
      <div 
        id="comments-panel" 
        className="h-0 overflow-hidden transition-all duration-300"
        aria-hidden={!isOpen}
      />
    </section>
  )
}
