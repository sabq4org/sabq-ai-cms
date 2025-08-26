#!/usr/bin/env node

/**
 * سكريبت لإصلاح مشكلة صور Base64 في المقالات الحديثة
 * يرفع الصور إلى Cloudinary ويحديث المسارات في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

const prisma = new PrismaClient();

// إعدادات Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function fixBase64ToCloudinary() {
  console.log('🔧 بدء إصلاح صور Base64 برفعها إلى Cloudinary...\n');

  try {
    // البحث عن جميع المقالات التي تحتوي على صور base64
    const articlesWithBase64Images = await prisma.articles.findMany({
      where: {
        featured_image: { startsWith: 'data:image/' }
      },
      select: {
        id: true,
        title: true,
        featured_image: true,
        categories: {
          select: { name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    console.log(`📊 وُجد ${articlesWithBase64Images.length} مقال يحتوي على صور base64`);

    if (articlesWithBase64Images.length === 0) {
      console.log('✅ لا توجد صور base64 تحتاج إصلاح!');
      return;
    }

    // التحقق من إعدادات Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME && !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      console.log('⚠️ لم يتم العثور على إعدادات Cloudinary');
      console.log('سيتم استبدال الصور بروابط افتراضية...\n');
      await replaceWithPlaceholders(articlesWithBase64Images);
      return;
    }

    console.log('☁️ رفع الصور إلى Cloudinary...\n');

    let uploadedCount = 0;
    const batchSize = 5; // رفع 5 صور في كل مجموعة

    for (let i = 0; i < articlesWithBase64Images.length; i += batchSize) {
      const batch = articlesWithBase64Images.slice(i, i + batchSize);
      
      const uploadPromises = batch.map(async (article) => {
        try {
          console.log(`📤 رفع صورة للمقال: ${article.title?.substring(0, 50)}...`);
          
          const base64Image = article.featured_image;
          const imageSize = Math.round(base64Image.length / 1024);
          console.log(`   📏 حجم الصورة: ${imageSize}KB`);

          // رفع الصورة إلى Cloudinary
          const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: 'sabq-cms/featured',
            resource_type: 'image',
            public_id: `article_${article.id}_${Date.now()}`,
            overwrite: false,
            transformation: [
              { width: 800, height: 450, crop: 'fill', quality: 'auto', format: 'auto' }
            ]
          });

          // تحديث المقال في قاعدة البيانات
          await prisma.articles.update({
            where: { id: article.id },
            data: { featured_image: uploadResult.secure_url }
          });

          console.log(`   ✅ تم رفع وتحديث: ${uploadResult.secure_url}`);
          return true;

        } catch (error) {
          console.error(`   ❌ خطأ في رفع صورة المقال ${article.id}:`, error.message);
          
          // في حالة فشل الرفع، استخدم صورة افتراضية
          const categoryName = article.categories?.name || 'default';
          const fallbackImage = getFallbackImage(categoryName);
          
          await prisma.articles.update({
            where: { id: article.id },
            data: { featured_image: fallbackImage }
          });
          
          console.log(`   🔄 تم استخدام صورة افتراضية: ${fallbackImage}`);
          return false;
        }
      });

      const results = await Promise.all(uploadPromises);
      uploadedCount += results.filter(Boolean).length;

      // إظهار التقدم
      console.log(`📈 تم رفع ${uploadedCount} من ${articlesWithBase64Images.length} صورة...\n`);
      
      // توقف قصير بين المجموعات
      if (i + batchSize < articlesWithBase64Images.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n🎉 تمت عملية الإصلاح بنجاح!`);
    console.log(`📊 إحصائيات العملية:`);
    console.log(`   - إجمالي المقالات: ${articlesWithBase64Images.length}`);
    console.log(`   - تم رفعها إلى Cloudinary: ${uploadedCount}`);
    console.log(`   - استخدمت صور افتراضية: ${articlesWithBase64Images.length - uploadedCount}`);

  } catch (error) {
    console.error('❌ خطأ في عملية الإصلاح:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function replaceWithPlaceholders(articlesWithBase64Images) {
  console.log('🔄 استبدال صور Base64 بصور افتراضية...');

  let replacedCount = 0;

  for (const article of articlesWithBase64Images) {
    try {
      const categoryName = article.categories?.name || 'default';
      const fallbackImage = getFallbackImage(categoryName);

      await prisma.articles.update({
        where: { id: article.id },
        data: { featured_image: fallbackImage }
      });

      console.log(`✅ تم استبدال صورة: ${article.title?.substring(0, 50)}...`);
      console.log(`   📸 الصورة الجديدة: ${fallbackImage}`);
      replacedCount++;

    } catch (error) {
      console.error(`❌ خطأ في استبدال صورة المقال ${article.id}:`, error);
    }
  }

  console.log(`\n📊 تم استبدال ${replacedCount} صورة بصور افتراضية`);
}

function getFallbackImage(categoryName) {
  // استخدام صور Cloudinary افتراضية عالية الجودة
  const cloudinaryBase = 'https://res.cloudinary.com/dybhezmvb/image/upload';
  
  const fallbackImages = {
    'محليات': `${cloudinaryBase}/c_fill,w_800,h_450,q_auto,f_auto/v1/sabq-cms/placeholders/saudi_news`,
    'العالم': `${cloudinaryBase}/c_fill,w_800,h_450,q_auto,f_auto/v1/sabq-cms/placeholders/world_news`,
    'رياضة': `${cloudinaryBase}/c_fill,w_800,h_450,q_auto,f_auto/v1/sabq-cms/placeholders/sports_news`,
    'اقتصاد': `${cloudinaryBase}/c_fill,w_800,h_450,q_auto,f_auto/v1/sabq-cms/placeholders/economy_news`,
    'تقنية': `${cloudinaryBase}/c_fill,w_800,h_450,q_auto,f_auto/v1/sabq-cms/placeholders/tech_news`,
    'صحة': `${cloudinaryBase}/c_fill,w_800,h_450,q_auto,f_auto/v1/sabq-cms/placeholders/health_news`,
    'default': `${cloudinaryBase}/c_fill,w_800,h_450,q_auto,f_auto/v1/sabq-cms/placeholders/default_news`
  };

  return fallbackImages[categoryName] || fallbackImages.default;
}

// اختبار اتصال Cloudinary
async function testCloudinaryConnection() {
  try {
    console.log('🔍 اختبار اتصال Cloudinary...');
    
    if (!process.env.CLOUDINARY_CLOUD_NAME && !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      console.log('⚠️ لم يتم تكوين Cloudinary');
      return false;
    }

    const result = await cloudinary.api.ping();
    console.log('✅ اتصال Cloudinary ناجح');
    return true;
  } catch (error) {
    console.log('❌ فشل اتصال Cloudinary:', error.message);
    return false;
  }
}

// تشغيل السكريبت
if (require.main === module) {
  const args = process.argv.slice(2);
  const forceReplace = args.includes('--replace-only');

  console.log('🚀 بدء إصلاح مشكلة الصور...\n');

  if (forceReplace) {
    console.log('⚠️ وضع الاستبدال المباشر: سيتم استبدال جميع صور Base64 بصور افتراضية\n');
  }

  const startProcess = forceReplace ? 
    Promise.resolve(false) : 
    testCloudinaryConnection();

  startProcess
    .then((cloudinaryAvailable) => {
      if (cloudinaryAvailable && !forceReplace) {
        return fixBase64ToCloudinary();
      } else {
        // في حالة عدم توفر Cloudinary أو الوضع المباشر
        return prisma.articles.findMany({
          where: { featured_image: { startsWith: 'data:image/' } },
          select: {
            id: true,
            title: true,
            featured_image: true,
            categories: { select: { name: true } }
          }
        }).then(articles => replaceWithPlaceholders(articles));
      }
    })
    .then(() => {
      console.log('\n✨ انتهت العملية بنجاح! يمكنك الآن تشغيل الموقع ومشاهدة الصور تظهر بشكل صحيح.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 فشل في تشغيل السكريبت:', error);
      process.exit(1);
    });
}

module.exports = { fixBase64ToCloudinary };
