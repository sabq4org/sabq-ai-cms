import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma';
import { requireAuthFromRequest } from '@/app/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id

    // مصادقة المستخدم بشكل صحيح لتجنب أخطاء FK
    const user = await requireAuthFromRequest(request)
    const userId = user.id

    // التحقق من وجود المقال
    const article = await prisma.articles.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404 }
      )
    }

    // فحص إذا كان المستخدم قد أعجب بالمقال مسبقاً (باستخدام المفتاح الفريد)
    const existingLike = await prisma.interactions.findUnique({
      where: {
        user_id_article_id_type: {
          user_id: userId,
          article_id: articleId,
          type: 'like'
        }
      }
    })

    let newLikesCount = article.likes
    let hasLiked = false

    if (existingLike) {
      // إلغاء الإعجاب
      await prisma.$transaction([
        prisma.interactions.delete({ where: { id: existingLike.id } }),
        prisma.articles.update({ where: { id: articleId }, data: { likes: { decrement: 1 } } }),
      ])
      // منع السالب
      await prisma.articles.updateMany({ where: { id: articleId, likes: { lt: 0 } as any }, data: { likes: 0 } })
      newLikesCount = Math.max(0, article.likes - 1)
      hasLiked = false
    } else {
      // إضافة إعجاب
      await prisma.$transaction([
        prisma.interactions.create({
          data: {
            id: `like_${articleId}_${userId}_${Date.now()}`,
            article_id: articleId,
            user_id: userId,
            type: 'like'
          }
        }),
        prisma.articles.update({ where: { id: articleId }, data: { likes: { increment: 1 } } }),
      ])
      newLikesCount = article.likes + 1
      hasLiked = true
    }

    return NextResponse.json({
      likes: newLikesCount,
      hasLiked
    })

  } catch (error: any) {
    const message = String(error?.message || '')
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    console.error('Error handling like:', error)
    return NextResponse.json(
      { error: 'خطأ في معالجة الإعجاب' },
      { status: 500 }
    )
  }
}
