const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseHealth() {
  console.log('🔍 فحص صحة قاعدة البيانات...\n');
  
  try {
    // فحص الاتصال
    await prisma.$connect();
    console.log('✅ الاتصال بقاعدة البيانات نجح');
    
    // جلب الإحصائيات
    const stats = {
      articles: await prisma.articles.count(),
      categories: await prisma.categories.count(),
      article_authors: await prisma.article_authors.count(),
      users: await prisma.users.count(),
      tags: await prisma.tags.count(),
      comments: await prisma.comments.count()
    };
    
    console.log('\n📊 إحصائيات قاعدة البيانات:');
    console.log('--------------------------------');
    Object.entries(stats).forEach(([table, count]) => {
      const emoji = count > 0 ? '✅' : '⚠️';
      console.log(`${emoji} ${table}: ${count} سجل`);
    });
    
    // فحص البيانات المفقودة
    console.log('\n🔍 فحص البيانات المفقودة:');
    console.log('--------------------------------');
    
    // مقالات بدون مؤلف
    const articlesWithoutAuthor = await prisma.articles.count({
      where: { author_id: null }
    });
    console.log(`${articlesWithoutAuthor > 0 ? '⚠️' : '✅'} مقالات بدون مؤلف: ${articlesWithoutAuthor}`);
    
    // مقالات بدون تصنيف
    const articlesWithoutCategory = await prisma.articles.count({
      where: { categoryId: null }
    });
    console.log(`${articlesWithoutCategory > 0 ? '⚠️' : '✅'} مقالات بدون تصنيف: ${articlesWithoutCategory}`);
    
    // تصنيفات نشطة
    const activeCategories = await prisma.categories.count({
      where: { is_active: true }
    });
    console.log(`✅ تصنيفات نشطة: ${activeCategories}`);
    
    // آخر 5 مقالات
    console.log('\n📰 آخر 5 مقالات:');
    console.log('--------------------------------');
    const latestArticles = await prisma.articles.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        created_at: true,
        author: { select: { name: true } },
        category: { select: { name: true } }
      }
    });
    
    latestArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   المؤلف: ${article.author?.name || 'غير محدد'}`);
      console.log(`   التصنيف: ${article.category?.name || 'غير محدد'}`);
      console.log(`   التاريخ: ${article.created_at.toLocaleDateString('ar-SA')}\n`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:');
    console.error(error.message);
    
    if (error.message.includes('P1001')) {
      console.log('\n💡 تأكد من:');
      console.log('1. DATABASE_URL صحيح في ملف .env');
      console.log('2. الخادم يمكنه الوصول لقاعدة البيانات');
      console.log('3. Supabase يقبل الاتصالات من IP الخاص بك');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseHealth(); 