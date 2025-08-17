const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 فحص قاعدة البيانات الحالية...\n');
  
  try {
    // التحقق من DATABASE_URL
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...\n');
    
    // عد السجلات في كل جدول
    const counts = {
      users: await prisma.users.count(),
      articles: await prisma.articles.count(),
      categories: await prisma.categories.count(),
      interactions: await prisma.interactions.count(),
      activityLogs: await prisma.activity_logs.count(),
      deepAnalyses: await prisma.deep_analyses.count(),
    };
    
    console.log('📈 إحصائيات قاعدة البيانات:');
    console.log('------------------------');
    for (const [table, count] of Object.entries(counts)) {
      console.log(`${table}: ${count} سجل`);
    }
    
    // عرض آخر 5 مقالات
    console.log('\n📰 آخر 5 مقالات:');
    console.log('----------------');
    const latestArticles = await prisma.articles.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        created_at: true
      }
    });
    
    latestArticles.forEach(article => {
      console.log(`- [${article.id}] ${article.title.substring(0, 50)}... (${new Date(article.created_at).toLocaleDateString('ar-SA')})`);
    });
    
    // عرض آخر نشاط
    console.log('\n⏰ آخر نشاط:');
    console.log('------------');
    const lastActivity = await prisma.activity_logs.findFirst({
      orderBy: { timestamp: 'desc' }
    });
    
    if (lastActivity) {
      console.log(`النشاط: ${lastActivity.action}`);
      console.log(`التاريخ: ${new Date(lastActivity.timestamp).toLocaleString('ar-SA')}`);
      console.log(`المستخدم: ${lastActivity.user_id}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    console.error('تفاصيل الخطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 