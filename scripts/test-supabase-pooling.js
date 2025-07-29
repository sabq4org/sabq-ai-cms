const { PrismaClient } = require('@prisma/client');

// إعدادات مختلفة لاختبار Pooling
const testConfigs = [
  {
    name: 'Standard Connection',
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL
  },
  {
    name: 'Pooling with pgbouncer=true',
    url: process.env.DATABASE_URL + '?pgbouncer=true',
    directUrl: process.env.DIRECT_URL
  },
  {
    name: 'Pooling with connection_limit',
    url: process.env.DATABASE_URL + '?pgbouncer=true&connection_limit=1',
    directUrl: process.env.DIRECT_URL
  }
];

async function testConnection(config) {
  console.log(`\n🔍 Testing: ${config.name}`);
  console.log('DATABASE_URL:', config.url?.replace(/:[^:@]+@/, ':****@'));
  console.log('DIRECT_URL:', config.directUrl?.replace(/:[^:@]+@/, ':****@'));
  
  try {
    // تعيين متغيرات البيئة مؤقتاً
    process.env.DATABASE_URL = config.url;
    process.env.DIRECT_URL = config.directUrl;
    
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
    
    // اختبار اتصال بسيط
    const startTime = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as test, current_database() as db, version() as version`;
    const duration = Date.now() - startTime;
    
    console.log('✅ Connection successful!');
    console.log('Response time:', duration, 'ms');
    console.log('Database info:', result[0]);
    
    // اختبار استعلام حقيقي
    const articlesCount = await prisma.article.count();
    console.log('Articles count:', articlesCount);
    
    await prisma.$disconnect();
    
    return { success: true, duration, config: config.name };
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.meta) console.error('Error meta:', error.meta);
    
    return { success: false, error: error.message, config: config.name };
  }
}

async function main() {
  console.log('🚀 Testing Supabase Pooling Connections\n');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  // التحقق من وجود المتغيرات
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set!');
    console.log('\nPlease set the following environment variables:');
    console.log('- DATABASE_URL: Your Supabase pooling connection string');
    console.log('- DIRECT_URL: Your Supabase direct connection string');
    console.log('\nExample:');
    console.log('DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true"');
    console.log('DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"');
    process.exit(1);
  }
  
  const results = [];
  
  for (const config of testConfigs) {
    const result = await testConnection(config);
    results.push(result);
    
    // انتظار قليلاً بين الاختبارات
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.config}: ${result.success ? result.duration + 'ms' : result.error}`);
  });
  
  // نصائح لحل المشاكل
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. تأكد من استخدام المنفذ الصحيح:');
  console.log('   - Pooling: port 6543');
  console.log('   - Direct: port 5432');
  console.log('\n2. في Prisma schema، تأكد من وجود:');
  console.log('   datasource db {');
  console.log('     provider  = "postgresql"');
  console.log('     url       = env("DATABASE_URL")');
  console.log('     directUrl = env("DIRECT_URL")');
  console.log('   }');
  console.log('\n3. للـ Pooling، أضف هذه المعاملات:');
  console.log('   ?pgbouncer=true&connection_limit=1');
  console.log('\n4. في Digital Ocean، تأكد من تعيين كلا المتغيرين:');
  console.log('   - DATABASE_URL (للقراءة - مع pooling)');
  console.log('   - DIRECT_URL (للكتابة والـ migrations)');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0)); 