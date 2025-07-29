#!/usr/bin/env node

/**
 * 🚑 إصلاح سريع لمشكلة الصور
 * يحول روابط S3 إلى روابط افتراضية مؤقتاً
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// صور افتراضية من Cloudinary
const DEFAULT_IMAGES = {
  article: 'https://res.cloudinary.com/dlaibl7id/image/upload/v1753111461/defaults/article-placeholder.jpg',
  category: 'https://res.cloudinary.com/dlaibl7id/image/upload/v1753111461/defaults/category-placeholder.jpg',
  avatar: 'https://res.cloudinary.com/dlaibl7id/image/upload/v1753111461/defaults/avatar-placeholder.jpg'
};

async function quickFix() {
  console.log('🚑 بدء الإصلاح السريع لمشكلة الصور...\n');
  
  try {
    // إصلاح صور المقالات
    console.log('🔧 إصلاح صور المقالات...');
    const articlesWithS3 = await prisma.articles.findMany({
      where: {
        OR: [
          { featured_image: { contains: 's3.amazonaws.com' } },
          { featured_image: { contains: 's3.us-east-1.amazonaws.com' } }
        ]
      }
    });

    console.log(`📊 وجدت ${articlesWithS3.length} مقال بصور S3`);

    for (const article of articlesWithS3) {
      await prisma.articles.update({
        where: { id: article.id },
        data: { featured_image: DEFAULT_IMAGES.article }
      });
    }

    // إصلاح صور التصنيفات
    console.log('\n🔧 إصلاح صور التصنيفات...');
    const categoriesWithS3 = await prisma.categories.findMany({
      where: {
        metadata: {
          path: ['image_url'],
          string_contains: 's3.amazonaws.com'
        }
      }
    });

    console.log(`📊 وجدت ${categoriesWithS3.length} تصنيف بصور S3`);

    for (const category of categoriesWithS3) {
      const metadata = category.metadata || {};
      metadata.image_url = DEFAULT_IMAGES.category;
      
      await prisma.categories.update({
        where: { id: category.id },
        data: { metadata }
      });
    }

    console.log('\n✅ تم الإصلاح السريع بنجاح!');
    console.log('📝 ملاحظة: هذا حل مؤقت، يُنصح بتشغيل سكريبت الترحيل الكامل لاحقاً');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
quickFix(); 