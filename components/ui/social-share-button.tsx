'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle,
  Copy,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SocialShareButtonProps {
  url: string
  title: string
  description?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export function SocialShareButton({ 
  url, 
  title, 
  description,
  className,
  size = 'md',
  variant = 'outline'
}: SocialShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || title)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('فشل في نسخ الرابط:', error)
    }
  }

  const openShareLink = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    setShowDropdown(false)
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant={variant}
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(sizeClasses[size], "p-0")}
        title="مشاركة المقال"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      {showDropdown && (
        <>
          {/* خلفية شفافة للإغلاق */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* قائمة المشاركة */}
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-20 min-w-[200px]">
            <div className="p-2 space-y-1">
              {/* تويتر */}
              <button
                onClick={() => openShareLink('twitter')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                <span>تويتر</span>
              </button>

              {/* فيسبوك */}
              <button
                onClick={() => openShareLink('facebook')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                <span>فيسبوك</span>
              </button>

              {/* لينكد إن */}
              <button
                onClick={() => openShareLink('linkedin')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
                <span>لينكد إن</span>
              </button>

              {/* واتساب */}
              <button
                onClick={() => openShareLink('whatsapp')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-green-500" />
                <span>واتساب</span>
              </button>

              <hr className="my-2 border-gray-200 dark:border-gray-600" />

              {/* نسخ الرابط */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface ShareButtonSimpleProps {
  url: string
  title: string
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ShareButtonSimple({ 
  url, 
  title, 
  platform, 
  className,
  size = 'sm'
}: ShareButtonSimpleProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  }

  const platformIcons = {
    twitter: { icon: Twitter, color: 'text-blue-400' },
    facebook: { icon: Facebook, color: 'text-blue-600' },
    linkedin: { icon: Linkedin, color: 'text-blue-700' },
    whatsapp: { icon: MessageCircle, color: 'text-green-500' },
  }

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  const { icon: Icon, color } = platformIcons[platform]

  const openShareLink = () => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openShareLink}
      className={cn(sizeClasses[size], "p-0", className)}
    >
      <Icon className={cn("h-4 w-4", color)} />
    </Button>
  )
}
