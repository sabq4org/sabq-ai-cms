import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id
    
    // في الواقع، ستحصل على user_id من JWT token أو session
    // هنا نستخدم fake user لأغراض التجربة
    const userId = request.headers.get('user-id') || 'demo-user-123'

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

    // فحص إذا كان المستخدم قد أعجب بالمقال مسبقاً
    const existingLike = await prisma.interactions.findFirst({
      where: {
        article_id: articleId,
        user_id: userId,
        type: 'like'
      }
    })

    let newLikesCount = article.likes
    let hasLiked = false

    if (existingLike) {
      // إلغاء الإعجاب
      await prisma.interactions.delete({
        where: { id: existingLike.id }
      })
      
      await prisma.articles.update({
        where: { id: articleId },
        data: { likes: { decrement: 1 } }
      })
      
      newLikesCount = article.likes - 1
      hasLiked = false
    } else {
      // إضافة إعجاب
      await prisma.interactions.create({
        data: {
          id: `like_${articleId}_${userId}_${Date.now()}`,
          article_id: articleId,
          user_id: userId,
          type: 'like'
        }
      })
      
      await prisma.articles.update({
        where: { id: articleId },
        data: { likes: { increment: 1 } }
      })
      
      newLikesCount = article.likes + 1
      hasLiked = true
    }

    return NextResponse.json({
      likes: newLikesCount,
      hasLiked
    })

  } catch (error) {
    console.error('Error handling like:', error)
    return NextResponse.json(
      { error: 'خطأ في معالجة الإعجاب' },
      { status: 500 }
    )
  }
}
