import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 بدء عملية إصلاح التواريخ...')
    
    // جلب جميع المقالات التي لا تحتوي على تاريخ نشر
    const articles = await prisma.articles.findMany({
      where: {
        OR: [
          { published_at: null }
        ],
        status: 'published' // فقط المقالات المنشورة
      },
      select: {
        id: true,
        title: true,
        created_at: true,
        updated_at: true,
        published_at: true,
        status: true
      }
    })
    
    console.log(`📊 وجدت ${articles.length} مقال بدون تاريخ نشر`)
    
    let fixedCount = 0
    const errors: any[] = []
    
    // إصلاح كل مقال
    for (const article of articles) {
      try {
        // استخدام تاريخ الإنشاء كتاريخ نشر
        const publishDate = article.created_at || article.updated_at || new Date()
        
        await prisma.articles.update({
          where: { id: article.id },
          data: {
            published_at: publishDate,
            updated_at: new Date()
          }
        })
        
        fixedCount++
        console.log(`✅ تم إصلاح تاريخ المقال: ${article.title}`)
      } catch (error) {
        console.error(`❌ خطأ في إصلاح المقال ${article.id}:`, error)
        errors.push({
          articleId: article.id,
          title: article.title,
          error: error instanceof Error ? error.message : 'خطأ غير معروف'
        })
      }
    }
    
    // إصلاح المقالات المجدولة
    console.log('🔍 البحث عن مقالات مجدولة بدون تاريخ...')
    
    const scheduledArticles = await prisma.articles.findMany({
      where: {
        status: 'scheduled',
        scheduled_for: null
      },
      select: {
        id: true,
        title: true,
        created_at: true
      }
    })
    
    for (const article of scheduledArticles) {
      try {
        // تعيين تاريخ مجدول في المستقبل (بعد يوم واحد)
        const scheduledDate = new Date()
        scheduledDate.setDate(scheduledDate.getDate() + 1)
        
        await prisma.articles.update({
          where: { id: article.id },
          data: {
            scheduled_for: scheduledDate,
            updated_at: new Date()
          }
        })
        
        fixedCount++
        console.log(`✅ تم إصلاح تاريخ المقال المجدول: ${article.title}`)
      } catch (error) {
        console.error(`❌ خطأ في إصلاح المقال المجدول ${article.id}:`, error)
        errors.push({
          articleId: article.id,
          title: article.title,
          error: 'فشل إصلاح التاريخ المجدول'
        })
      }
    }
    
    console.log(`✨ اكتملت عملية الإصلاح: تم إصلاح ${fixedCount} مقال`)
    
    return NextResponse.json({
      success: true,
      message: `تم إصلاح ${fixedCount} مقال بنجاح`,
      fixed: fixedCount,
      errors: errors.length > 0 ? errors : undefined,
      stats: {
        articlesWithoutPublishDate: articles.length,
        scheduledWithoutDate: scheduledArticles.length,
        totalFixed: fixedCount
      }
    })
    
  } catch (error) {
    console.error('❌ خطأ في عملية إصلاح التواريخ:', error)
    return NextResponse.json({
      success: false,
      error: 'فشلت عملية إصلاح التواريخ',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
} 