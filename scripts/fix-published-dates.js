#!/usr/bin/env node

const { PrismaClient } = require('../lib/generated/prisma');

async function fixPublishedDates() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 بدء إصلاح تواريخ النشر للمقالات...\n');

    // العثور على المقالات المنشورة بدون تاريخ نشر
    const articlesWithoutPublishedDate = await prisma.articles.findMany({
      where: {
        status: 'published',
        published_at: null
      },
      select: {
        id: true,
        title: true,
        created_at: true,
        updated_at: true
      }
    });

    console.log(`📊 تم العثور على ${articlesWithoutPublishedDate.length} مقال منشور بدون تاريخ نشر`);

    if (articlesWithoutPublishedDate.length === 0) {
      console.log('✅ جميع المقالات المنشورة لها تواريخ نشر صحيحة');
      return;
    }

    console.log('\n📝 المقالات التي ستُصلح:');
    articlesWithoutPublishedDate.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title.substring(0, 80)}...`);
      console.log(`   📅 تاريخ الإنشاء: ${article.created_at.toLocaleString('ar-SA')}`);
      console.log(`   🔄 آخر تحديث: ${article.updated_at.toLocaleString('ar-SA')}`);
    });

    console.log('\n🛠️ بدء الإصلاح...');

    // تحديث المقالات لتستخدم تاريخ آخر تحديث كتاريخ نشر
    const updateResults = await Promise.all(
      articlesWithoutPublishedDate.map(async (article) => {
        try {
          const updated = await prisma.articles.update({
            where: { id: article.id },
            data: {
              published_at: article.updated_at // استخدام تاريخ آخر تحديث
            }
          });
          return { success: true, article };
        } catch (error) {
          return { success: false, article, error };
        }
      })
    );

    // عرض النتائج
    const successful = updateResults.filter(r => r.success);
    const failed = updateResults.filter(r => !r.success);

    console.log(`\n✅ تم إصلاح ${successful.length} مقال بنجاح`);
    
    if (failed.length > 0) {
      console.log(`❌ فشل إصلاح ${failed.length} مقال:`);
      failed.forEach(({ article, error }) => {
        console.log(`   - ${article.title}: ${error.message}`);
      });
    }

    // التحقق النهائي
    const remainingArticles = await prisma.articles.count({
      where: {
        status: 'published',
        published_at: null
      }
    });

    if (remainingArticles === 0) {
      console.log('\n🎉 تم إصلاح جميع المقالات بنجاح!');
      
      // مسح الكاش بعد الإصلاح
      console.log('\n🧹 مسح الكاش بعد الإصلاح...');
      try {
        // محاولة مسح الكاش محلياً
        const { cache } = require('../lib/redis-improved');
        await cache.clearPattern('articles:*');
        console.log('✅ تم مسح الكاش المحلي');
      } catch (cacheError) {
        console.log('⚠️ لم يتم مسح الكاش المحلي:', cacheError.message);
      }
      
    } else {
      console.log(`\n⚠️ لا يزال هناك ${remainingArticles} مقال يحتاج إصلاح`);
    }

  } catch (error) {
    console.error('❌ خطأ في إصلاح تواريخ النشر:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPublishedDates(); 