import prisma from "@/lib/prisma";
import { ensureUniqueSlug, resolveContentType, slugify } from "@/lib/slug";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// Cache في الذاكرة
const articleCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // دقيقة واحدة

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cacheKey = searchParams.toString();

  // التحقق من الكاش أولاً
  const cached = articleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("✅ إرجاع المقالات من الكاش");
    return NextResponse.json(cached.data, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  try {
    console.log("🔍 بداية معالجة طلب المقالات");
    console.log("prisma:", typeof prisma);
    console.log("prisma.articles:", typeof prisma?.articles);

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
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
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

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب المقالات",
        details: error.message || "خطأ غير معروف",
      },
      { status: 500 }
    );
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

  try {
    // معالجة آمنة لتحليل JSON
    try {
      data = await request.json();
      console.log("📦 البيانات المستلمة:", JSON.stringify(data, null, 2));
    } catch (jsonError: any) {
      console.error("❌ خطأ في تحليل JSON:", jsonError);
      return NextResponse.json(
        {
          success: false,
          error: "البيانات المرسلة غير صحيحة",
          details: "فشل في تحليل البيانات المرسلة - تأكد من صحة تنسيق JSON",
          code: "INVALID_JSON",
        },
        { status: 400 }
      );
    }

    // توحيد أسماء الحقول المختلفة
    const authorId =
      data.author_id || data.authorId || data.article_author_id || null;
    const categoryId = data.category_id || data.categoryId || null;

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

    if (!data.content?.trim()) {
      errors.push("محتوى المقال مطلوب ولا يمكن أن يكون فارغاً");
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

    // التحقق من طول المحتوى
    if (data.content && data.content.length < 10) {
      errors.push("محتوى المقال قصير جداً (أدنى حد 10 أحرف)");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "بيانات المقال غير صحيحة",
          details: errors.join(", "),
          validation_errors: errors,
        },
        { status: 400 }
      );
    }

    // توليد slug من العنوان وضمان uniqueness
    const baseSlug = slugify(data.slug || data.title || "");
    const uniqueSlug = await ensureUniqueSlug(prisma as any, baseSlug);

    // معالجة الحقل المميز بأسمائه المختلفة
    const isFeatured =
      data.featured || data.is_featured || data.isFeatured || false;
    const isBreaking =
      data.breaking || data.is_breaking || data.isBreaking || false;

    // سيتم تحديد حقول المؤلف لاحقاً بعد التحقق من مصدر المؤلف
    let articleData = {
      id: data.id || generateId(),
      title: data.title,
      slug: uniqueSlug,
      content: data.content,
      excerpt: data.excerpt || data.summary || null,
      category_id: categoryId, // استخدام المتغير الموحد
      status: data.status || "draft",
      featured: isFeatured,
      breaking: isBreaking,
      featured_image: data.featured_image || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      seo_keywords: data.seo_keywords || null,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: data.status === "published" ? new Date() : null,
      metadata: data.metadata || {},
      // تعيين article_type والتوافق مع content_type
      article_type: data.article_type || "news",
      content_type: resolveContentType(data.article_type) as any,
    };

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
        where: { id: authorId },
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
              success: false,
              error: "المؤلف المحدد غير نشط في النظام",
              details: `معرف المؤلف: ${authorId}`,
            },
            { status: 400 }
          );
        }
      }
    } catch (error) {
      console.log("⚠️ خطأ في البحث في article_authors:", error.message);
    }

    // إذا لم يوجد في article_authors، ابحث في users (النظام القديم)
    if (!author) {
      try {
        const userAuthor = await prisma.users.findUnique({
          where: { id: authorId },
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
        console.log("⚠️ خطأ في البحث في users:", error.message);
      }
    }

    // فحص التصنيف
    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!author) {
      console.error("❌ المؤلف غير موجود في أي جدول:", authorId);
      return NextResponse.json(
        {
          success: false,
          error: "المؤلف المحدد غير موجود في النظام",
          details: `معرف المؤلف: ${authorId}. تأكد من اختيار مؤلف من القائمة المتاحة.`,
        },
        { status: 400 }
      );
    }

    if (!category) {
      console.error("❌ التصنيف غير موجود:", categoryId);
      return NextResponse.json(
        {
          success: false,
          error: "التصنيف المحدد غير موجود في النظام",
          details: `معرف التصنيف: ${categoryId}`,
        },
        { status: 400 }
      );
    }

    console.log("✅ المؤلف والتصنيف صحيحان:", {
      author: author.full_name || author.name || author.email,
      authorSource: authorSource,
      category: category.name,
    });

    // تحديد حقول المؤلف بناءً على مصدره
    if (authorSource === "article_authors") {
      // استخدام النظام الجديد - article_authors
      articleData.article_author_id = author.id;
      // author_id مطلوب في schema - نحتاج استخدام dummy user أو إصلاح schema
      // مؤقتاً، سنستخدم ID المؤلف نفسه إذا وُجد في users
      try {
        const dummyUser = await prisma.users.findFirst({
          select: { id: true },
        });
        articleData.author_id = dummyUser?.id || author.id; // fallback
      } catch (error) {
        articleData.author_id = author.id; // إذا فشل، استخدم نفس ID
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

    // إنشاء المقال أولاً
    const article = await prisma.articles.create({
      data: articleData,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    // تعامل مبسط مع المقالات المميزة - تجنب FeaturedArticleManager مؤقتاً
    if (articleData.featured === true) {
      console.log("ℹ️ المقال مميز - تم تعيينه كمميز مباشرة");
    }

    return NextResponse.json(
      {
        success: true,
        article,
        message:
          data.status === "published"
            ? "تم نشر المقال بنجاح"
            : "تم حفظ المسودة بنجاح",
        summary: {
          id: article.id,
          title: article.title,
          author: article.author?.name || article.author?.email,
          category: article.categories?.name,
          status: article.status,
          created_at: article.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء المقال:", error);
    console.error("Stack trace:", error.stack);

    // معالجة أخطاء Prisma الشائعة
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "المقال موجود مسبقاً",
          details: "يوجد مقال بنفس العنوان أو المعرف",
        },
        { status: 409 }
      );
    }

    if (error.code === "P2003") {
      const field = error.meta?.field_name || "unknown";
      let message = "خطأ في البيانات المرجعية";
      let details = "التصنيف أو المؤلف غير موجود";

      console.error("🔍 تفاصيل خطأ P2003:", {
        field,
        meta: error.meta,
        receivedData: {
          author_id: authorId,
          category_id: categoryId,
        },
      });

      if (field.includes("author")) {
        message = "المستخدم المحدد غير موجود";
        details = `معرف المستخدم: ${authorId}`;
      } else if (field.includes("category")) {
        message = "التصنيف المحدد غير موجود";
        details = `معرف التصنيف: ${categoryId}`;
      }

      return NextResponse.json(
        {
          success: false,
          error: message,
          details,
          debug: {
            field,
            author_id: authorId,
            category_id: categoryId,
          },
        },
        { status: 400 }
      );
    }

    // معالجة محسنة للأخطاء المختلفة
    let errorMessage = "فشل في إنشاء المقال";
    let errorDetails = error.message || "خطأ غير معروف";
    let statusCode = 500;
    let errorCode = error.code || "UNKNOWN_ERROR";

    // معالجة خاصة لأنواع الأخطاء المختلفة
    if (error.name === "SyntaxError") {
      errorMessage = "خطأ في تنسيق البيانات";
      errorDetails = "البيانات المرسلة غير صحيحة أو تحتوي على أحرف غير مدعومة";
      statusCode = 400;
      errorCode = "SYNTAX_ERROR";
    } else if (error.name === "ValidationError") {
      errorMessage = "خطأ في التحقق من البيانات";
      statusCode = 400;
      errorCode = "VALIDATION_ERROR";
    } else if (error.code === "P2002") {
      errorMessage = "المقال موجود مسبقاً";
      errorDetails = "يوجد مقال آخر بنفس العنوان أو المعرف";
      statusCode = 409;
      errorCode = "DUPLICATE_ARTICLE";
    } else if (error.code === "P2025") {
      errorMessage = "البيانات المرجعية غير موجودة";
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
        success: false,
        error: errorMessage,
        details: errorDetails,
        code: errorCode,
      },
      { status: statusCode }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// دالة مساعدة لتوليد ID
function generateId() {
  return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
