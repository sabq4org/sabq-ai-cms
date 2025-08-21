// البحث عن المقالات الحديثة
const { PrismaClient } = require('@prisma/client');

async function findRecentArticles() {
  const prisma = new PrismaClient();
  
  try {
    // البحث عن آخر 5 مقالات
    const articles = await prisma.articles.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        created_at: true
      }
    });

    console.log(`🔍 عدد المقالات الموجودة: ${articles.length}`);
    
    if (articles.length === 0) {
      console.log('❌ لا توجد مقالات في قاعدة البيانات');
      return;
    }

    console.log('\n📋 آخر المقالات:');
    articles.forEach((article, index) => {
      console.log(`\n${index + 1}. المقال ${article.id}:`);
      console.log(`   العنوان: ${article.title || 'بدون عنوان'}`);
      console.log(`   الحالة: ${article.status}`);
      console.log(`   التاريخ: ${article.created_at}`);
      console.log(`   المحتوى: ${article.content ? `موجود (${article.content.length} حرف)` : 'غير موجود'}`);
      
      if (article.content && article.content.includes('<img')) {
        console.log(`   🖼️ يحتوي على صور!`);
      }
    });

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findRecentArticles();
