import { NextRequest } from 'next/server'
import { withCaching } from '@/lib/api-handlers-v2'
import { prisma } from '@/lib/prisma'

// Helper function لحساب الوقت النسبي
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  return date.toLocaleDateString('ar-SA')
}

// GET - جلب التعليقات مع cursor pagination محسّن
export const GET = withCaching({
  key: (req: NextRequest) => {
    const url = new URL(req.url)
    const articleId = url.searchParams.get('articleId') || 'unknown'
    const cursor = url.searchParams.get('cursor') || '0'
    return `cache:v2:comments-optimized:${articleId}:cursor:${cursor}`
  },
  ttlSec: 180, // كاش 3 دقائق
  handler: async (req: NextRequest, timer) => {
    const url = new URL(req.url)
    const articleId = url.searchParams.get('articleId')
    const cursor = url.searchParams.get('cursor')
    const limit = 10

    if (!articleId) {
      return new Response(
        JSON.stringify({ error: 'معرف المقال مطلوب' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    try {
      timer.start('db')
      
      // استعلام محسّن مع فهرسة cursor
      const comments = await prisma.$queryRaw`
        SELECT 
          c.id,
          c.text,
          c.created_at as "createdAt",
          c.is_approved as "isApproved",
          u.name as "authorName",
          u.image as "authorAvatar",
          COALESCE(l.like_count, 0) as "likeCount",
          COALESCE(r.reply_count, 0) as "replyCount"
        FROM comments c
        LEFT JOIN users u ON c.author_id = u.id
        LEFT JOIN (
          SELECT comment_id, COUNT(*) as like_count 
          FROM comment_likes 
          GROUP BY comment_id
        ) l ON c.id = l.comment_id
        LEFT JOIN (
          SELECT parent_id, COUNT(*) as reply_count 
          FROM comments 
          WHERE parent_id IS NOT NULL 
          GROUP BY parent_id
        ) r ON c.id = r.parent_id
        WHERE c.article_id = ${articleId}
          AND c.is_approved = true
          AND c.parent_id IS NULL
          ${cursor && cursor !== '0' ? `AND c.id < ${cursor}` : ''}
        ORDER BY c.created_at DESC
        LIMIT ${limit + 1}
      ` as any[]

      timer.end('db')

      // تحديد هل يوجد المزيد
      const hasMore = comments.length > limit
      if (hasMore) {
        comments.pop()
      }

      const nextCursor = hasMore && comments.length > 0 ? comments[comments.length - 1].id : undefined

      // تنسيق البيانات
      const formattedComments = comments.map(comment => ({
        id: comment.id,
        author: {
          name: comment.authorName || 'مجهول',
          avatar: comment.authorAvatar
        },
        text: comment.text,
        timestamp: comment.createdAt.toISOString(),
        timeAgo: getTimeAgo(new Date(comment.createdAt)),
        likes: parseInt(comment.likeCount) || 0,
        replies: parseInt(comment.replyCount) || 0,
        isLiked: false, // TODO: من session
        isApproved: comment.isApproved
      }))

      return {
        items: formattedComments,
        hasMore,
        nextCursor,
        total: comments.length
      }

    } catch (error) {
      console.error('Error fetching optimized comments:', error)
      return new Response(
        JSON.stringify({ error: 'خطأ في جلب التعليقات' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
})
