#!/usr/bin/env node

/**
 * سكريبت تنظيف الروابط العربية وضمان استخدام الروابط الإنجليزية فقط
 */

const { PrismaClient } = require("@prisma/client");
const { nanoid } = require("nanoid");

const prisma = new PrismaClient();

// نسخة مبسطة من دوال slug-utils
function containsArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function generateSlug(text) {
  const withoutDiacritics = text.replace(/[\u064B-\u065F\u0670]/g, "");

  const replacements = {
    أ: "a",
    إ: "e",
    آ: "a",
    ا: "a",
    ب: "b",
    ت: "t",
    ث: "th",
    ج: "j",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "dh",
    ر: "r",
    ز: "z",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "d",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "q",
    ك: "k",
    ل: "l",
    م: "m",
    ن: "n",
    ه: "h",
    و: "w",
    ي: "y",
    ى: "a",
    ة: "h",
    ء: "a",
    ئ: "e",
    ؤ: "o",
    " ": "-",
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  let slug = withoutDiacritics
    .split("")
    .map((char) => replacements[char] || char)
    .join("");

  slug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug || slug.length < 2 || !/[a-z0-9]/.test(slug)) {
    return "";
  }

  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-[^-]*$/, "");
  }

  return slug;
}

async function cleanupSystem() {
  console.log("🚀 بدء تنظيف النظام من الروابط العربية...");
  console.log("==========================================\n");

  try {
    // فحص روابط الزوايا
    console.log("📁 فحص روابط الزوايا...");
    const corners = await prisma.muqtarabCorner.findMany({
      select: { id: true, slug: true, name: true },
    });

    let cornersUpdated = 0;
    for (const corner of corners) {
      if (containsArabic(corner.slug)) {
        // توليد slug إنجليزي جديد
        let newSlug = generateSlug(corner.name);
        if (!newSlug || newSlug.length < 3) {
          newSlug = `corner-${nanoid(8)}`;
        }

        // التأكد من الفرادة
        let counter = 1;
        const originalSlug = newSlug;
        while (
          await prisma.muqtarabCorner.findUnique({ where: { slug: newSlug } })
        ) {
          newSlug = `${originalSlug}-${counter}`;
          counter++;
        }

        await prisma.muqtarabCorner.update({
          where: { id: corner.id },
          data: { slug: newSlug },
        });

        console.log(`   ✅ ${corner.name}: ${corner.slug} → ${newSlug}`);
        cornersUpdated++;
      } else {
        console.log(`   ✓ ${corner.name}: ${corner.slug} (إنجليزي بالفعل)`);
      }
    }

    // فحص روابط المقالات
    console.log("\n📄 فحص روابط المقالات...");
    const articles = await prisma.muqtarabArticle.findMany({
      select: { id: true, slug: true, title: true },
    });

    let articlesUpdated = 0;
    for (const article of articles) {
      if (containsArabic(article.slug)) {
        // توليد slug إنجليزي جديد
        let newSlug = generateSlug(article.title);
        if (!newSlug || newSlug.length < 3) {
          newSlug = `article-${nanoid(8)}`;
        }

        // التأكد من الفرادة
        let counter = 1;
        const originalSlug = newSlug;
        while (
          await prisma.muqtarabArticle.findUnique({ where: { slug: newSlug } })
        ) {
          newSlug = `${originalSlug}-${counter}`;
          counter++;
        }

        await prisma.muqtarabArticle.update({
          where: { id: article.id },
          data: { slug: newSlug },
        });

        console.log(`   ✅ ${article.title}: ${article.slug} → ${newSlug}`);
        articlesUpdated++;
      } else {
        console.log(`   ✓ ${article.title}: ${article.slug} (إنجليزي بالفعل)`);
      }
    }

    console.log("\n==========================================");
    console.log("📊 ملخص النتائج:");
    console.log(
      `   📁 الزوايا: ${cornersUpdated} تم تحديثها من أصل ${corners.length}`
    );
    console.log(
      `   📄 المقالات: ${articlesUpdated} تم تحديثها من أصل ${articles.length}`
    );

    if (cornersUpdated === 0 && articlesUpdated === 0) {
      console.log("\n🎉 ممتاز! جميع الروابط إنجليزية بالفعل");
      console.log(
        "✅ النظام يعمل بشكل صحيح مع المثال: https://www.sabq.io/muqtarab/aTFaS56S"
      );
    } else {
      console.log("\n🎉 تم تنظيف جميع الروابط العربية بنجاح");
      console.log("✅ النظام الآن يستخدم روابط إنجليزية فقط");
    }

    // عرض بعض الأمثلة
    console.log("\n📝 أمثلة على الروابط الحالية:");
    const sampleCorners = await prisma.muqtarabCorner.findMany({
      select: { slug: true, name: true },
      take: 3,
    });

    const sampleArticles = await prisma.muqtarabArticle.findMany({
      select: { slug: true, title: true },
      take: 3,
    });

    sampleCorners.forEach((corner) => {
      console.log(
        `   📁 https://www.sabq.io/muqtarab/${corner.slug} (${corner.name})`
      );
    });

    sampleArticles.forEach((article) => {
      console.log(
        `   📄 https://www.sabq.io/muqtarab/${article.slug} (${article.title})`
      );
    });
  } catch (error) {
    console.error("❌ خطأ في تنظيف النظام:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
cleanupSystem().then(() => {
  console.log("\n✅ انتهى تنظيف النظام بنجاح");
  process.exit(0);
});
