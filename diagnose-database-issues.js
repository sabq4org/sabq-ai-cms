// تشخيص مشاكل قاعدة البيانات المتقدم
const { PrismaClient } = require('@prisma/client');

async function diagnoseDatabaseIssues() {
  console.log('🔍 تشخيص متقدم لمشاكل قاعدة البيانات...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
  });
  
  try {
    // 1. اختبار الاتصال المتعدد
    console.log('🔗 اختبار الاتصالات المتعددة...');
    const connections = [];
    for (let i = 0; i < 5; i++) {
      try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const duration = Date.now() - start;
        connections.push(duration);
        console.log(`  اتصال ${i + 1}: ${duration}ms`);
      } catch (e) {
        console.log(`  اتصال ${i + 1}: ❌ فشل - ${e.message}`);
      }
    }
    
    const avgTime = connections.reduce((a, b) => a + b, 0) / connections.length;
    console.log(`📊 متوسط زمن الاستجابة: ${avgTime.toFixed(2)}ms\n`);
    
    // 2. اختبار Connection Pool
    console.log('🏊 اختبار Connection Pool...');
    try {
      const poolInfo = await prisma.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) filter (where state = 'active') as active_connections,
          count(*) filter (where state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
      console.log('✅ معلومات الاتصالات:', poolInfo);
    } catch (e) {
      console.log('⚠️ لا يمكن الحصول على معلومات Connection Pool:', e.message);
    }
    
    // 3. اختبار الاستعلامات الثقيلة
    console.log('\n⚡ اختبار الاستعلامات الثقيلة...');
    
    const heavyQueries = [
      {
        name: 'جلب المقالات مع التصنيفات',
        query: () => prisma.articles.findMany({
          take: 10,
          include: { categories: true, author: true }
        })
      },
      {
        name: 'عد المقالات حسب الحالة',
        query: () => prisma.articles.groupBy({
          by: ['status'],
          _count: { status: true }
        })
      },
      {
        name: 'البحث في المقالات',
        query: () => prisma.articles.findMany({
          where: {
            OR: [
              { title: { contains: 'السعودية' } },
              { content: { contains: 'السعودية' } }
            ]
          },
          take: 5
        })
      }
    ];
    
    for (const { name, query } of heavyQueries) {
      try {
        const start = Date.now();
        const result = await query();
        const duration = Date.now() - start;
        console.log(`  ✅ ${name}: ${duration}ms (${Array.isArray(result) ? result.length : 'N/A'} نتيجة)`);
      } catch (e) {
        console.log(`  ❌ ${name}: فشل - ${e.message}`);
      }
    }
    
    // 4. اختبار العمليات المتزامنة
    console.log('\n🔄 اختبار العمليات المتزامنة...');
    try {
      const start = Date.now();
      const [users, articles, categories] = await Promise.all([
        prisma.users.count(),
        prisma.articles.count(),
        prisma.categories.count()
      ]);
      const duration = Date.now() - start;
      console.log(`✅ العمليات المتزامنة: ${duration}ms`);
      console.log(`   - المستخدمون: ${users}`);
      console.log(`   - المقالات: ${articles}`);
      console.log(`   - الفئات: ${categories}`);
    } catch (e) {
      console.log(`❌ العمليات المتزامنة فشلت: ${e.message}`);
    }
    
    // 5. اختبار الذاكرة والأداء
    console.log('\n💾 اختبار استهلاك الذاكرة...');
    const memBefore = process.memoryUsage();
    
    // عملية كثيفة الاستخدام للذاكرة
    try {
      const largeDataset = await prisma.articles.findMany({
        include: {
          categories: true,
          author: true,
          comments: { take: 5 }
        }
      });
      
      const memAfter = process.memoryUsage();
      const memDiff = {
        rss: (memAfter.rss - memBefore.rss) / 1024 / 1024,
        heapUsed: (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024,
        heapTotal: (memAfter.heapTotal - memBefore.heapTotal) / 1024 / 1024
      };
      
      console.log(`✅ تم جلب ${largeDataset.length} مقال مع البيانات المرتبطة`);
      console.log(`📊 استهلاك الذاكرة:`);
      console.log(`   - RSS: ${memDiff.rss.toFixed(2)} MB`);
      console.log(`   - Heap Used: ${memDiff.heapUsed.toFixed(2)} MB`);
      console.log(`   - Heap Total: ${memDiff.heapTotal.toFixed(2)} MB`);
    } catch (e) {
      console.log(`❌ اختبار الذاكرة فشل: ${e.message}`);
    }
    
    // 6. اختبار Engine Status
    console.log('\n🔧 حالة Prisma Engine...');
    try {
      // معلومات الإصدار
      console.log(`📦 إصدار Prisma Client: ${prisma._clientVersion || 'غير معروف'}`);
      
      // اختبار صحة Engine
      await prisma.$executeRaw`SELECT 'Engine OK' as status`;
      console.log('✅ Prisma Engine يعمل بشكل طبيعي');
      
    } catch (e) {
      console.log(`❌ مشكلة في Prisma Engine: ${e.message}`);
    }
    
  } catch (error) {
    console.log('\n💥 خطأ عام في التشخيص:', error.message);
    console.log('Stack trace:', error.stack);
    
  } finally {
    await prisma.$disconnect();
    console.log('\n🏁 انتهى التشخيص');
  }
}

// تشغيل التشخيص
diagnoseDatabaseIssues()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 خطأ حاسم في التشخيص:', error);
    process.exit(1);
  });
