#!/usr/bin/env node
/**
 * استعادة الصور المحذوفة خطأً وإضافة صور بديلة مناسبة
 * للمقالات التي فقدت صورها أثناء عملية التنظيف
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// صور بديلة متنوعة حسب الفئة
const categoryImages = {
  'politics': 'https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/categories/politics.jpg',
  'sports': 'https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/categories/sports.jpg',
  'economy': 'https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/categories/economy.jpg',
  'technology': 'https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/categories/technology.jpg',
  'health': 'https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/categories/health.jpg',
  'education': 'https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/categories/education.jpg',
  'culture': 'https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/categories/culture.jpg',
  'local': 'https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/categories/local.jpg',
  'international': 'https://res.cloudinary.com/dybhezmvb/image/upload/v1700000000/sabq-cms/categories/international.jpg',
  'default': 'https://ui-avatars.com/api/?name=سبق&background=1E40AF&color=fff&size=800&font-size=0.33&rounded=false'
};

// صور Unsplash عالية الجودة كبدائل
const unsplashImages = [
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80'
];

async function restoreImages() {
  try {
    console.log('🔍 البحث عن المقالات بدون صور...');

    // العثور على المقالات بدون صور أو بصور null
    const articlesWithoutImages = await prisma.articles.findMany({
      where: {
        OR: [
          { featured_image: null },
          { featured_image: '' },
          { social_image: null },
          { social_image: '' }
        ],
        status: 'published'
      },
      include: {
        categories: true
      },
      take: 100 // معالجة 100 مقال في المرة الواحدة
    });

    console.log(`📊 تم العثور على ${articlesWithoutImages.length} مقال بحاجة لصور`);

    let updatedCount = 0;

    for (const article of articlesWithoutImages) {
      try {
        // تحديد الصورة المناسبة بناءً على الفئة
        let imageUrl = categoryImages.default;
        
        if (article.categories && article.categories.length > 0) {
          const categorySlug = article.categories[0].slug?.toLowerCase();
          imageUrl = categoryImages[categorySlug] || categoryImages.default;
        } else {
          // استخدام صورة عشوائية من Unsplash للمقالات بدون فئة
          const randomIndex = Math.floor(Math.random() * unsplashImages.length);
          imageUrl = unsplashImages[randomIndex];
        }

        // تحديث المقال
        await prisma.articles.update({
          where: { id: article.id },
          data: {
            featured_image: article.featured_image || imageUrl,
            social_image: article.social_image || imageUrl,
            updated_at: new Date()
          }
        });

        updatedCount++;
        
        if (updatedCount % 10 === 0) {
          console.log(`📝 تم تحديث ${updatedCount} مقال...`);
        }

      } catch (err) {
        console.error(`❌ خطأ في تحديث المقال ${article.id}:`, err.message);
      }
    }

    console.log(`🎉 تم تحديث ${updatedCount} مقال بنجاح!`);

    // إحصائيات نهائية
    const totalArticles = await prisma.articles.count({ where: { status: 'published' } });
    const articlesWithImages = await prisma.articles.count({
      where: {
        status: 'published',
        featured_image: { not: null },
        featured_image: { not: '' }
      }
    });

    console.log(`📈 إحصائيات نهائية:`);
    console.log(`   إجمالي المقالات: ${totalArticles}`);
    console.log(`   المقالات بصور: ${articlesWithImages}`);
    console.log(`   نسبة التغطية: ${((articlesWithImages / totalArticles) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ خطأ في العملية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تحديث المقالات المميزة خصيصاً
async function updateFeaturedArticles() {
  try {
    console.log('⭐ تحديث المقالات المميزة...');

    const featuredArticles = await prisma.articles.findMany({
      where: {
        featured: true,
        status: 'published',
        OR: [
          { featured_image: null },
          { featured_image: '' }
        ]
      },
      take: 20
    });

    console.log(`🌟 تم العثور على ${featuredArticles.length} مقال مميز بحاجة لصور`);

    for (let i = 0; i < featuredArticles.length; i++) {
      const article = featuredArticles[i];
      
      // صور مميزة عالية الجودة للمقالات المميزة
      const premiumImages = [
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=675&fit=crop&crop=entropy&auto=format&q=80',
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=675&fit=crop&crop=entropy&auto=format&q=80',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=675&fit=crop&crop=entropy&auto=format&q=80',
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=675&fit=crop&crop=entropy&auto=format&q=80'
      ];

      const imageUrl = premiumImages[i % premiumImages.length];

      await prisma.articles.update({
        where: { id: article.id },
        data: {
          featured_image: imageUrl,
          social_image: imageUrl,
          updated_at: new Date()
        }
      });

      console.log(`✨ تم تحديث المقال المميز: ${article.title?.substring(0, 50)}...`);
    }

  } catch (error) {
    console.error('❌ خطأ في تحديث المقالات المميزة:', error);
  }
}

// تشغيل السكريبت
async function main() {
  console.log('🚀 بدء عملية استعادة الصور...\n');
  
  await updateFeaturedArticles();
  console.log('');
  await restoreImages();
  
  console.log('\n✅ انتهت عملية استعادة الصور بنجاح!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { restoreImages, updateFeaturedArticles };
