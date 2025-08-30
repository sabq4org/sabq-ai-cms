'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Flag, 
  Clock,
  User,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Comment {
  id: string
  author: {
    name: string
    avatar?: string
  }
  text: string
  timestamp: string
  timeAgo: string
  likes: number
  replies: number
  isLiked: boolean
  isApproved: boolean
}

interface CommentsResponse {
  items: Comment[]
  hasMore: boolean
  nextCursor?: string
  total: number
}

interface CommentsPanelProps {
  articleId: string
}

// Fetcher function مع Server-Timing
const fetcher = async (url: string): Promise<CommentsResponse> => {
  const startTime = performance.now()
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  // Log timing للتطوير
  if (process.env.NODE_ENV === 'development') {
    const loadTime = performance.now() - startTime
    console.log(`تحميل التعليقات: ${loadTime.toFixed(2)}ms`)
  }
  
  return data
}

export default function CommentsPanel({ articleId }: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cursor, setCursor] = useState<string>()
  
  const { 
    data, 
    error, 
    isLoading,
    mutate 
  } = useSWR<CommentsResponse>(
    `/api/comments-optimized?articleId=${articleId}${cursor ? `&cursor=${cursor}` : ''}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 دقيقة
    }
  )

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          articleId,
          text: newComment.trim(),
        })
      })
      
      if (!response.ok) {
        throw new Error('فشل في إرسال التعليق')
      }
      
      setNewComment('')
      toast.success('تم إرسال تعليقك وهو قيد المراجعة')
      
      // Refresh comments
      mutate()
      
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('فشل في إرسال التعليق')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include',
      })
      mutate()
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  // Loading state مع skeleton
  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="جاري تحميل التعليقات">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>تعذر تحميل التعليقات</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => mutate()}
          >
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* نموذج التعليق الجديد */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              شارك رأيك
            </h4>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب تعليقك هنا..."
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {newComment.length}/500 حرف
              </span>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                إرسال
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة التعليقات */}
      {data?.items && data.items.length > 0 ? (
        <div className="space-y-4">
          {data.items.map((comment) => (
            <Card key={comment.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.author.name}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {comment.timeAgo}
                      </div>
                      {!comment.isApproved && (
                        <Badge variant="secondary" className="text-xs">
                          قيد المراجعة
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {comment.text}
                    </p>
                    
                    <div className="flex items-center gap-4 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-auto p-1 gap-1 text-xs",
                          comment.isLiked && "text-red-500"
                        )}
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <Heart className={cn(
                          "h-3 w-3",
                          comment.isLiked && "fill-current"
                        )} />
                        {comment.likes}
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="h-auto p-1 gap-1 text-xs">
                        <Reply className="h-3 w-3" />
                        رد
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="h-auto p-1 gap-1 text-xs text-gray-400">
                        <Flag className="h-3 w-3" />
                        بلاغ
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* زر تحميل المزيد */}
          {data.hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setCursor(data.nextCursor)}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                تحميل المزيد من التعليقات
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>لا توجد تعليقات بعد</p>
            <p className="text-sm">كن أول من يشارك رأيه!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
