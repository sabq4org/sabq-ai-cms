import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/prisma-helper";
import { ensureUniqueSlug, resolveContentType } from "@/lib/slug";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// Cache في الذاكرة
const articleCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 ثانية

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cacheKey = searchParams.toString();

  // التحقق من الكاش أولاً
  const cached = articleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    if (process.env.NODE_ENV !== 'production') {
      console.log("✅ إرجاع المقالات من الكاش");
    }
    return NextResponse.json(cached.data, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("🔍 بداية معالجة طلب المقالات");
      console.log("prisma:", typeof prisma);
      console.log("prisma.articles:", typeof prisma?.articles);
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 200);
    const status = searchParams.get("status") || "published";
    const category_id = searchParams.get("category_id");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "published_at";
    const order = searchParams.get("order") || "desc";
    const skip = (page - 1) * limit;
    const types = searchParams.get("types"); // دعم معامل types الجديد
    const article_type = searchParams.get("article_type"); // فلتر نوع المقال الجديد
    const exclude = searchParams.get("exclude"); // استبعاد مقال معين

    console.log(
      `🔍 فلترة المقالات حسب category: ${category_id}, نوع المقال: ${article_type}`
    );

    // بناء شروط البحث
    const where: any = {};

    if (status !== "all") {
      where.status = status;
    }

    if (category_id && category_id !== "all") {
      where.category_id = category_id;
    }

    // دعم فلتر article_type للفصل بين الأخبار والمقالات
    if (article_type) {
      if (article_type === "news") {
        // للأخبار: نبحث عن article_type = 'news' فقط
        where.article_type = "news";
      } else if (article_type === "opinion") {
        // لمقالات الرأي: نبحث عن مقالات الرأي فقط
        where.article_type = { in: ["opinion", "analysis", "interview"] };
      } else {
        where.article_type = article_type;
      }
      console.log(`🎯 تطبيق فلتر article_type: ${article_type}`);
    } else {
      // 🔥 تغيير مهم: عرض الأخبار فقط بشكل افتراضي (استبعاد مقالات الرأي)
      // مقالات الرأي لها مساحات مخصصة في "قادة الرأي اليوم"
      where.article_type = {
        notIn: ["opinion", "analysis", "interview"],
      };
      console.log(`🎯 عرض افتراضي: الأخبار فقط (استبعاد مقالات الرأي)`);
    }

    if (search) {
      const typeFilter = where.OR
        ? { OR: where.OR }
        : where.article_type
        ? { article_type: where.article_type }
        : {};

      where.AND = [
        typeFilter,
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        },
      ];

      // إزالة filters الأخرى لتجنب التعارض
      delete where.article_type;
      delete where.OR;
    }

    // دعم معامل types القديم للتوافق العكسي
    if (types) {
      const typeArray = types.split(",").filter(Boolean);
      if (typeArray.length > 0) {
        where.article_type = { in: typeArray };
        console.log(`🎯 تطبيق فلتر types: ${typeArray.join(", ")}`);
      }
    }

    // التحقق من معامل sortBy=latest
    const sortBy = searchParams.get("sortBy");
    const orderBy: any = {};

    if (sortBy === "latest" || sort === "published_at") {
      orderBy.published_at = order;
    } else if (sort === "views") {
      // الحقل الصحيح في الجدول هو "views" وليس "views_count"
      orderBy.views = order;
    } else {
      orderBy[sort] = order;
    }

    // جلب المقالات أولاً (بدون content_type لتوافق قاعدة البيانات الحالية)
    const articles = await withRetry(async () => {
      return prisma.articles.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          author_id: true,
          article_author_id: true,
          category_id: true,
          status: true,
          featured: true,
          breaking: true,
          featured_image: true,
          seo_title: true,
          seo_description: true,
          seo_keywords: true,
          created_at: true,
          updated_at: true,
          published_at: true,
          metadata: true,
          article_type: true,
          content_type: true, // Ensure this field is always fetched
          views: true,
          reading_time: true,
          summary: true,
          likes: true,
          saves: true,
          shares: true,
          allow_comments: true,
          social_image: true,
          audio_summary_url: true,
          categories: {
            select: { id: true, name: true, slug: true, color: true },
          },
          author: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      });
    });

    // حساب العدد بنفس شروط where بالضبط
    let totalCount = 0;
    try {
      // إنشاء نسخة من where للعد (بدون skip/take)
      const countWhere = { ...where };
      // إزالة أي خصائص غير متعلقة بالفلترة
      delete countWhere.AND;

      if (search && where.AND) {
        // إعادة بناء شروط البحث للعد
        countWhere.AND = where.AND;
      }

      totalCount = await prisma.articles.count({ where: countWhere });
    } catch (countError) {
      console.error("⚠️ خطأ في حساب العدد:", countError);
      totalCount = articles.length;
    }

    // جلب عدد التعليقات الموافق عليها بشكل مجمّع
    const ids = articles.map((a) => a.id).filter(Boolean) as string[];
    let commentsCountsMap = new Map<string, number>();
    if (ids.length > 0) {
      try {
        const grouped = await prisma.comments.groupBy({
          by: ["article_id"],
          where: { article_id: { in: ids }, status: "approved" },
          _count: { _all: true },
        });
        commentsCountsMap = new Map(
          grouped.map((g: any) => [g.article_id, g._count?._all || 0])
        );
      } catch (e) {
        console.error("⚠️ فشل في جلب عدد التعليقات المجمّع:", e);
      }
    }

    // إضافة معلومات إضافية وتوحيد حقول العدادات
    const enrichedArticles = articles.map((article) => ({
      ...article,
      image: article.featured_image,
      category: article.categories,
      author_name: article.author?.name || null,
      views: article.views || 0,
      views_count: article.views || 0,
      comments_count: commentsCountsMap.get(article.id) || 0,
    }));

    const response = {
      success: true,
      articles: enrichedArticles,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + limit < totalCount,
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
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("❌ خطأ في جلب المقالات:", error);

    // عدم كسر الواجهة الأمامية مؤقتاً: نعيد 200 مع success=false وقائمة فارغة
    return NextResponse.json({
      success: false,
      error: "حدث خطأ في جلب المقالات",
      details: error.message || "خطأ غير معروف",
      articles: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
      hasMore: false,
    });
  }
}

