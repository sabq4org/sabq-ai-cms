import dbConnectionManager from "@/lib/db-connection-manager";
import prisma from "@/lib/prisma";
import { getCachedCategories } from "@/lib/services/categoriesCache";
import { FeaturedArticleManager } from "@/lib/services/featured-article-manager";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log("🚀 بدء GET request - المرحلة 1");
    const { id } = await context.params;
    console.log(`📰 جلب المقال: ${id} - المرحلة 2`);

    if (!id) {
      console.log("❌ معرف المقال مفقود - المرحلة 2.1");
      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر الحصول على المقال: معرّف المقال مطلوب",
          code: "MISSING_ID",
          details: "يجب توفير معرّف المقال في رابط API"
        },
        { status: 400 }
      );
    }

    console.log(`✅ معرف المقال موجود: ${id} - المرحلة 3`);

    // استخدام مدير الاتصال لضمان الاتصال
    // السماح بجلب أي حالة عند استخدام ?all=true
    const url = new URL(request.url);
    const includeAll = url.searchParams.get("all") === "true";

    // محاولة الاتصال بقاعدة البيانات بطريقة بسيطة
    let article;
    try {
      console.log("🔗 محاولة الاتصال بقاعدة البيانات - المرحلة 4");

      // استعلام مباشر بدون تعقيد
      console.log("🔍 تنفيذ استعلام قاعدة البيانات - المرحلة 6");
      article = await prisma.articles.findFirst({
        where: {
          OR: [{ id: id }, { slug: id }],
          ...(includeAll ? {} : { status: "published" }),
        },
        include: {
          categories: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          article_author: {
            select: {
              id: true,
              full_name: true,
              slug: true,
              title: true,
              avatar_url: true,
              specializations: true,
            },
          },
        },
      });
      console.log(
        "✅ استعلام قاعدة البيانات اكتمل - المرحلة 7",
        article ? "مقال موجود" : "مقال غير موجود"
      );
    } catch (dbError: any) {
      console.error("❌ خطأ في الاتصال بقاعدة البيانات - المرحلة 8:", dbError);
      throw dbError;
    }

    if (!article) {
      console.log(`⚠️ المقال غير موجود: ${id}`);
      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر الحصول على المقال: المقال غير موجود",
          code: "ARTICLE_NOT_FOUND",
          details: "تأكد من صحة رابط المقال أو قد يكون المقال قد تم حذفه",
        },
        { status: 404 }
      );
    }

    // التحقق من حالة النشر إذا لم يكن includeAll
    if (!includeAll && article.status !== "published") {
      console.log(`⚠️ المقال غير منشور: ${id} - الحالة: ${article.status}`);

      let errorMessage = "المقال غير متاح للعرض";
      let errorDetails = "";

      switch (article.status) {
        case "draft":
          errorMessage = "المقال في وضع المسودة";
          errorDetails = "هذا المقال لم يكتمل بعد ولا يزال قيد الإعداد";
          break;
        case "pending_review":
          errorMessage = "المقال قيد المراجعة";
          errorDetails = "هذا المقال يخضع للمراجعة من قبل فريق التحرير";
          break;
        case "archived":
          errorMessage = "المقال مؤرشف";
          errorDetails = "تم نقل هذا المقال إلى الأرشيف";
          break;
        case "rejected":
          errorMessage = "المقال مرفوض";
          errorDetails = "تم رفض نشر هذا المقال";
          break;
      }

      return NextResponse.json(
        {
          ok: false,
          message: `تعذّر الحصول على المقال: ${errorMessage}`,
          code: "ARTICLE_NOT_PUBLISHED",
          details: errorDetails,
          status: article.status,
        },
        { status: 403 }
      );
    }

    // تحديث عدد المشاهدات بشكل غير متزامن
    dbConnectionManager
      .executeWithConnection(async () => {
        await prisma.articles.update({
          where: { id: article.id },
          data: { views: { increment: 1 } },
        });
      })
      .catch((error) => {
        console.error("⚠️ فشل تحديث المشاهدات:", error);
      });

    // إضافة معلومات التصنيف من الـ cache إذا لزم الأمر
    let categoryInfo = article.categories;
    if (!categoryInfo && article.category_id) {
      try {
        const categoriesResult = await getCachedCategories();
        categoryInfo = categoriesResult.categories.find(
          (c) => c.id === article.category_id
        );
      } catch (error) {
        console.error("⚠️ فشل جلب التصنيف من cache:", error);
      }
    }

    // تنسيق بيانات الكاتب مع إعطاء أولوية لكاتب المقال الحقيقي
    const authorName =
      article.article_author?.full_name || article.author?.name || null;
    const authorAvatar =
      article.article_author?.avatar_url || article.author?.avatar || null;

    // معالجة الكلمات المفتاحية (tags) وseo_keywords
    let tags = [];
    let keywords = [];
    
    try {
      // أولاً نحاول استخراج الكلمات المفتاحية من seo_keywords (أولوية أعلى)
      if (article.seo_keywords) {
        console.log("🔑 استخراج الكلمات المفتاحية من seo_keywords:", article.seo_keywords);
        
        if (Array.isArray(article.seo_keywords)) {
          keywords = article.seo_keywords;
        } else if (typeof article.seo_keywords === 'string') {
          try {
            // محاولة تحليل JSON
            const parsedKeywords = JSON.parse(article.seo_keywords);
            keywords = Array.isArray(parsedKeywords) ? parsedKeywords : [article.seo_keywords];
          } catch (e) {
            // إذا لم تكن JSON صالح، نفترض أنها قائمة مفصولة بفواصل
            keywords = article.seo_keywords.split(',').map(k => k.trim()).filter(Boolean);
          }
        } else {
          keywords = article.seo_keywords ? [String(article.seo_keywords)] : [];
        }
        
        console.log("✅ الكلمات المفتاحية من seo_keywords بعد المعالجة:", keywords);
      }
      
      // ثم نحاول استخراج الكلمات المفتاحية من metadata.keywords أو metadata.seo_keywords
      if ((!keywords || keywords.length === 0) && article.metadata) {
        const metadata = typeof article.metadata === 'string' ? JSON.parse(article.metadata) : article.metadata;
        
        if (metadata.keywords || metadata.seo_keywords) {
          const metaKeywords = metadata.seo_keywords || metadata.keywords;
          console.log("🔑 استخراج الكلمات المفتاحية من metadata:", metaKeywords);
          
          if (Array.isArray(metaKeywords)) {
            keywords = metaKeywords;
          } else if (typeof metaKeywords === 'string') {
            try {
              const parsedKeywords = JSON.parse(metaKeywords);
              keywords = Array.isArray(parsedKeywords) ? parsedKeywords : [metaKeywords];
            } catch (e) {
              keywords = metaKeywords.split(',').map(k => k.trim()).filter(Boolean);
            }
          } else if (metaKeywords) {
            keywords = [String(metaKeywords)];
          }
          
          console.log("✅ الكلمات المفتاحية من metadata بعد المعالجة:", keywords);
        }
      }
      
      // أخيراً نحاول استخراج العلامات (tags) التقليدية
      if ((!keywords || keywords.length === 0) && article.tags) {
        console.log("🏷️ استخراج العلامات من tags:", article.tags);
        
        if (Array.isArray(article.tags)) {
          tags = article.tags;
        } else if (typeof article.tags === 'string') {
          try {
            const parsedTags = JSON.parse(article.tags);
            tags = Array.isArray(parsedTags) ? parsedTags : [article.tags];
          } catch (e) {
            tags = article.tags.split(',').map(tag => tag.trim()).filter(Boolean);
          }
        } else {
          tags = article.tags ? [String(article.tags)] : [];
        }
        
        // إذا وجدنا العلامات ولم نجد كلمات مفتاحية، نستخدم العلامات كبديل
        if (tags.length > 0 && (!keywords || keywords.length === 0)) {
          keywords = tags;
        }
        
        console.log("✅ العلامات المستخرجة:", tags);
      }
      
      // تسجيل للمساعدة في التشخيص
      console.log("🔍 معلومات الكلمات المفتاحية والعلامات:", {
        seo_keywords: {
          original: article.seo_keywords,
          processed: keywords,
          type: typeof article.seo_keywords
        },
        tags: {
          original: article.tags,
          processed: tags,
          type: typeof article.tags
        },
        metadata: {
          hasKeywords: article.metadata && (typeof article.metadata === 'string' ? 
            JSON.parse(article.metadata).keywords !== undefined : 
            article.metadata.keywords !== undefined),
          hasSeoKeywords: article.metadata && (typeof article.metadata === 'string' ? 
            JSON.parse(article.metadata).seo_keywords !== undefined : 
            article.metadata.seo_keywords !== undefined)
        }
      });
    } catch (error) {
      console.error("❌ خطأ في معالجة الكلمات المفتاحية:", error);
      keywords = [];
      tags = [];
    }

    const formattedArticle = {
      ok: true,
      message: "تم الحصول على المقال بنجاح",
      data: {
        ...article,
        // ✅ إضافة image للتوافق مع المكونات
        image: article.featured_image,
        image_url: article.featured_image,
        category: categoryInfo,
        // ضمان إرجاع الكلمات المفتاحية كمصفوفة في جميع الحقول المتوقعة
        tags: tags,
        keywords: keywords,
        seo_keywords: keywords,
        // ضمان وجود الكلمات المفتاحية في metadata أيضًا
        metadata: (() => {
          try {
            const parsedMetadata = typeof article.metadata === 'string' 
              ? JSON.parse(article.metadata) 
              : article.metadata || {};
            return {
              ...parsedMetadata,
              keywords: keywords,
              seo_keywords: keywords
            };
          } catch (e) {
            console.warn("⚠️ خطأ في تحليل metadata:", e);
            return {
              keywords: keywords,
              seo_keywords: keywords
            };
          }
        })(),
        // إعطاء أولوية لكاتب المقال الحقيقي من article_authors
        author_name: authorName,
        author_title: article.article_author?.title || null,
        author_specialty: article.article_author?.specializations?.[0] || null,
        author_avatar: authorAvatar,
        author_slug: article.article_author?.slug || null,
        // دعم النظام القديم أيضاً مع إضافة معلومات المراسل
        author: {
          ...article.author,
          name: authorName,
          avatar: authorAvatar,
          // إضافة بيانات المراسل من article_author
          reporter: article.article_author
            ? {
                id: article.article_author.id,
                full_name: article.article_author.full_name,
                slug: article.article_author.slug,
                is_verified: true, // افتراضي للمراسلين المسجلين
                verification_badge: "verified",
              }
            : null,
        }
      }
    };

    // 🔍 تتبع الصورة للتشخيص
    console.log("🖼️ [ARTICLE API] تتبع الصورة:", {
      articleId: article.id,
      title: article.title?.substring(0, 50) + "...",
      featured_image: article.featured_image,
      imageExists: !!article.featured_image,
      imageType: article.featured_image?.includes("cloudinary")
        ? "cloudinary"
        : article.featured_image?.includes("placeholder")
        ? "placeholder"
        : "other",
    });

    // تسجيل البيانات المرجعة للكلمات المفتاحية
    console.log("📤 البيانات المرجعة للكلمات المفتاحية:", {
      keywords: formattedArticle.data.keywords,
      seo_keywords: formattedArticle.data.seo_keywords,
      metadata_keywords: formattedArticle.data.metadata?.keywords,
      keywordsCount: formattedArticle.data.keywords?.length || 0
    });

    // إرجاع البيانات مع معلومات الكاتب المحسنة
    return NextResponse.json(formattedArticle);
  } catch (error: any) {
    console.error("❌ خطأ في جلب المقال:", error);

    // معالجة أخطاء الاتصال بشكل خاص
    if (error.message?.includes("connection") || error.code === "P2024") {
      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر الحصول على المقال: مشكلة في الاتصال بقاعدة البيانات",
          code: "DB_CONNECTION_ERROR",
          details: "يرجى المحاولة مرة أخرى بعد قليل"
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "تعذّر الحصول على المقال: خطأ في النظام",
        code: "SYSTEM_ERROR",
        details: error.message || "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}

// تحديث المقال
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // فحص Debug Mode
    const debugMode = request.headers.get("X-Debug-Mode") === "true";

    let data;
    try {
      data = await request.json();
    } catch (jsonError) {
      console.error("❌ خطأ في قراءة JSON:", jsonError);
      return NextResponse.json(
        {
          success: false,
          error: "البيانات المرسلة غير صالحة",
          details: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    if (debugMode) {
      console.group(`🔍 DEBUG: تحديث المقال ${id}`);
      console.log("⏰ الوقت:", new Date().toISOString());
      console.log("📥 البيانات الخام:", JSON.stringify(data, null, 2));
    }

    console.log("📥 البيانات المستلمة للتحديث:", data);
    console.log("📦 metadata المستلمة:", data.metadata);

    // التحقق من وجود المقال قبل محاولة التحديث
    const existingArticle = await dbConnectionManager.executeWithConnection(
      async () => {
        return await prisma.articles.findUnique({
          where: { id },
          select: { id: true, title: true, featured: true, slug: true },
        });
      }
    );

    if (!existingArticle) {
      console.error("❌ المقال غير موجود:", id);
      return NextResponse.json(
        {
          success: false,
          error: "المقال غير موجود",
          details: "Article not found",
        },
        { status: 404 }
      );
    }

    console.log("✅ تم العثور على المقال:", {
      id: existingArticle.id,
      title: existingArticle.title,
      featured: existingArticle.featured,
    });

    // التحقق من صحة البيانات المستلمة
    if (data.featured_image && typeof data.featured_image !== "string") {
      console.error("❌ نوع صورة المقال غير صحيح:", typeof data.featured_image);
      return NextResponse.json(
        {
          success: false,
          error: "نوع صورة المقال غير صحيح",
          details: "featured_image must be a string",
        },
        { status: 400 }
      );
    }

    // معالجة البيانات قبل الحفظ
    const updateData: any = {
      updated_at: new Date(),
    };

    // معالجة خاصة للكلمات المفتاحية (seo_keywords)
    if (data.seo_keywords !== undefined) {
      // تحويل الكلمات المفتاحية إلى تنسيق مناسب
      try {
        console.log("🔑 معالجة الكلمات المفتاحية:", data.seo_keywords);
        
        // تنظيف وتهيئة البيانات
        let keywords = data.seo_keywords;
        
        if (Array.isArray(keywords)) {
          // إذا كانت مصفوفة، نحولها إلى JSON string أو نص مفصول بفواصل
          if (keywords.length === 0) {
            updateData.seo_keywords = null; // إذا كانت فارغة، نضع null
          } else {
            updateData.seo_keywords = JSON.stringify(keywords); // نحفظها كـ JSON string
          }
        } else if (typeof keywords === 'string') {
          // إذا كانت نصًا، نستخدمها مباشرة
          updateData.seo_keywords = keywords || null;
        } else if (keywords) {
          // أي نوع آخر، نحوله إلى نص
          updateData.seo_keywords = String(keywords);
        } else {
          // إذا كانت فارغة أو undefined، نضع null
          updateData.seo_keywords = null;
        }
        
        console.log("✅ الكلمات المفتاحية بعد المعالجة:", updateData.seo_keywords);
      } catch (error) {
        console.error("❌ خطأ في معالجة الكلمات المفتاحية:", error);
        // في حالة الخطأ، استخدم null كقيمة افتراضية آمنة
        updateData.seo_keywords = null;
      }
    }
    
    // إذا كانت هناك كلمات مفتاحية في metadata، استخرجها أيضًا
    if (data.metadata?.keywords !== undefined && !data.seo_keywords) {
      try {
        console.log("🔑 استخراج الكلمات المفتاحية من metadata:", data.metadata.keywords);
        
        let metadataKeywords = data.metadata.keywords;
        if (Array.isArray(metadataKeywords)) {
          if (metadataKeywords.length === 0) {
            updateData.seo_keywords = null;
          } else {
            updateData.seo_keywords = JSON.stringify(metadataKeywords);
          }
        } else if (typeof metadataKeywords === 'string') {
          updateData.seo_keywords = metadataKeywords || null;
        } else if (metadataKeywords) {
          updateData.seo_keywords = String(metadataKeywords);
        }
        
        console.log("✅ الكلمات المفتاحية من metadata بعد المعالجة:", updateData.seo_keywords);
      } catch (error) {
        console.error("❌ خطأ في استخراج الكلمات المفتاحية من metadata:", error);
      }
    }

    // نسخ الحقول المسموح بها فقط
    const allowedFields = [
      "title",
      "content",
      "excerpt",
      "featured_image",
      "status",
      "metadata",
      "published_at",
      "scheduled_for",
      "seo_title",
      "seo_description",
      // "seo_keywords", - تمت معالجته بشكل خاص أعلاه
      "breaking",
      // 'featured' تمت إزالته من هنا وسيتم معالجته بشكل خاص
      // الحقول غير الموجودة في schema: subtitle, type, image_caption, author_name, publish_at, external_link
    ];

    // Prevent slug changes for short, random slugs
    if (
      data.slug &&
      existingArticle.slug.length <= 12 &&
      existingArticle.slug !== data.slug
    ) {
      console.warn(
        `⚠️ Attempt to change a short slug was blocked. Old: "${existingArticle.slug}", New: "${data.slug}"`
      );
      delete data.slug;
    }

    console.log("📋 الحقول المستلمة:", Object.keys(data));
    console.log("📋 القيم المستلمة:", data);

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
        console.log(`✅ تم نسخ الحقل ${field}:`, data[field]);
      }
    }

    // منطق الجدولة عند التحديث: إذا تم تمرير scheduled_for مستقبلية → status=scheduled وإزالة published_at
    try {
      if (data.scheduled_for || data.publish_at || data.publishAt) {
        const rawSchedule = data.scheduled_for || data.publish_at || data.publishAt;
        const scheduledDate = new Date(rawSchedule);
        if (!isNaN(scheduledDate.getTime())) {
          const now = new Date();
          if (scheduledDate.getTime() > now.getTime()) {
            updateData.status = "scheduled";
            updateData.scheduled_for = scheduledDate;
            updateData.published_at = null;
          } else {
            updateData.status = "published";
            updateData.published_at = now;
            updateData.scheduled_for = null;
          }
        }
      }
    } catch (e) {
      console.warn("⚠️ فشل معالجة منطق الجدولة في PATCH:", (e as any)?.message);
    }

    // معالجة خاصة للعلاقات (author و category و article_author)
    if (data.author_id) {
      updateData.author = {
        connect: { id: data.author_id },
      };
      console.log(`✅ تم ربط المؤلف (users.author): ${data.author_id}`);
    }

    if (data.article_author_id) {
      updateData.article_author = {
        connect: { id: data.article_author_id },
      } as any;
      console.log(
        `✅ تم ربط المراسل (article_authors): ${data.article_author_id}`
      );
    }

    if (data.category_id) {
      updateData.categories = {
        connect: { id: data.category_id },
      };
      console.log(`✅ تم ربط التصنيف: ${data.category_id}`);
    }

    // معالجة خاصة لحقل featured - نحفظه مؤقتاً ونعالجه بعد التحديث
    let shouldUpdateFeatured = false;
    let featuredValue = false;

    // التحقق من جميع الأسماء المحتملة للحقل المميز
    if (
      data.featured !== undefined ||
      data.is_featured !== undefined ||
      data.isFeatured !== undefined
    ) {
      shouldUpdateFeatured = true;
      featuredValue = Boolean(
        data.featured || data.is_featured || data.isFeatured
      );
      console.log(
        `🏆 سيتم تحديث حالة التمييز للمقال ${id}: ${
          featuredValue ? "مميز" : "غير مميز"
        }`
      );
      // لا نضيف featured إلى updateData هنا، سنعالجه بشكل منفصل
    }

    // معالجة حقل breaking بأسمائه المختلفة
    if (
      data.breaking !== undefined ||
      data.is_breaking !== undefined ||
      data.isBreaking !== undefined
    ) {
      updateData.breaking = Boolean(
        data.breaking || data.is_breaking || data.isBreaking
      );
    }

    // ضبط content_type عند التحديث بما يتوافق مع article_type
    if (data.article_type !== undefined) {
      const type = (data.article_type || "").toString().toLowerCase();
      updateData.content_type = ["opinion", "analysis", "interview"].includes(
        type
      )
        ? ("OPINION" as any)
        : ("NEWS" as any);
    }

    // معالجة excerpt/summary
    if (data.excerpt !== undefined || data.summary !== undefined) {
      updateData.excerpt = data.excerpt || data.summary;
    }

    // التأكد من أن metadata يتم حفظه بشكل صحيح كـ JSON
    if (data.metadata) {
      try {
        updateData.metadata =
          typeof data.metadata === "string"
            ? data.metadata
            : JSON.stringify(data.metadata);
      } catch (error) {
        console.error("❌ خطأ في معالجة metadata:", error);
        // استخدام القيمة كما هي إذا فشل التحويل إلى JSON
        updateData.metadata =
          typeof data.metadata === "string" ? data.metadata : "{}";
      }
    }

    console.log("💾 البيانات المعدة للحفظ:", updateData);

    try {
      // محاولة تحديث المقال مع معالجة أفضل للأخطاء
      const updatedArticle = await dbConnectionManager.executeWithConnection(
        async () => {
          return await prisma.articles.update({
            where: { id },
            data: updateData,
          });
        }
      );

      console.log("✅ تم تحديث المقال بنجاح:", {
        id: updatedArticle.id,
        title: updatedArticle.title,
      });

      // معالجة تحديث حالة التمييز باستخدام المدير المركزي
      if (shouldUpdateFeatured) {
        if (featuredValue) {
          // تعيين المقال كمميز
          const featuredResult =
            await FeaturedArticleManager.setFeaturedArticle(id, {
              categoryId: updatedArticle.category_id || undefined,
            });

          if (featuredResult.success) {
            console.log("✅", featuredResult.message);
          } else {
            console.error(
              "❌ خطأ في تعيين المقال كمميز:",
              featuredResult.message
            );
          }
        } else {
          // إلغاء تمييز المقال
          const unfeaturedResult =
            await FeaturedArticleManager.unsetFeaturedArticle(id);

          if (unfeaturedResult.success) {
            console.log("✅", unfeaturedResult.message);
          } else {
            console.error(
              "❌ خطأ في إلغاء تمييز المقال:",
              unfeaturedResult.message
            );
          }
        }

        // إعادة تحقق صحة الصفحة الرئيسية
        try {
          const { revalidatePath } = await import("next/cache");
          revalidatePath("/");
          console.log("🔄 تم إعادة تحقق صحة الصفحة الرئيسية");
        } catch (error) {
          console.error("❌ خطأ في إعادة تحقق صحة الصفحة الرئيسية:", error);
        }
      }

      if (debugMode) {
        console.log("✅ تحديث ناجح:", updatedArticle.id);
        console.groupEnd();
      }

      // إرجاع استجابة موحدة متوافقة مع معايير API Envelope
      return NextResponse.json({
        ok: true,
        message: updatedArticle.status === "draft" ? "تم حفظ المسودة بنجاح" : "تم تحديث المقال بنجاح",
        data: {
          id: updatedArticle.id,
          title: updatedArticle.title,
          slug: updatedArticle.slug,
          status: updatedArticle.status
        }
      }, { status: 200 });
    } catch (updateError: any) {
      console.error("❌ خطأ في تحديث المقال في قاعدة البيانات:", updateError);
      console.error("📋 تفاصيل خطأ التحديث:", {
        code: updateError.code,
        message: updateError.message,
        meta: updateError.meta,
        articleId: id,
        updateData: JSON.stringify(updateData, null, 2),
      });

      // رسائل خطأ أكثر تفصيلاً متوافقة مع معايير API Envelope
      if (updateError.code === "P2025") {
        return NextResponse.json(
          {
            ok: false,
            message: "المقال غير موجود",
            code: "ARTICLE_NOT_FOUND",
            details: "تأكد من صحة معرف المقال"
          },
          { status: 404 }
        );
      } else if (updateError.code === "P2002") {
        return NextResponse.json(
          {
            ok: false,
            message: "تعذّر حفظ المقال: قيمة مكررة في حقل فريد",
            code: "DUPLICATE_VALUE_ERROR",
            details: `حقل مكرر: ${updateError.meta?.target}`
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر حفظ المقال: خطأ في قاعدة البيانات",
          code: "DATABASE_ERROR",
          details: updateError.message || "خطأ غير معروف في قاعدة البيانات",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ خطأ في تحديث المقال:", error);
    console.error("📋 تفاصيل الخطأ:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      articleId: id,
    });

    // في حالة Debug Mode، أرسل تفاصيل أكثر
    const isDebug = request.headers.get("X-Debug-Mode") === "true";

    return NextResponse.json(
      {
        ok: false,
        message: "تعذّر حفظ المقال: خطأ داخلي غير متوقع",
        code: "INTERNAL_ERROR",
        details: isDebug ? error.message : "الرجاء المحاولة لاحقاً"
      },
      { status: 500 }
    );
  }
}

// حذف المقال (حذف فعلي نهائي)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    console.log(`🗑️ بدء حذف المقال: ${id}`);

    // التحقق من وجود المقال أولاً
    const existingArticle = await dbConnectionManager.executeWithConnection(
      async () => {
        return await prisma.articles.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
            status: true,
            featured: true,
            category_id: true,
            author_id: true,
            article_author_id: true,
          },
        });
      }
    );

    if (!existingArticle) {
      console.log(`❌ المقال غير موجود: ${id}`);
      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر حذف المقال: المقال غير موجود",
          code: "ARTICLE_NOT_FOUND",
          details: `معرف المقال: ${id} غير موجود في قاعدة البيانات`
        },
        { status: 404 }
      );
    }

    console.log(
      `📄 المقال الموجود: "${existingArticle.title}" - الحالة: ${existingArticle.status}`
    );

    // إذا كان المقال مميزاً، قم بإزالة تمييزه أولاً
    if (existingArticle.featured) {
      try {
        await FeaturedArticleManager.unsetFeaturedArticle(id);
        console.log(`✅ تم إلغاء تمييز المقال قبل الحذف`);
      } catch (featuredError) {
        console.warn(
          `⚠️ فشل في إلغاء تمييز المقال، سيتم المتابعة:`,
          featuredError
        );
      }
    }

    // حذف جميع البيانات المرتبطة بالمقال أولاً
    await dbConnectionManager.executeWithConnection(async () => {
      // حذف التعليقات
      await prisma.comments.deleteMany({
        where: { article_id: id },
      });

      // حذف الإعجابات
      await prisma.likes.deleteMany({
        where: { article_id: id },
      });

      // حذف المشاركات
      await prisma.shares.deleteMany({
        where: { article_id: id },
      });

      // حذف المقالات المحفوظة للمستخدمين
      await prisma.saved_articles.deleteMany({
        where: { article_id: id },
      });

      // حذف قراءات المقال
      await prisma.article_reads.deleteMany({
        where: { article_id: id },
      });

      // حذف أي بيانات تحليلات
      await prisma.article_analytics.deleteMany({
        where: { article_id: id },
      });

      console.log(`🧹 تم حذف جميع البيانات المرتبطة بالمقال`);
    });

    // أخيراً حذف المقال نفسه
    const deletedArticle = await dbConnectionManager.executeWithConnection(
      async () => {
        return await prisma.articles.delete({
          where: { id },
        });
      }
    );

    console.log(`✅ تم حذف المقال "${existingArticle.title}" بالكامل نهائياً`);

    // إعادة تحقق صحة الصفحات ذات الصلة
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/");
      revalidatePath("/admin/articles");
      if (existingArticle.category_id) {
        revalidatePath(`/categories/${existingArticle.category_id}`);
      }
      console.log(`🔄 تم إعادة تحقق صحة الصفحات ذات الصلة`);
    } catch (revalidateError) {
      console.warn(`⚠️ فشل في إعادة تحقق صحة الصفحات:`, revalidateError);
    }

    return NextResponse.json({
      ok: true,
      message: `تم حذف المقال "${existingArticle.title}" نهائياً`,
      data: {
        id: existingArticle.id,
        title: existingArticle.title,
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ خطأ في حذف المقال:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          ok: false,
          message: "تعذّر حذف المقال: المقال غير موجود",
          code: "ARTICLE_NOT_FOUND",
          details: `معرف المقال: ${id} غير موجود في قاعدة البيانات`
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "تعذّر حذف المقال: خطأ في النظام",
        code: "SYSTEM_ERROR",
        details: error.message || "خطأ غير معروف",
        debug:
          process.env.NODE_ENV === "development"
            ? {
                errorCode: error.code,
                errorType: error.constructor.name,
                articleId: id,
                timestamp: new Date().toISOString(),
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}

// دعم PUT method (يستخدم نفس منطق PATCH)
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}
