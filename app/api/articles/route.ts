import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache في الذاكرة
const articleCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // دقيقة واحدة

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cacheKey = searchParams.toString();
  
  // التحقق من الكاش أولاً
  const cached = articleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ إرجاع المقالات من الكاش');
    return NextResponse.json(cached.data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });
  }

  try {
    console.log('🔍 بداية معالجة طلب المقالات');
    console.log('prisma:', typeof prisma);
    console.log('prisma.articles:', typeof prisma?.articles);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 200);
    const status = searchParams.get('status') || 'published';
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'published_at';
    const order = searchParams.get('order') || 'desc';
    const skip = (page - 1) * limit;
    const types = searchParams.get('types'); // دعم معامل types الجديد
    const exclude = searchParams.get('exclude'); // استبعاد مقال معين

    console.log(`🔍 فلترة المقالات حسب category: ${category_id}`);

    // بناء شروط البحث
    const where: any = {};
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (category_id && category_id !== 'all') {
      where.category_id = category_id;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // دعم معامل types - تم التعليق لأن حقل type غير موجود في قاعدة البيانات
    // يمكن استخدام metadata->type إذا كان مطلوباً
    /*
    if (types) {
      const typeArray = types.split(',').filter(Boolean);
      if (typeArray.length > 0) {
        where.type = { in: typeArray };
      }
    }
    */
    
    // التحقق من معامل sortBy=latest
    const sortBy = searchParams.get('sortBy');
    const orderBy: any = {};
    
    if (sortBy === 'latest' || sort === 'published_at') {
      orderBy.published_at = order;
    } else if (sort === 'views') {
      orderBy.views_count = order;
    } else {
      orderBy[sort] = order;
    }

    // جلب المقالات مع العد بشكل متوازي
    const [articles, totalCount] = await Promise.all([
      prisma.articles.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      }),
      
      prisma.articles.count({ where })
    ]);

    // إضافة معلومات إضافية
    const enrichedArticles = articles.map(article => ({
      ...article,
      image: article.featured_image,
      category: article.categories,
      author_name: article.author?.name || null,
      comments_count: 0 // يمكن إضافة عد التعليقات لاحقاً
    }));

    const response = {
      success: true,
      articles: enrichedArticles,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + limit < totalCount
    };

    // حفظ في الكاش
    articleCache.set(cacheKey, { data: response, timestamp: Date.now() });
    
    // تنظيف الكاش القديم
    if (articleCache.size > 100) {
      const oldestKey = Array.from(articleCache.keys())[0];
      articleCache.delete(oldestKey);
    }

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب المقالات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب المقالات',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// إنشاء مقال جديد
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/articles - بداية معالجة الطلب');
  
  try {
    const data = await request.json()
    console.log('📦 البيانات المستلمة:', JSON.stringify(data, null, 2))
    
    // التحقق من البيانات المطلوبة
    if (!data.title || !data.content) {
      return NextResponse.json({
        success: false,
        error: 'العنوان والمحتوى مطلوبان'
      }, { status: 400 })
    }
    
    if (!data.category_id) {
      return NextResponse.json({
        success: false,
        error: 'يجب اختيار تصنيف للمقال'
      }, { status: 400 })
    }
    
    if (!data.author_id) {
      return NextResponse.json({
        success: false,
        error: 'يجب تحديد كاتب المقال'
      }, { status: 400 })
    }
    
    // توليد slug من العنوان
    const generateSlug = (title: string): string => {
      return title
        .trim()
        .toLowerCase()
        .replace(/[^\w\s\u0600-\u06FF-]/g, '') // إزالة الأحرف الخاصة مع الحفاظ على العربية
        .replace(/\s+/g, '-') // استبدال المسافات بـ -
        .replace(/-+/g, '-') // إزالة - المتكررة
        .replace(/^-+|-+$/g, '') // إزالة - من البداية والنهاية
        || `article-${Date.now()}`; // fallback إذا كان العنوان فارغ
    };
    
    // معالجة الحقل المميز بأسمائه المختلفة
    const isFeatured = data.featured || data.is_featured || data.isFeatured || false;
    const isBreaking = data.breaking || data.is_breaking || data.isBreaking || false;
    
    // تنقية البيانات للتأكد من مطابقتها لنموذج articles
    const articleData = {
      id: data.id || generateId(),
      title: data.title,
      slug: data.slug || generateSlug(data.title),
      content: data.content,
      excerpt: data.excerpt || data.summary || null,
      author_id: data.author_id, // يجب أن يكون موجوداً من الواجهة
      category_id: data.category_id,
      status: data.status || 'draft',
      featured: isFeatured,
      breaking: isBreaking,
      featured_image: data.featured_image || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      seo_keywords: data.seo_keywords || null,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: data.status === 'published' ? new Date() : null,
      metadata: data.metadata || {}
    };
    
    console.log('📝 بيانات المقال المنقاة:', articleData);
    
    // إنشاء المقال أولاً
    const article = await prisma.articles.create({
      data: articleData
    })
    
    // تعامل مبسط مع المقالات المميزة - تجنب FeaturedArticleManager مؤقتاً
    if (articleData.featured === true) {
      console.log('ℹ️ المقال مميز - تم تعيينه كمميز مباشرة');
    }
    
    return NextResponse.json({
      success: true,
      article,
      message: data.status === 'published' ? 'تم نشر المقال بنجاح' : 'تم حفظ المسودة بنجاح'
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء المقال:', error)
    console.error('Stack trace:', error.stack)
    
    // معالجة أخطاء Prisma الشائعة
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'المقال موجود مسبقاً',
        details: 'يوجد مقال بنفس العنوان أو المعرف'
      }, { status: 409 })
    }
    
    if (error.code === 'P2003') {
      const field = error.meta?.field_name || 'unknown';
      let message = 'خطأ في البيانات المرجعية';
      let details = 'التصنيف أو المؤلف غير موجود';
      
      console.error('🔍 تفاصيل خطأ P2003:', {
        field,
        meta: error.meta,
        receivedData: {
          author_id: data.author_id,
          category_id: data.category_id
        }
      });
      
      if (field.includes('author')) {
        message = 'المستخدم المحدد غير موجود';
        details = `معرف المستخدم: ${data.author_id}`;
      } else if (field.includes('category')) {
        message = 'التصنيف المحدد غير موجود';
        details = `معرف التصنيف: ${data.category_id}`;
      }
      
      return NextResponse.json({
        success: false,
        error: message,
        details,
        debug: {
          field,
          author_id: data.author_id,
          category_id: data.category_id
        }
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء المقال',
      details: error.message || 'خطأ غير معروف',
      code: error.code
    }, { status: 500 })
  } finally {
    await prisma.$disconnect();
  }
}

// دالة مساعدة لتوليد ID
function generateId() {
  return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
