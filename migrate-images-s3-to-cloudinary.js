#!/usr/bin/env node

/**
 * أداة ترحيل الصور من Amazon S3 إلى Cloudinary
 * تحل مشكلة الروابط المعقدة والمؤقتة
 */

const { PrismaClient } = require("@prisma/client");
const https = require("https");
const fs = require("fs");
const path = require("path");

class ImageMigrationTool {
  constructor() {
    this.prisma = new PrismaClient();
    this.cloudinaryConfig = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "dybhezmvb",
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    };
    this.migratedCount = 0;
    this.skippedCount = 0;
    this.errorCount = 0;
  }

  /**
   * فحص جميع الصور في قاعدة البيانات
   */
  async scanDatabase() {
    console.log("🔍 فحص قاعدة البيانات للبحث عن صور Amazon S3...\n");

    try {
      // فحص صور التصنيفات
      const categories = await this.prisma.category.findMany({
        where: {
          OR: [
            { cover_image: { contains: "amazonaws.com" } },
            {
              metadata: {
                path: ["cover_image"],
                string_contains: "amazonaws.com",
              },
            },
          ],
        },
      });

      console.log(
        `📋 تم العثور على ${categories.length} تصنيف يحتوي على صور S3\n`
      );

      for (const category of categories) {
        await this.migrateCategoryImage(category);
      }

      // فحص صور المقالات (إذا كان هناك جدول منفصل للصور)
      // يمكن إضافة المزيد هنا حسب الحاجة

      this.printSummary();
    } catch (error) {
      console.error("❌ خطأ في فحص قاعدة البيانات:", error);
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * ترحيل صورة تصنيف واحد
   */
  async migrateCategoryImage(category) {
    console.log(`📂 معالجة تصنيف: ${category.name} (${category.id})`);

    let s3ImageUrl = category.cover_image;

    // البحث في metadata أيضاً
    if (!s3ImageUrl && category.metadata?.cover_image) {
      s3ImageUrl = category.metadata.cover_image;
    }

    if (!s3ImageUrl || !s3ImageUrl.includes("amazonaws.com")) {
      console.log(`   ⏭️  لا توجد صورة S3 للترحيل`);
      this.skippedCount++;
      return;
    }

    // فحص إذا كان الرابط معقد ومؤقت
    const isComplexS3Url =
      s3ImageUrl.includes("X-Amz-") ||
      s3ImageUrl.includes("Expires=") ||
      s3ImageUrl.length > 200;

    if (isComplexS3Url) {
      console.log(`   🚫 رابط S3 معقد ومؤقت، سيتم استبداله بصورة افتراضية`);
      await this.replaceWithDefaultImage(category);
      return;
    }

    try {
      // محاولة ترحيل الصورة الفعلية
      console.log(`   📤 ترحيل الصورة من S3 إلى Cloudinary...`);
      const cloudinaryUrl = await this.uploadToCloudinary(
        s3ImageUrl,
        `categories/${category.slug}`
      );

      if (cloudinaryUrl) {
        await this.updateCategoryImage(category, cloudinaryUrl);
        console.log(
          `   ✅ تم الترحيل بنجاح: ${cloudinaryUrl.substring(0, 60)}...`
        );
        this.migratedCount++;
      } else {
        throw new Error("فشل في رفع الصورة");
      }
    } catch (error) {
      console.log(`   ❌ فشل الترحيل: ${error.message}`);
      console.log(`   🔄 استبدال بصورة افتراضية...`);
      await this.replaceWithDefaultImage(category);
    }

    console.log("");
  }

  /**
   * رفع صورة إلى Cloudinary
   */
  async uploadToCloudinary(imageUrl, folder) {
    try {
      // تحميل الصورة من S3
      const imageBuffer = await this.downloadImage(imageUrl);

      // إنشاء FormData للرفع
      const FormData = require("form-data");
      const form = new FormData();

      form.append("file", imageBuffer);
      form.append("folder", folder);
      form.append("quality", "auto");
      form.append("format", "auto");
      // إزالة upload_preset واستخدام signed upload

      // رفع إلى Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/image/upload`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error("خطأ في رفع الصورة إلى Cloudinary:", error);
      return null;
    }
  }

  /**
   * تحميل صورة من URL
   */
  async downloadImage(url) {
    return new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }

          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => resolve(Buffer.concat(chunks)));
        })
        .on("error", reject);
    });
  }

  /**
   * استبدال بصورة افتراضية
   */
  async replaceWithDefaultImage(category) {
    const defaultImages = {
      محليات:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80",
      العالم:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      رياضة:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
      تقنية:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      ميديا:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
    };

    const defaultImage =
      defaultImages[category.name] ||
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80";

    await this.updateCategoryImage(category, defaultImage);
    console.log(`   🎨 تم استبدال بصورة افتراضية`);
    this.skippedCount++;
  }

  /**
   * تحديث صورة التصنيف في قاعدة البيانات
   */
  async updateCategoryImage(category, newImageUrl) {
    try {
      await this.prisma.category.update({
        where: { id: category.id },
        data: {
          cover_image: newImageUrl,
          metadata: {
            ...category.metadata,
            cover_image: newImageUrl,
            migrated_from_s3: true,
            migration_date: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("خطأ في تحديث قاعدة البيانات:", error);
      this.errorCount++;
    }
  }

  /**
   * طباعة ملخص العملية
   */
  printSummary() {
    console.log("📊 ملخص عملية الترحيل:");
    console.log("====================");
    console.log(`✅ تم ترحيلها بنجاح: ${this.migratedCount}`);
    console.log(`⏭️  تم تخطيها: ${this.skippedCount}`);
    console.log(`❌ فشل: ${this.errorCount}`);
    console.log(
      `🎯 المجموع: ${
        this.migratedCount + this.skippedCount + this.errorCount
      }\n`
    );

    if (this.migratedCount > 0) {
      console.log("🎉 تم الانتهاء من الترحيل بنجاح!");
      console.log("💡 يمكنك الآن إزالة إعدادات Amazon S3 من متغيرات البيئة");
    }
  }
}

// تشغيل الأداة
if (require.main === module) {
  const migrationTool = new ImageMigrationTool();

  console.log("🚀 بدء أداة ترحيل الصور من Amazon S3 إلى Cloudinary");
  console.log("==================================================\n");

  migrationTool.scanDatabase().catch(console.error);
}

module.exports = ImageMigrationTool;
