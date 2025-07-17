#!/usr/bin/env node

const { PrismaClient } = require('../lib/generated/prisma');

async function checkRecentArticles() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 جاري التحقق من المقالات الحديثة...\n');

    // جلب آخر 10 مقالات
    const recentArticles = await prisma.articles.findMany({
      orderBy: {
        created_at: 'desc'
      },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        created_at: true,
        updated_at: true,
        published_at: true,
        author_id: true
      }
    });

    console.log(`📊 تم العثور على ${recentArticles.length} مقال حديث:\n`);

    recentArticles.forEach((article, index) => {
      const createdTime = new Date(article.created_at).toLocaleString('ar-SA');
      const updatedTime = new Date(article.updated_at).toLocaleString('ar-SA');
      const publishedTime = article.published_at ? new Date(article.published_at).toLocaleString('ar-SA') : 'غير منشور';
      
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   🆔 ID: ${article.id}`);
      console.log(`   📝 الحالة: ${article.status}`);
      console.log(`   👤 المؤلف: ${article.author_id || 'غير محدد'}`);
      console.log(`   📅 تاريخ الإنشاء: ${createdTime}`);
      console.log(`   🔄 آخر تحديث: ${updatedTime}`);
      console.log(`   📰 تاريخ النشر: ${publishedTime}`);
      console.log('');
    });

    // إحصائيات بالحالة
    const statusCounts = await prisma.articles.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log('📈 إحصائيات المقالات بالحالة:');
    statusCounts.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status} مقال`);
    });

    // التحقق من المقالات المنشورة حديثاً (آخر ساعة)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentPublished = await prisma.articles.findMany({
      where: {
        status: 'published',
        OR: [
          { published_at: { gte: oneHourAgo } },
          { updated_at: { gte: oneHourAgo } }
        ]
      },
      orderBy: {
        published_at: 'desc'
      },
      select: {
        id: true,
        title: true,
        published_at: true,
        updated_at: true
      }
    });

    console.log(`\n🚨 المقالات المنشورة في آخر ساعة: ${recentPublished.length}`);
    if (recentPublished.length > 0) {
      recentPublished.forEach((article, index) => {
        const publishedTime = article.published_at ? new Date(article.published_at).toLocaleString('ar-SA') : 'غير محدد';
        console.log(`${index + 1}. ${article.title} - ${publishedTime}`);
      });
    } else {
      console.log('❌ لا توجد مقالات منشورة في آخر ساعة');
    }

  } catch (error) {
    console.error('❌ خطأ في التحقق من المقالات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentArticles(); 