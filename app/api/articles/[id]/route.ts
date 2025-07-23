import { NextRequest, NextResponse } from 'next/server'
import { prisma, ensureConnection } from '@/lib/prisma'
import { cache, CACHE_TTL } from '@/lib/redis-improved'

// دالة مساعدة لإضافة cache headers
function setCacheHeaders(response: NextResponse, maxAge: number = 300) {
  response.headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=60`);
  response.headers.set('CDN-Cache-Control', `max-age=${maxAge}`);
  response.headers.set('Vercel-CDN-Cache-Control', `max-age=${maxAge}`);
  return response;
}

// GET - جلب مقال واحد مع معالجة محسنة للأخطاء
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'معرف المقال مطلوب'
      }, { status: 400 });
    }

    // التأكد من الاتصال بقاعدة البيانات
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات',
        code: 'DATABASE_CONNECTION_FAILED'
      }, { status: 503 });
    }
    
    // محاولة جلب من Redis cache أولاً
    const cacheKey = `article:${id}`;
    let cachedArticle = null;
    
    try {
      cachedArticle = await cache.get(cacheKey);
      if (cachedArticle && (cachedArticle as any).status === 'published') {
        console.log(`✅ تم جلب المقال ${id} من Redis cache`);
        
        // زيادة عدد المشاهدات بشكل غير متزامن
        prisma.articles.update({
          where: { id: (cachedArticle as any).id },
          data: { views: { increment: 1 } }
        }).catch(() => {});
        
        const response = NextResponse.json(cachedArticle);
        response.headers.set('X-Cache', 'HIT');
        response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
        return setCacheHeaders(response);
      }
    } catch (cacheError) {
      console.warn('⚠️ خطأ في جلب البيانات من cache:', cacheError);
    }
    
    // جلب المقال من قاعدة البيانات بطريقة محسنة
    const dbArticle = await prisma.articles.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      select: {
        // حقول أساسية فقط لسرعة الاستجابة
        id: true,
        title: true,
        content: true,
        excerpt: true,
        slug: true,
        published_at: true,
        created_at: true,
        updated_at: true,
        featured_image: true,
        views: true,
        likes: true,
        shares: true,
        saves: true,
        featured: true,
        breaking: true,
        reading_time: true,
        status: true,
        author_id: true,
        category_id: true,
        seo_keywords: true,
        seo_description: true,
        metadata: true,
        // علاقة واحدة فقط
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true
          }
        }
      }
    });
    
    if (!dbArticle) {
      return NextResponse.json({ 
        success: false,
        error: 'Article not found',
        message: 'المقال المطلوب غير موجود',
        code: 'ARTICLE_NOT_FOUND'
      }, { status: 404 });
    }
    
    // التحقق من حالة المقال
    if (dbArticle.status !== 'published') {
      const cookieHeader = request.headers.get('cookie');
      const isEditor = cookieHeader && cookieHeader.includes('user=');
      
      if (!isEditor) {
        return NextResponse.json({ 
          success: false,
          error: 'Article not published',
          message: 'هذه المقالة غير منشورة',
          code: 'ARTICLE_NOT_PUBLISHED',
          status: dbArticle.status
        }, { status: 403 });
      }
    }
    
    // تحضير البيانات للإرسال
    const metadata = (dbArticle.metadata || {}) as any;
    const keywords = dbArticle.seo_keywords ? 
      dbArticle.seo_keywords.split(',').map(k => k.trim()) : [];
    
    const articleData = {
      ...dbArticle,
      success: true,
      keywords,
      summary: dbArticle.excerpt,
      ai_summary: metadata.ai_summary,
      author: {
        id: dbArticle.author_id || 'unknown',
        name: metadata.author_name || 'فريق التحرير',
        avatar: metadata.author_avatar
      },
      author_name: metadata.author_name || 'فريق التحرير',
      category: dbArticle.categories,
      category_name: dbArticle.categories?.name,
      category_color: dbArticle.categories?.color,
      is_breaking: dbArticle.breaking || false,
      is_featured: dbArticle.featured || false,
      stats: {
        views: dbArticle.views || 0,
        likes: dbArticle.likes || 0,
        shares: dbArticle.shares || 0,
        saves: dbArticle.saves || 0,
        comments: 0
      }
    };
    
    // زيادة عدد المشاهدات بشكل غير متزامن
    if (dbArticle.status === 'published') {
      prisma.articles.update({
        where: { id: dbArticle.id },
        data: { views: { increment: 1 } }
      }).catch(() => {});
      
      // حفظ في cache
      try {
        await cache.set(cacheKey, articleData, CACHE_TTL.ARTICLES);
      } catch (error) {
        console.warn('⚠️ فشل حفظ المقال في cache');
      }
    }
    
    const response = NextResponse.json(articleData);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    return setCacheHeaders(response);
    
  } catch (error: any) {
    console.error('❌ خطأ في جلب المقال:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'خطأ داخلي في الخادم',
      message: 'حدث خطأ أثناء محاولة جلب المقال',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}

// PATCH - تحديث مقال مع معالجة محسنة للأخطاء
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let articleId = '';
  try {
    // التأكد من الاتصال بقاعدة البيانات أولاً
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات',
        code: 'DATABASE_CONNECTION_FAILED'
      }, { status: 503 });
    }

    const { id: idFromParams } = await context.params;
    articleId = idFromParams;
    
    let updates;
    try {
      updates = await request.json();
    } catch (jsonError) {
      console.error('❌ خطأ في تحليل البيانات المرسلة:', jsonError);
      return NextResponse.json({
        success: false,
        error: 'بيانات غير صحيحة',
        code: 'INVALID_JSON',
        message: 'تنسيق البيانات المرسلة غير صحيح'
      }, { status: 400 });
    }

    console.log('🔄 [API] محاولة تحديث المقال:', articleId);
    
    // معالجة عدم تطابق اسم الحقل: تحويل summary إلى excerpt
    if (updates.summary) {
      updates.excerpt = updates.summary;
      delete updates.summary;
    }
    
    // معالجة عدم تطابق أسماء الحقول البوليانية
    if (typeof updates.is_featured !== 'undefined') {
      updates.featured = updates.is_featured;
      delete updates.is_featured;
    }
    if (typeof updates.is_breaking !== 'undefined') {
      updates.breaking = updates.is_breaking;
      delete updates.is_breaking;
    }

    // معالجة الكلمات المفتاحية
    let keywordsToSave = null;
    if (updates.keywords) {
      keywordsToSave = updates.keywords;
      // حفظ الكلمات في seo_keywords كنص
      updates.seo_keywords = Array.isArray(updates.keywords) 
        ? updates.keywords.join(', ') 
        : updates.keywords;
      delete updates.keywords;
    }

    // فصل category_id للتعامل معه كعلاقة
    const { category_id, ...otherUpdates } = updates;
    
    // إزالة الحقول التي لا يجب تحديثها مباشرة
    const { id: _, created_at, updated_at, ...updateData } = otherUpdates;

    const dataToUpdate: any = {
      ...updateData,
      updated_at: new Date(),
    };

    // إضافة الكلمات المفتاحية إلى metadata
    if (keywordsToSave) {
      dataToUpdate.metadata = {
        ...(updateData.metadata || {}),
        keywords: keywordsToSave
      };
    }

    if (category_id) {
      try {
        // التحقق من وجود التصنيف أولاً
        const categoryExists = await prisma.categories.findUnique({
          where: { id: category_id },
          select: { id: true }
        });
        
        if (categoryExists) {
          dataToUpdate.categories = {
            connect: { id: category_id },
          };
        } else {
          console.warn(`⚠️ التصنيف غير موجود: ${category_id}`);
          // لا نضيف العلاقة إذا كان التصنيف غير موجود
        }
      } catch (categoryError) {
        console.error('❌ خطأ في التحقق من التصنيف:', categoryError);
        // نتجاهل خطأ التصنيف ونكمل التحديث
      }
    }

    // تحديث المقال مع معالجة الأخطاء
    let updatedArticle;
    try {
      updatedArticle = await prisma.articles.update({
        where: { id: articleId },
        data: dataToUpdate,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          }
        }
      });
      
      console.log('✅ [API] تم تحديث المقال بنجاح:', articleId);
    } catch (dbUpdateError: any) {
      console.error('❌ خطأ في تحديث قاعدة البيانات:', dbUpdateError);
      
      if (dbUpdateError.code === 'P2025') {
        return NextResponse.json({
          success: false,
          error: 'المقال غير موجود',
          message: 'لم يتم العثور على المقال المطلوب تحديثه',
          code: 'ARTICLE_NOT_FOUND'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'فشل في تحديث المقال',
        message: 'حدث خطأ أثناء تحديث المقال في قاعدة البيانات',
        code: 'DATABASE_UPDATE_FAILED',
        details: process.env.NODE_ENV === 'development' ? dbUpdateError.message : undefined
      }, { status: 500 });
    }
    
    // مسح الكاش بعد التحديث (مع معالجة الأخطاء)
    try {
      console.log('🧹 مسح الكاش بعد تحديث المقال...');
      await cache.del(`article:${articleId}`);
      await cache.clearPattern('articles:*');
    } catch (cacheError) {
      console.warn('⚠️ خطأ في مسح الكاش:', cacheError);
      // لا نفشل العملية بسبب خطأ الكاش
    }
    
    return NextResponse.json({
      success: true,
      data: updatedArticle,
      message: 'تم تحديث المقال بنجاح'
    });

  } catch (error: any) {
    console.error('❌ [API] خطأ فادح في تحديث المقال:', {
      id: articleId,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          error: 'فشل التحديث: المقال غير موجود.',
          details: 'لم يتم العثور على سجل بالمُعرّف المحدد.',
          code: error.code 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'فشل تحديث المقال.',
        details: error.message || 'خطأ غير معروف في الخادم.',
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    // في بيئات غير الإنتاج، لا يتم قطع الاتصال للسماح بإعادة الاستخدام
    if (process.env.NODE_ENV === 'production') {
    }
  }
}

// DELETE - حذف مقال
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.articles.delete({ where: { id } });
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}

// PUT - تحديث كامل للمقال
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let articleId = '';
  try {
    const { id: idFromParams } = await context.params;
    articleId = idFromParams;
    const body = await request.json();

    console.log('🔄 [API PUT] محاولة تحديث المقال:', articleId);
    
    // معالجة الموجز
    const excerpt = body.excerpt || body.summary || '';
    
    // معالجة metadata مع الحقول المهمة
    const metadata = body.metadata || {};
    
    // معالجة is_breaking - إعطاء الأولوية للقيمة المباشرة ثم metadata
    const is_breaking = body.is_breaking === true || (metadata as any).is_breaking === true || false;
    
    // معالجة is_featured
    const is_featured = body.is_featured === true || (metadata as any).is_featured === true || false;
    
    // تحديث metadata بالقيم الصحيحة
    (metadata as any).is_breaking = is_breaking;
    (metadata as any).is_featured = is_featured;
    
    // إذا كان هناك كلمات مفتاحية في body
    if (body.keywords) {
      (metadata as any).keywords = body.keywords;
    }
    
    // إذا كان هناك اسم مؤلف
    if (body.author_name) {
      (metadata as any).author_name = body.author_name;
    }

    // إضافة شرح الصورة إلى metadata
    if (body.image_caption || body.featured_image_caption) {
      (metadata as any).image_caption = body.image_caption || body.featured_image_caption;
    }

    const updateData: any = {
      title: body.title,
      content: body.content || '',
      excerpt: excerpt,
      status: body.status || 'draft',
      featured_image: body.featured_image || null,
      featured_image_alt: body.featured_image_alt || null,
      seo_title: body.seo_title || body.title,
      seo_description: body.seo_description || excerpt,
      seo_keywords: body.keywords ? (Array.isArray(body.keywords) ? body.keywords.join(', ') : body.keywords) : body.seo_keywords || null,
      metadata: metadata,
      breaking: is_breaking,
      featured: is_featured,
      updated_at: new Date()
    };

    // معالجة content_blocks إذا كان موجوداً
    if (body.content_blocks) {
      updateData.content_blocks = body.content_blocks;
    }

    // معالجة category_id
    if (body.category_id) {
      updateData.category = {
        connect: { id: body.category_id }
      };
    }

    // معالجة publish_at
    if (body.publish_at) {
      updateData.published_at = new Date(body.publish_at);
    }

    // تحديث المقال
    const updatedArticle = await prisma.articles.update({
      where: { id: articleId },
      data: updateData
    });

    console.log('✅ [API PUT] تم تحديث المقال بنجاح:', {
      id: articleId,
      is_breaking: updatedArticle.breaking,
      metadata: updatedArticle.metadata
    });

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      message: 'تم تحديث المقال بنجاح'
    });

  } catch (error: any) {
    console.error('❌ [API PUT] خطأ في تحديث المقال:', {
      id: articleId,
      message: error.message,
      code: error.code
    });

    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false,
          error: 'المقال غير موجود',
          code: error.code 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'فشل تحديث المقال',
        details: error.message || 'خطأ غير معروف',
        code: error.code
      },
      { status: 500 }
    );
  }
}

 