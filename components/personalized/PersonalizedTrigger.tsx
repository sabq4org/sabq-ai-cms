'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, User, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PersonalizedTriggerProps {
  className?: string
  userId?: string
}

export default function PersonalizedTrigger({ 
  className, 
  userId 
}: PersonalizedTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [PersonalizedPanel, setPersonalizedPanel] = useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Dynamic import للمكون
  const loadPersonalizedPanel = async () => {
    if (PersonalizedPanel) return
    
    setIsLoading(true)
    try {
      const { default: PanelComponent } = await import('./PersonalizedPanel')
      setPersonalizedPanel(() => PanelComponent)
    } catch (error) {
      console.error('فشل في تحميل المحتوى المخصص:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenPersonalized = async () => {
    await loadPersonalizedPanel()
    setIsOpen(true)
    
    // Track analytics
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'open_personalized',
            userId,
            timestamp: Date.now()
          })
        })
      } catch (e) {
        // Silent fail
      }
    }
  }

  // Prefetch on hover
  useEffect(() => {
    const prefetchOnHover = () => {
      if (!PersonalizedPanel && !isLoading) {
        loadPersonalizedPanel()
      }
    }

    const triggerElement = document.querySelector('[data-personalized-trigger]')
    if (triggerElement) {
      triggerElement.addEventListener('mouseenter', prefetchOnHover)
      return () => triggerElement.removeEventListener('mouseenter', prefetchOnHover)
    }
  }, [PersonalizedPanel, isLoading])

  if (isOpen && PersonalizedPanel) {
    return (
      <section 
        className={cn("mt-6 space-y-4", className)}
        role="region"
        aria-label="المحتوى المخصص لك"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            مخصص لك
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق المحتوى المخصص"
          >
            إغلاق ×
          </Button>
        </div>
        <PersonalizedPanel userId={userId} />
      </section>
    )
  }

  return (
    <section className={cn("mt-6", className)}>
      <div 
        className="relative overflow-hidden rounded-xl border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-blue-900/20"
        data-personalized-trigger
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2 w-8 h-8 bg-purple-400 rounded-full blur-sm" />
          <div className="absolute bottom-2 left-2 w-6 h-6 bg-blue-400 rounded-full blur-sm" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-pink-400 rounded-full blur-sm" />
        </div>
        
        <div className="relative p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            محتوى مخصص لك
          </h4>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            اكتشف مقالات وأخبار تتناسب مع اهتماماتك الشخصية
          </p>

          <div className="flex justify-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
              🎯 مقترحات ذكية
            </Badge>
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
              📚 بناءً على قراءاتك
            </Badge>
          </div>
          
          <Button
            onClick={handleOpenPersonalized}
            disabled={isLoading}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري التحميل...
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                اعرض مقترحاتي
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            يتم تخصيص المحتوى بناءً على تفضيلاتك وسجل قراءاتك
          </p>
        </div>
      </div>
      
      {/* Skeleton محجوز للمساحة */}
      <div 
        className="h-0 overflow-hidden transition-all duration-300"
        aria-hidden={!isOpen}
      />
    </section>
  )
}
