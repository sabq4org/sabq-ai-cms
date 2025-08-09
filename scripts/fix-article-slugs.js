const { PrismaClient } = require("@prisma/client");

// تهيئة Prisma client
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function fixArticleSlugs() {
  try {
    console.log("🔄 بدء تحويل slugs المقالات إلى الإنجليزية...");

    // جلب جميع المقالات التي تحتوي على أحرف عربية في الـ slug
    const articles = await prisma.muqtarabArticle.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    console.log(`📊 تم العثور على ${articles.length} مقالة`);

    for (const article of articles) {
      // فحص إذا كان الـ slug يحتوي على أحرف عربية
      const hasArabic = /[\u0600-\u06FF]/.test(article.slug);

      if (hasArabic) {
        // إنشاء slug إنجليزي جديد
        const newSlug = generateUniqueSlug(article.title, article.id);

        console.log(
          `🔄 تحديث مقال "${article.title}": ${article.slug} → ${newSlug}`
        );

        await prisma.muqtarabArticle.update({
          where: { id: article.id },
          data: { slug: newSlug },
        });
      }
    }

    console.log("✅ تم تحويل جميع slugs المقالات بنجاح!");
  } catch (error) {
    console.error("❌ خطأ في تحويل slugs المقالات:", error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateUniqueSlug(title, id) {
  // خريطة تحويل الكلمات العربية إلى الإنجليزية
  const translations = {
    ذكاء: "intelligence",
    اصطناعي: "artificial",
    تقنية: "tech",
    تعلم: "learning",
    آلة: "machine",
    الآلة: "machine",
    شبكات: "networks",
    عصبية: "neural",
    معالجة: "processing",
    لغة: "language",
    رؤية: "vision",
    حاسوبية: "computer",
    أمن: "security",
    سيبراني: "cyber",
    بيانات: "data",
    علوم: "science",
    تطوير: "development",
    برمجة: "programming",
    تطبيقات: "apps",
    مواقع: "websites",
    ويب: "web",
    مقال: "article",
    دليل: "guide",
    كيفية: "how-to",
    طريقة: "method",
    أفضل: "best",
    جديد: "new",
    مميز: "featured",
    شرح: "explanation",
    تحليل: "analysis",
    نصائح: "tips",
    خطوات: "steps",
  };

  let englishSlug = title.toLowerCase();

  // تحويل الكلمات العربية
  Object.keys(translations).forEach((arabic) => {
    const english = translations[arabic];
    englishSlug = englishSlug.replace(new RegExp(arabic, "g"), english);
  });

  // إزالة الأحرف غير المطلوبة وتحويل المسافات إلى شرطات
  englishSlug = englishSlug
    .replace(/[^\w\s-]/g, "") // إزالة الرموز
    .replace(/\s+/g, "-") // تحويل المسافات إلى شرطات
    .replace(/-+/g, "-") // إزالة الشرطات المتكررة
    .replace(/^-|-$/g, ""); // إزالة الشرطات في البداية والنهاية

  // إذا كان الناتج فارغ أو قصير، استخدم المعرف
  if (!englishSlug || englishSlug.length < 3) {
    englishSlug = `article-${id.slice(-8)}`;
  }

  return englishSlug;
}

// تشغيل السكريبت
if (require.main === module) {
  fixArticleSlugs();
}

module.exports = { fixArticleSlugs, generateUniqueSlug };
