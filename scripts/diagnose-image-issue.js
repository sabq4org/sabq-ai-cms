#!/usr/bin/env node

/**
 * سكريبت لتشخيص مشكلة عدم ظهور الصور في مكونات مختلفة
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseImageIssue() {
  console.log('🔍 بدء تشخيص مشكلة الصور...\n');

  try {
    // 1. فحص إجمالي المقالات
    const totalArticles = await prisma.articles.count();
    console.log(`📊 إجمالي المقالات: ${totalArticles}`);

    // 2. فحص تفصيلي
    const base64Count = await prisma.articles.count({
      where: { featured_image: { startsWith: 'data:image/' } }
    });
    
    const urlCount = await prisma.articles.count({
      where: { featured_image: { startsWith: 'http' } }
    });
    
    const localCount = await prisma.articles.count({
      where: { featured_image: { startsWith: '/images/' } }
    });
    
    const noImageCount = await prisma.articles.count({
      where: { 
        OR: [
          { featured_image: null },
          { featured_image: '' }
        ]
      }
    });

    console.log('\n📊 إحصائيات الصور:');
    console.log(`   - صور Base64: ${base64Count}`);
    console.log(`   - صور URLs: ${urlCount}`);
    console.log(`   - صور محلية: ${localCount}`);
    console.log(`   - بدون صور: ${noImageCount}`);

    // 3. فحص آخر المقالات (المشكلة المذكورة)
    console.log('\n📋 آخر 4 مقالات (المشكلة المذكورة):');
    const latestArticles = await prisma.articles.findMany({
      take: 4,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        featured_image: true,
        created_at: true,
        categories: {
          select: { name: true }
        }
      }
    });

    latestArticles.forEach((article, index) => {
      const imageType = getImageType(article.featured_image);
      const imageSize = article.featured_image ? 
        (article.featured_image.startsWith('data:image/') ? 
          `${Math.round(article.featured_image.length / 1024)}KB` : 
          'URL') : 'لا توجد';
      
      console.log(`${index + 1}. ${article.title?.substring(0, 60)}...`);
      console.log(`   ID: ${article.id}`);
      console.log(`   التصنيف: ${article.categories?.name || 'غير محدد'}`);
      console.log(`   نوع الصورة: ${imageType}`);
      console.log(`   حجم الصورة: ${imageSize}`);
      console.log(`   تاريخ النشر: ${article.created_at}`);
      
      if (article.featured_image) {
        console.log(`   عينة من رابط الصورة: ${article.featured_image.substring(0, 100)}...`);
      }
      console.log('');
    });

    // 4. فحص المقالات المميزة
    console.log('📌 المقالات المميزة (للنسخة الخفيفة):');
    const featuredArticles = await prisma.articles.findMany({
      where: {
        status: 'published',
        featured_image: { not: null }
      },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        featured_image: true,
        status: true
      }
    });

    featuredArticles.forEach((article, index) => {
      const imageType = getImageType(article.featured_image);
      console.log(`${index + 1}. ${imageType}: ${article.title?.substring(0, 50)}...`);
    });

    // 5. البحث عن صور Base64 كبيرة (المشكلة المحتملة)
    console.log('\n⚠️ الصور Base64 الكبيرة (أكبر من 100KB):');
    const largeBase64Articles = await prisma.articles.findMany({
      where: {
        featured_image: { startsWith: 'data:image/' }
      },
      select: {
        id: true,
        title: true,
        featured_image: true
      }
    });

    const largeImages = largeBase64Articles.filter(article => 
      article.featured_image && article.featured_image.length > 100000
    );

    if (largeImages.length > 0) {
      largeImages.forEach((article, index) => {
        const sizeKB = Math.round(article.featured_image.length / 1024);
        console.log(`${index + 1}. ${article.title?.substring(0, 50)}... (${sizeKB}KB)`);
        console.log(`   ID: ${article.id}`);
      });
    } else {
      console.log('   ✅ لا توجد صور base64 كبيرة');
    }

    // 6. اقتراحات الحل
    console.log('\n💡 اقتراحات الحل:');
    
    if (base64Count > 0) {
      console.log(`   1. تحويل ${base64Count} صور base64 إلى Cloudinary أو حذفها`);
    }
    
    if (noImageCount > 0) {
      console.log(`   2. إضافة صور افتراضية لـ ${noImageCount} مقال بدون صور`);
    }
    
    console.log('   3. التحقق من إعدادات مكون LightFeaturedStrip');
    console.log('   4. فحص الشبكة في المتصفح لرؤية أخطاء تحميل الصور');

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getImageType(imagePath) {
  if (!imagePath) return 'بدون صورة';
  if (imagePath.startsWith('data:image/')) return 'Base64';
  if (imagePath.startsWith('http')) return 'URL خارجي';
  if (imagePath.startsWith('/images/')) return 'صورة محلية';
  return 'نوع غير محدد';
}

// تشغيل السكريبت
if (require.main === module) {
  diagnoseImageIssue()
    .then(() => {
      console.log('\n✅ انتهى التشخيص');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 فشل في التشخيص:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseImageIssue };
