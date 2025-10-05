const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickCheck() {
  console.log('🔍 فحص سريع لقاعدة البيانات...\n');
  
  try {
    // فحص الاتصال
    await prisma.$connect();
    console.log('✅ الاتصال بقاعدة البيانات نجح\n');
    
    // فحص بسيط للجداول الرئيسية
    console.log('📊 إحصائيات الجداول الرئيسية:');
    console.log('--------------------------------');
    
    try {
      const articlesCount = await prisma.articles.count();
      console.log(`✅ المقالات: ${articlesCount} مقال`);
    } catch (e) {
      console.log(`❌ خطأ في عد المقالات: ${e.message}`);
    }
    
    try {
      const categoriesCount = await prisma.categories.count();
      console.log(`✅ التصنيفات: ${categoriesCount} تصنيف`);
    } catch (e) {
      console.log(`❌ خطأ في عد التصنيفات: ${e.message}`);
    }
    
    try {
      const usersCount = await prisma.users.count();
      console.log(`✅ المستخدمون: ${usersCount} مستخدم`);
    } catch (e) {
      console.log(`❌ خطأ في عد المستخدمين: ${e.message}`);
    }
    
    try {
      const tagsCount = await prisma.tags.count();
      console.log(`✅ العلامات: ${tagsCount} علامة`);
    } catch (e) {
      console.log(`❌ خطأ في عد العلامات: ${e.message}`);
    }
    
    // فحص آخر مقال
    console.log('\n📰 آخر مقال:');
    console.log('--------------------------------');
    try {
      const latestArticle = await prisma.articles.findFirst({
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          created_at: true,
          status: true
        }
      });
      
      if (latestArticle) {
        console.log(`العنوان: ${latestArticle.title}`);
        console.log(`التاريخ: ${latestArticle.created_at.toLocaleDateString('ar-SA')}`);
        console.log(`الحالة: ${latestArticle.status}`);
      } else {
        console.log('لا توجد مقالات');
      }
    } catch (e) {
      console.log(`❌ خطأ في جلب آخر مقال: ${e.message}`);
    }
    
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

quickCheck();
