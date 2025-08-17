'use client'

import React, { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"

interface ReadingProgressProps {
  className?: string
  height?: number
  backgroundColor?: string
  progressColor?: string
}

export function ReadingProgress({ 
  className,
  height = 3,
  backgroundColor = 'rgba(0, 0, 0, 0.1)',
  progressColor = '#3b82f6'
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setProgress(Math.min(100, Math.max(0, scrollPercent)))
    }

    // تحديث التقدم عند التحميل
    updateProgress()

    // إضافة مستمع التمرير
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        className
      )}
      style={{ 
        height: `${height}px`,
        backgroundColor 
      }}
    >
      <div 
        className="h-full transition-all duration-150 ease-out"
        style={{ 
          width: `${progress}%`,
          backgroundColor: progressColor
        }}
      />
    </div>
  )
}
