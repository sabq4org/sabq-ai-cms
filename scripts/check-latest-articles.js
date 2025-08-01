const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestArticles() {
  try {
    console.log('🔍 فحص أحدث المقالات...');
    
    // أحدث 5 مقالات عامة
    const latestArticles = await prisma.articles.findMany({
      take: 5,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        published_at: true,
        created_at: true,
        category_id: true
      }
    });
    
    console.log('\n📰 أحدث 5 مقالات في قاعدة البيانات:');
    latestArticles.forEach((article, index) => {
      console.log(`${index + 1}. "${article.title}"`);
      console.log(`   الحالة: ${article.status || 'غير محدد'} | منشور: ${article.published_at ? 'نعم' : 'لا'}`);
      console.log(`   التصنيف: ${article.category_id || 'غير محدد'}`);
      console.log(`   الرابط: /article/${article.slug || article.id}`);
      console.log(`   التاريخ: ${article.created_at.toISOString().split('T')[0]}`);
      console.log('');
    });
    
    // فحص المقالات المنشورة فقط
    const publishedCount = await prisma.articles.count({
      where: {
        published_at: {
          not: null
        }
      }
    });
    
    console.log(`📊 إجمالي المقالات المنشورة: ${publishedCount}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestArticles();
