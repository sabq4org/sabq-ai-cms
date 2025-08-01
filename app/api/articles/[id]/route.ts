import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCachedCategories } from '@/lib/services/categoriesCache'
import dbConnectionManager from '@/lib/db-connection-manager'
import { FeaturedArticleManager } from '@/lib/services/featured-article-manager'

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

    // محاولة الاتصال بقاعدة البيانات
    let article;
    try {
      // محاولة التأكد من الاتصال أولاً
      await prisma.$connect();
      
      article = await dbConnectionManager.executeWithConnection(async () => {
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
            },
            article_author: {
              select: {
                id: true,
                full_name: true,
                slug: true,
                title: true,
                avatar_url: true,
                specializations: true
              }
            }
        }
      })
    })
    } catch (dbError: any) {
      console.error('❌ خطأ في الاتصال بقاعدة البيانات:', dbError);
      
      // إذا كان الخطأ متعلق بعدم الاتصال، حاول مرة أخرى
      if (dbError.message?.includes('Engine is not yet connected')) {
        console.log('🔄 محاولة إعادة الاتصال...');
        try {
          await prisma.$disconnect();
          await new Promise(resolve => setTimeout(resolve, 1000));
          await prisma.$connect();
          
          // محاولة أخرى
          article = await prisma.articles.findFirst({
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
              },
              article_author: {
                select: {
                  id: true,
                  full_name: true,
                  slug: true,
                  title: true,
                  avatar_url: true,
                  specializations: true
                }
              }
            }
          });
        } catch (retryError) {
          console.error('❌ فشلت محاولة إعادة الاتصال:', retryError);
          throw dbError;
        }
      } else {
        throw dbError;
      }
    }
    
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
    
    // تنسيق بيانات الكاتب مع إعطاء أولوية لكاتب المقال الحقيقي
    const formattedArticle = {
      ...article,
      category: categoryInfo,
      // إعطاء أولوية لكاتب المقال الحقيقي من article_authors
      author_name: article.article_author?.full_name || article.author?.name || null,
      author_title: article.article_author?.title || null,
      author_specialty: article.article_author?.specializations?.[0] || null,
      author_avatar: article.article_author?.avatar_url || article.author?.avatar || null,
      author_slug: article.article_author?.slug || null,
      success: true
    };
    
    // إرجاع البيانات مع معلومات الكاتب المحسنة
    return NextResponse.json(formattedArticle)
    
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
    // فحص Debug Mode
    const debugMode = request.headers.get('X-Debug-Mode') === 'true';
    
    let data;
    try {
      data = await request.json()
    } catch (jsonError) {
      console.error('❌ خطأ في قراءة JSON:', jsonError);
      return NextResponse.json({
        success: false,
        error: 'البيانات المرسلة غير صالحة',
        details: 'Invalid JSON in request body'
      }, { status: 400 })
    }
    
    if (debugMode) {
      console.group(`🔍 DEBUG: تحديث المقال ${id}`);
      console.log('⏰ الوقت:', new Date().toISOString());
      console.log('📥 البيانات الخام:', JSON.stringify(data, null, 2));
    }
    
    console.log('📥 البيانات المستلمة للتحديث:', data)
    console.log('📦 metadata المستلمة:', data.metadata)
    
    // التحقق من وجود المقال قبل محاولة التحديث
    const existingArticle = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.findUnique({
        where: { id },
        select: { id: true, title: true, featured: true }
      })
    })
    
    if (!existingArticle) {
      console.error('❌ المقال غير موجود:', id)
      return NextResponse.json({
        success: false,
        error: 'المقال غير موجود',
        details: 'Article not found'
      }, { status: 404 })
    }
    
    console.log('✅ تم العثور على المقال:', { id: existingArticle.id, title: existingArticle.title, featured: existingArticle.featured })
    
    // التحقق من صحة البيانات المستلمة
    if (data.featured_image && typeof data.featured_image !== 'string') {
      console.error('❌ نوع صورة المقال غير صحيح:', typeof data.featured_image)
      return NextResponse.json({
        success: false,
        error: 'نوع صورة المقال غير صحيح',
        details: 'featured_image must be a string'
      }, { status: 400 })
    }
    
    // معالجة البيانات قبل الحفظ
    const updateData: any = {
      updated_at: new Date()
    }
    
    // نسخ الحقول المسموح بها فقط
    const allowedFields = [
      'title', 'content', 'excerpt',
      'featured_image',
      'status', 'metadata', 'published_at',
      'seo_title', 'seo_description', 'seo_keywords',
      'breaking'
      // 'featured' تمت إزالته من هنا وسيتم معالجته بشكل خاص
      // الحقول غير الموجودة في schema: subtitle, type, image_caption, author_name, publish_at, external_link
    ]
    
    console.log('📋 الحقول المستلمة:', Object.keys(data));
    console.log('📋 القيم المستلمة:', data);
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
        console.log(`✅ تم نسخ الحقل ${field}:`, data[field]);
      }
    }
    
    // معالجة خاصة للعلاقات (author و category)
    if (data.author_id) {
      updateData.author = {
        connect: { id: data.author_id }
      }
      console.log(`✅ تم ربط المؤلف: ${data.author_id}`);
    }
    
    if (data.category_id) {
      updateData.categories = {
        connect: { id: data.category_id }
      }
      console.log(`✅ تم ربط التصنيف: ${data.category_id}`);
    }
    
    // معالجة خاصة لحقل featured - نحفظه مؤقتاً ونعالجه بعد التحديث
    let shouldUpdateFeatured = false;
    let featuredValue = false;
    
    // التحقق من جميع الأسماء المحتملة للحقل المميز
    if (data.featured !== undefined || data.is_featured !== undefined || data.isFeatured !== undefined) {
      shouldUpdateFeatured = true;
      featuredValue = Boolean(data.featured || data.is_featured || data.isFeatured);
      console.log(`🏆 سيتم تحديث حالة التمييز للمقال ${id}: ${featuredValue ? 'مميز' : 'غير مميز'}`);
      // لا نضيف featured إلى updateData هنا، سنعالجه بشكل منفصل
    }
    
    // معالجة حقل breaking بأسمائه المختلفة
    if (data.breaking !== undefined || data.is_breaking !== undefined || data.isBreaking !== undefined) {
      updateData.breaking = Boolean(data.breaking || data.is_breaking || data.isBreaking);
    }
    
    // معالجة excerpt/summary
    if (data.excerpt !== undefined || data.summary !== undefined) {
      updateData.excerpt = data.excerpt || data.summary;
    }
    
    // التأكد من أن metadata يتم حفظه بشكل صحيح كـ JSON
    if (data.metadata) {
      try {
        updateData.metadata = typeof data.metadata === 'string' 
          ? data.metadata 
          : JSON.stringify(data.metadata)
      } catch (error) {
        console.error('❌ خطأ في معالجة metadata:', error)
        // استخدام القيمة كما هي إذا فشل التحويل إلى JSON
        updateData.metadata = typeof data.metadata === 'string' 
          ? data.metadata 
          : '{}'
      }
    }
    
    console.log('💾 البيانات المعدة للحفظ:', updateData)
    
    try {
      // محاولة تحديث المقال مع معالجة أفضل للأخطاء
      const updatedArticle = await dbConnectionManager.executeWithConnection(async () => {
        return await prisma.articles.update({
          where: { id },
          data: updateData
        })
      })
      
      console.log('✅ تم تحديث المقال بنجاح:', { id: updatedArticle.id, title: updatedArticle.title })
      
      // معالجة تحديث حالة التمييز باستخدام المدير المركزي
      if (shouldUpdateFeatured) {
        if (featuredValue) {
          // تعيين المقال كمميز
          const featuredResult = await FeaturedArticleManager.setFeaturedArticle(id, {
            categoryId: updatedArticle.category_id || undefined
          });
          
          if (featuredResult.success) {
            console.log('✅', featuredResult.message);
          } else {
            console.error('❌ خطأ في تعيين المقال كمميز:', featuredResult.message);
          }
        } else {
          // إلغاء تمييز المقال
          const unfeaturedResult = await FeaturedArticleManager.unsetFeaturedArticle(id);
          
          if (unfeaturedResult.success) {
            console.log('✅', unfeaturedResult.message);
          } else {
            console.error('❌ خطأ في إلغاء تمييز المقال:', unfeaturedResult.message);
          }
        }
        
        // إعادة تحقق صحة الصفحة الرئيسية
        try {
          const { revalidatePath } = await import('next/cache')
          revalidatePath('/')
          console.log('🔄 تم إعادة تحقق صحة الصفحة الرئيسية')
        } catch (error) {
          console.error('❌ خطأ في إعادة تحقق صحة الصفحة الرئيسية:', error)
        }
      }
      
      if (debugMode) {
        console.log('✅ تحديث ناجح:', updatedArticle.id);
        console.groupEnd();
      }
      
      return NextResponse.json({
        success: true,
        article: updatedArticle
      })
    } catch (updateError: any) {
      console.error('❌ خطأ في تحديث المقال في قاعدة البيانات:', updateError)
      console.error('📋 تفاصيل خطأ التحديث:', {
        code: updateError.code,
        message: updateError.message,
        meta: updateError.meta,
        articleId: id,
        updateData: JSON.stringify(updateData, null, 2)
      });
      
      // رسائل خطأ أكثر تفصيلاً
      if (updateError.code === 'P2025') {
        return NextResponse.json({
          success: false,
          error: 'المقال غير موجود',
          details: 'Article not found'
        }, { status: 404 })
      } else if (updateError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'قيمة مكررة في حقل فريد',
          details: `Unique constraint failed: ${updateError.meta?.target}`
        }, { status: 409 })
      }
      
      return NextResponse.json({
        success: false,
        error: 'فشل تحديث المقال',
        details: updateError.message || 'خطأ غير معروف في قاعدة البيانات',
        debug: {
          errorCode: updateError.code,
          errorType: updateError.constructor.name,
          articleId: id,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ خطأ في تحديث المقال:', error)
    console.error('📋 تفاصيل الخطأ:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      articleId: id
    })
    
    // في حالة Debug Mode، أرسل تفاصيل أكثر
    const isDebug = request.headers.get('X-Debug-Mode') === 'true';
    
    return NextResponse.json({
      success: false,
      error: 'فشل تحديث المقال',
      details: error.message || 'خطأ غير معروف',
      ...(isDebug ? {
        debug: {
          errorType: error.constructor.name,
          errorCode: error.code,
          articleId: id,
          timestamp: new Date().toISOString()
        }
      } : {})
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

// دعم PUT method (يستخدم نفس منطق PATCH)
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}
