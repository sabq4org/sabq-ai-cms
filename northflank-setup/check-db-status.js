const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 فحص حالة قاعدة البيانات...\n');
  
  try {
    // 1. اختبار الاتصال
    console.log('📡 اختبار الاتصال...');
    await prisma.$connect();
    console.log('✅ الاتصال ناجح\n');
    
    // 2. فحص الجداول
    console.log('📋 فحص الجداول الموجودة...');
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    if (tables.length === 0) {
      console.log('❌ لا توجد جداول - تحتاج لتشغيل migrations\n');
      console.log('🔧 الحل: شغّل الأمر التالي:');
      console.log('   npx prisma db push\n');
      return;
    }
    
    console.log(`✅ عدد الجداول: ${tables.length}`);
    const tableNames = tables.map(t => t.tablename);
    console.log('📊 الجداول:', tableNames.join(', '));
    
    // 3. فحص البيانات الأساسية
    console.log('\n📈 إحصائيات البيانات:');
    
    // فحص المستخدمين
    if (tableNames.includes('users')) {
      const userCount = await prisma.users.count();
      console.log(`👥 المستخدمون: ${userCount}`);
    }
    
    // فحص التصنيفات
    if (tableNames.includes('categories')) {
      const categoryCount = await prisma.categories.count();
      console.log(`📁 التصنيفات: ${categoryCount}`);
      
      if (categoryCount === 0) {
        console.log('   ⚠️ لا توجد تصنيفات - شغّل seed-basic-data.js');
      }
    }
    
    // فحص المقالات
    if (tableNames.includes('articles')) {
      const totalArticles = await prisma.articles.count();
      const publishedArticles = await prisma.articles.count({
        where: { status: 'published' }
      });
      const featuredArticles = await prisma.articles.count({
        where: { status: 'published', featured: true }
      });
      
      console.log(`📰 المقالات الكلية: ${totalArticles}`);
      console.log(`   - منشورة: ${publishedArticles}`);
      console.log(`   - مميزة: ${featuredArticles}`);
      
      if (publishedArticles === 0) {
        console.log('   ⚠️ لا توجد مقالات منشورة - شغّل seed-basic-data.js');
      }
    }
    
    console.log('\n✅ فحص قاعدة البيانات مكتمل');
    
  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n🔧 الحل: الجداول غير موجودة');
      console.log('   1. شغّل: npx prisma db push');
      console.log('   2. ثم: node northflank-setup/seed-basic-data.js');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
checkDatabase();
