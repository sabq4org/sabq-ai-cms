#!/usr/bin/env node

/**
 * أداة تنظيف روابط Amazon S3 - بدون متطلبات إضافية
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * تنظيف روابط Amazon S3
 */
function cleanS3Url(url) {
  if (!url || !url.includes('amazonaws.com')) {
    return url;
  }

  try {
    const urlObject = new URL(url);
    
    // إزالة معاملات التوقيع المعقدة
    const paramsToRemove = [
      'X-Amz-Algorithm', 'X-Amz-Content-Sha256', 'X-Amz-Credential',
      'X-Amz-Date', 'X-Amz-Expires', 'X-Amz-Signature', 
      'X-Amz-SignedHeaders', 'x-amz-checksum-mode', 'x-id'
    ];
    
    paramsToRemove.forEach(param => urlObject.searchParams.delete(param));
    
    return urlObject.toString();
  } catch (error) {
    console.warn(`خطأ في تنظيف الرابط: ${error.message}`);
    return url;
  }
}

/**
 * تنظيف روابط S3 في قاعدة البيانات
 */
async function cleanS3UrlsInDatabase() {
  try {
    console.log('🧹 تنظيف روابط Amazon S3 في قاعدة البيانات...\n');
    
    // البحث عن التصنيفات التي تحتوي على روابط S3 معقدة
    const categories = await prisma.categories.findMany({
      where: {
        metadata: { 
          path: ['cover_image'], 
          string_contains: 'X-Amz-' 
        }
      }
    });

    if (categories.length === 0) {
      console.log('✅ لا توجد روابط تحتاج تنظيف - جميع الروابط نظيفة بالفعل');
      return;
    }

    console.log(`🔍 وُجد ${categories.length} تصنيف يحتاج تنظيف`);

    let cleanedCount = 0;

    for (const category of categories) {
      let needsUpdate = false;
      let updatedMetadata = category.metadata ? { ...category.metadata } : {};

      // تنظيف metadata.cover_image
      if (updatedMetadata && updatedMetadata.cover_image && 
          typeof updatedMetadata.cover_image === 'string' &&
          updatedMetadata.cover_image.includes('X-Amz-')) {
        
        const cleanUrl = cleanS3Url(updatedMetadata.cover_image);
        console.log(`🧹 تنظيف صورة ${category.name}:`);
        console.log(`   من: ${updatedMetadata.cover_image.substring(0, 80)}...`);
        console.log(`   إلى: ${cleanUrl}`);
        
        updatedMetadata.cover_image = cleanUrl;
        updatedMetadata.cleaned_at = new Date().toISOString();
        needsUpdate = true;
        cleanedCount++;
      }

      if (needsUpdate) {
        await prisma.categories.update({
          where: { id: category.id },
          data: { metadata: updatedMetadata }
        });
        console.log(`✅ تم تنظيف: ${category.name}\n`);
      }
    }

    console.log(`🎉 تم الانتهاء من التنظيف - تم تنظيف ${cleanedCount} رابط`);
    
  } catch (error) {
    console.error('❌ خطأ في التنظيف:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * عرض إحصائيات الصور
 */
async function showImageStats() {
  try {
    console.log('📊 إحصائيات الصور في قاعدة البيانات:\n');
    
    const totalCategories = await prisma.categories.count();
    
    const categoriesWithImages = await prisma.categories.count({
      where: {
        metadata: { 
          path: ['cover_image'], 
          not: null 
        }
      }
    });

    const s3Images = await prisma.categories.count({
      where: {
        metadata: { 
          path: ['cover_image'], 
          string_contains: 'amazonaws.com' 
        }
      }
    });

    const complexS3Images = await prisma.categories.count({
      where: {
        metadata: { 
          path: ['cover_image'], 
          string_contains: 'X-Amz-' 
        }
      }
    });

    console.log(`📋 إجمالي التصنيفات: ${totalCategories}`);
    console.log(`🖼️  التصنيفات مع صور: ${categoriesWithImages}`);
    console.log(`☁️  صور Amazon S3: ${s3Images}`);
    console.log(`🔗 روابط S3 معقدة (تحتاج تنظيف): ${complexS3Images}`);
    
    if (complexS3Images > 0) {
      console.log('\n💡 يُنصح بتشغيل: node clean-s3-urls.js clean');
    } else {
      console.log('\n✅ جميع روابط S3 نظيفة ومحسنة');
    }
    
  } catch (error) {
    console.error('❌ خطأ في عرض الإحصائيات:', error);
  }
}

// تشغيل العملية المطلوبة
const action = process.argv[2];

async function main() {
  switch (action) {
    case 'clean':
      await cleanS3UrlsInDatabase();
      break;
    case 'stats':
      await showImageStats();
      break;
    default:
      console.log(`
🛠️  أداة تنظيف روابط Amazon S3

الاستخدام:
  node clean-s3-urls.js stats   # عرض إحصائيات الصور
  node clean-s3-urls.js clean   # تنظيف الروابط المعقدة

💡 ابدأ بـ 'stats' لمعرفة حالة قاعدة البيانات
      `);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
