/**
 * فحص نوع المقال الأخير المنشور
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('🔍 فحص نوع المقال الأخير المنشور...\n');

async function checkLatestArticle() {
  try {
    // جلب آخر 5 مقالات منشورة
    const latestArticles = await prisma.articles.findMany({
      where: {
        status: 'published'
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        article_type: true,
        status: true,
        created_at: true,
        published_at: true
      }
    });

    console.log('📊 آخر 5 مقالات منشورة:');
    console.log('=====================================');
    
    latestArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   🏷️  النوع: ${article.article_type}`);
      console.log(`   📅 تاريخ الإنشاء: ${article.created_at}`);
      console.log(`   📅 تاريخ النشر: ${article.published_at}`);
      console.log(`   ✅ الحالة: ${article.status}`);
      console.log(`   🆔 المعرف: ${article.id}`);
      console.log('');
    });

    // إحصائيات أنواع المقالات
    console.log('📊 إحصائيات أنواع المقالات:');
    console.log('=====================================');
    
    const typeStats = await prisma.articles.groupBy({
      by: ['article_type'],
      where: {
        status: 'published'
      },
      _count: {
        id: true
      }
    });

    typeStats.forEach(stat => {
      console.log(`🏷️  ${stat.article_type || 'غير محدد'}: ${stat._count.id} مقال`);
    });

    console.log('\n💡 ملاحظات:');
    console.log('- إذا كان المقال الأخير نوعه "opinion" فهذا سبب عدم ظهوره في الأخبار');
    console.log('- APIs الأخبار تستبعد مقالات نوع "opinion", "analysis", "interview"');
    console.log('- المقالات التي نوعها "news" أو null تظهر في الأخبار');
    
  } catch (error) {
    console.error('❌ خطأ في فحص المقالات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestArticle();