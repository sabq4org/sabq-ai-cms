const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMoreFeaturedNews() {
  try {
    console.log('🌟 إضافة المزيد من الأخبار المميزة...\n');
    
    // جلب آخر 3 أخبار منشورة غير مميزة
    const latestArticles = await prisma.articles.findMany({
      where: {
        status: 'published',
        featured: false
      },
      select: {
        id: true,
        title: true
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 2
    });
    
    if (latestArticles.length === 0) {
      console.log('⚠️ لا توجد أخبار غير مميزة لإضافتها');
      return;
    }
    
    console.log(`📰 سيتم تمييز ${latestArticles.length} خبر:\n`);
    
    // تحديث الأخبار لتصبح مميزة
    for (const article of latestArticles) {
      await prisma.articles.update({
        where: { id: article.id },
        data: { featured: true }
      });
      
      console.log(`✅ تم تمييز: ${article.title}`);
    }
    
    // عرض الأخبار المميزة الحالية
    console.log('\n\n📊 الأخبار المميزة الحالية:');
    const featuredArticles = await prisma.articles.findMany({
      where: {
        featured: true,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        published_at: true
      },
      orderBy: {
        published_at: 'desc'
      }
    });
    
    featuredArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
    });
    
    console.log(`\n✨ إجمالي الأخبار المميزة: ${featuredArticles.length}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreFeaturedNews();