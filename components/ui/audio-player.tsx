'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  SkipBack,
  SkipForward
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  src?: string
  title?: string
  className?: string
  autoPlay?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export function AudioPlayer({ 
  src, 
  title = "ملخص صوتي", 
  className, 
  autoPlay = false,
  onPlay,
  onPause,
  onEnded
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // تشغيل/إيقاف الصوت
  const togglePlay = async () => {
    if (!audioRef.current || !src) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        onPause?.()
      } else {
        setIsLoading(true)
        await audioRef.current.play()
        setIsPlaying(true)
        setIsLoading(false)
        onPlay?.()
      }
    } catch (error) {
      console.error('خطأ في تشغيل الصوت:', error)
      setIsLoading(false)
    }
  }

  // إيقاف الصوت
  const stopAudio = () => {
    if (!audioRef.current) return
    
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
  }

  // كتم/إلغاء كتم الصوت
  const toggleMute = () => {
    if (!audioRef.current) return
    
    audioRef.current.muted = !audioRef.current.muted
    setIsMuted(!isMuted)
  }

  // تخطي للخلف 10 ثوان
  const skipBackward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
  }

  // تخطي للأمام 10 ثوان
  const skipForward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
  }

  // النقر على شريط التقدم
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // تنسيق الوقت
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // أحداث الصوت
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      onEnded?.()
    }

    const handleLoadStart = () => {
      setIsLoading(true)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [onEnded])

  // التشغيل التلقائي
  useEffect(() => {
    if (autoPlay && src && audioRef.current) {
      togglePlay()
    }
  }, [autoPlay, src])

  if (!src) {
    return (
      <Card className={cn("bg-gray-50 dark:bg-gray-800", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-gray-500">
            <Volume2 className="h-5 w-5 ml-2" />
            <span>لا يوجد ملف صوتي</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-white dark:bg-gray-900 border shadow-sm", className)}>
      <CardContent className="p-4">
        {/* عنوان المشغل */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">{title}</h4>
          <div className="flex items-center text-xs text-gray-500">
            {duration > 0 && (
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            )}
          </div>
        </div>

        {/* شريط التقدم */}
        <div 
          ref={progressRef}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer mb-3"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipBackward}
            disabled={!src}
            className="h-8 w-8 p-0"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={togglePlay}
            disabled={!src || isLoading}
            className="h-10 w-10 rounded-full"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 mr-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={skipForward}
            disabled={!src}
            className="h-8 w-8 p-0"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={stopAudio}
            disabled={!src}
            className="h-8 w-8 p-0"
          >
            <Square className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            disabled={!src}
            className="h-8 w-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* عنصر الصوت */}
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}
