#!/usr/bin/env node

/**
 * سكريبت لإصلاح مشكلة الصور المحفوظة كـ base64 في قاعدة البيانات
 * يقوم بتحويل الصور من base64 إلى روابط عادية أو صور مؤقتة
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBase64Images() {
  console.log('🔧 بدء إصلاح مشكلة صور base64...');

  try {
    // البحث عن جميع المقالات التي تحتوي على صور base64
    const articlesWithBase64Images = await prisma.articles.findMany({
      where: {
        OR: [
          { featured_image: { startsWith: 'data:image/' } },
          { social_image: { startsWith: 'data:image/' } }
        ]
      },
      select: {
        id: true,
        title: true,
        featured_image: true,
        social_image: true,
        category_id: true,
        categories: {
          select: { name: true }
        }
      }
    });

    console.log(`📊 وُجد ${articlesWithBase64Images.length} مقال يحتوي على صور base64`);

    if (articlesWithBase64Images.length === 0) {
      console.log('✅ لا توجد صور base64 تحتاج إصلاح!');
      return;
    }

    // إظهار عينة من المشكلة
    console.log('\n📋 عينة من المقالات التي تحتاج إصلاح:');
    articlesWithBase64Images.slice(0, 5).forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   - التصنيف: ${article.categories?.name || 'غير محدد'}`);
      console.log(`   - طول الصورة الرئيسية: ${article.featured_image?.length || 0} حرف`);
      if (article.social_image) {
        console.log(`   - طول الصورة الاجتماعية: ${article.social_image.length} حرف`);
      }
      console.log('');
    });

    // إنشاء روابط بديلة حسب التصنيف
    const placeholderImages = {
      'محليات': '/images/news-placeholder-lite.svg',
      'العالم': '/images/news-placeholder-lite.svg',
      'رياضة': '/images/sports-placeholder.svg',
      'اقتصاد': '/images/economy-placeholder.svg',
      'تقنية': '/images/tech-placeholder.svg',
      'صحة': '/images/health-placeholder.svg',
      'ثقافة': '/images/news-placeholder-lite.svg',
      'مجتمع': '/images/news-placeholder-lite.svg',
      'سياسة': '/images/news-placeholder-lite.svg',
      'default': '/images/news-placeholder-lite.svg'
    };

    console.log('\n🔄 بدء عملية الإصلاح...');

    let fixedCount = 0;
    const batchSize = 10; // معالجة 10 مقالات في كل مجموعة

    for (let i = 0; i < articlesWithBase64Images.length; i += batchSize) {
      const batch = articlesWithBase64Images.slice(i, i + batchSize);
      
      const updatePromises = batch.map(async (article) => {
        const categoryName = article.categories?.name || 'default';
        const placeholderImage = placeholderImages[categoryName] || placeholderImages.default;

        const updateData = {};

        // إصلاح الصورة الرئيسية
        if (article.featured_image?.startsWith('data:image/')) {
          updateData.featured_image = placeholderImage;
        }

        // إصلاح الصورة الاجتماعية
        if (article.social_image?.startsWith('data:image/')) {
          updateData.social_image = placeholderImage;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.articles.update({
            where: { id: article.id },
            data: updateData
          });

          console.log(`✅ تم إصلاح: ${article.title.substring(0, 50)}...`);
          return true;
        }
        return false;
      });

      const results = await Promise.all(updatePromises);
      fixedCount += results.filter(Boolean).length;

      // إظهار التقدم
      console.log(`📈 تم إصلاح ${fixedCount} من ${articlesWithBase64Images.length} مقال...`);
      
      // توقف قصير بين المجموعات
      if (i + batchSize < articlesWithBase64Images.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n🎉 تمت عملية الإصلاح بنجاح!`);
    console.log(`📊 إحصائيات العملية:`);
    console.log(`   - إجمالي المقالات المفحوصة: ${articlesWithBase64Images.length}`);
    console.log(`   - المقالات التي تم إصلاحها: ${fixedCount}`);
    console.log(`   - الصور البديلة المستخدمة: ${Object.values(placeholderImages).length}`);

  } catch (error) {
    console.error('❌ خطأ في عملية الإصلاح:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// التحقق من وجود ملفات الصور البديلة
async function checkPlaceholderImages() {
  const fs = require('fs');
  const path = require('path');

  const images = [
    'news-placeholder-lite.svg',
    'news-placeholder-dark.svg'
  ];

  const publicImagesDir = path.join(process.cwd(), 'public', 'images');
  
  console.log('🔍 التحقق من وجود الصور البديلة...');
  
  for (const image of images) {
    const imagePath = path.join(publicImagesDir, image);
    if (fs.existsSync(imagePath)) {
      console.log(`✅ ${image} موجود`);
    } else {
      console.log(`⚠️ ${image} غير موجود - سيتم استخدام fallback`);
    }
  }
}

// وظيفة لمراقبة وإصلاح صور base64 الجديدة
async function monitorBase64Images() {
  console.log('🔍 بدء مراقبة صور base64 الجديدة...');
  
  setInterval(async () => {
    try {
      const articlesWithBase64 = await prisma.articles.findMany({
        where: {
          OR: [
            { featured_image: { startsWith: 'data:image/' } },
            { social_image: { startsWith: 'data:image/' } }
          ]
        },
        select: { id: true }
      });

      if (articlesWithBase64.length > 0) {
        console.log(`⚠️ تم اكتشاف ${articlesWithBase64.length} مقال جديد بصور base64!`);
        await fixBase64Images();
      }
    } catch (error) {
      console.error('❌ خطأ في مراقبة صور base64:', error);
    }
  }, 30000); // فحص كل 30 ثانية
}

// تشغيل السكريبت
if (require.main === module) {
  const args = process.argv.slice(2);
  const shouldMonitor = args.includes('--monitor') || args.includes('-m');

  checkPlaceholderImages()
    .then(() => fixBase64Images())
    .then(() => {
      console.log('\n✨ انتهت العملية بنجاح! يمكنك الآن تشغيل الموقع ومشاهدة الصور تظهر بشكل صحيح.');
      
      if (shouldMonitor) {
        console.log('🔄 تفعيل وضع المراقبة المستمرة...');
        monitorBase64Images();
      } else {
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('💥 فشل في تشغيل السكريبت:', error);
      process.exit(1);
    });
}

module.exports = { fixBase64Images };
