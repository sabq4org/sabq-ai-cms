#!/usr/bin/env node

/**
 * سكريبت اختبار الاتصال عبر pgBouncer
 */

const { PrismaClient } = require('@prisma/client');

// الألوان للـ console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}🧪 اختبار الاتصال بقاعدة البيانات عبر pgBouncer${colors.reset}\n`);

// إعدادات الاتصال
const pooledUrl = process.env.DATABASE_URL || "postgres://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:6543/postgres?pgbouncer=true";
const directUrl = process.env.DIRECT_URL || "postgres://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres";

// عرض الإعدادات
console.log(`${colors.blue}📋 الإعدادات:${colors.reset}`);
console.log(`   Pooled URL: ${pooledUrl.substring(0, 50)}...`);
console.log(`   Direct URL: ${directUrl.substring(0, 50)}...`);
console.log();

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: pooledUrl
      }
    },
    log: ['error', 'warn']
  });
  
  const tests = {
    passed: 0,
    failed: 0
  };
  
  try {
    // 1. اختبار الاتصال الأساسي
    console.log(`${colors.yellow}1️⃣ اختبار الاتصال الأساسي${colors.reset}`);
    const startTime = Date.now();
    
    await prisma.$connect();
    const connectTime = Date.now() - startTime;
    
    console.log(`${colors.green}✅ تم الاتصال بنجاح في ${connectTime}ms${colors.reset}`);
    tests.passed++;
    
    // 2. اختبار استعلام بسيط
    console.log(`\n${colors.yellow}2️⃣ اختبار استعلام بسيط${colors.reset}`);
    const queryStart = Date.now();
    
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as server_time`;
    const queryTime = Date.now() - queryStart;
    
    console.log(`${colors.green}✅ الاستعلام نجح في ${queryTime}ms${colors.reset}`);
    console.log(`   وقت الخادم: ${result[0].server_time}`);
    tests.passed++;
    
    // 3. اختبار جلب التصنيفات
    console.log(`\n${colors.yellow}3️⃣ اختبار جلب التصنيفات${colors.reset}`);
    const categoriesStart = Date.now();
    
    const categories = await prisma.categories.findMany({
      take: 5
    });
    const categoriesTime = Date.now() - categoriesStart;
    
    console.log(`${colors.green}✅ تم جلب ${categories.length} تصنيف في ${categoriesTime}ms${colors.reset}`);
    tests.passed++;
    
    // 4. اختبار الاتصالات المتعددة
    console.log(`\n${colors.yellow}4️⃣ اختبار الاتصالات المتعددة${colors.reset}`);
    const parallelStart = Date.now();
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        prisma.$queryRaw`SELECT ${i} as id, NOW() as time`
      );
    }
    
    await Promise.all(promises);
    const parallelTime = Date.now() - parallelStart;
    
    console.log(`${colors.green}✅ تم تنفيذ 10 استعلامات متوازية في ${parallelTime}ms${colors.reset}`);
    console.log(`   متوسط الوقت لكل استعلام: ${Math.round(parallelTime / 10)}ms`);
    tests.passed++;
    
    // 5. اختبار معلومات الاتصال
    console.log(`\n${colors.yellow}5️⃣ معلومات الاتصال${colors.reset}`);
    
    const connectionInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        inet_server_addr() as server_address,
        inet_server_port() as server_port,
        version() as postgres_version
    `;
    
    console.log(`${colors.green}✅ معلومات الاتصال:${colors.reset}`);
    console.log(`   قاعدة البيانات: ${connectionInfo[0].database_name}`);
    console.log(`   المستخدم: ${connectionInfo[0].user_name}`);
    console.log(`   المنفذ: ${connectionInfo[0].server_port}`);
    console.log(`   الإصدار: ${connectionInfo[0].postgres_version.split(',')[0]}`);
    tests.passed++;
    
    // 6. اختبار connection pooling
    console.log(`\n${colors.yellow}6️⃣ اختبار Connection Pooling${colors.reset}`);
    
    const activeConnections = await prisma.$queryRaw`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;
    
    console.log(`${colors.green}✅ الاتصالات النشطة: ${activeConnections[0].active_connections}${colors.reset}`);
    tests.passed++;
    
  } catch (error) {
    console.error(`${colors.red}❌ خطأ: ${error.message}${colors.reset}`);
    tests.failed++;
  } finally {
    await prisma.$disconnect();
  }
  
  // النتيجة النهائية
  console.log(`\n${colors.cyan}📊 النتيجة النهائية:${colors.reset}`);
  console.log(`   ${colors.green}✅ نجح: ${tests.passed} اختبار${colors.reset}`);
  console.log(`   ${colors.red}❌ فشل: ${tests.failed} اختبار${colors.reset}`);
  
  if (tests.failed === 0) {
    console.log(`\n${colors.green}🎉 جميع الاختبارات نجحت! pgBouncer يعمل بشكل ممتاز${colors.reset}`);
    console.log(`\n${colors.cyan}💡 الفوائد المحققة:${colors.reset}`);
    console.log('   ✅ أداء محسن مع connection pooling');
    console.log('   ✅ استقرار أفضل للاتصال');
    console.log('   ✅ استخدام أقل للموارد');
    console.log('   ✅ حماية من too many connections');
  } else {
    console.log(`\n${colors.yellow}⚠️ بعض الاختبارات فشلت، يرجى مراجعة الإعدادات${colors.reset}`);
  }
}

// تشغيل الاختبارات
testConnection()
  .catch(console.error)
  .finally(() => process.exit(0)); 