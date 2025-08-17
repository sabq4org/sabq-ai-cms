#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// إعدادات التحسين
const QUALITY = {
  webp: 85,
  avif: 80,
};

const MAX_DIMENSIONS = {
  width: 1920,
  height: 1080,
};

// دالة تحسين صورة واحدة
async function optimizeImage(imagePath, outputPath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    console.log(`📸 معالجة: ${path.basename(imagePath)} (${metadata.width}x${metadata.height})`);

    // تحسين وتحويل إلى WebP
    await sharp(imagePath)
      .resize(MAX_DIMENSIONS.width, MAX_DIMENSIONS.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY.webp })
      .toFile(outputPath);

    // حساب نسبة التوفير
    const originalStats = await fs.stat(imagePath);
    const optimizedStats = await fs.stat(outputPath);
    const savings = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(2);

    console.log(`✅ تم التحسين: ${path.basename(outputPath)} - توفير ${savings}%`);
    
    return {
      original: imagePath,
      optimized: outputPath,
      originalSize: originalStats.size,
      optimizedSize: optimizedStats.size,
      savings: parseFloat(savings),
    };
  } catch (error) {
    console.error(`❌ خطأ في تحسين ${imagePath}:`, error.message);
    return null;
  }
}

// دالة البحث عن الصور في مجلد
async function findImages(directory) {
  const images = [];
  const items = await fs.readdir(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      // البحث في المجلدات الفرعية
      const subImages = await findImages(fullPath);
      images.push(...subImages);
    } else if (item.isFile()) {
      // التحقق من امتداد الملف
      const ext = path.extname(item.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        images.push(fullPath);
      }
    }
  }

  return images;
}

// دالة تحديث URLs في قاعدة البيانات
async function updateDatabaseUrls(originalUrl, optimizedUrl) {
  try {
    // تحديث المقالات
    const articlesUpdated = await prisma.articles.updateMany({
      where: {
        OR: [
          { featured_image: originalUrl },
          { social_image: originalUrl },
        ],
      },
      data: {
        featured_image: optimizedUrl,
        social_image: optimizedUrl,
      },
    });

    // تحديث التصنيفات
    const categoriesUpdated = await prisma.categories.updateMany({
      where: {
        metadata: {
          path: ['cover_image'],
          equals: originalUrl,
        },
      },
      data: {
        metadata: {
          cover_image: optimizedUrl,
        },
      },
    });

    return {
      articles: articlesUpdated.count,
      categories: categoriesUpdated.count,
    };
  } catch (error) {
    console.error('خطأ في تحديث قاعدة البيانات:', error);
    return { articles: 0, categories: 0 };
  }
}

// الدالة الرئيسية
async function main() {
  console.log('🚀 بدء تحسين الصور الموجودة...\n');

  const uploadsDir = path.join(__dirname, '../public/uploads');
  const optimizedDir = path.join(__dirname, '../public/uploads/optimized');

  // إنشاء مجلد الصور المحسنة
  await fs.mkdir(optimizedDir, { recursive: true });

  // البحث عن جميع الصور
  console.log('🔍 البحث عن الصور...');
  const images = await findImages(uploadsDir);
  console.log(`📊 تم العثور على ${images.length} صورة\n`);

  // تحسين كل صورة
  const results = [];
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const imagePath of images) {
    // تخطي الصور المحسنة مسبقاً
    if (imagePath.includes('/optimized/')) continue;

    const relativePath = path.relative(uploadsDir, imagePath);
    const outputPath = path.join(
      optimizedDir,
      relativePath.replace(/\.[^/.]+$/, '.webp')
    );

    // إنشاء المجلدات الفرعية إذا لزم الأمر
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    const result = await optimizeImage(imagePath, outputPath);
    
    if (result) {
      results.push(result);
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;

      // تحديث URLs في قاعدة البيانات
      const originalUrl = `/uploads/${relativePath}`;
      const optimizedUrl = `/uploads/optimized/${relativePath.replace(/\.[^/.]+$/, '.webp')}`;
      
      const dbUpdates = await updateDatabaseUrls(originalUrl, optimizedUrl);
      if (dbUpdates.articles > 0 || dbUpdates.categories > 0) {
        console.log(`📝 تم تحديث: ${dbUpdates.articles} مقال، ${dbUpdates.categories} تصنيف`);
      }
    }
  }

  // عرض الملخص
  console.log('\n📊 ملخص التحسين:');
  console.log('================');
  console.log(`✅ تم تحسين: ${results.length} صورة`);
  console.log(`📦 الحجم الأصلي: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 الحجم المحسن: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`💾 إجمالي التوفير: ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(2)}%`);

  // حفظ تقرير مفصل
  const report = {
    date: new Date().toISOString(),
    totalImages: results.length,
    totalOriginalSize,
    totalOptimizedSize,
    totalSavings: ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(2),
    images: results,
  };

  await fs.writeFile(
    path.join(__dirname, '../reports/image-optimization-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n✅ تم حفظ التقرير في: reports/image-optimization-report.json');
}

// تشغيل السكريبت
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 