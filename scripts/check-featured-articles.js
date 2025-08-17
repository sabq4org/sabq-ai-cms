// سكريبت للتحقق من الأخبار المميزة في قاعدة البيانات
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFeaturedArticles() {
  try {
    console.log('🔍 جاري البحث عن الأخبار المميزة...');
    
    // البحث عن الأخبار المميزة
    const featuredArticles = await prisma.articles.findMany({
      where: {
        featured: true
      },
      select: {
        id: true,
        title: true,
        status: true,
        featured: true,
        published_at: true,
        updated_at: true
      },
      orderBy: [
        { updated_at: 'desc' },
        { published_at: 'desc' }
      ]
    });
    
    console.log(`✅ تم العثور على ${featuredArticles.length} خبر مميز:`);
    console.log(JSON.stringify(featuredArticles, null, 2));
    
    // التحقق من الخبر المميز الذي سيظهر في الواجهة
    const activeArticle = await prisma.articles.findFirst({
      where: {
        featured: true,
        status: 'published',
        published_at: {
          lte: new Date()
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        featured: true,
        published_at: true,
        updated_at: true
      },
      orderBy: [
        { updated_at: 'desc' },
        { published_at: 'desc' }
      ]
    });
    
    if (activeArticle) {
      console.log('✅ الخبر المميز الذي سيظهر في الواجهة:');
      console.log(JSON.stringify(activeArticle, null, 2));
    } else {
      console.log('❌ لا يوجد خبر مميز مؤهل للظهور في الواجهة');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تنفيذ الفحص
checkFeaturedArticles();