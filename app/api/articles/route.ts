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
    const article_type = searchParams.get('article_type'); // فلتر نوع المقال الجديد
    const exclude = searchParams.get('exclude'); // استبعاد مقال معين

    console.log(`🔍 فلترة المقالات حسب category: ${category_id}, نوع المقال: ${article_type}`);

    // بناء شروط البحث
    const where: any = {};
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (category_id && category_id !== 'all') {
      where.category_id = category_id;
    }
    
    // دعم فلتر article_type للفصل بين الأخبار والمقالات
    if (article_type) {
      if (article_type === 'news') {
        // للأخبار: نبحث عن article_type = 'news' فقط (إزالة null للآن)
        where.article_type = 'news';
      } else {
        where.article_type = article_type;
      }
      console.log(`🎯 تطبيق فلتر article_type: ${article_type}`);
    } else {
      // عرض جميع المحتوى المنشور (أخبار + مقالات) 
      // لا نطبق فلتر article_type - نعرض كل شيء منشور
      console.log(`🎯 عرض عام: جميع المحتوى المنشور (أخبار + مقالات)`);
    }
    
    if (search) {
      const typeFilter = where.OR ? { OR: where.OR } : (where.article_type ? { article_type: where.article_type } : {});
      
      where.AND = [
        typeFilter,
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
      
      // إزالة filters الأخرى لتجنب التعارض
      delete where.article_type;
      delete where.OR;
    }
    
    // دعم معامل types القديم للتوافق العكسي
    if (types) {
      const typeArray = types.split(',').filter(Boolean);
      if (typeArray.length > 0) {
        where.article_type = { in: typeArray };
        console.log(`🎯 تطبيق فلتر types: ${typeArray.join(', ')}`);
      }
    }
    
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

    // جلب المقالات أولاً
    const articles = await prisma.articles.findMany({
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
    });

    // حساب العدد بنفس شروط where ولكن بشكل منفصل
    let totalCount = 0;
    try {
      if (article_type) {
        totalCount = await prisma.articles.count({
          where: {
            status: status !== 'all' ? status : undefined,
            category_id: (category_id && category_id !== 'all') ? category_id : undefined,
            article_type: article_type === 'news' ? 'news' : article_type
          }
        });
      } else {
        // عد الأخبار فقط (استبعاد مقالات الرأي)
        totalCount = await prisma.articles.count({
          where: {
            status: status !== 'all' ? status : undefined,
            category_id: (category_id && category_id !== 'all') ? category_id : undefined,
            article_type: {
              notIn: ['opinion', 'analysis', 'interview']
            }
          }
        });
      }
    } catch (countError) {
      console.error('⚠️ خطأ في حساب العدد:', countError);
      totalCount = articles.length;
    }

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
  
  let data: any = {}; // تعريف data خارج try block
  
  try {
    data = await request.json()
    console.log('📦 البيانات المستلمة:', JSON.stringify(data, null, 2))
    
    // توحيد أسماء الحقول المختلفة
    const authorId = data.author_id || data.authorId || data.article_author_id || null;
    const categoryId = data.category_id || data.categoryId || null;
    
    console.log('🔄 توحيد الحقول:', {
      original_author: data.author_id,
      original_authorId: data.authorId, 
      original_article_author_id: data.article_author_id,
      unified_author: authorId,
      original_category: data.category_id,
      original_categoryId: data.categoryId,
      unified_category: categoryId
    });

    // التحقق من البيانات المطلوبة مع تحسين الرسائل
    const errors = [];
    
    if (!data.title?.trim()) {
      errors.push('العنوان مطلوب ولا يمكن أن يكون فارغاً');
    }
    
    if (!data.content?.trim()) {
      errors.push('محتوى المقال مطلوب ولا يمكن أن يكون فارغاً');
    }
    
    if (!categoryId) {
      errors.push('يجب اختيار تصنيف للمقال');
    }
    
    if (!authorId) {
      errors.push('يجب تحديد كاتب المقال');
    }
    
    // التحقق من طول العنوان
    if (data.title && data.title.length > 200) {
      errors.push('عنوان المقال طويل جداً (أقصى حد 200 حرف)');
    }
    
    // التحقق من طول المحتوى
    if (data.content && data.content.length < 10) {
      errors.push('محتوى المقال قصير جداً (أدنى حد 10 أحرف)');
    }
    
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'بيانات المقال غير صحيحة',
        details: errors.join(', '),
        validation_errors: errors
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
      author_id: authorId, // استخدام المتغير الموحد
      category_id: categoryId, // استخدام المتغير الموحد
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
    
    // التحقق من وجود التصنيف والمؤلف في قاعدة البيانات قبل الإنشاء
    console.log('🔍 التحقق من صحة المؤلف والتصنيف...');
    
    const [author, category] = await Promise.all([
      prisma.users.findUnique({ where: { id: authorId } }),
      prisma.categories.findUnique({ where: { id: categoryId } })
    ]);
    
    if (!author) {
      console.error('❌ المؤلف غير موجود:', authorId);
      return NextResponse.json({
        success: false,
        error: 'المؤلف المحدد غير موجود في النظام',
        details: `معرف المؤلف: ${authorId}`
      }, { status: 400 });
    }
    
    if (!category) {
      console.error('❌ التصنيف غير موجود:', categoryId);
      return NextResponse.json({
        success: false,
        error: 'التصنيف المحدد غير موجود في النظام',
        details: `معرف التصنيف: ${categoryId}`
      }, { status: 400 });
    }
    
    console.log('✅ المؤلف والتصنيف صحيحان:', {
      author: author.name || author.email,
      category: category.name
    });
    
    // إنشاء المقال أولاً
    const article = await prisma.articles.create({
      data: articleData,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        categories: {
          select: { id: true, name: true, slug: true }
        }
      }
    })
    
    // تعامل مبسط مع المقالات المميزة - تجنب FeaturedArticleManager مؤقتاً
    if (articleData.featured === true) {
      console.log('ℹ️ المقال مميز - تم تعيينه كمميز مباشرة');
    }
    
    return NextResponse.json({
      success: true,
      article,
      message: data.status === 'published' ? 'تم نشر المقال بنجاح' : 'تم حفظ المسودة بنجاح',
      summary: {
        id: article.id,
        title: article.title,
        author: article.author?.name || article.author?.email,
        category: article.categories?.name,
        status: article.status,
        created_at: article.created_at
      }
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
          author_id: authorId,
          category_id: categoryId
        }
      });
      
      if (field.includes('author')) {
        message = 'المستخدم المحدد غير موجود';
        details = `معرف المستخدم: ${authorId}`;
      } else if (field.includes('category')) {
        message = 'التصنيف المحدد غير موجود';
        details = `معرف التصنيف: ${categoryId}`;
      }
      
      return NextResponse.json({
        success: false,
        error: message,
        details,
        debug: {
          field,
          author_id: authorId,
          category_id: categoryId
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
