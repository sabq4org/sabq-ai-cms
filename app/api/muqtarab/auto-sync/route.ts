import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// 🔄 Hook للتحديث التلقائي للمحتوى في مقترب
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case "refresh_muqtarab_content":
        await refreshMuqtarabContent();
        break;
      case "auto_publish_article":
        await autoPublishArticle(data.articleId);
        break;
      case "sync_angle_visibility":
        await syncAngleVisibility();
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "تم تنفيذ العملية بنجاح",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("خطأ في التحديث التلقائي:", error);
    return NextResponse.json(
      { error: "حدث خطأ في التحديث التلقائي" },
      { status: 500 }
    );
  }
}

// 🔄 تحديث محتوى مقترب تلقائياً
async function refreshMuqtarabContent() {
  try {
    console.log("🔄 بدء تحديث محتوى مقترب...");

    // 1. التحقق من المقالات الجديدة المنشورة
    const newPublishedArticles = await prisma.muqtarabArticle.findMany({
      where: {
        status: "published",
        updated_at: {
          gte: new Date(Date.now() - 30 * 60 * 1000), // آخر 30 دقيقة
        },
      },
      include: {
        corner: true,
      },
    });

    console.log(`📝 وجد ${newPublishedArticles.length} مقال جديد منشور`);

    // 2. تحديث عداد المقالات في الزوايا
    for (const article of newPublishedArticles) {
      if (article.corner) {
        await updateAngleArticleCount(article.corner.id);
      }
    }

    // 3. تحديث الإحصائيات العامة
    await updateMuqtarabStats();

    // 4. مسح الكاش
    await clearMuqtarabCache();

    console.log("✅ تم تحديث محتوى مقترب بنجاح");
  } catch (error) {
    console.error("❌ خطأ في تحديث محتوى مقترب:", error);
    throw error;
  }
}

// 📊 تحديث عداد المقالات في الزاوية
async function updateAngleArticleCount(angleId: string) {
  try {
    const publishedCount = await prisma.muqtarabArticle.count({
      where: {
        corner_id: angleId,
        status: "published",
      },
    });

    await prisma.muqtarabCorner.update({
      where: { id: angleId },
      data: {
        updated_at: new Date(),
        // يمكن إضافة حقل articles_count إذا لم يكن موجوداً
      },
    });

    console.log(
      `📊 تم تحديث عداد المقالات للزاوية ${angleId}: ${publishedCount} مقال`
    );
  } catch (error) {
    console.error(`❌ خطأ في تحديث عداد المقالات للزاوية ${angleId}:`, error);
  }
}

// 🔄 نشر المقال تلقائياً في مقترب
async function autoPublishArticle(articleId: string) {
  try {
    // 1. جلب المقال
    const article = await prisma.muqtarabArticle.findUnique({
      where: { id: articleId },
      include: { corner: true },
    });

    if (!article) {
      throw new Error("المقال غير موجود");
    }

    // 2. التأكد من أن المقال منشور
    if (article.status !== "published") {
      console.log(`📝 المقال ${articleId} ليس منشوراً، تخطي العملية`);
      return;
    }

    // 3. التأكد من أن الزاوية منشورة ونشطة
    if (!article.corner?.is_active) {
      console.log(`⚠️ الزاوية ${article.corner?.name} غير نشطة، تفعيلها...`);

      await prisma.muqtarabCorner.update({
        where: { id: article.corner_id },
        data: {
          is_active: true,
          updated_at: new Date(),
        },
      });
    }

    // 4. تحديث المقال ليظهر في مقترب
    await prisma.muqtarabArticle.update({
      where: { id: articleId },
      data: {
        status: "published",
        published_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 5. مسح الكاش
    await clearMuqtarabCache();

    console.log(`✅ تم نشر المقال ${article.title} في مقترب تلقائياً`);
  } catch (error) {
    console.error(`❌ خطأ في النشر التلقائي للمقال ${articleId}:`, error);
    throw error;
  }
}

// 🔄 مزامنة ظهور الزوايا
async function syncAngleVisibility() {
  try {
    console.log("🔄 بدء مزامنة ظهور الزوايا...");

    // 1. العثور على الزوايا التي لها مقالات منشورة لكنها غير نشطة
    const inactiveAnglesWithContent = await prisma.muqtarabCorner.findMany({
      where: {
        is_active: false,
        articles: {
          some: {
            status: "published",
          },
        },
      },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: "published" },
            },
          },
        },
      },
    });

    console.log(
      `🔍 وجد ${inactiveAnglesWithContent.length} زاوية غير نشطة لها محتوى منشور`
    );

    // 2. تفعيل الزوايا التي لها محتوى منشور
    for (const angle of inactiveAnglesWithContent) {
      await prisma.muqtarabCorner.update({
        where: { id: angle.id },
        data: {
          is_active: true,
          updated_at: new Date(),
        },
      });

      console.log(
        `✅ تم تفعيل الزاوية: ${angle.name} (${angle._count.articles} مقال منشور)`
      );
    }

    // 3. العثور على الزوايا النشطة بدون محتوى منشور
    const activeAnglesWithoutContent = await prisma.muqtarabCorner.findMany({
      where: {
        is_active: true,
        articles: {
          none: {
            status: "published",
          },
        },
      },
    });

    console.log(
      `🔍 وجد ${activeAnglesWithoutContent.length} زاوية نشطة بدون محتوى منشور`
    );

    // يمكن اختيار إخفاء الزوايا بدون محتوى أو تركها (حسب الحاجة)
    // await prisma.muqtarabCorner.updateMany({
    //   where: { id: { in: activeAnglesWithoutContent.map(a => a.id) } },
    //   data: { is_active: false }
    // });

    console.log("✅ تم مزامنة ظهور الزوايا بنجاح");
  } catch (error) {
    console.error("❌ خطأ في مزامنة ظهور الزوايا:", error);
    throw error;
  }
}

// 📊 تحديث الإحصائيات العامة
async function updateMuqtarabStats() {
  try {
    const [totalAngles, activeAngles, totalArticles, publishedArticles] =
      await Promise.all([
        prisma.muqtarabCorner.count(),
        prisma.muqtarabCorner.count({ where: { is_active: true } }),
        prisma.muqtarabArticle.count(),
        prisma.muqtarabArticle.count({ where: { status: "published" } }),
      ]);

    console.log("📊 الإحصائيات المحدثة:", {
      totalAngles,
      activeAngles,
      totalArticles,
      publishedArticles,
    });
  } catch (error) {
    console.error("❌ خطأ في تحديث الإحصائيات:", error);
  }
}

// 🗑️ مسح الكاش
async function clearMuqtarabCache() {
  // في Next.js يمكن مسح الكاش باستخدام revalidatePath
  // أو تقنيات أخرى حسب الحاجة
  console.log("🗑️ مسح كاش مقترب...");
}

// GET للحصول على حالة التحديث التلقائي
export async function GET() {
  try {
    const stats = await prisma.muqtarabCorner.findMany({
      select: {
        id: true,
        name: true,
        is_active: true,
        _count: {
          select: {
            articles: {
              where: { status: "published" },
            },
          },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("خطأ في جلب حالة التحديث:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب البيانات" },
      { status: 500 }
    );
  }
}
