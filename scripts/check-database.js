const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  console.log('🔍 فحص حالة قاعدة البيانات...');
  
  try {
    const prisma = new PrismaClient();
    
    // فحص الاتصال
    await prisma.$connect();
    console.log('✅ الاتصال بقاعدة البيانات نجح');
    
    // فحص الجداول
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `;
    
    console.log(`📊 عدد الجداول: ${tables.length}`);
    tables.forEach(table => console.log(`   - ${table.tablename}`));
    
    // فحص البيانات
    if (tables.some(t => t.tablename === 'articles')) {
      const articleCount = await prisma.articles.count();
      console.log(`📰 عدد المقالات: ${articleCount}`);
    }
    
    if (tables.some(t => t.tablename === 'categories')) {
      const categoryCount = await prisma.categories.count();
      console.log(`📂 عدد الأقسام: ${categoryCount}`);
    }
    
    await prisma.$disconnect();
    console.log('✅ فحص قاعدة البيانات مكتمل');
    
  } catch (error) {
    console.error('❌ خطأ في قاعدة البيانات:', error.message);
    process.exit(1);
  }
}

checkDatabase();
