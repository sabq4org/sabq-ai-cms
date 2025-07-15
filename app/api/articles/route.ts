import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis-improved'

import { filterTestContent, rejectTestContent } from '@/lib/data-protection'
import jwt from 'jsonwebtoken'
import { perfMonitor } from '@/lib/performance-monitor'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// دالة مساعدة لإضافة CORS headers
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// دالة لإنشاء response مع CORS headers
function corsResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // إضافة cache headers لتحسين الأداء
  if (status === 200) {
    // cache لمدة 5 دقائق للمقالات
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    // إضافة ETag للتحقق من التغييرات
    const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64').substring(0, 27)}"`;
    response.headers.set('ETag', etag);
  }
  
  return addCorsHeaders(response);
}

// دالة لمعالجة طلبات OPTIONS
function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return handleOptions();
}

export const runtime = 'nodejs'

// جلب المقالات
export async function GET(request: NextRequest) {
  const endTimer = perfMonitor.startTimer('api_articles_get');
  
  try {
    console.log('🔍 بدء معالجة طلب المقالات...')
    const { searchParams } = new URL(request.url)
    
    // إنشاء مفتاح التخزين المؤقت بناءً على المعاملات
    const cacheKey = CACHE_KEYS.articles(Object.fromEntries(searchParams))
    
    // محاولة جلب البيانات من Redis
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      console.log('✅ تم جلب المقالات من Redis cache')
      return corsResponse(cachedData, 200)
    }
    
    // بناء شروط البحث
    const where: any = {}
    
    // فلترة حسب الحالة مع استبعاد المقالات المحذوفة دائماً
    const status = searchParams.get('status')
    
    // إذا كان المطلوب هو المقالات المحذوفة فقط (للوحة التحكم)
    if (status === 'deleted') {
      where.status = 'deleted'
    } else {
      // لجميع الحالات الأخرى، نستبعد المقالات المحذوفة دائماً
      if (status) {
        where.status = status
      }
      // إضافة شرط لاستبعاد المقالات المحذوفة في جميع الحالات
      where.NOT = { status: 'deleted' }
    }

    // فلترة حسب التصنيف
    const categoryId = searchParams.get('category_id')
    if (categoryId) {
      where.category_id = categoryId
    }

    // فلترة حسب المؤلف
    const authorId = searchParams.get('author_id')
    if (authorId) {
      where.author_id = authorId
    }

    // البحث في العنوان والمحتوى
    const search = searchParams.get('search')
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } }
      ]
    }

    // فلترة المقالات المميزة
    const featured = searchParams.get('featured')
    if (featured === 'true') {
      where.featured = true
    }

    // فلترة الأخبار العاجلة
    const breaking = searchParams.get('breaking')
    if (breaking === 'true') {
      where.breaking = true
    }

    /*
    // فلترة حسب نوع المقال (OPINION أو غيره) - معطل مؤقتاً للتشخيص
    const type = searchParams.get('type')
    if (type === 'OPINION') {
      // جلب معرف تصنيف الرأي من قاعدة البيانات
      const opinionCategory = await prisma.categories.findFirst({
        where: { 
          OR: [
            { slug: 'opinion' },
            { name: 'رأي' }
          ]
        },
        select: { id: true }
      })
      if (opinionCategory) {
        where.category_id = opinionCategory.id
      }
    } else if (type && type !== 'OPINION') {
      // لأنواع أخرى من المقالات، استبعاد مقالات الرأي
      const opinionCategory = await prisma.categories.findFirst({
        where: { 
          OR: [
            { slug: 'opinion' },
            { name: 'رأي' }
          ]
        },
        select: { id: true }
      })
      if (opinionCategory) {
        where.category_id = { not: opinionCategory.id }
      }
    }
    */

    // الترتيب
    const sortBy = searchParams.get('sortBy') || 'published_at';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
    
    let orderBy: any = {};
    if (sortBy === 'published_at') {
      // استخدام created_at إذا كان published_at غير موجود
      orderBy = [
        { published_at: order },
        { created_at: order }
      ];
    } else if (sortBy === 'views_count') {
      orderBy.views_count = order;
    } else if (sortBy === 'engagement_score') {
      orderBy.engagement_score = order;
    } else if (sortBy === 'created_at') {
      orderBy.created_at = order;
    } else {
      orderBy = [
        { published_at: order },
        { created_at: order }
      ];
    }

    // التقسيم (Pagination)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')
    const skip = (page - 1) * limit

    // جلب المقالات من قاعدة البيانات البعيدة مع العلاقات (Eager Loading)
    console.time('🔍 جلب المقالات من قاعدة البيانات')
    let articles = []
    try {
      // استخدام select محدد لتقليل حجم البيانات المنقولة
      articles = await prisma.articles.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          published_at: true,
          created_at: true,
          views: true,
          reading_time: true,
          status: true,
          featured: true,
          breaking: true,
          author_id: true,
          category_id: true,
          // محتوى المقال فقط عند الحاجة
          content: searchParams.get('includeContent') === 'true',
          // البيانات الوصفية
          seo_title: true,
          seo_description: true,
          // العلاقات
          categories: {
            select: {
              id: true,
              name: true,
              name_en: true,
              slug: true,
              color: true,
              icon: true
            }
          }
        }
      })
    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات:', dbError)
      throw dbError
    }
    console.timeEnd('🔍 جلب المقالات من قاعدة البيانات')

    // جلب العدد الإجمالي والمؤلفين بشكل متوازي
    console.time('📊 جلب البيانات الإضافية')
    const [total, authors] = await Promise.all([
      // جلب العدد الإجمالي
      prisma.articles.count({ where }),
      
      // جلب المؤلفين فقط إذا كانت هناك مقالات
      articles.length > 0 
        ? prisma.users.findMany({
            where: { 
              id: { 
                in: [...new Set(articles.map((a: any) => a.author_id).filter(Boolean))] 
              } 
            },
            select: {
              id: true,
              name: true,
              email: true
            }
          })
        : Promise.resolve([])
    ])
    console.timeEnd('📊 جلب البيانات الإضافية')

    // تحويل المؤلفين إلى Map للوصول السريع
    const authorsMap = authors.reduce((acc: any, author: any) => {
      acc[author.id] = author
      return acc
    }, {})

    // تحويل البيانات للتوافق مع الواجهة
    console.time('🔄 تحويل وتنسيق البيانات')
    const formattedArticles = articles.map((article: any) => {
      // محاولة الحصول على اسم المؤلف من مصادر مختلفة
      const author = authorsMap[article.author_id] || null
      const authorName = author?.name || 
                        article.metadata?.author_name || 
                        (author?.email ? author.email.split('@')[0] : null) ||
                        'غير محدد'
      
      // التصنيف يأتي مباشرة من include
      const category = article.categories || null
      
      return {
        ...article,
        author: { 
          id: article.author_id, 
          name: authorName,
          email: author?.email
        },
        author_name: authorName, // إضافة author_name مباشرة للتوافق
        category: category || { 
          id: article.category_id, 
          name: 'غير مصنف',
          name_ar: 'غير مصنف',
          slug: 'uncategorized',
          color: '#6B7280'
        },
        category_name: category?.name || 'غير مصنف',
        category_color: category?.color || '#6B7280',
        featured_image: article.featured_image,
        reading_time: article.reading_time,
        created_at: article.created_at,
        updated_at: article.updated_at,
        published_at: article.published_at,
        views_count: article.views || 0 // إضافة views_count من حقل views في قاعدة البيانات
      }
    })
    console.timeEnd('🔄 تحويل وتنسيق البيانات')

    // تصفية المحتوى التجريبي إذا كان مطلوباً
    // const filteredArticles = filterTestContent(formattedArticles);
    const filteredArticles = formattedArticles; // تعطيل التصفية مؤقتاً
    
    // إحصائيات التقسيم
    const stats = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: skip + limit < total,
      hasPrev: page > 1
    }

    console.log(`✅ تم جلب ${formattedArticles.length} مقال من أصل ${total}`)
    
    const responseData = {
      success: true,
      articles: formattedArticles,
      data: formattedArticles,
      pagination: stats,
      filters: {
        status: searchParams.get('status'),
        category_id: searchParams.get('category_id'),
        search: searchParams.get('search'),
        featured: searchParams.get('featured'),
        breaking: searchParams.get('breaking'),
        type: searchParams.get('type')
      }
    }
    
    const duration = endTimer();
    console.log(`⏱️ إجمالي وقت معالجة الطلب: ${duration.toFixed(2)}ms`);
    
    // حفظ البيانات في Redis للطلبات المستقبلية
    await cache.set(cacheKey, responseData, CACHE_TTL.ARTICLES)
    
    return corsResponse(responseData, 200)
  } catch (error) {
    endTimer();
    console.error('خطأ في جلب المقالات:', error)
    return corsResponse({
      success: false,
      error: 'فشل في استرجاع المقالات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500)
  }
}

// إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    // التحقق من صلاحيات المستخدم
    const authCheck = await checkUserPermissions(request);
    
    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      category_id,
      author_id,
      author_name,
      status = 'draft',
      featured_image,
      metadata = {}
    } = body

    // التحقق من البيانات المطلوبة
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'العنوان والمحتوى مطلوبان' },
        { status: 400 }
      )
    }
    
    // استخدام معرف المستخدم الحالي إذا لم يتم تحديد author_id
    const finalAuthorId = author_id || (authCheck.valid ? authCheck.user?.id : null) || 'default-author-id'
    const finalAuthorName = author_name || (authCheck.valid ? authCheck.user?.name : null) || 'غير محدد'

    // إنشاء المقال في قاعدة البيانات البعيدة
    const article = await prisma.articles.create({
      data: {
        id: crypto.randomUUID(),
        title: String(title),
        content: String(content),
        excerpt: excerpt ? String(excerpt) : content.substring(0, 200) + '...',
        category_id: category_id || null,
        status: String(status),
        featured_image: featured_image || null,
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
          isSmartDraft: (metadata as any)?.isSmartDraft || false,
          aiEditor: (metadata as any)?.aiEditor || false,
          author_name: finalAuthorName // حفظ اسم المؤلف في metadata
        },
        author_id: finalAuthorId, // استخدام معرف المؤلف النهائي
        slug: generateSlug(title),
        views: 0,
        reading_time: Math.ceil(content.split(' ').length / 200), // تقدير وقت القراءة
        updated_at: new Date()
      }
    })

    // إضافة حدث إلى timeline_events عند نشر المقال
    if (status === 'published') {
      try {
        await prisma.timeline_events.create({
          data: {
            id: crypto.randomUUID(),
            event_type: 'article_published',
            entity_type: 'article',
            entity_id: article.id,
            title: `مقال جديد: ${title}`,
            description: excerpt || content.substring(0, 100) + '...',
            user_id: finalAuthorId || null,
            author_name: finalAuthorName,
            metadata: {
              category_id: category_id,
              featured_image: featured_image,
              is_breaking: (metadata as any)?.is_breaking || false
            },
            created_at: new Date()
          }
        })
        console.log('✅ تم إضافة الحدث إلى timeline_events')
      } catch (error) {
        console.error('⚠️ فشل إضافة الحدث إلى timeline_events:', error)
        // لا نريد أن نفشل العملية بالكامل إذا فشل إضافة الحدث
      }
    }

    console.log('✅ تم إنشاء المقال:', {
      id: article.id,
      title: article.title,
      status: article.status,
      isSmartDraft: (metadata as any)?.isSmartDraft
    })

    // مسح الكاش عند إنشاء مقال جديد
    if (status === 'published') {
      console.log('🧹 مسح الكاش بعد نشر المقال...');
      await cache.clearPattern('articles:*');
      if (category_id) {
        await cache.clearPattern(`articles:*category_id*${category_id}*`);
      }
    }

    // توليد الصوت تلقائياً إذا كان المقال منشوراً وله موجز
    if (status === 'published' && article.excerpt && process.env.ELEVENLABS_API_KEY) {
      try {
        console.log('🎙️ بدء توليد الصوت للموجز...')
        const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get('host')}` || 'http://localhost:3000';
        const audioResponse = await fetch(`${baseUrl}/api/voice-summary?articleId=${article.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (audioResponse.ok) {
          const audioData = await audioResponse.json();
          if (audioData.success) {
            console.log('✅ تم توليد الصوت بنجاح:', audioData.audioUrl);
          }
        }
      } catch (audioError) {
        console.error('⚠️ فشل توليد الصوت (لكن المقال تم حفظه):', audioError);
        // لا نريد أن نفشل العملية بالكامل إذا فشل توليد الصوت
      }
    }

    return NextResponse.json({
      success: true,
      article,
      message: 'تم حفظ المقال بنجاح'
    })
  } catch (error) {
    console.error('❌ خطأ في إنشاء المقال:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطأ في حفظ المقال',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    )
  }
}

