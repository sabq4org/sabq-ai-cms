/**
 * سكريبت إنشاء إعلانات تجريبية لاختبار نظام الإعلانات
 * Demo Ads Creation Script
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createDemoAds() {
  try {
    console.log("🚀 بدء إنشاء الإعلانات التجريبية...");

    // إعلان 1: أسفل الأخبار المميزة
    const ad1 = await prisma.ads.create({
      data: {
        title: "إعلان تجريبي - أفضل منتجات التكنولوجيا",
        image_url:
          "https://via.placeholder.com/728x90/0066cc/ffffff?text=%D8%A5%D8%B9%D9%84%D8%A7%D9%86+%D8%AA%D8%AC%D8%B1%D9%8A%D8%A8%D9%8A",
        target_url: "https://example.com/tech-products",
        placement: "below_featured",
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم من الآن
        metadata: {
          description: "اكتشف أحدث منتجات التكنولوجيا بأفضل الأسعار",
          target_audience: "جميع الزوار",
          ad_type: "banner",
        },
      },
    });

    // إعلان 2: في تفاصيل المقال
    const ad2 = await prisma.ads.create({
      data: {
        title: "إعلان تجريبي - كورسات تعليمية",
        image_url:
          "https://via.placeholder.com/320x250/cc6600/ffffff?text=%D9%83%D9%88%D8%B1%D8%B3%D8%A7%D8%AA+%D8%AA%D8%B9%D9%84%D9%8A%D9%85%D9%8A%D8%A9",
        target_url: "https://example.com/courses",
        placement: "article_detail_header",
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: {
          description: "تعلم البرمجة والتصميم مع أفضل الكورسات العربية",
          target_audience: "المهتمين بالتعليم",
          ad_type: "banner",
        },
      },
    });

    // إعلان 3: أسفل البلوك المخصص
    const ad3 = await prisma.ads.create({
      data: {
        title: "إعلان تجريبي - خدمات مالية",
        image_url:
          "https://via.placeholder.com/728x90/009900/ffffff?text=%D8%AE%D8%AF%D9%85%D8%A7%D8%AA+%D9%85%D8%A7%D9%84%D9%8A%D8%A9",
        target_url: "https://example.com/financial",
        placement: "below_custom_block",
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: {
          description: "احصل على أفضل العروض المصرفية والاستثمارية",
          target_audience: "المستثمرين",
          ad_type: "banner",
        },
      },
    });

    // إعلان 4: في الشريط الجانبي (أعلى)
    const ad4 = await prisma.ads.create({
      data: {
        title: "إعلان تجريبي - عقارات",
        image_url:
          "https://via.placeholder.com/300x250/cc0066/ffffff?text=%D8%B9%D9%82%D8%A7%D8%B1%D8%A7%D8%AA",
        target_url: "https://example.com/real-estate",
        placement: "sidebar_top",
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: {
          description: "اكتشف أفضل العقارات في المنطقة",
          target_audience: "المهتمين بالعقارات",
          ad_type: "sidebar",
        },
      },
    });

    // إعلان 5: في الشريط الجانبي (أسفل)
    const ad5 = await prisma.ads.create({
      data: {
        title: "إعلان تجريبي - سيارات",
        image_url:
          "https://via.placeholder.com/300x250/6600cc/ffffff?text=%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA",
        target_url: "https://example.com/cars",
        placement: "sidebar_bottom",
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: {
          description: "أفضل عروض السيارات الجديدة والمستعملة",
          target_audience: "المهتمين بالسيارات",
          ad_type: "sidebar",
        },
      },
    });

    // إعلان 6: في التذييل
    const ad6 = await prisma.ads.create({
      data: {
        title: "إعلان تجريبي - خدمات الشحن",
        image_url:
          "https://via.placeholder.com/970x90/cc3300/ffffff?text=%D8%AE%D8%AF%D9%85%D8%A7%D8%AA+%D8%A7%D9%84%D8%B4%D8%AD%D9%86",
        target_url: "https://example.com/shipping",
        placement: "footer_banner",
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: {
          description: "خدمات الشحن السريع لجميع أنحاء العالم",
          target_audience: "جميع الزوار",
          ad_type: "banner",
        },
      },
    });

    console.log("✅ تم إنشاء الإعلانات التجريبية بنجاح!");
    console.log(`📊 تم إنشاء ${6} إعلانات:`, {
      "أسفل الأخبار المميزة": ad1.id,
      "في تفاصيل المقال": ad2.id,
      "أسفل البلوك المخصص": ad3.id,
      "الشريط الجانبي (أعلى)": ad4.id,
      "الشريط الجانبي (أسفل)": ad5.id,
      "في التذييل": ad6.id,
    });
  } catch (error) {
    console.error("❌ خطأ في إنشاء الإعلانات التجريبية:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
createDemoAds();
