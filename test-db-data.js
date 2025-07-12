const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function testDatabaseData() {
  try {
    console.log('🔍 اختبار الاتصال بقاعدة البيانات...');
    
    // اختبار الاتصال
    await prisma.$connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    
    // عد التصنيفات
    const categoriesCount = await prisma.categories.count();
    console.log(`📁 عدد التصنيفات: ${categoriesCount}`);
    
    // عد المقالات
    const articlesCount = await prisma.articles.count();
    console.log(`📄 عدد المقالات: ${articlesCount}`);
    
    // عرض التصنيفات
    const categories = await prisma.categories.findMany({
      take: 10,
      orderBy: { created_at: 'desc' }
    });
    
    console.log('\n📁 التصنيفات الموجودة:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.id}) - نشط: ${cat.is_active}`);
    });
    
    // عرض المقالات
    const articles = await prisma.articles.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: {
        categories: true
      }
    });
    
    console.log('\n📄 المقالات الموجودة:');
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} - حالة: ${article.status} - تصنيف: ${article.categories?.name || 'غير محدد'}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseData(); 