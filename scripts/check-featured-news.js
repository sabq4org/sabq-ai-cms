const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFeaturedNews() {
  try {
    console.log('🔍 فحص الأخبار المميزة...\n');
    
    // جلب جميع الأخبار المميزة
    const featuredArticles = await prisma.articles.findMany({
      where: {
        featured: true,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        featured: true,
        status: true,
        published_at: true,
        created_at: true
      },
      orderBy: {
        published_at: 'desc'
      }
    });
    
    console.log(`📊 عدد الأخبار المميزة المنشورة: ${featuredArticles.length}\n`);
    
    if (featuredArticles.length > 0) {
      console.log('📝 قائمة الأخبار المميزة:');
      featuredArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`   ID: ${article.id}`);
        console.log(`   Slug: ${article.slug || 'لا يوجد'}`);
        console.log(`   تاريخ النشر: ${article.published_at ? new Date(article.published_at).toLocaleString('ar-SA') : 'غير محدد'}`);
      });
      
      // اختبار API
      console.log('\n\n🌐 اختبار API الكاروسيل...');
      const response = await fetch('http://localhost:3002/api/featured-news-carousel');
      const data = await response.json();
      
      console.log(`\n📡 حالة API: ${response.ok ? 'نجح ✅' : 'فشل ❌'}`);
      console.log(`عدد المقالات المرجعة: ${data.articles?.length || 0}`);
      
      if (data.articles && data.articles.length > 0) {
        console.log('\n📰 المقالات في API:');
        data.articles.forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
        });
      }
    } else {
      console.log('⚠️ لا توجد أخبار مميزة منشورة حالياً');
      
      // البحث عن أي أخبار مميزة (حتى غير المنشورة)
      const allFeatured = await prisma.articles.findMany({
        where: { featured: true },
        select: {
          id: true,
          title: true,
          status: true
        }
      });
      
      if (allFeatured.length > 0) {
        console.log(`\n📌 يوجد ${allFeatured.length} خبر مميز ولكن غير منشور:`);
        allFeatured.forEach(article => {
          console.log(`- ${article.title} (الحالة: ${article.status})`);
        });
      }
    }
    
    // فحص آخر 5 أخبار منشورة
    console.log('\n\n📰 آخر 5 أخبار منشورة (للمقارنة):');
    const latestArticles = await prisma.articles.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        featured: true
      },
      orderBy: { published_at: 'desc' },
      take: 5
    });
    
    latestArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} ${article.featured ? '⭐ مميز' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeaturedNews();