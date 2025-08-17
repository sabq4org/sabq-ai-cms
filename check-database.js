// دعنا نستخدم المسار المباشر للإصدار المولد
let PrismaClient;
try {
  PrismaClient = require('./lib/generated/prisma').PrismaClient;
} catch {
  try {
    PrismaClient = require('@prisma/client').PrismaClient;
  } catch {
    console.log('❌ لا يمكن تحميل Prisma Client');
    process.exit(1);
  }
}

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 فحص جدول deep_analyses...');
    
    const count = await prisma.deep_analyses.count();
    console.log(`📊 عدد التحليلات في قاعدة البيانات: ${count}`);
    
    if (count > 0) {
      const sample = await prisma.deep_analyses.findFirst({
        select: {
          id: true,
          ai_summary: true,
          key_topics: true,
          metadata: true,
          analyzed_at: true
        }
      });
      
      console.log('📝 مثال على تحليل موجود:');
      console.log(JSON.stringify(sample, null, 2));
    } else {
      console.log('⚠️ لا توجد تحليلات في قاعدة البيانات');
    }
    
    // فحص جدول articles أيضاً
    const articlesCount = await prisma.articles?.count?.() || 0;
    console.log(`📰 عدد المقالات في قاعدة البيانات: ${articlesCount}`);
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
