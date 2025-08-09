// إنشاء slugs للمقالات التي لا تملك slug
import prisma from "../lib/prisma.js";

function generateSlug(title) {
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

async function generateMissingSlugs() {
  console.log("🔍 البحث عن المقالات بدون slugs...");

  try {
    // مقالات الأخبار
    const newsArticlesWithoutSlugs = await prisma.article.findMany({
      where: {
        OR: [{ slug: null }, { slug: "" }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    console.log(
      `📰 وُجد ${newsArticlesWithoutSlugs.length} مقال من الأخبار بدون slug`
    );

    // مقالات مُقترب
    const muqtarabArticlesWithoutSlugs = await prisma.muqtarabArticle.findMany({
      where: {
        OR: [{ slug: null }, { slug: "" }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    console.log(
      `📝 وُجد ${muqtarabArticlesWithoutSlugs.length} مقال من مُقترب بدون slug`
    );

    // تحديث مقالات الأخبار
    for (const article of newsArticlesWithoutSlugs) {
      const slug = generateSlug(article.title);
      if (slug) {
        try {
          await prisma.article.update({
            where: { id: article.id },
            data: { slug: slug },
          });
          console.log(`✅ تم إنشاء slug للمقال: ${article.title} -> ${slug}`);
        } catch (error) {
          // إذا كان الـ slug مكرر، أضف رقم
          const uniqueSlug = `${slug}-${article.id.substring(0, 8)}`;
          await prisma.article.update({
            where: { id: article.id },
            data: { slug: uniqueSlug },
          });
          console.log(
            `✅ تم إنشاء slug فريد للمقال: ${article.title} -> ${uniqueSlug}`
          );
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
        } catch (error) {
          // إذا كان الـ slug مكرر، أضف رقم
          const uniqueSlug = `${slug}-${article.id.substring(0, 8)}`;
          await prisma.muqtarabArticle.update({
            where: { id: article.id },
            data: { slug: uniqueSlug },
          });
          console.log(
            `✅ تم إنشاء slug فريد لمقال مُقترب: ${article.title} -> ${uniqueSlug}`
          );
        }
      }
    }

    console.log("🎉 تم الانتهاء من إنشاء جميع الـ slugs المفقودة!");
  } catch (error) {
    console.error("❌ خطأ في إنشاء الـ slugs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateMissingSlugs();
