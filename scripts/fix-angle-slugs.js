const { PrismaClient } = require("@prisma/client");

// تهيئة Prisma client
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// خريطة تحويل الـ slugs من العربية إلى الإنجليزية
const SLUG_MAPPING = {
  "تقنية-ai": "ai-tech",
  "tech-ai": "ai-tech", // في حالة وجود خليط
  "ذكاء-اصطناعي": "artificial-intelligence",
  "تعلم-الآلة": "machine-learning",
  روبوتات: "robotics",
  تقنية: "technology",
  برمجة: "programming",
  "أمن-سيبراني": "cybersecurity",
  بيانات: "data-science",
  "الذكاء-الاصطناعي": "artificial-intelligence",
  "التعلم-الآلي": "machine-learning",
  "الشبكات-العصبية": "neural-networks",
  "معالجة-اللغة": "nlp",
  "رؤية-حاسوبية": "computer-vision",
  "تطوير-التطبيقات": "app-development",
  "التحليل-الذكي": "intelligent-analysis",
};

async function fixAngleSlugs() {
  try {
    console.log("🔄 بدء تحويل slugs الزوايا إلى الإنجليزية...");

    // جلب جميع الزوايا
    const angles = await prisma.muqtarabCorner.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    console.log(`📊 تم العثور على ${angles.length} زاوية`);

    for (const angle of angles) {
      let newSlug = angle.slug;

      // البحث عن slug مطابق في الخريطة
      if (SLUG_MAPPING[angle.slug]) {
        newSlug = SLUG_MAPPING[angle.slug];
      } else {
        // إنشاء slug إنجليزي تلقائياً
        newSlug = generateEnglishSlug(angle.name);
      }

      // تحديث الـ slug إذا كان مختلفاً
      if (newSlug !== angle.slug) {
        console.log(
          `🔄 تحديث الزاوية "${angle.name}": ${angle.slug} → ${newSlug}`
        );

        await prisma.muqtarabCorner.update({
          where: { id: angle.id },
          data: { slug: newSlug },
        });
      }
    }

    console.log("✅ تم تحويل جميع slugs الزوايا بنجاح!");

    // عرض قائمة الروابط الجديدة
    console.log("\n📋 الروابط الجديدة:");
    const updatedAngles = await prisma.muqtarabCorner.findMany({
      select: { slug: true, name: true },
    });

    updatedAngles.forEach((angle) => {
      console.log(`   • /muqtarab/${angle.slug} - ${angle.name}`);
    });
  } catch (error) {
    console.error("❌ خطأ في تحويل slugs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateEnglishSlug(title) {
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

  return englishSlug || "ai-tech"; // قيمة افتراضية
}

// تشغيل السكريبت
if (require.main === module) {
  fixAngleSlugs();
}

module.exports = { fixAngleSlugs, generateEnglishSlug };
