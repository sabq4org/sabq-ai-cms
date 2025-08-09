/**
 * مدقق الروابط - منع الروابط العربية نهائياً
 */

import { containsArabic, enforceEnglishSlug } from "./slug-utils";

/**
 * التحقق من صحة الرابط - إنجليزي فقط
 */
export function validateUrl(slug: string): {
  isValid: boolean;
  message?: string;
  correctedSlug?: string;
} {
  // فحص وجود أحرف عربية
  if (containsArabic(slug)) {
    return {
      isValid: false,
      message: "الروابط العربية غير مسموحة في النظام",
      correctedSlug: enforceEnglishSlug(slug),
    };
  }

  // فحص صيغة الرابط
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      isValid: false,
      message: "الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط",
      correctedSlug: enforceEnglishSlug(slug),
    };
  }

  // فحص الطول
  if (slug.length < 2) {
    return {
      isValid: false,
      message: "الرابط قصير جداً",
      correctedSlug: `content-${Math.random().toString(36).substring(2, 8)}`,
    };
  }

  if (slug.length > 100) {
    return {
      isValid: false,
      message: "الرابط طويل جداً",
      correctedSlug: slug.substring(0, 50),
    };
  }

  return { isValid: true };
}

/**
 * تنظيف جميع الروابط في قاعدة البيانات
 */
export async function cleanupArabicUrls() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  try {
    console.log("🧹 بدء تنظيف الروابط العربية...");

    // تنظيف روابط الزوايا
    const corners = await prisma.muqtarabCorner.findMany({
      select: { id: true, slug: true, name: true },
    });

    for (const corner of corners) {
      if (containsArabic(corner.slug)) {
        const newSlug = enforceEnglishSlug(corner.slug);
        await prisma.muqtarabCorner.update({
          where: { id: corner.id },
          data: { slug: newSlug },
        });
        console.log(`✅ تم تحديث رابط الزاوية: ${corner.slug} → ${newSlug}`);
      }
    }

    // تنظيف روابط المقالات
    const articles = await prisma.muqtarabArticle.findMany({
      select: { id: true, slug: true, title: true },
    });

    for (const article of articles) {
      if (containsArabic(article.slug)) {
        const newSlug = enforceEnglishSlug(article.slug);
        await prisma.muqtarabArticle.update({
          where: { id: article.id },
          data: { slug: newSlug },
        });
        console.log(`✅ تم تحديث رابط المقال: ${article.slug} → ${newSlug}`);
      }
    }

    console.log("🎉 تم تنظيف جميع الروابط العربية بنجاح");
  } catch (error) {
    console.error("❌ خطأ في تنظيف الروابط:", error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * تقرير عن الروابط في النظام
 */
export async function generateUrlReport() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const corners = await prisma.muqtarabCorner.findMany({
      select: { slug: true, name: true },
    });

    const articles = await prisma.muqtarabArticle.findMany({
      select: { slug: true, title: true },
    });

    const report = {
      corners: {
        total: corners.length,
        english: corners.filter((c: any) => !containsArabic(c.slug)).length,
        arabic: corners.filter((c: any) => containsArabic(c.slug)).length,
      },
      articles: {
        total: articles.length,
        english: articles.filter((a: any) => !containsArabic(a.slug)).length,
        arabic: articles.filter((a: any) => containsArabic(a.slug)).length,
      },
    };

    console.log("📊 تقرير الروابط:");
    console.log(
      `الزوايا: ${report.corners.english}/${report.corners.total} إنجليزي`
    );
    console.log(
      `المقالات: ${report.articles.english}/${report.articles.total} إنجليزي`
    );

    if (report.corners.arabic > 0 || report.articles.arabic > 0) {
      console.log("⚠️ يوجد روابط عربية تحتاج تنظيف");
    } else {
      console.log("✅ جميع الروابط إنجليزية");
    }

    await prisma.$disconnect();
    return report;
  } catch (error) {
    console.error("❌ خطأ في إنشاء التقرير:", error);
    await prisma.$disconnect();
    throw error;
  }
}