// إنشاء مقال جديد
export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/articles - بداية معالجة الطلب");
  console.log(
    "📡 Request headers:",
    Object.fromEntries(request.headers.entries())
  );
  console.log("📡 Request method:", request.method);
  console.log("📡 Request url:", request.url);

  let data: any = {}; // تعريف data خارج try block
    let authorId: string | null | undefined = null; // تعريف authorId خارج try block
    let categoryId: string | null | undefined = null; // تعريف categoryId خارج try block

  try {
    // معالجة آمنة لتحليل JSON
    try {
      data = await request.json();
      console.log(
        "Full request body for debugging:",
        JSON.stringify(data, null, 2)
      );
    } catch (jsonError: any) {
      console.error("❌ خطأ في تحليل JSON:", jsonError);
      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر إنشاء المقال: البيانات المرسلة غير صحيحة",
          code: "INVALID_JSON",
          details: "فشل في تحليل البيانات المرسلة - تأكد من صحة تنسيق JSON"
        },
        { status: 400 }
      );
    }

    // توحيد أسماء الحقول المختلفة
    authorId = data.author_id || data.authorId || data.article_author_id || null;
    categoryId = data.category_id || data.categoryId || null;
    
    // إذا لم يتم إرسال تصنيف، استخدم التصنيف الافتراضي (محليات)
    if (!categoryId) {
      categoryId = 'cat-001'; // محليات كافتراضي
      console.log("⚠️ لم يتم تحديد تصنيف، سيتم استخدام التصنيف الافتراضي: محليات");
    }

    console.log("🔄 توحيد الحقول:", {
      original_author: data.author_id,
      original_authorId: data.authorId,
      original_article_author_id: data.article_author_id,
      unified_author: authorId,
      original_category: data.category_id,
      original_categoryId: data.categoryId,
      unified_category: categoryId,
    });

    // التحقق من البيانات المطلوبة مع تحسين الرسائل
    const errors = [];

    if (!data.title?.trim()) {
      errors.push("العنوان مطلوب ولا يمكن أن يكون فارغاً");
    }

    // معالجة المحتوى - يمكن أن يكون string أو object من المحرر
    console.log("🔍 نوع المحتوى الأصلي:", typeof data.content, "القيمة:", data.content);
    
    let processedContent = data.content;
    
    if (typeof data.content === 'object' && data.content !== null) {
      console.log("📋 معالجة محتوى object:", Object.keys(data.content));
      if (data.content.html) {
        processedContent = data.content.html;
        console.log("✅ استخراج HTML من المحتوى");
      } else if (data.content.content) {
        processedContent = JSON.stringify(data.content);
        console.log("✅ تحويل المحتوى إلى JSON string");
      } else {
        processedContent = JSON.stringify(data.content);
        console.log("✅ تحويل الكائن كاملاً إلى JSON string");
      }
    }

    // تأكد من أن المحتوى المعالج string وليس null أو undefined
    if (typeof processedContent !== 'string') {
      processedContent = String(processedContent || '');
      console.log("⚠️ تحويل المحتوى إلى string:", typeof processedContent);
    }

    console.log("🎯 المحتوى النهائي المعالج:", {
      type: typeof processedContent,
      length: processedContent?.length || 0,
      preview: processedContent?.substring(0, 100) || 'فارغ'
    });

    // التحقق من المحتوى بعد المعالجة
    if (!processedContent || !processedContent.trim()) {
      errors.push("محتوى المقال مطلوب ولا يمكن أن يكون فارغاً");
    }

    // التحقق من طول المحتوى
    if (processedContent && processedContent.length < 10) {
      errors.push("محتوى المقال قصير جداً (أدنى حد 10 أحرف)");
    }

    if (!categoryId) {
      errors.push("يجب اختيار تصنيف للمقال");
    }

    if (!authorId) {
      errors.push("يجب تحديد كاتب المقال");
    }

    // التحقق من طول العنوان
    if (data.title && data.title.length > 200) {
      errors.push("عنوان المقال طويل جداً (أقصى حد 200 حرف)");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر إنشاء المقال: بيانات غير صحيحة",
          code: "VALIDATION_ERROR",
          details: errors.join(", "),
          validation_errors: errors,
        },
        { status: 400 }
      );
    }

    const contentType = resolveContentType(data.article_type);

    // توليد slug فريد قصير
    const uniqueSlug = await ensureUniqueSlug(prisma as any);

    // معالجة الحقل المميز بأسمائه المختلفة
    const isFeatured =
      data.featured || data.is_featured || data.isFeatured || false;
    const isBreaking =
      data.breaking || data.is_breaking || data.isBreaking || false;

    // سيتم تحديد حقول المؤلف لاحقاً بعد التحقق من مصدر المؤلف
    let articleData: any = {
      id: data.id || generateId(),
      title: data.title,
      slug: uniqueSlug,
      content: processedContent, // استخدام المحتوى المعالج
      excerpt: data.excerpt || data.summary || null,
      category_id: categoryId, // استخدام المتغير الموحد
      status: data.status || "draft",
      featured: isFeatured,
      breaking: isBreaking,
      featured_image: data.featured_image || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      seo_keywords: data.seo_keywords || (data.keywords && Array.isArray(data.keywords) ? data.keywords.join(", ") : null),
      created_at: new Date(),
      updated_at: new Date(),
      // سيتم تحديد published_at و scheduled_for أدناه حسب منطق الجدولة
      published_at: null as Date | null,
      scheduled_for: null as Date | null,
      metadata: data.metadata || {},
      // تعيين article_type والتوافق مع content_type
      article_type: data.article_type || "news",
      content_type: contentType,
      // إضافة معرف مؤلف مؤقت يتم تحديثه لاحقاً
      article_author_id: null,
      author_id: null,
    };

    // دالة مساعدة: تحويل وقت محلي (Asia/Riyadh) إلى UTC
    function toUTCFromRiyadh(input: string | Date): Date | null {
      try {
        if (!input) return null;
        if (input instanceof Date) return input;
        // إذا كانت السلسلة تحتوي على منطقة/إزاحة زمنية صريحة نتركها كما هي
        if (/([zZ]|[+-]\d{2}:?\d{2})$/.test(input)) {
          const d = new Date(input);
          return isNaN(d.getTime()) ? null : d;
        }
        // نتعامل معها كوقت محلي للرياض UTC+3 → نحول إلى UTC بطرح 3 ساعات
        const dLocal = new Date(input);
        if (isNaN(dLocal.getTime())) return null;
        // تاريخ بدون منطقة زمنية في بيئة الخادم (غالباً UTC) سيُفسَّر كـ UTC، لذا نطرح 3 ساعات لنحصل على UTC الصحيح
        const utcMs = dLocal.getTime() - 3 * 60 * 60 * 1000;
        return new Date(utcMs);
      } catch {
        return null;
      }
    }

    // منطق الجدولة: منع النشر الفوري إذا تم تحديد وقت مستقبلي
    try {
      const rawSchedule = data.scheduled_for || data.publish_at || data.publishAt;
      if (rawSchedule) {
        const scheduledDate = toUTCFromRiyadh(rawSchedule);
        if (scheduledDate && typeof scheduledDate.getTime === 'function' && !isNaN(scheduledDate.getTime())) {
          const now = new Date();
          if (scheduledDate.getTime() > now.getTime()) {
            // مجدول في المستقبل → الحالة scheduled ولا يوجد published_at
            articleData.status = "scheduled";
            articleData.scheduled_for = scheduledDate;
            articleData.published_at = null;
          } else {
            // الوقت في الماضي/الآن → نشر فوري
            articleData.status = "published";
            articleData.published_at = now;
            articleData.scheduled_for = null;
          }
        }
      } else if ((data.publishMode === "publish_now") || data.status === "published") {
        // نشر فوري صريح
        articleData.status = "published";
        articleData.published_at = new Date();
        articleData.scheduled_for = null;
      } else if (!data.status || data.status === "draft") {
        // مسودة
        articleData.status = "draft";
        articleData.published_at = null;
        articleData.scheduled_for = null;
      }
    } catch (e) {
      console.warn("⚠️ فشل منطق الجدولة، سيتم افتراض مسودة/نشر افتراضي:", (e as any)?.message);
      if (data.status === "published") {
        articleData.published_at = new Date();
      } else {
        articleData.published_at = null;
      }
      articleData.scheduled_for = null;
    }

    console.log("📝 بيانات المقال المنقاة:", articleData);

    // التحقق من وجود التصنيف والمؤلف في قاعدة البيانات قبل الإنشاء
    console.log("🔍 التحقق من صحة المؤلف والتصنيف...");
    console.log("🔍 authorId من البيانات:", authorId);
    console.log("🔍 categoryId من البيانات:", categoryId);

    // البحث عن المؤلف في جداول متعددة مع تحديد النظام المناسب
    let author = null;
    let authorSource = null; // 'article_authors' أو 'users'

    // محاولة البحث في article_authors أولاً (النظام الجديد)
    try {
      author = await prisma.article_authors.findUnique({
        where: { id: authorId || undefined },
        select: { id: true, full_name: true, email: true, is_active: true },
      });

      if (author) {
        authorSource = "article_authors";
        console.log(
          "✅ تم العثور على المؤلف في article_authors (النظام الجديد):",
          author.full_name
        );

        // التحقق من أن المؤلف نشط
        if (!author.is_active) {
          console.error("❌ المؤلف غير نشط:", authorId);
          return NextResponse.json(
            {
              ok: false,
              message: "تعذّر إنشاء المقال: المؤلف المحدد غير نشط في النظام",
              code: "INACTIVE_AUTHOR",
              details: `معرف المؤلف: ${authorId}`,
            },
            { status: 400 }
          );
        }
      }
    } catch (error) {
      console.log("⚠️ خطأ في البحث في article_authors:", (error as any).message);
    }

    // إذا لم يوجد في article_authors، ابحث في users (النظام القديم)
    if (!author) {
      try {
        const userAuthor = await prisma.users.findUnique({
          where: { id: authorId || undefined },
          select: { id: true, name: true, email: true, role: true },
        });

        if (userAuthor) {
          authorSource = "users";
          console.log(
            "✅ تم العثور على المؤلف في users (النظام القديم):",
            userAuthor.name
          );
          // تحويل بنية users لتتوافق مع article_authors
          author = {
            id: userAuthor.id,
            full_name: userAuthor.name,
            email: userAuthor.email,
            is_active: true,
          };
        }
      } catch (error) {
        console.log("⚠️ خطأ في البحث في users:", (error as any).message);
      }
    }

    // فحص التصنيف
    const category = await prisma.categories.findUnique({
      where: { id: categoryId || undefined },
    });

    if (!author) {
      console.error("❌ المؤلف غير موجود في أي جدول:", authorId);
      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر إنشاء المقال: المؤلف المحدد غير موجود في النظام",
          code: "AUTHOR_NOT_FOUND",
          details: `معرف المؤلف: ${authorId}. تأكد من اختيار مؤلف من القائمة المتاحة.`,
        },
        { status: 400 }
      );
    }

    if (!category) {
      console.error("❌ التصنيف غير موجود:", categoryId);
      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر إنشاء المقال: التصنيف المحدد غير موجود في النظام",
          code: "CATEGORY_NOT_FOUND",
          details: `معرف التصنيف: ${categoryId}`,
        },
        { status: 400 }
      );
    }

    console.log("✅ المؤلف والتصنيف صحيحان:", {
      author: author.full_name || author.email,
      authorSource: authorSource,
      category: category.name,
    });

    // تحديد حقول المؤلف بناءً على مصدره
    if (authorSource === "article_authors") {
      // استخدام النظام الجديد - article_authors
      articleData.article_author_id = author.id;
      
      // البحث عن user مرتبط بنفس البريد الإلكتروني أو إنشاء مؤلف افتراضي
      let systemUser = null;
      try {
        if (author.email) {
          systemUser = await prisma.users.findFirst({
            where: { email: author.email },
            select: { id: true }
          });
        }
      } catch (e) {
        console.log("⚠️ فشل البحث عن user مرتبط");
      }
      
      if (systemUser) {
        articleData.author_id = systemUser.id;
        console.log("📝 تم ربط المؤلف بـ user موجود:", systemUser.id);
      } else {
        // استخدام user افتراضي أو إنشاء واحد
        // البحث عن أول user متاح كـ fallback
        const defaultUser = await prisma.users.findFirst({
          select: { id: true },
          orderBy: { created_at: 'asc' }
        });
        
        if (defaultUser) {
          articleData.author_id = defaultUser.id;
          console.log("📝 استخدام user افتراضي:", defaultUser.id);
        } else {
          // آخر محاولة: إنشاء user جديد بنفس معرف المؤلف
          console.log("⚡ إنشاء user طارئ بنفس معرف المؤلف...");
          try {
            const emergencyUser = await prisma.users.create({
              data: {
                id: author.id, // نفس معرف المؤلف
                email: author.email || `${author.id}@sabq.org`,
                name: author.full_name || 'مؤلف',
                role: 'writer',
                email_verified_at: new Date(),
                created_at: new Date(),
                updated_at: new Date()
              }
            });
            articleData.author_id = emergencyUser.id;
            console.log("✅ تم إنشاء user طارئ:", emergencyUser.id);
          } catch (userCreateError) {
            console.error("❌ فشل إنشاء user طارئ:", userCreateError);
            // كحل أخير: استخدام نفس الـ ID
            articleData.author_id = author.id;
            console.log("⚠️ استخدام نفس الـ ID كحل أخير");
          }
        }
      }
      
      console.log("📝 استخدام النظام الجديد: article_author_id =", author.id);
    } else if (authorSource === "users") {
      // استخدام النظام القديم - users
      articleData.author_id = author.id;
      articleData.article_author_id = null; // حقل اختياري
      console.log("📝 استخدام النظام القديم: author_id =", author.id);
    }

    console.log("📝 بيانات المقال النهائية مع المؤلف:", {
      id: articleData.id,
      title: articleData.title,
      author_id: articleData.author_id,
      article_author_id: articleData.article_author_id,
      category_id: articleData.category_id,
      article_type: articleData.article_type, // 🔧 تسجيل article_type
      status: articleData.status,
    });

    // إنشاء المقال بشكل مبسط وسريع
    console.log("⚡ إنشاء المقال...");
    
    console.log("🔍 البيانات المُرسلة إلى Prisma:");
    console.log("   - id:", articleData.id);
    console.log("   - author_id:", articleData.author_id);
    console.log("   - article_author_id:", articleData.article_author_id);
    console.log("   - category_id:", articleData.category_id);
    console.log("   - content_type:", articleData.content_type);
    
    const article = await prisma.articles.create({
      data: articleData,
    });

    console.log("✅ تم إنشاء المقال بنجاح:", article.id);

    // 🔔 إرسال إشعارات للمستخدمين المهتمين بالتصنيف (فقط للمقالات المنشورة)
    if (article.status === 'published' && article.category_id) {
      try {
        console.log('🔔 إرسال إشعارات للمستخدمين المهتمين بالتصنيف...');
        
        // استيراد SmartNotificationEngine
        const { SmartNotificationEngine } = await import('@/lib/notifications/smart-engine');
        
        // إرسال إشعارات غير مزامنة
        setImmediate(() => {
          SmartNotificationEngine.notifyNewArticleInCategory(article.id, article.category_id!)
            .then(() => {
              console.log('✅ تم إرسال إشعارات المقال الجديد بنجاح');
            })
            .catch((error) => {
              console.error('❌ خطأ في إرسال إشعارات المقال الجديد:', error);
            });
        });
        
      } catch (error) {
        console.error('❌ خطأ في تحميل محرك الإشعارات:', error);
      }
    } else if (article.status !== 'published') {
      console.log('ℹ️ المقال غير منشور، تخطي الإشعارات');
    } else if (!article.category_id) {
      console.log('⚠️ المقال بدون تصنيف، تخطي الإشعارات');
    }

    // ربط المقال بنظام القصص الذكي في الخلفية (لا نعطل النشر)
    if (typeof process !== 'undefined') {
      setImmediate(() => {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        fetch(`${siteUrl}/api/stories/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: article.title,
            content: article.content || "",
            category: category?.name,
            source: "article-created",
            meta: {
              articleId: article.id,
              articleSlug: article.slug,
              categoryId: article.category_id,
              authorId: article.author_id,
              createdAt: article.created_at,
            },
          }),
        }).catch((error) => {
          console.warn("⚠️ فشل تحليل القصة في الخلفية:", error.message);
        });
      });
    }

    // تعامل مبسط مع المقالات المميزة - تجنب FeaturedArticleManager مؤقتاً
    if (articleData.featured === true) {
      console.log("ℹ️ المقال مميز - تم تعيينه كمميز مباشرة");
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          (article.status === "published")
            ? "تم نشر المقال بنجاح"
            : (article.status === "scheduled")
            ? "تم جدولة المقال للنشر"
            : "تم حفظ المسودة بنجاح",
        data: {
          id: article.id,
          slug: article.slug,
          title: article.title,
          status: article.status
        }
      },
      { status: 201, headers: { "Cache-Control": "no-store", "X-Article-Status": article.status } }
    );
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء المقال:", error);
    console.error("Stack trace:", error.stack);

    // معالجة أخطاء Prisma الشائعة
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر إنشاء المقال: المقال موجود مسبقاً",
          code: "DUPLICATE_ARTICLE",
          details: "يوجد مقال بنفس العنوان أو المعرف"
        },
        { status: 409 }
      );
    }

    if (error.code === "P2003") {
      const field = error.meta?.field_name || "unknown";
      let message = "تعذّر إنشاء المقال: خطأ في البيانات المرجعية";
      let details = "التصنيف أو المؤلف غير موجود";
      let errorCode = "REFERENCE_NOT_FOUND";

      console.error("🔍 تفاصيل خطأ P2003:", {
        field,
        constraint: error.meta?.constraint,
        meta: error.meta,
        receivedData: {
          authorId,
          categoryId,
          article_author_id: articleData?.article_author_id,
          author_id: articleData?.author_id,
        },
      });

      if (field.includes("author")) {
        message = "تعذّر إنشاء المقال: المستخدم المحدد غير موجود";
        details = `معرف المستخدم: ${authorId} غير موجود`;
        errorCode = "AUTHOR_NOT_FOUND";
      } else if (field.includes("category")) {
        message = "تعذّر إنشاء المقال: التصنيف المحدد غير موجود";
        details = `معرف التصنيف: ${categoryId} غير موجود`;
        errorCode = "CATEGORY_NOT_FOUND";
      }

      return NextResponse.json(
        {
          ok: false,
          message: message,
          code: errorCode,
          details: details
        },
        { status: 400 }
      );
    }

    // معالجة محسنة للأخطاء المختلفة
    let errorMessage = "تعذّر إنشاء المقال: فشل في العملية";
    let errorDetails = error.message || "خطأ غير معروف";
    let statusCode = 500;
    let errorCode = error.code || "UNKNOWN_ERROR";

    // معالجة خاصة لأنواع الأخطاء المختلفة
    if (error.name === "SyntaxError") {
      errorMessage = "تعذّر إنشاء المقال: خطأ في تنسيق البيانات";
      errorDetails = "البيانات المرسلة غير صحيحة أو تحتوي على أحرف غير مدعومة";
      statusCode = 400;
      errorCode = "SYNTAX_ERROR";
    } else if (error.name === "ValidationError") {
      errorMessage = "تعذّر إنشاء المقال: خطأ في التحقق من البيانات";
      statusCode = 400;
      errorCode = "VALIDATION_ERROR";
    } else if (error.code === "P2002") {
      errorMessage = "تعذّر إنشاء المقال: المقال موجود مسبقاً";
      errorDetails = "يوجد مقال آخر بنفس العنوان أو المعرف";
      statusCode = 409;
      errorCode = "DUPLICATE_ARTICLE";
    } else if (error.code === "P2025") {
      errorMessage = "تعذّر إنشاء المقال: البيانات المرجعية غير موجودة";
      errorDetails = "المؤلف أو التصنيف المحدد غير موجود";
      statusCode = 400;
      errorCode = "REFERENCE_NOT_FOUND";
    }

    console.error("❌ خطأ مصنف في إنشاء المقال:", {
      error: errorMessage,
      details: errorDetails,
      code: errorCode,
      originalError: error.message,
      stack: error.stack?.split("\n")[0], // أول سطر من الـ stack trace فقط
    });

    return NextResponse.json(
      {
        ok: false,
        message: errorMessage,
        code: errorCode,
        details: errorDetails
      },
      { status: statusCode }
    );
  } finally {
    // لا نقوم بإغلاق اتصال Prisma في بيئة سيرفرلس/Nodejs المشتركة
  }
}

// دالة مساعدة لتوليد ID
function generateId() {
  return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}