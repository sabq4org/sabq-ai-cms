import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

function generateSlug(title: string): string | null {
  if (!title) return null;

  return (
    title
      .trim()
      .toLowerCase()
      // إزالة العلامات والرموز
      .replace(
        /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0020\u002D\u005F\u0030-\u0039a-zA-Z]/g,
        ""
      )
      // تحويل المسافات إلى شرطات
      .replace(/\s+/g, "-")
      // إزالة الشرطات المتتالية
      .replace(/-+/g, "-")
      // إزالة الشرطات من البداية والنهاية
      .replace(/^-|-$/g, "")
      // تحديد الطول الأقصى
      .substring(0, 100)
  );
}

export async function POST() {
  try {
    console.log("🔍 البحث عن المقالات بدون slugs...");

    // مقالات الأخبار - استخدام الاسم الصحيح للجدول
    const newsArticlesWithoutSlugs = await prisma.articles.findMany({
      where: {
        OR: [{ slug: undefined }, { slug: "" }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10, // نأخذ 10 في كل مرة
    });

    console.log(
      `📰 وُجد ${newsArticlesWithoutSlugs.length} مقال من الأخبار بدون slug`
    );

    // مقالات مُقترب
    const muqtarabArticlesWithoutSlugs = await prisma.muqtarabArticle.findMany({
      where: {
        OR: [{ slug: undefined }, { slug: "" }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10, // نأخذ 10 في كل مرة
    });

    console.log(
      `📝 وُجد ${muqtarabArticlesWithoutSlugs.length} مقال من مُقترب بدون slug`
    );

    const results = {
      newsUpdated: 0,
      muqtarabUpdated: 0,
      errors: [] as string[],
    };

    // تحديث مقالات الأخبار
    for (const article of newsArticlesWithoutSlugs) {
      const slug = generateSlug(article.title);
      if (slug) {
        try {
          await prisma.articles.update({
            where: { id: article.id },
            data: { slug: slug },
          });
          console.log(`✅ تم إنشاء slug للمقال: ${article.title} -> ${slug}`);
          results.newsUpdated++;
        } catch (error) {
          try {
            // إذا كان الـ slug مكرر، أضف رقم
            const uniqueSlug = `${slug}-${article.id.substring(0, 8)}`;
            await prisma.articles.update({
              where: { id: article.id },
              data: { slug: uniqueSlug },
            });
            console.log(
              `✅ تم إنشاء slug فريد للمقال: ${article.title} -> ${uniqueSlug}`
            );
            results.newsUpdated++;
          } catch (finalError) {
            console.error(`❌ فشل في تحديث المقال ${article.id}:`, finalError);
            results.errors.push(
              `News article ${article.id}: ${(finalError as Error).message}`
            );
          }
        }
      }
    }

    // تحديث مقالات مُقترب
    for (const article of muqtarabArticlesWithoutSlugs) {
      const slug = generateSlug(article.title);
      if (slug) {
        try {
          await prisma.muqtarabArticle.update({
            where: { id: article.id },
            data: { slug: slug },
          });
          console.log(
            `✅ تم إنشاء slug لمقال مُقترب: ${article.title} -> ${slug}`
          );
          results.muqtarabUpdated++;
        } catch (error) {
          try {
            // إذا كان الـ slug مكرر، أضف رقم
            const uniqueSlug = `${slug}-${article.id.substring(0, 8)}`;
            await prisma.muqtarabArticle.update({
              where: { id: article.id },
              data: { slug: uniqueSlug },
            });
            console.log(
              `✅ تم إنشاء slug فريد لمقال مُقترب: ${article.title} -> ${uniqueSlug}`
            );
            results.muqtarabUpdated++;
          } catch (finalError) {
            console.error(
              `❌ فشل في تحديث مقال مُقترب ${article.id}:`,
              finalError
            );
            results.errors.push(
              `Muqtarab article ${article.id}: ${(finalError as Error).message}`
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم إنشاء slugs للمقالات بنجاح",
      results: results,
      totalUpdated: results.newsUpdated + results.muqtarabUpdated,
    });
  } catch (error) {
    console.error("❌ خطأ في إنشاء الـ slugs:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
