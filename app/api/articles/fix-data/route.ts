import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateAndFixDate } from '@/lib/date-utils'

// دالة لإصلاح بيانات المقالات الموجودة
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 بدء عملية إصلاح بيانات المقالات...')
    
    // جلب جميع المقالات التي تحتاج إلى إصلاح
    const articles = await prisma.articles.findMany({
      where: {
        OR: [
          { author_id: 'default-author-id' }
        ]
      }
    })
    
    console.log(`📊 وجدت ${articles.length} مقال يحتاج إلى إصلاح`)
    
    let fixedCount = 0
    const errors: any[] = []
    
    // إصلاح كل مقال
    for (const article of articles) {
      try {
        const updates: any = {}
        
        // إصلاح التاريخ
        if (!article.published_at && article.created_at) {
          const fixedDate = validateAndFixDate(article.created_at)
          if (fixedDate) {
            updates.published_at = fixedDate
          }
        }
        
        // إصلاح معرف المؤلف
        if (!article.author_id || article.author_id === 'default-author-id') {
          // محاولة الحصول على المؤلف من metadata
          const metadata = article.metadata as any
          if (metadata?.author_id) {
            updates.author_id = metadata.author_id
          } else {
            // استخدام أول مستخدم admin كمؤلف افتراضي
            const defaultAuthor = await prisma.users.findFirst({
              where: {
                OR: [
                  { role: 'admin' },
                  { is_admin: true }
                ]
              },
              select: { id: true }
            })
            
            if (defaultAuthor) {
              updates.author_id = defaultAuthor.id
            }
          }
        }
        
        // تحديث metadata بمعلومات إضافية
        if (Object.keys(updates).length > 0) {
          const currentMetadata = article.metadata as any || {}
          updates.metadata = {
            ...currentMetadata,
            fixed_at: new Date().toISOString(),
            fixed_fields: Object.keys(updates)
          }
          
          // تحديث المقال
          await prisma.articles.update({
            where: { id: article.id },
            data: updates
          })
          
          fixedCount++
          console.log(`✅ تم إصلاح المقال: ${article.title}`)
        }
      } catch (error) {
        console.error(`❌ خطأ في إصلاح المقال ${article.id}:`, error)
        errors.push({
          articleId: article.id,
          title: article.title,
          error: error instanceof Error ? error.message : 'خطأ غير معروف'
        })
      }
    }
    
    // إصلاح المقالات التي ليس لها مؤلف مرتبط
    console.log('🔍 البحث عن مقالات بدون مؤلف مرتبط...')
    
    const articlesWithoutAuthor = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        author_id: true,
        metadata: true
      }
    })
    
    // التحقق من وجود المؤلفين
    const authorIds = [...new Set(articlesWithoutAuthor.map((a: any) => a.author_id).filter(Boolean))]
    const existingAuthors = await prisma.users.findMany({
      where: {
        id: { in: authorIds }
      },
      select: { id: true }
    })
    
    const existingAuthorIds = new Set(existingAuthors.map((a: any) => a.id))
    const defaultAuthor = await prisma.users.findFirst({
      where: {
        OR: [
          { email: 'admin@sabq.org' },
          { role: 'admin' },
          { is_admin: true }
        ]
      },
      select: { id: true, name: true }
    })
    
    for (const article of articlesWithoutAuthor) {
      if (article.author_id && !existingAuthorIds.has(article.author_id)) {
        try {
          const metadata = article.metadata as any || {}
          await prisma.articles.update({
            where: { id: article.id },
            data: {
              author_id: defaultAuthor?.id || 'system',
              metadata: {
                ...metadata,
                original_author_id: article.author_id,
                fixed_at: new Date().toISOString(),
                fixed_reason: 'author_not_found'
              }
            }
          })
          fixedCount++
          console.log(`✅ تم إصلاح مؤلف المقال: ${article.title}`)
        } catch (error) {
          console.error(`❌ خطأ في إصلاح مؤلف المقال ${article.id}:`, error)
          errors.push({
            articleId: article.id,
            title: article.title,
            error: 'فشل إصلاح المؤلف'
          })
        }
      }
    }
    
    console.log(`✨ اكتملت عملية الإصلاح: تم إصلاح ${fixedCount} مقال`)
    
    return NextResponse.json({
      success: true,
      message: `تم إصلاح ${fixedCount} مقال بنجاح`,
      fixed: fixedCount,
      errors: errors.length > 0 ? errors : undefined,
      defaultAuthor: defaultAuthor ? {
        id: defaultAuthor.id,
        name: defaultAuthor.name
      } : null
    })
    
  } catch (error) {
    console.error('❌ خطأ في عملية إصلاح البيانات:', error)
    return NextResponse.json({
      success: false,
      error: 'فشلت عملية إصلاح البيانات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
} 