import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';

const prisma = new PrismaClient();

// إنشاء مقال جديد (للإدارة)
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/admin/articles - بداية معالجة الطلب');
  
  let data: any = {}; // تعريف data خارج try block
  
  try {
    data = await request.json();
    console.log('📦 البيانات المستلمة:', JSON.stringify(data, null, 2));
    
    // التحقق من البيانات المطلوبة
    if (!data.title || !data.content) {
      return NextResponse.json({
        success: false,
        error: 'العنوان والمحتوى مطلوبان'
      }, { status: 400 });
    }
    
    // استخدام القيم من النموذج أو القيم الافتراضية
    const article_author_id = data.article_author_id || data.author_id;
    const category_id = data.category_id || data.category;
    
    if (!article_author_id) {
      return NextResponse.json({
        success: false,
        error: 'يجب تحديد كاتب المقال'
      }, { status: 400 });
    }
    
    // البحث عن مستخدم افتراضي أو إنشاؤه
    let default_author_id = 'system-user-default';
    
    // التحقق من وجود المستخدم الافتراضي
    const systemUser = await prisma.users.findFirst({
      where: {
        OR: [
          { id: 'system-user-default' },
          { email: 'system@sabq.ai' },
          { role: 'admin' }
        ]
      }
    });
    
    if (systemUser) {
      default_author_id = systemUser.id;
    } else {
      // إنشاء مستخدم افتراضي إذا لم يكن موجوداً
      try {
        const newSystemUser = await prisma.users.create({
          data: {
            id: 'system-user-default',
            email: 'system@sabq.ai',
            name: 'نظام المقالات',
            role: 'admin',
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        default_author_id = newSystemUser.id;
        console.log('✅ تم إنشاء مستخدم النظام الافتراضي');
      } catch (userCreateError) {
        console.error('⚠️ فشل في إنشاء مستخدم النظام، استخدام أول مستخدم موجود');
        const firstUser = await prisma.users.findFirst();
        if (firstUser) {
          default_author_id = firstUser.id;
        }
      }
    }
    
    // البحث عن تصنيف افتراضي إذا لم يتم تحديد تصنيف
    let final_category_id = category_id;
    
    if (!final_category_id) {
      console.log('⚠️ لم يتم تحديد تصنيف، البحث عن تصنيف افتراضي...');
      
      // البحث عن أول تصنيف نشط
      const defaultCategory = await prisma.categories.findFirst({
        where: { is_active: true },
        orderBy: { display_order: 'asc' }
      });
      
      if (defaultCategory) {
        final_category_id = defaultCategory.id;
        console.log(`✅ تم استخدام التصنيف الافتراضي: ${defaultCategory.name} (${defaultCategory.id})`);
      } else {
        console.log('⚠️ لا توجد تصنيفات نشطة، سيتم المتابعة بدون تصنيف');
        final_category_id = null;
      }
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
    
    // توليد ID فريد
    const generateId = () => {
      return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    
    // معالجة الحقول
    const isFeatured = data.featured || data.is_featured || data.isFeatured || false;
    const isBreaking = data.breaking || data.is_breaking || data.isBreaking || false;
    
    // تحضير البيانات
    const articleId = data.id || generateId();
    const articleSlug = data.slug || generateSlug(data.title);
    const readingTime = data.reading_time || Math.ceil(data.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length / 225);
    
    console.log('📝 بيانات المقال المنقاة:', {
      id: articleId,
      title: data.title,
      slug: articleSlug,
      article_author_id,
      original_category_id: category_id,
      final_category_id,
      default_author_id
    });
    
    // إنشاء المقال
    const article = await prisma.articles.create({
      data: {
        id: articleId,
        title: data.title,
        slug: articleSlug,
        content: data.content,
        excerpt: data.excerpt || data.summary || null,
        status: data.status || 'draft',
        featured: isFeatured,
        breaking: isBreaking,
        featured_image: data.featured_image || null,
        seo_title: data.seo_title || data.title,
        seo_description: data.seo_description || data.excerpt || data.summary,
        seo_keywords: data.seo_keywords || null,
        tags: data.tags || [],
        views: 0,
        likes: 0,
        shares: 0,
        reading_time: readingTime,
        ai_quotes: data.ai_quotes || [],
        article_type: data.article_type || 'article',
        summary: data.summary || data.excerpt || null,
        created_at: new Date(),
        updated_at: new Date(),
        published_at: data.status === 'published' ? new Date() : null,
        metadata: data.metadata || {},
        // Connect relationships
        author: {
          connect: { id: default_author_id }
        },
        categories: final_category_id ? {
          connect: { id: final_category_id }
        } : undefined,
        article_author: article_author_id ? {
          connect: { id: article_author_id }
        } : undefined
      },
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
        },
        article_author: {
          select: {
            id: true,
            full_name: true,
            slug: true,
            title: true
          }
        }
      }
    });
    
    console.log('✅ تم إنشاء المقال بنجاح:', article.id);
    
    // حفظ الاقتباسات الذكية إذا وجدت
    if (data.ai_quotes && Array.isArray(data.ai_quotes) && data.ai_quotes.length > 0) {
      try {
        // يمكن إضافة حفظ الاقتباسات في جدول منفصل إذا لزم الأمر
        console.log(`💬 تم حفظ ${data.ai_quotes.length} اقتباس ذكي مع المقال`);
      } catch (quotesError) {
        console.error('⚠️ خطأ في حفظ الاقتباسات الذكية:', quotesError);
        // لا نفشل العملية بسبب الاقتباسات
      }
    }
    
    // مسح الكاش إذا كان المقال منشور
    if (data.status === 'published') {
      try {
        // مسح كاش الصفحات الرئيسية
        revalidatePath('/');
        revalidatePath('/home');
        revalidatePath('/home-v2');
        revalidatePath('/news');
        revalidatePath('/articles');
        
        // مسح كاش التصنيف إذا كان موجود
        if (article.categories?.slug) {
          revalidatePath(`/category/${article.categories.slug}`);
        }
        
        // مسح كاش tags
        revalidateTag('articles');
        revalidateTag('news');
        revalidateTag('featured-news');
        
        console.log('🔄 تم مسح الكاش بنجاح');
      } catch (cacheError) {
        console.error('⚠️ خطأ في مسح الكاش:', cacheError);
        // لا نفشل العملية بسبب الكاش
      }

      // إشعار المستخدمين المهتمين بالتصنيف (ذكاء) عند النشر مباشرة
      try {
        // المقال يعود مع categories كعلاقة، وليس category_id
        const categoryId = article.categories?.id || final_category_id;
        
        if (categoryId) {
          console.log('🔔 بدء إرسال إشعارات للمستخدمين المهتمين بالتصنيف:', categoryId);
          const { SmartNotificationEngine } = await import('@/lib/notifications/smart-engine');
          // غير متزامن حتى لا يؤخر الاستجابة
          setImmediate(() => {
            SmartNotificationEngine
              .notifyNewArticleInCategory(article.id, categoryId)
              .then(() => console.log('✅ تم إرسال الإشعارات بنجاح'))
              .catch((e: any) => console.error('❌ فشل إشعار المهتمين:', e?.message || e));
          });
        } else {
          console.log('⚠️ لا يوجد تصنيف للمقال، تخطي الإشعارات');
        }
      } catch (notifyErr) {
        console.error('❌ خطأ أثناء تفعيل إشعار الاهتمامات:', (notifyErr as any)?.message || notifyErr);
      }
    }
    
    return NextResponse.json({
      success: true,
      article,
      message: data.status === 'published' ? 'تم نشر المقال بنجاح' : 'تم حفظ المقال كمسودة'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء المقال:', error);
    console.error('Stack trace:', error.stack);
    
    // معالجة أخطاء Prisma الشائعة
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'المقال موجود مسبقاً',
        details: 'يوجد مقال بنفس العنوان أو المعرف'
      }, { status: 409 });
    }
    
    if (error.code === 'P2003') {
      const field = error.meta?.field_name || 'unknown';
      let message = 'خطأ في البيانات المرجعية';
      let details = 'التصنيف أو المؤلف غير موجود';
      
      console.error('🔍 تفاصيل خطأ P2003:', {
        field,
        meta: error.meta,
        receivedData: {
          article_author_id: data.article_author_id || data.author_id,
          category_id: data.category_id || data.category,
          author_id: default_author_id
        }
      });
      
      if (field.includes('author')) {
        message = 'المؤلف المحدد غير موجود';
        details = `معرف المؤلف: ${data.article_author_id || data.author_id}`;
      } else if (field.includes('category')) {
        message = 'التصنيف المحدد غير موجود';
        details = `معرف التصنيف: ${data.category_id || data.category}`;
      }
      
      return NextResponse.json({
        success: false,
        error: message,
        details,
        debug: {
          field,
          article_author_id: data.article_author_id || data.author_id,
          category_id: data.category_id || data.category,
          author_id: default_author_id
        }
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء المقال',
      details: error.message || 'خطأ غير معروف',
      code: error.code
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET: جلب المقالات (للإدارة)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status') || 'all';
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const skip = (page - 1) * limit;

    // بناء شروط البحث - فقط مقالات الرأي
    const where: any = {
      // تصفية مقالات الرأي فقط
      article_type: {
        in: ['opinion', 'analysis', 'interview']
      }
    };
    
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

    // ترتيب النتائج
    const orderBy: any = {};
    orderBy[sort] = order;

    // جلب المقالات مع العد
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
          },
          article_author: {
            select: {
              id: true,
              full_name: true,
              slug: true,
              title: true,
              avatar_url: true
            }
          }
        }
      }),
      
      prisma.articles.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      articles,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + limit < totalCount
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب المقالات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب المقالات',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}