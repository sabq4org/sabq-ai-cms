import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCachedCategories } from '@/lib/services/categoriesCache'
import dbConnectionManager from '@/lib/db-connection-manager'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  console.log(`📰 جلب المقال: ${id}`)
  
  try {
    // استخدام مدير الاتصال لضمان الاتصال
    const article = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.findFirst({
        where: {
          OR: [
            { id: id },
            { slug: id }
          ],
          status: 'published'
        },
        include: {
          categories: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      })
    })
    
    if (!article) {
      return NextResponse.json({
        success: false,
        error: 'المقال غير موجود'
      }, { status: 404 })
    }
    
    // تحديث عدد المشاهدات بشكل غير متزامن
    dbConnectionManager.executeWithConnection(async () => {
      await prisma.articles.update({
        where: { id: article.id },
        data: { views: { increment: 1 } }
      })
    }).catch(error => {
      console.error('⚠️ فشل تحديث المشاهدات:', error)
    })
    
    // إضافة معلومات التصنيف من الـ cache إذا لزم الأمر
    let categoryInfo = article.categories
    if (!categoryInfo && article.category_id) {
      try {
        const categoriesResult = await getCachedCategories()
        categoryInfo = categoriesResult.categories.find(c => c.id === article.category_id)
      } catch (error) {
        console.error('⚠️ فشل جلب التصنيف من cache:', error)
      }
    }
    
    return NextResponse.json({
      success: true,
      ...article,
      category: categoryInfo
    })
    
  } catch (error: any) {
    console.error('❌ خطأ في جلب المقال:', error)
    
    // معالجة أخطاء الاتصال بشكل خاص
    if (error.message?.includes('connection') || error.code === 'P2024') {
      return NextResponse.json({
        success: false,
        error: 'مشكلة في الاتصال بقاعدة البيانات',
        details: 'يرجى المحاولة مرة أخرى بعد قليل',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب المقال',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// تحديث المقال
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  
  try {
    const data = await request.json()
    
    const updatedArticle = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date()
        }
      })
    })
    
    return NextResponse.json({
      success: true,
      article: updatedArticle
    })
    
  } catch (error: any) {
    console.error('❌ خطأ في تحديث المقال:', error)
    
    return NextResponse.json({
      success: false,
      error: 'فشل تحديث المقال',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// حذف المقال
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  
  try {
    const deletedArticle = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.update({
        where: { id },
        data: {
          status: 'deleted' as any,
          updated_at: new Date()
        }
      })
    })
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف المقال بنجاح',
      article: deletedArticle
    })
    
  } catch (error: any) {
    console.error('❌ خطأ في حذف المقال:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'المقال غير موجود'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'فشل حذف المقال',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 })
  }
}
