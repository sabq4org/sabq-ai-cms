const { PrismaClient } = require('@prisma/client');

console.log('🔍 تشخيص سريع لمشكلة الاتصال...\n');

// التحقق من المتغيرات
console.log('1️⃣ فحص متغيرات البيئة:');
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ موجود' : '❌ مفقود'}`);
console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? '✅ موجود' : '❌ مفقود'}`);

if (!process.env.DATABASE_URL) {
  console.error('\n❌ DATABASE_URL غير موجود! تأكد من وجود ملف .env');
  process.exit(1);
}

// إنشاء Prisma client
console.log('\n2️⃣ إنشاء Prisma Client...');
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=5&pool_timeout=20&connect_timeout=30'
    }
  }
});

// اختبار الاتصال
async function testConnection() {
  console.log('\n3️⃣ اختبار الاتصال...');
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`   محاولة ${attempt}/3...`);
      
      // محاولة الاتصال
      await prisma.$connect();
      
      // اختبار query بسيط
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('   ✅ الاتصال نجح!');
      
      // اختبار الجداول
      console.log('\n4️⃣ فحص الجداول:');
      
      try {
        const articlesCount = await prisma.articles.count();
        console.log(`   ✅ articles: ${articlesCount} مقال`);
      } catch (e) {
        console.log(`   ❌ articles: ${e.message}`);
      }
      
      try {
        const analysesCount = await prisma.deep_analyses.count();
        console.log(`   ✅ deep_analyses: ${analysesCount} تحليل`);
      } catch (e) {
        console.log(`   ❌ deep_analyses: ${e.message}`);
      }
      
      try {
        const categoriesCount = await prisma.categories.count();
        console.log(`   ✅ categories: ${categoriesCount} تصنيف`);
      } catch (e) {
        console.log(`   ❌ categories: ${e.message}`);
      }
      
      return true;
    } catch (error) {
      console.error(`   ❌ فشلت المحاولة ${attempt}: ${error.message}`);
      
      if (attempt < 3) {
        console.log(`   ⏳ انتظار ${attempt * 2} ثانية...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
    }
  }
  
  return false;
}

// الحلول المقترحة
function showSolutions() {
  console.log('\n💡 الحلول المقترحة:');
  console.log('\n1. تحديث DATABASE_URL في .env:');
  console.log('   أضف هذه المعاملات في نهاية DATABASE_URL:');
  console.log('   ?connection_limit=10&pool_timeout=20&connect_timeout=30&pgbouncer=true&sslmode=require');
  
  console.log('\n2. إعادة تشغيل التطبيق:');
  console.log('   # أوقف الخادم (Ctrl+C)');
  console.log('   rm -rf .next node_modules/.cache');
  console.log('   npm run dev');
  
  console.log('\n3. في لوحة تحكم Supabase:');
  console.log('   - تحقق من Connection Pooling');
  console.log('   - تأكد من أن Mode = Transaction');
  console.log('   - Pool Size = 10-15');
  
  console.log('\n4. جرب الاتصال من pgAdmin أو TablePlus');
}

// تشغيل الاختبار
testConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ قاعدة البيانات تعمل بشكل جيد!');
      console.log('\n📌 إذا كانت المشكلة مستمرة في التطبيق:');
      console.log('   1. أعد تشغيل خادم Next.js');
      console.log('   2. امسح cache المتصفح');
      console.log('   3. تحقق من console المتصفح للأخطاء');
    } else {
      console.log('\n❌ فشل الاتصال بقاعدة البيانات!');
      showSolutions();
    }
  })
  .catch(error => {
    console.error('\n❌ خطأ غير متوقع:', error);
    showSolutions();
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n👋 تم إغلاق الاتصال');
  }); 