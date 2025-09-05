const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFeaturedImages() {
  console.log('🔍 البحث عن المقالات ذات الصور الضخمة...');
  
  try {
    // البحث عن المقالات التي تحتوي على صور base64 ضخمة
    const articlesWithLargeImages = await prisma.articles.findMany({
      where: {
        OR: [
          {
            featured_image: {
              startsWith: 'data:',
            },
          },
          {
            social_image: {
              startsWith: 'data:',
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        featured_image: true,
        social_image: true,
      },
    });

    console.log(`📊 تم العثور على ${articlesWithLargeImages.length} مقالة`);

    for (const article of articlesWithLargeImages) {
      const featuredImageSize = article.featured_image ? article.featured_image.length : 0;
      const socialImageSize = article.social_image ? article.social_image.length : 0;
      
      console.log(`\n📄 المقالة: ${article.title.substring(0, 50)}...`);
      console.log(`   معرف: ${article.id}`);
      console.log(`   حجم الصورة المميزة: ${featuredImageSize.toLocaleString()} حرف`);
      console.log(`   حجم الصورة الاجتماعية: ${socialImageSize.toLocaleString()} حرف`);

      // إصلاح المقالات التي تحتوي على صور أكبر من 10KB
      if (featuredImageSize > 10000 || socialImageSize > 10000) {
        console.log(`   🔧 إصلاح المقالة...`);
        
        await prisma.articles.update({
          where: { id: article.id },
          data: {
            featured_image: featuredImageSize > 10000 ? null : article.featured_image,
            social_image: socialImageSize > 10000 ? null : article.social_image,
          },
        });
        
        console.log(`   ✅ تم الإصلاح`);
      } else {
        console.log(`   ⏭️  تخطي - الحجم مقبول`);
      }
    }

    console.log('\n🎉 تم الانتهاء من إصلاح جميع المقالات!');
    
  } catch (error) {
    console.error('❌ خطأ في الإصلاح:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
if (require.main === module) {
  fixFeaturedImages();
}

module.exports = { fixFeaturedImages };
