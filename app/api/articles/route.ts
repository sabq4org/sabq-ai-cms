import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import dbConnectionManager from '@/lib/db-connection-manager';

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
  try {
    const data = await request.json()
    
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
    
    // تنقية البيانات للتأكد من مطابقتها لنموذج articles
    const articleData = {
      id: data.id || generateId(),
      title: data.title,
      slug: data.slug || generateSlug(data.title),
      content: data.content,
      excerpt: data.excerpt || null,
      author_id: data.author_id || '00000000-0000-0000-0000-000000000001', // مستخدم افتراضي
      category_id: data.category_id,
      status: data.status || 'draft',
      featured: data.featured || false,
      breaking: data.breaking || false,
      featured_image: data.featured_image || null,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: data.status === 'published' ? new Date() : null,
      metadata: data.metadata || {}
    };
    
    console.log('📝 بيانات المقال المنقاة:', articleData);
    
    // إذا كان المقال مميزاً، نقوم بإلغاء التمييز عن الأخبار الأخرى
    if (articleData.featured === true) {
      try {
        await prisma.articles.updateMany({
          where: {
            featured: true
          },
          data: {
            featured: false
          }
        });
        console.log('✅ تم إلغاء التمييز عن الأخبار الأخرى قبل إنشاء الخبر المميز الجديد');
      } catch (error) {
        console.error('❌ خطأ في إلغاء التمييز عن الأخبار الأخرى:', error);
      }
    }
    
    const article = await prisma.articles.create({
      data: articleData
    })
    
    return NextResponse.json({
      success: true,
      article,
      message: data.status === 'published' ? 'تم نشر المقال بنجاح' : 'تم حفظ المسودة بنجاح'
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء المقال:', error)
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء المقال',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// دالة مساعدة لتوليد ID
function generateId() {
  return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
