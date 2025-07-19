'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface OptimizedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  prefetch?: boolean
  scroll?: boolean
  replace?: boolean
  onMouseEnter?: () => void
}

export default function OptimizedLink({
  href,
  children,
  className = '',
  prefetch = true,
  scroll = true,
  replace = false,
  onMouseEnter
}: OptimizedLinkProps) {
  const router = useRouter()

  // Preload critical routes
  useEffect(() => {
    if (prefetch && typeof window !== 'undefined') {
      // Check if it's a critical route
      const criticalRoutes = ['/news', '/categories', '/insights/deep']
      const isCritical = criticalRoutes.some(route => href.startsWith(route))
      
      if (isCritical) {
        // Preload after a short delay
        const timer = setTimeout(() => {
          router.prefetch(href)
        }, 100)
        
        return () => clearTimeout(timer)
      }
    }
  }, [href, prefetch, router])

  const handleMouseEnter = () => {
    // Prefetch on hover for better UX
    if (prefetch) {
      router.prefetch(href)
    }
    onMouseEnter?.()
  }

  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      scroll={scroll}
      replace={replace}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Link>
  )
}
