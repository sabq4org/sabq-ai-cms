const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupTestArticles() {
  try {
    console.log('🔍 جلب جميع المقالات...');
    
    const articles = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        article_type: true,
        created_at: true,
        is_opinion_leader: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log('📊 إجمالي المقالات:', articles.length);
    
    console.log('\n📝 قائمة جميع المقالات:');
    articles.forEach((article, index) => {
      const leaderFlag = article.is_opinion_leader ? ' 👑' : '';
      console.log(`${index + 1}. [${article.id}] ${article.title} - ${article.status} - ${article.article_type || 'غير محدد'}${leaderFlag}`);
    });
    
    // البحث عن المقالات الحقيقية (التي تحتوي على 'عبقرية' أو كلمات حقيقية أخرى)
    const realArticles = articles.filter(article => 
      article.title.includes('عبقرية') || 
      article.title.includes('العبقرية') ||
      article.title.includes('الطفولة') ||
      (article.status === 'published' && !article.title.includes('تجريبي') && !article.title.includes('اختبار'))
    );
    
    console.log('\n✅ المقالات الحقيقية التي سيتم الحفاظ عليها:');
    realArticles.forEach(article => {
      const leaderFlag = article.is_opinion_leader ? ' 👑 (قائد رأي اليوم)' : '';
      console.log(`- [${article.id}] ${article.title}${leaderFlag}`);
    });
    
    // المقالات التي سيتم حذفها
    const articlesToDelete = articles.filter(article => 
      !article.title.includes('عبقرية') && 
      !article.title.includes('العبقرية') &&
      !article.title.includes('الطفولة') &&
      (article.title.includes('تجريبي') || 
       article.title.includes('اختبار') ||
       article.title.includes('Test') ||
       article.title.includes('مثال') ||
       article.status === 'draft')
    );
    
    console.log('\n🗑️ المقالات التي سيتم حذفها:');
    articlesToDelete.forEach(article => {
      console.log(`- [${article.id}] ${article.title}`);
    });
    
    if (articlesToDelete.length > 0) {
      console.log(`\n⚠️ سيتم حذف ${articlesToDelete.length} مقال تجريبي...`);
      
      // حذف المقالات التجريبية
      const deleteResult = await prisma.articles.deleteMany({
        where: {
          id: {
            in: articlesToDelete.map(a => a.id)
          }
        }
      });
      
      console.log(`✅ تم حذف ${deleteResult.count} مقال تجريبي بنجاح`);
    } else {
      console.log('\n✅ لا توجد مقالات تجريبية للحذف');
    }
    
    // التأكد من تعيين قائد رأي اليوم للمقال الحقيقي الوحيد
    if (realArticles.length === 1 && !realArticles[0].is_opinion_leader) {
      console.log('\n👑 تعيين المقال الحقيقي كقائد رأي اليوم...');
      
      await prisma.articles.updateMany({
        where: { is_opinion_leader: true },
        data: { is_opinion_leader: false }
      });
      
      await prisma.articles.update({
        where: { id: realArticles[0].id },
        data: { 
          is_opinion_leader: true,
          article_type: 'opinion'
        }
      });
      
      console.log(`✅ تم تعيين "${realArticles[0].title}" كقائد رأي اليوم`);
    }
    
    // عرض النتيجة النهائية
    console.log('\n📊 النتيجة النهائية:');
    const finalArticles = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        article_type: true,
        is_opinion_leader: true
      }
    });
    
    finalArticles.forEach((article, index) => {
      const leaderFlag = article.is_opinion_leader ? ' 👑' : '';
      console.log(`${index + 1}. [${article.id}] ${article.title} - ${article.status} - ${article.article_type}${leaderFlag}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف المقالات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestArticles();