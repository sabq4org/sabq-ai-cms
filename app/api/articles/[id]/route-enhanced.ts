import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET: جلب مقال واحد مع معالجة أخطاء محسنة
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 [Article API] بدء جلب المقال...');
    
    const { id } = await params;
    
    if (!id) {
      console.error('❌ [Article API] معرف المقال مفقود');
      return NextResponse.json({
        success: false,
        error: 'معرف المقال مطلوب'
      }, { status: 400 });
    }

    // فك ترميز المعرف
    let decodedId = id;
    try {
      decodedId = decodeURIComponent(id);
      console.log(`📝 [Article API] معالجة المعرف: ${id} -> ${decodedId}`);
    } catch (error) {
      console.warn('⚠️ [Article API] تعذر فك ترميز المعرف:', id);
    }

    // استيراد آمن لـ Prisma
    let prisma, ensureConnection;
    try {
      const prismaModule = await import('@/lib/prisma');
      prisma = prismaModule.prisma;
      ensureConnection = prismaModule.ensureConnection;
      console.log('✅ [Article API] تم تحميل Prisma بنجاح');
    } catch (error) {
      console.error('❌ [Article API] فشل تحميل Prisma:', error);
      return NextResponse.json({
        success: false,
        error: 'خطأ في النظام - فشل تحميل قاعدة البيانات',
        code: 'PRISMA_IMPORT_FAILED'
      }, { status: 500 });
    }

    // التأكد من الاتصال بقاعدة البيانات
    let isConnected = false;
    try {
      isConnected = await ensureConnection();
      console.log('🔗 [Article API] حالة الاتصال بقاعدة البيانات:', isConnected);
    } catch (error) {
      console.error('❌ [Article API] خطأ في فحص الاتصال:', error);
    }
    
    if (!isConnected) {
      console.error('❌ [Article API] فشل الاتصال بقاعدة البيانات');
      return NextResponse.json({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات',
        code: 'DATABASE_CONNECTION_FAILED'
      }, { status: 503 });
    }
    
    // جلب المقال من قاعدة البيانات
    let dbArticle = null;
    try {
      console.log(`🔍 [Article API] البحث عن المقال بالمعرف: ${decodedId}`);
      
      dbArticle = await prisma.articles.findFirst({
        where: {
          OR: [
            { id: decodedId },
            { slug: decodedId },
            { slug: id }
          ]
        },
        select: {
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
      
      console.log('📊 [Article API] نتيجة البحث:', dbArticle ? 'تم العثور على المقال' : 'لم يتم العثور على المقال');
      
    } catch (dbError) {
      console.error('❌ [Article API] خطأ في قاعدة البيانات:', dbError);
      return NextResponse.json({
        success: false,
        error: 'خطأ في جلب البيانات من قاعدة البيانات',
        code: 'DATABASE_QUERY_FAILED',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      }, { status: 500 });
    }
    
    if (!dbArticle) {
      console.warn(`⚠️ [Article API] المقال غير موجود: ${decodedId}`);
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
        console.warn(`⚠️ [Article API] محاولة الوصول لمقال غير منشور: ${decodedId}`);
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
      id: dbArticle.id,
      title: dbArticle.title,
      content: dbArticle.content,
      excerpt: dbArticle.excerpt,
      slug: dbArticle.slug,
      featured_image: dbArticle.featured_image,
      author_id: dbArticle.author_id,
      category_id: dbArticle.category_id,
      published_at: dbArticle.published_at,
      created_at: dbArticle.created_at,
      updated_at: dbArticle.updated_at,
      views: dbArticle.views || 0,
      likes: dbArticle.likes || 0,
      shares: dbArticle.shares || 0,
      saves: dbArticle.saves || 0,
      featured: dbArticle.featured || false,
      breaking: dbArticle.breaking || false,
      reading_time: dbArticle.reading_time || 5,
      status: dbArticle.status,
      seo_keywords: keywords,
      seo_description: dbArticle.seo_description,
      metadata: metadata,
      category: dbArticle.categories,
      stats: {
        likes: dbArticle.likes || 0,
        saves: dbArticle.saves || 0,
        shares: dbArticle.shares || 0,
        views: dbArticle.views || 0
      }
    };
    
    // تسجيل زيارة (بشكل غير متزامن)
    prisma.articles.update({
      where: { id: dbArticle.id },
      data: { views: { increment: 1 } }
    }).catch(err => console.error('خطأ في تحديث عدد المشاهدات:', err));
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ [Article API] تم جلب المقال بنجاح في ${responseTime}ms`);
    
    const response = NextResponse.json({
      success: true,
      ...articleData
    });
    
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    
    return response;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ [Article API] خطأ غير متوقع:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ غير متوقع',
      code: 'UNEXPECTED_ERROR',
      responseTime: `${responseTime}ms`,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// UPDATE: تحديث المقال
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 [Article API] بدء تحديث المقال...');
    
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'معرف المقال مطلوب'
      }, { status: 400 });
    }

    // استيراد آمن لـ Prisma
    const { prisma, ensureConnection } = await import('@/lib/prisma');
    
    // التأكد من الاتصال بقاعدة البيانات
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, { status: 503 });
    }
    
    // تحديث المقال
    const updatedArticle = await prisma.articles.update({
      where: { id },
      data: {
        ...body,
        updated_at: new Date()
      }
    });
    
    console.log('✅ [Article API] تم تحديث المقال بنجاح');
    
    return NextResponse.json({
      success: true,
      data: updatedArticle,
      message: 'تم تحديث المقال بنجاح'
    });
    
  } catch (error) {
    console.error('❌ [Article API] خطأ في تحديث المقال:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث المقال',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE: حذف المقال
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ [Article API] بدء حذف المقال...');
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'معرف المقال مطلوب'
      }, { status: 400 });
    }

    // استيراد آمن لـ Prisma
    const { prisma, ensureConnection } = await import('@/lib/prisma');
    
    // التأكد من الاتصال بقاعدة البيانات
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, { status: 503 });
    }
    
    // حذف المقال (soft delete)
    await prisma.articles.update({
      where: { id },
      data: {
        status: 'deleted',
        updated_at: new Date()
      }
    });
    
    console.log('✅ [Article API] تم حذف المقال بنجاح');
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف المقال بنجاح'
    });
    
  } catch (error) {
    console.error('❌ [Article API] خطأ في حذف المقال:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف المقال',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
