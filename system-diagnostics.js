const { PrismaClient } = require('@prisma/client');

async function systemDiagnostics() {
  console.log('🔍 بدء التشخيص الشامل للنظام...');
  console.log('=' .repeat(60));
  
  // 1. فحص حالة قاعدة البيانات
  try {
    console.log('\n📊 1. فحص الاتصال بقاعدة البيانات:');
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    const startTime = Date.now();
    await prisma.$connect();
    const connectTime = Date.now() - startTime;
    console.log(`✅ الاتصال ناجح في ${connectTime}ms`);
    
    // اختبار استعلام بسيط
    const queryStart = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const queryTime = Date.now() - queryStart;
    console.log(`✅ استعلام بسيط: ${queryTime}ms`);
    
    // فحص Pool connections
    const poolInfo = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;
    console.log('📈 معلومات Pool:', poolInfo);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log('❌ خطأ في الاتصال:', error.message);
  }
  
  // 2. فحص متغيرات البيئة
  console.log('\n🔧 2. فحص متغيرات البيئة:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'موجود' : 'مفقود'}`);
  console.log(`- Database Host: ${process.env.DATABASE_URL?.match(/@([^:]+)/)?.[1] || 'غير محدد'}`);
  
  // 3. فحص الذاكرة والموارد
  console.log('\n💾 3. فحص الموارد:');
  const memUsage = process.memoryUsage();
  console.log(`- RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
  console.log(`- Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
  console.log(`- Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
  console.log(`- External: ${Math.round(memUsage.external / 1024 / 1024)} MB`);
  
  // 4. اختبار الحمولة
  console.log('\n⚡ 4. اختبار الحمولة (10 استعلامات متتالية):');
  try {
    const prisma = new PrismaClient();
    const times = [];
    
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await prisma.articles.count();
      const time = Date.now() - start;
      times.push(time);
      console.log(`  ${i + 1}. ${time}ms`);
    }
    
    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    console.log(`📊 متوسط الوقت: ${Math.round(avgTime)}ms`);
    console.log(`📊 أقصى وقت: ${maxTime}ms`);
    console.log(`📊 أقل وقت: ${minTime}ms`);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log('❌ خطأ في اختبار الحمولة:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ انتهاء التشخيص');
}

systemDiagnostics().catch(console.error);
