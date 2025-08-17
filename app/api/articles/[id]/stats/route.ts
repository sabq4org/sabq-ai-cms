import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id

    // جلب الإحصائيات الأساسية
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: {
        views: true,
        likes: true,
        saves: true, 
        shares: true,
        categories: { select: { name: true } },
        category_id: true
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404 }
      )
    }

    // حساب معدل النمو (مقارنة بمتوسط المقالات في نفس التصنيف)
    let growthRate = 0
    if (article.category_id) {
      const categoryStats = await prisma.articles.aggregate({
        where: {
          category_id: article.category_id,
          id: { not: articleId }
        },
        _avg: {
          views: true
        }
      })

      if (categoryStats._avg.views && categoryStats._avg.views > 0) {
        growthRate = Math.round(((article.views - categoryStats._avg.views) / categoryStats._avg.views) * 100)
      }
    }

    // فحص تفاعل المستخدم (إذا كان مسجل دخول)
    const userId = request.headers.get('user-id') // من middleware المصادقة
    let userInteractions = {
      hasLiked: false,
      hasSaved: false
    }

    if (userId) {
      const interactions = await prisma.interactions.findMany({
        where: { 
          article_id: articleId, 
          user_id: userId,
          type: { in: ['like', 'save'] }
        },
        select: { type: true }
      })

      userInteractions = {
        hasLiked: interactions.some(i => i.type === 'like'),
        hasSaved: interactions.some(i => i.type === 'save')
      }
    }

    // زيادة عدد المشاهدات
    await prisma.articles.update({
      where: { id: articleId },
      data: { views: { increment: 1 } }
    })

    const responseStats = {
      views: article.views + 1,
      likes: article.likes,
      saves: article.saves,
      shares: article.shares,
      comments: 0, // سيتم إضافة جدول التعليقات لاحقاً
      category: article.categories?.name || '',
      growthRate: Math.max(0, growthRate),
      userInteractions
    }

    return NextResponse.json(responseStats)

  } catch (error) {
    console.error('Error fetching article stats:', error)
    return NextResponse.json(
      { error: 'خطأ في جلب الإحصائيات' },
      { status: 500 }
    )
  }
}
