#!/usr/bin/env node

/**
 * 🚨 إصلاح طارئ لمشكلة الصور على موقع الإنتاج
 * يحول جميع روابط S3 إلى روابط عامة بدون توقيع
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// دالة لتنظيف رابط S3
function cleanS3Url(url) {
  if (!url || typeof url !== 'string') return url;
  
  // إذا كان رابط S3
  if (url.includes('s3.amazonaws.com') || url.includes('s3.us-east-1.amazonaws.com')) {
    // إزالة جميع معاملات التوقيع
    const cleanUrl = url.split('?')[0];
    console.log(`🔧 تنظيف: ${url.substring(0, 50)}... → ${cleanUrl.substring(0, 50)}...`);
    return cleanUrl;
  }
  
  return url;
}

async function fixImages() {
  console.log('🚨 بدء إصلاح طارئ لمشكلة الصور على موقع الإنتاج...\n');
  
  try {
    // 1. إصلاح صور المقالات
    console.log('📰 إصلاح صور المقالات...');
    const articles = await prisma.articles.findMany({
      where: {
        OR: [
          { featured_image: { contains: 's3.amazonaws.com' } },
          { featured_image: { contains: 'X-Amz' } }
        ]
      }
    });
    
    console.log(`  - وجدت ${articles.length} مقال بصور S3`);
    
    for (const article of articles) {
      const cleanUrl = cleanS3Url(article.featured_image);
      if (cleanUrl !== article.featured_image) {
        await prisma.articles.update({
          where: { id: article.id },
          data: { featured_image: cleanUrl }
        });
        console.log(`  ✅ ${article.title.substring(0, 30)}...`);
      }
    }
    
    // 2. إصلاح صور التصنيفات
    console.log('\n📁 إصلاح صور التصنيفات...');
    const categories = await prisma.categories.findMany();
    
    let fixedCategories = 0;
    for (const category of categories) {
      if (category.metadata && typeof category.metadata === 'object') {
        const metadata = category.metadata;
        if (metadata.image_url && metadata.image_url.includes('s3.amazonaws.com')) {
          const cleanUrl = cleanS3Url(metadata.image_url);
          if (cleanUrl !== metadata.image_url) {
            await prisma.categories.update({
              where: { id: category.id },
              data: {
                metadata: {
                  ...metadata,
                  image_url: cleanUrl
                }
              }
            });
            console.log(`  ✅ ${category.name}`);
            fixedCategories++;
          }
        }
        // أيضاً تحقق من cover_image
        if (metadata.cover_image && metadata.cover_image.includes('s3.amazonaws.com')) {
          const cleanUrl = cleanS3Url(metadata.cover_image);
          if (cleanUrl !== metadata.cover_image) {
            await prisma.categories.update({
              where: { id: category.id },
              data: {
                metadata: {
                  ...metadata,
                  cover_image: cleanUrl
                }
              }
            });
            console.log(`  ✅ ${category.name} (cover_image)`);
            fixedCategories++;
          }
        }
      }
    }
    
    console.log(`  - أصلحت ${fixedCategories} صورة تصنيف`);
    
    // 3. إصلاح صور المستخدمين
    console.log('\n👤 إصلاح صور المستخدمين...');
    const users = await prisma.users.findMany({
      where: {
        OR: [
          { avatar: { contains: 's3.amazonaws.com' } },
          { avatar: { contains: 'X-Amz' } }
        ]
      }
    });
    
    console.log(`  - وجدت ${users.length} مستخدم بصور S3`);
    
    for (const user of users) {
      const cleanUrl = cleanS3Url(user.avatar);
      if (cleanUrl !== user.avatar) {
        await prisma.users.update({
          where: { id: user.id },
          data: { avatar: cleanUrl }
        });
        console.log(`  ✅ ${user.name}`);
      }
    }
    
    // 4. مسح كاش التصنيفات
    console.log('\n🧹 مسح كاش التصنيفات...');
    try {
      const response = await fetch('https://sabq.me/api/categories?nocache=true');
      if (response.ok) {
        console.log('  ✅ تم مسح الكاش بنجاح');
      }
    } catch (error) {
      console.log('  ⚠️ فشل مسح الكاش:', error.message);
    }
    
    console.log('\n✅ تم إصلاح جميع الصور!');
    console.log('\n📝 ملاحظات مهمة:');
    console.log('  1. هذا حل مؤقت - يجب نشر تحديثات Cloudinary');
    console.log('  2. تأكد من أن S3 bucket يسمح بالوصول العام');
    console.log('  3. قد تحتاج لمسح كاش المتصفح لرؤية التغييرات');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// للتشغيل المباشر
if (require.main === module) {
  fixImages();
}

module.exports = { cleanS3Url, fixImages }; 