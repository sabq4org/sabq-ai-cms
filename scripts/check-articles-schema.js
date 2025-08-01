/**
 * فحص بنية جدول المقالات وتحديد الأنواع المتاحة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    console.log('🔍 فحص بنية جدول المقالات...\n');
    
    // فحص عينة من المقالات لمعرفة الحقول المتاحة
    const sampleArticles = await prisma.articles.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        article_type: true,
        author_id: true,
        category_id: true,
        created_at: true,
        published_at: true,
        views: true,
        metadata: true
      }
    });
    
    console.log('📋 عينة من المقالات:');
    sampleArticles.forEach((article, index) => {
      console.log(`  ${index + 1}.`);
      console.log(`     ID: ${article.id}`);
      console.log(`     العنوان: ${article.title}`);
      console.log(`     الحالة: ${article.status}`);
      console.log(`     نوع المقال (article_type): ${article.article_type || 'غير محدد'}`);
      console.log(`     التصنيف: ${article.category_id || 'غير مصنف'}`);
      console.log(`     المشاهدات: ${article.views || 0}`);
      console.log('');
    });
    
    // إحصائيات article_type إذا كان موجوداً
    try {
      const articleTypeStats = await prisma.articles.groupBy({
        by: ['article_type'],
        _count: {
          id: true
        }
      });
      
      console.log('\n📊 إحصائيات أنواع المقالات (article_type):');
      articleTypeStats.forEach(stat => {
        console.log(`  ${stat.article_type || 'null'}: ${stat._count.id} مقال`);
      });
    } catch (error) {
      console.log('❌ حقل article_type غير موجود في قاعدة البيانات');
    }
    
    // إحصائيات الحالات
    const statusStats = await prisma.articles.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📊 إحصائيات الحالات (status):');
    statusStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count.id} مقال`);
    });
    
    // فحص المقالات التجريبية
    const testArticles = await prisma.articles.findMany({
      where: {
        OR: [
          { title: { contains: 'test', mode: 'insensitive' } },
          { title: { contains: 'تجربة', mode: 'insensitive' } },
          { title: { contains: 'demo', mode: 'insensitive' } },
          { title: { contains: 'example', mode: 'insensitive' } },
          { title: { contains: 'مقال', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        article_type: true,
        views: true,
        created_at: true
      }
    });
    
    console.log(`\n🧪 المقالات التجريبية المكتشفة: ${testArticles.length}`);
    testArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
      console.log(`     الحالة: ${article.status}`);
      console.log(`     النوع: ${article.article_type || 'غير محدد'}`);
      console.log(`     المشاهدات: ${article.views || 0}`);
      console.log('');
    });
    
    // توصيات للتنظيف
    console.log('💡 توصيات التصحيح:');
    
    if (testArticles.length > 0) {
      console.log(`  1. يوجد ${testArticles.length} مقال تجريبي يحتاج أرشفة أو حذف`);
    }
    
    // فحص المقالات بدون نوع محدد
    const articlesWithoutType = await prisma.articles.count({
      where: {
        article_type: null
      }
    });
    
    if (articlesWithoutType > 0) {
      console.log(`  2. يوجد ${articlesWithoutType} مقال بدون نوع محدد`);
    }
    
    // مقترح حل للفصل
    console.log('\n🔧 مقترح الحل للفصل بين الأخبار والمقالات:');
    console.log('  1. إضافة فلتر article_type = "news" لصفحة إدارة الأخبار');
    console.log('  2. تحديد نوع المحتوى عند الإنشاء');
    console.log('  3. أرشفة المقالات التجريبية');
    console.log('  4. تصحيح المصطلحات في واجهة الأخبار');
    console.log('  5. فصل المقالات (opinion/analysis/interview) عن الأخبار (news)');
    
  } catch (error) {
    console.error('❌ خطأ في فحص البنية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();