// دوال مساعدة
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '') // إزالة الأحرف غير المسموحة
    .replace(/\s+/g, '-') // استبدال المسافات بشرطة
    .replace(/-+/g, '-') // إزالة الشرطات المتكررة
    .trim()
    .substring(0, 100) // تحديد الطول
}

function calculateReadingTime(content: string): number {
  const wordsCount = content.split(/\s+/).length
  return Math.ceil(wordsCount / 200)
}

// دالة للتحقق من صلاحيات المستخدم
async function checkUserPermissions(request: NextRequest, requireDelete: boolean = false): Promise<{ valid: boolean, user?: any, error?: string }> {
  try {
    // محاولة الحصول على التوكن من الكوكيز أو من Authorization header
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return { valid: false, error: 'لم يتم العثور على معلومات المصادقة' };
    }

    // التحقق من صحة التوكن
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return { valid: false, error: 'جلسة غير صالحة' };
    }

    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_admin: true,
        is_verified: true
      }
    });

    if (!user) {
      return { valid: false, error: 'المستخدم غير موجود' };
    }

    // التحقق من أن المستخدم مفعل
    if (!user.is_verified) {
      return { valid: false, error: 'المستخدم غير مفعل' };
    }

    // التحقق من صلاحيات الحذف إذا كان مطلوباً
    if (requireDelete) {
      const canDelete = user.is_admin || 
                       user.role === 'admin' || 
                       user.role === 'editor' || 
                       user.role === 'super_admin';

      if (!canDelete) {
        return { valid: false, error: 'ليس لديك صلاحية حذف المقالات' };
      }
    }

    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: 'خطأ في التحقق من الصلاحيات' };
  }
}

// DELETE: حذف مقالات (حذف ناعم) - محمي بالمصادقة
export async function DELETE(request: NextRequest) {
  try {
    // التحقق من صلاحيات المستخدم للحذف
    const authCheck = await checkUserPermissions(request, true);
    if (!authCheck.valid) {
      return NextResponse.json({
        success: false,
        error: authCheck.error || 'غير مصرح بالوصول'
      }, { status: 401 });
    }

    const body = await request.json()
    const ids = body.ids || []

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'معرفات المقالات مطلوبة'
      }, { status: 400 })
    }

    // تسجيل عملية الحذف للمراجعة
    console.log(`🗑️ محاولة حذف ${ids.length} مقال من قبل المستخدم:`, {
      userId: authCheck.user?.id,
      userEmail: authCheck.user?.email,
      userRole: authCheck.user?.role,
      articleIds: ids,
      timestamp: new Date().toISOString()
    });

    // تحديث حالة المقالات إلى "محذوف" في قاعدة البيانات البعيدة
    const result = await prisma.articles.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        status: 'deleted',
        updated_at: new Date()
      }
    })

    // تسجيل النشاط في سجل الأنشطة - معطل مؤقتاً
    // await prisma.activity_logs.create({ ... });

    console.log(`✅ تم حذف ${result.count} مقال بنجاح من قبل:`, authCheck.user?.email);

    return NextResponse.json({
      success: true,
      affected: result.count,
      message: `تم حذف ${result.count} مقال(ات) بنجاح`,
      deletedBy: {
        userId: authCheck.user.id,
        userEmail: authCheck.user.email,
        userRole: authCheck.user.role
      }
    })
  } catch (error) {
    console.error('خطأ في حذف المقالات:', error)
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف المقالات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
} 