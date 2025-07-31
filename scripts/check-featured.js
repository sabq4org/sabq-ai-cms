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
      
      // التحقق من السبب
      console.log('\n🔍 تحليل الأسباب المحتملة:');
      
      // التحقق من وجود أخبار بحالة published
      const publishedCount = await prisma.articles.count({
        where: {
          status: 'published'
        }
      });
      console.log(`📊 عدد الأخبار المنشورة: ${publishedCount}`);
      
      // التحقق من وجود أخبار مميزة بحالة غير published
      const nonPublishedFeatured = await prisma.articles.findMany({
        where: {
          featured: true,
          NOT: {
            status: 'published'
          }
        },
        select: {
          id: true,
          title: true,
          status: true
        }
      });
      
      if (nonPublishedFeatured.length > 0) {
        console.log('⚠️ أخبار مميزة غير منشورة:');
        console.log(JSON.stringify(nonPublishedFeatured, null, 2));
      }
      
      // التحقق من وجود أخبار مميزة بتاريخ نشر مستقبلي
      const futureFeatured = await prisma.articles.findMany({
        where: {
          featured: true,
          status: 'published',
          published_at: {
            gt: new Date()
          }
        },
        select: {
          id: true,
          title: true,
          published_at: true
        }
      });
      
      if (futureFeatured.length > 0) {
        console.log('⏰ أخبار مميزة بتاريخ نشر مستقبلي:');
        console.log(JSON.stringify(futureFeatured, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تنفيذ الفحص
checkFeaturedArticles();