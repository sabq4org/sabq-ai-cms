import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id
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

    // فحص إذا كان المستخدم قد حفظ المقال مسبقاً
    const existingSave = await prisma.interactions.findFirst({
      where: {
        article_id: articleId,
        user_id: userId,
        type: 'save'
      }
    })

    let newSavesCount = article.saves
    let hasSaved = false

    if (existingSave) {
      // إلغاء الحفظ
      await prisma.interactions.delete({
        where: { id: existingSave.id }
      })
      
      await prisma.articles.update({
        where: { id: articleId },
        data: { saves: { decrement: 1 } }
      })
      
      newSavesCount = article.saves - 1
      hasSaved = false
    } else {
      // إضافة حفظ
      await prisma.interactions.create({
        data: {
          id: `save_${articleId}_${userId}_${Date.now()}`,
          article_id: articleId,
          user_id: userId,
          type: 'save'
        }
      })
      
      await prisma.articles.update({
        where: { id: articleId },
        data: { saves: { increment: 1 } }
      })
      
      newSavesCount = article.saves + 1
      hasSaved = true
    }

    return NextResponse.json({
      saves: newSavesCount,
      hasSaved
    })

  } catch (error) {
    console.error('Error handling save:', error)
    return NextResponse.json(
      { error: 'خطأ في معالجة الحفظ' },
      { status: 500 }
    )
  }
}
