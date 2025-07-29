const { PrismaClient } = require('@prisma/client');

// إنشاء Prisma client مع إعدادات محسنة
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

// إحصائيات المراقبة
const stats = {
  checks: 0,
  successes: 0,
  failures: 0,
  lastError: null,
  startTime: new Date(),
  consecutiveFailures: 0,
};

// دالة فحص الاتصال
async function checkConnection() {
  stats.checks++;
  
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const duration = Date.now() - start;
    
    stats.successes++;
    stats.consecutiveFailures = 0;
    
    console.log(`✅ [${new Date().toLocaleTimeString()}] الاتصال سليم (${duration}ms)`);
    return true;
  } catch (error) {
    stats.failures++;
    stats.consecutiveFailures++;
    stats.lastError = error.message;
    
    console.error(`❌ [${new Date().toLocaleTimeString()}] فشل الاتصال:`, error.message);
    
    // إذا فشل الاتصال 3 مرات متتالية، حاول إعادة الاتصال
    if (stats.consecutiveFailures >= 3) {
      console.log('🔄 محاولة إعادة الاتصال...');
      try {
        await prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await prisma.$connect();
        console.log('✅ تم إعادة الاتصال بنجاح!');
        stats.consecutiveFailures = 0;
      } catch (reconnectError) {
        console.error('❌ فشل إعادة الاتصال:', reconnectError.message);
      }
    }
    
    return false;
  }
}

// دالة عرض الإحصائيات
function displayStats() {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
  const successRate = stats.checks > 0 
    ? ((stats.successes / stats.checks) * 100).toFixed(2)
    : 0;
  
  console.log('\n📊 إحصائيات المراقبة:');
  console.log(`⏱️  وقت التشغيل: ${uptime} ثانية`);
  console.log(`🔍 عدد الفحوصات: ${stats.checks}`);
  console.log(`✅ نجح: ${stats.successes}`);
  console.log(`❌ فشل: ${stats.failures}`);
  console.log(`📈 نسبة النجاح: ${successRate}%`);
  console.log(`🔴 فشل متتالي: ${stats.consecutiveFailures}`);
  
  if (stats.lastError) {
    console.log(`❗ آخر خطأ: ${stats.lastError}`);
  }
  
  console.log('─'.repeat(50));
}

// بدء المراقبة
console.log('🚀 بدء مراقبة اتصال قاعدة البيانات...');
console.log(`📍 DATABASE_URL: ${process.env.DATABASE_URL ? 'موجود' : 'مفقود'}`);
console.log('─'.repeat(50));

// فحص أولي
checkConnection();

// فحص دوري كل 10 ثواني
const checkInterval = setInterval(checkConnection, 10000);

// عرض الإحصائيات كل دقيقة
const statsInterval = setInterval(displayStats, 60000);

// معالجة إيقاف البرنامج
process.on('SIGINT', async () => {
  console.log('\n\n🛑 إيقاف المراقبة...');
  
  clearInterval(checkInterval);
  clearInterval(statsInterval);
  
  displayStats();
  
  await prisma.$disconnect();
  process.exit(0);
});

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (error) => {
  console.error('❌ خطأ غير متوقع:', error);
});

console.log('💡 اضغط Ctrl+C لإيقاف المراقبة\n'); 