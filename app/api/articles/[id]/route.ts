import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCachedCategories } from '@/lib/services/categoriesCache'
import dbConnectionManager from '@/lib/db-connection-manager'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    console.log(`📰 جلب المقال: ${id}`)
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'معرف المقال مطلوب',
        code: 'MISSING_ID'
      }, { status: 400 })
    }
    
    // استخدام مدير الاتصال لضمان الاتصال
    // السماح بجلب أي حالة عند استخدام ?all=true
    const url = new URL(request.url)
    const includeAll = url.searchParams.get('all') === 'true'

    const article = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.findFirst({
        where: {
          OR: [
            { id: id },
            { slug: id }
          ],
          ...(includeAll ? {} : { status: 'published' })
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
      console.log(`⚠️ المقال غير موجود: ${id}`)
      return NextResponse.json({
        success: false,
        error: 'المقال غير موجود',
        code: 'ARTICLE_NOT_FOUND',
        details: 'تأكد من صحة رابط المقال أو قد يكون المقال قد تم حذفه'
      }, { status: 404 })
    }
    
    // التحقق من حالة النشر إذا لم يكن includeAll
    if (!includeAll && article.status !== 'published') {
      console.log(`⚠️ المقال غير منشور: ${id} - الحالة: ${article.status}`)
      
      let errorMessage = 'المقال غير متاح للعرض';
      let errorDetails = '';
      
      switch (article.status) {
        case 'draft':
          errorMessage = 'المقال في وضع المسودة';
          errorDetails = 'هذا المقال لم يكتمل بعد ولا يزال قيد الإعداد';
          break;
        case 'pending_review':
          errorMessage = 'المقال قيد المراجعة';
          errorDetails = 'هذا المقال يخضع للمراجعة من قبل فريق التحرير';
          break;
        case 'archived':
          errorMessage = 'المقال مؤرشف';
          errorDetails = 'تم نقل هذا المقال إلى الأرشيف';
          break;
        case 'rejected':
          errorMessage = 'المقال مرفوض';
          errorDetails = 'تم رفض نشر هذا المقال';
          break;
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        code: 'ARTICLE_NOT_PUBLISHED',
        details: errorDetails,
        status: article.status
      }, { status: 403 })
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
    
    // إرجاع البيانات مباشرة للتوافق مع صفحة عرض المقال
    return NextResponse.json({
      ...article,
      category: categoryInfo,
      success: true
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

// تحديث المقال - دعم PUT
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}

// تحديث المقال
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  
  try {
    const data = await request.json()
    console.log('📥 البيانات المستلمة للتحديث:', data)
    console.log('📦 metadata المستلمة:', data.metadata)
    
    // معالجة البيانات قبل الحفظ
    const updateData: any = {
      ...data,
      updated_at: new Date()
    }
    
    // التأكد من أن metadata يتم حفظه بشكل صحيح
    if (data.metadata) {
      updateData.metadata = data.metadata
    }
    
    console.log('💾 البيانات المعدة للحفظ:', updateData)
    
    const updatedArticle = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.update({
        where: { id },
        data: updateData
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
