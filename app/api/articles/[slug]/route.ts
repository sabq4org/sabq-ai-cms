import prisma, { ensureDbConnected, retryWithConnection } from "@/lib/prisma";
import { getCachedCategories } from "@/lib/cache-utils";
import { FeaturedArticleManager } from "@/lib/services/featured-article-manager";
import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    console.log("🚀 بدء GET request - المرحلة 1");
    const { slug } = await context.params;
    const id = slug; // اسم البارام يطابق اسم المجلد [slug]
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

    // التأكد من الاتصال بقاعدة البيانات
    await ensureDbConnected();

    // محاولة الاتصال بقاعدة البيانات بشكل آمن مع إعادة المحاولة
    let article;
    try {
      console.log("🔗 محاولة الاتصال بقاعدة البيانات - المرحلة 4");

      // استعلام مباشر بدون تعقيد
      console.log("🔍 تنفيذ استعلام قاعدة البيانات - المرحلة 6");
      article = await retryWithConnection(async () => {
        return await prisma.articles.findFirst({
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

    // تحديث عدد المشاهدات بشكل غير متزامن مع إعادة المحاولة
    setImmediate(() => {
      retryWithConnection(async () => {
        await prisma.articles.update({
          where: { id: article.id },
          data: { views: { increment: 1 } },
        });
      }).catch((error) => {
        console.error("⚠️ فشل تحديث المشاهدات:", error);
      });
    });

    // إضافة معلومات التصنيف من الـ cache إذا لزم الأمر
    let categoryInfo = article.categories;
    if (!categoryInfo && article.category_id) {
      try {
        const categoriesResult = await getCachedCategories();
        categoryInfo = categoriesResult.find(
          (c: any) => c.id === article.category_id
        ) || null;
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
            tags = String(article.tags).split(',').map((tag: string) => tag.trim()).filter(Boolean);
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
            (typeof article.metadata === 'object' && article.metadata !== null && 'keywords' in article.metadata)),
          hasSeoKeywords: article.metadata && (typeof article.metadata === 'string' ? 
            JSON.parse(article.metadata).seo_keywords !== undefined : 
            (typeof article.metadata === 'object' && article.metadata !== null && 'seo_keywords' in article.metadata))
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
        // ✅ إضافة حقول Alt Text ووصف الصورة
        featured_image_alt: (article as any).featured_image_alt,
        featured_image_caption: (article as any).featured_image_caption,
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

// تحديث مقال موجود
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log("🚀 PATCH /api/articles/[id] - بداية معالجة طلب التحديث");
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          message: "معرف المقال مطلوب",
          code: "MISSING_ID"
        },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log("📝 بيانات التحديث:", data);

    // تحضير بيانات التحديث
    const updateData: any = {
      updated_at: new Date(),
    };

    // تحديث الحقول المرسلة فقط
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.breaking !== undefined) updateData.breaking = data.breaking;
    if (data.featured_image !== undefined) updateData.featured_image = data.featured_image;
    if (data.featured_image_alt !== undefined) updateData.featured_image_alt = data.featured_image_alt;
    if (data.featured_image_caption !== undefined) updateData.featured_image_caption = data.featured_image_caption;
    if (data.category_id !== undefined) updateData.category_id = data.category_id;
    if (data.tags !== undefined) updateData.tags = data.tags;

    // تحديث وقت النشر للمقالات المنشورة حديثاً
    if (data.status === 'published' && updateData.published_at === null) {
      updateData.published_at = new Date();
    }

    const updatedArticle = await prisma.articles.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    console.log("✅ تم تحديث المقال بنجاح:", updatedArticle.id);

    return NextResponse.json({
      ok: true,
      message: "تم تحديث المقال بنجاح",
      article: updatedArticle,
    });
  } catch (error: any) {
    console.error("❌ خطأ في تحديث المقال:", error);
    
    return NextResponse.json(
      {
        ok: false,
        message: "فشل في تحديث المقال",
        code: "UPDATE_FAILED",
        details: error.message,
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
            slug: true,
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

      // حذف تفاعلات المستخدمين المعيارية
      await prisma.interactions.deleteMany({ where: { article_id: id } });
      // حذف التعليقات (موجودة في schema)
      await prisma.comments.deleteMany({ where: { article_id: id } });

      // 🗑️ حذف الإشعارات المرتبطة بالمقال - مهم جداً!
      const deletedNotifications = await prisma.smartNotifications.deleteMany({
        where: {
          OR: [
            { data: { path: ['articleId'], equals: id } },
            { data: { path: ['entityId'], equals: id } },
            { data: { path: ['link'], string_contains: existingArticle.slug || id } }
          ]
        }
      });
      
      console.log(`🔔 تم حذف ${deletedNotifications.count} إشعارات مرتبطة بالمقال`);

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
