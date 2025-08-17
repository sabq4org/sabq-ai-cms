import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// 🔄 Webhook للتحديث التلقائي عند نشر مقال
export async function POST(request: NextRequest) {
  try {
    const { articleId, action } = await request.json();

    console.log(`🔔 Webhook triggered: ${action} for article ${articleId}`);

    switch (action) {
      case "article_published":
        await handleArticlePublished(articleId);
        break;
      case "article_updated":
        await handleArticleUpdated(articleId);
        break;
      case "article_deleted":
        await handleArticleDeleted(articleId);
        break;
      default:
        console.log(`⚠️ Unknown webhook action: ${action}`);
    }

    return NextResponse.json({
      success: true,
      message: `Webhook ${action} processed successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// 📝 معالجة نشر مقال جديد
async function handleArticlePublished(articleId: string) {
  try {
    console.log(`📝 معالجة نشر مقال: ${articleId}`);

    // 1. جلب المقال والزاوية
    const article = await prisma.muqtarabArticle.findUnique({
      where: { id: articleId },
      include: { corner: true },
    });

    if (!article) {
      console.log(`⚠️ المقال ${articleId} غير موجود`);
      return;
    }

    // 2. التأكد من تفعيل الزاوية إذا لم تكن مفعلة
    if (article.corner && !article.corner.is_active) {
      await prisma.muqtarabCorner.update({
        where: { id: article.corner.id },
        data: {
          is_active: true,
          updated_at: new Date(),
        },
      });

      console.log(`✅ تم تفعيل الزاوية: ${article.corner.name}`);
    }

    // 3. تحديث إحصائيات الزاوية
    if (article.corner) {
      await updateCornerStats(article.corner.id);
    }

    // 4. تحديث كاش الصفحة الرئيسية لمقترب
    const baseUrl = process.env.NEXTAUTH_URL || 
                   process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.NEXT_PUBLIC_APP_URL ||
                   'http://localhost:3000';
                   
    await fetch(`${baseUrl}/api/revalidate?path=/muqtarab`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.REVALIDATE_TOKEN}` },
    }).catch(() => {
      console.log("⚠️ فشل في تحديث كاش /muqtarab");
    });

    // 5. تحديث كاش صفحة الزاوية
    await fetch(
      `${process.env.NEXTAUTH_URL}/api/revalidate?path=/muqtarab/${article.corner?.slug}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.REVALIDATE_TOKEN}` },
      }
    ).catch(() => {
      console.log(`⚠️ فشل في تحديث كاش /muqtarab/${article.corner?.slug}`);
    });

    console.log(`✅ تم تحديث مقترب تلقائياً بعد نشر المقال: ${article.title}`);
  } catch (error) {
    console.error(`❌ خطأ في معالجة نشر المقال ${articleId}:`, error);
  }
}

// 📝 معالجة تحديث مقال
async function handleArticleUpdated(articleId: string) {
  try {
    console.log(`🔄 معالجة تحديث مقال: ${articleId}`);

    const article = await prisma.muqtarabArticle.findUnique({
      where: { id: articleId },
      include: { corner: true },
    });

    if (article?.corner) {
      await updateCornerStats(article.corner.id);

      // تحديث كاش صفحة المقال
      await fetch(
        `${process.env.NEXTAUTH_URL}/api/revalidate?path=/muqtarab/articles/${article.slug}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.REVALIDATE_TOKEN}` },
        }
      ).catch(() => {
        console.log(`⚠️ فشل في تحديث كاش المقال ${article.slug}`);
      });
    }

    console.log(`✅ تم تحديث المقال: ${article?.title}`);
  } catch (error) {
    console.error(`❌ خطأ في معالجة تحديث المقال ${articleId}:`, error);
  }
}

// 🗑️ معالجة حذف مقال
async function handleArticleDeleted(articleId: string) {
  try {
    console.log(`🗑️ معالجة حذف مقال: ${articleId}`);

    // يمكن إضافة منطق خاص بحذف المقال هنا
    // مثل تحديث الإحصائيات أو إخفاء الزاوية إذا لم تعد تحتوي على مقالات

    console.log(`✅ تم معالجة حذف المقال: ${articleId}`);
  } catch (error) {
    console.error(`❌ خطأ في معالجة حذف المقال ${articleId}:`, error);
  }
}

// 📊 تحديث إحصائيات الزاوية
async function updateCornerStats(cornerId: string) {
  try {
    const [publishedCount, totalViews] = await Promise.all([
      prisma.muqtarabArticle.count({
        where: {
          corner_id: cornerId,
          status: "published",
        },
      }),
      prisma.muqtarabArticle.aggregate({
        where: {
          corner_id: cornerId,
          status: "published",
        },
        _sum: {
          views: true,
        },
      }),
    ]);

    // يمكن حفظ هذه الإحصائيات في جدول منفصل أو حقول في جدول الزوايا
    console.log(
      `📊 إحصائيات الزاوية ${cornerId}: ${publishedCount} مقال، ${
        totalViews._sum.views || 0
      } مشاهدة`
    );
  } catch (error) {
    console.error(`❌ خطأ في تحديث إحصائيات الزاوية ${cornerId}:`, error);
  }
}
