'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    // Simulate route change events (Next.js App Router doesn't have built-in loading states)
    const observer = new MutationObserver(() => {
      setIsLoading(false)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            {/* Spinner محسن */}
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            {/* نص التحميل */}
            <div className="text-sm text-gray-600 font-medium">
              جاري التحميل...
            </div>
          </div>
        </div>
      )}
      
      {/* المحتوى */}
      <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        {children}
      </div>
    </>
  )
}
