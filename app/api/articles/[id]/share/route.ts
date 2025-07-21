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

    // تسجيل المشاركة
    await prisma.interactions.create({
      data: {
        id: `share_${articleId}_${userId}_${Date.now()}`,
        article_id: articleId,
        user_id: userId,
        type: 'share'
      }
    })

    // زيادة عداد المشاركات
    await prisma.articles.update({
      where: { id: articleId },
      data: { shares: { increment: 1 } }
    })

    return NextResponse.json({
      shares: article.shares + 1,
      success: true
    })

  } catch (error) {
    console.error('Error handling share:', error)
    return NextResponse.json(
      { error: 'خطأ في معالجة المشاركة' },
      { status: 500 }
    )
  }
}
