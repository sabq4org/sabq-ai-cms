import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

interface ReadingTrackerData {
  userId?: string
  articleId: string
  sessionId: string
  startTime: Date
  scrollDepth: number
  readingProgress: number
  totalDuration: number
  activeDuration: number
  idleTime: number
  clicksCount: number
  scrollsCount: number
  completed: boolean
}

interface TrackerConfig {
  minReadingTime?: number // الحد الأدنى للوقت ليعتبر قراءة (بالثواني)
  idleThreshold?: number // عتبة الخمول (بالثواني)
  progressThreshold?: number // نسبة اكتمال القراءة
  enableRealTimeTracking?: boolean // تفعيل التتبع المباشر
}

const defaultConfig: TrackerConfig = {
  minReadingTime: 10,
  idleThreshold: 30,
  progressThreshold: 0.8,
  enableRealTimeTracking: true
}

export function useReadingTracker(
  userId: string | undefined,
  articleId: string,
  config: TrackerConfig = {}
) {
  const mergedConfig = { ...defaultConfig, ...config }
  const [isTracking, setIsTracking] = useState(false)
  const [sessionData, setSessionData] = useState<ReadingTrackerData | null>(null)
  
  // References for tracking
  const sessionIdRef = useRef<string | undefined>(undefined)
  const startTimeRef = useRef<Date | undefined>(undefined)
  const lastActivityRef = useRef<Date | undefined>(undefined)
  const idleTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const scrollDepthRef = useRef<number>(0)
  const clickCountRef = useRef<number>(0)
  const scrollCountRef = useRef<number>(0)
  const totalDurationRef = useRef<number>(0)
  const activeDurationRef = useRef<number>(0)
  const idleTimeRef = useRef<number>(0)
  const lastScrollTimeRef = useRef<Date | undefined>(undefined)

  // Generate unique session ID
  const generateSessionId = () => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Calculate scroll depth
  const calculateScrollDepth = (): number => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    return scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0
  }

  // Calculate reading progress based on visible text
  const calculateReadingProgress = (): number => {
    const scrollDepth = calculateScrollDepth()
    // تقدير تقريبي: التمرير 60% = قراءة 80%
    return Math.min(scrollDepth * 1.33, 1)
  }

  // Get device information
  const getDeviceInfo = () => {
    const ua = navigator.userAgent
    let deviceType = 'desktop'
    
    if (/Mobile|Android|iPhone|iPad/.test(ua)) {
      deviceType = /iPad/.test(ua) ? 'tablet' : 'mobile'
    }
    
    return {
      deviceType,
      screenSize: `${screen.width}x${screen.height}`,
      browser: getBrowserName(ua),
      operatingSystem: getOSName(ua)
    }
  }

  const getBrowserName = (ua: string): string => {
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  const getOSName = (ua: string): string => {
    if (ua.includes('Windows')) return 'Windows'
    if (ua.includes('Mac')) return 'macOS'
    if (ua.includes('Linux')) return 'Linux'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  // Handle user activity
  const handleActivity = () => {
    lastActivityRef.current = new Date()
    
    // Clear idle timeout
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
    }
    
    // Set new idle timeout
    idleTimeoutRef.current = setTimeout(() => {
      const idleStart = lastActivityRef.current
      const idleEnd = new Date()
      const idleDuration = (idleEnd.getTime() - idleStart!.getTime()) / 1000
      idleTimeRef.current += idleDuration
    }, mergedConfig.idleThreshold! * 1000)
  }

  // Handle scroll events
  const handleScroll = () => {
    const currentScrollDepth = calculateScrollDepth()
    if (currentScrollDepth > scrollDepthRef.current) {
      scrollDepthRef.current = currentScrollDepth
    }
    
    const now = new Date()
    if (!lastScrollTimeRef.current || now.getTime() - lastScrollTimeRef.current.getTime() > 500) {
      scrollCountRef.current += 1
      lastScrollTimeRef.current = now
    }
    
    handleActivity()
  }

  // Handle click events
  const handleClick = () => {
    clickCountRef.current += 1
    handleActivity()
  }

  // Send tracking data to server
  const sendTrackingData = async (isComplete = false) => {
    if (!sessionIdRef.current || !startTimeRef.current || !userId) return

    const now = new Date()
    const totalDuration = (now.getTime() - startTimeRef.current.getTime()) / 1000
    const deviceInfo = getDeviceInfo()
    
    const trackingData = {
      userId,
      articleId,
      sessionId: sessionIdRef.current,
      startTime: startTimeRef.current,
      endTime: isComplete ? now : undefined,
      totalDuration: Math.round(totalDuration),
      activeDuration: Math.round(totalDuration - idleTimeRef.current),
      idleTime: Math.round(idleTimeRef.current),
      scrollDepth: scrollDepthRef.current,
      readingProgress: calculateReadingProgress(),
      clicksCount: clickCountRef.current,
      scrollsCount: scrollCountRef.current,
      completed: isComplete || calculateReadingProgress() >= mergedConfig.progressThreshold!,
      ...deviceInfo,
      source: document.referrer ? 'referrer' : 'direct',
      referrer: document.referrer || undefined,
      metadata: {
        url: window.location.href,
        title: document.title,
        timestamp: now.toISOString()
      }
    }

    try {
      const response = await fetch('/api/reading-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('📊 تم حفظ بيانات جلسة القراءة:', result)
      
    } catch (error) {
      console.error('❌ خطأ في حفظ بيانات التتبع:', error)
    }
  }

  // Start tracking
  const startTracking = () => {
    if (isTracking || !userId) return

    sessionIdRef.current = generateSessionId()
    startTimeRef.current = new Date()
    lastActivityRef.current = new Date()
    setIsTracking(true)

    // Reset counters
    scrollDepthRef.current = 0
    clickCountRef.current = 0
    scrollCountRef.current = 0
    idleTimeRef.current = 0

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('mousemove', handleActivity)

    // Set up heartbeat for real-time tracking
    if (mergedConfig.enableRealTimeTracking) {
      heartbeatIntervalRef.current = setInterval(() => {
        sendTrackingData(false)
      }, 30000) // Send data every 30 seconds
    }

    console.log('📖 بدء تتبع جلسة القراءة:', sessionIdRef.current)
  }

  // Stop tracking
  const stopTracking = () => {
    if (!isTracking) return

    // Send final data
    sendTrackingData(true)

    // Clear intervals and timeouts
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
    }

    // Remove event listeners
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('click', handleClick)
    window.removeEventListener('keydown', handleActivity)
    window.removeEventListener('mousemove', handleActivity)

    setIsTracking(false)
    console.log('🔚 انتهاء تتبع جلسة القراءة')
  }

  // Initialize tracking on mount
  useEffect(() => {
    if (userId && articleId) {
      startTracking()
    }

    // Cleanup on unmount
    return () => {
      stopTracking()
    }
  }, [userId, articleId])

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden - stop heartbeat but keep tracking
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
        }
      } else {
        // Page visible - resume heartbeat
        if (isTracking && mergedConfig.enableRealTimeTracking) {
          heartbeatIntervalRef.current = setInterval(() => {
            sendTrackingData(false)
          }, 30000)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isTracking])

  // Get current session stats
  const getCurrentStats = () => {
    if (!isTracking || !startTimeRef.current) return null

    const now = new Date()
    const totalDuration = (now.getTime() - startTimeRef.current.getTime()) / 1000

    return {
      sessionId: sessionIdRef.current,
      totalDuration: Math.round(totalDuration),
      activeDuration: Math.round(totalDuration - idleTimeRef.current),
      scrollDepth: scrollDepthRef.current,
      readingProgress: calculateReadingProgress(),
      clicksCount: clickCountRef.current,
      scrollsCount: scrollCountRef.current,
      completed: calculateReadingProgress() >= mergedConfig.progressThreshold!
    }
  }

  return {
    isTracking,
    startTracking,
    stopTracking,
    getCurrentStats,
    sessionData
  }
} 