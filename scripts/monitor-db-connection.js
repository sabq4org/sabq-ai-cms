#!/usr/bin/env node

/**
 * سكريبت مراقبة اتصال قاعدة البيانات
 * يفحص الاتصال كل 10 ثواني ويعرض الإحصائيات
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['error'],
  errorFormat: 'minimal'
});

// إحصائيات المراقبة
const stats = {
  startTime: Date.now(),
  checks: 0,
  successful: 0,
  failed: 0,
  lastError: null,
  consecutiveFails: 0
};

// ألوان للـ terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

async function checkConnection() {
  stats.checks++;
  const startTime = Date.now();
  
  try {
    // اختبار بسيط للاتصال
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - startTime;
    
    stats.successful++;
    stats.consecutiveFails = 0;
    
    console.log(
      `${colors.green}✅ [${new Date().toLocaleTimeString('ar-SA')}] الاتصال سليم (${duration}ms)${colors.reset}`
    );
    
    return true;
  } catch (error) {
    stats.failed++;
    stats.consecutiveFails++;
    stats.lastError = error.message;
    
    console.error(
      `${colors.red}❌ [${new Date().toLocaleTimeString('ar-SA')}] فشل الاتصال: ${error.message}${colors.reset}`
    );
    
    if (stats.consecutiveFails >= 3) {
      console.error(
        `${colors.yellow}⚠️  تحذير: فشل الاتصال ${stats.consecutiveFails} مرات متتالية!${colors.reset}`
      );
    }
    
    return false;
  }
}

function showStats() {
  const runtime = Math.floor((Date.now() - stats.startTime) / 1000);
  const successRate = stats.checks > 0 
    ? ((stats.successful / stats.checks) * 100).toFixed(2) 
    : 0;
  
  console.log(`${colors.blue}📊 إحصائيات المراقبة:${colors.reset}`);
  console.log(`⏱️  وقت التشغيل: ${runtime} ثانية`);
  console.log(`🔍 عدد الفحوصات: ${stats.checks}`);
  console.log(`✅ نجح: ${stats.successful}`);
  console.log(`❌ فشل: ${stats.failed}`);
  console.log(`📈 نسبة النجاح: ${successRate}%`);
  console.log(`🔴 فشل متتالي: ${stats.consecutiveFails}`);
  console.log('──────────────────────────────────────────────────');
}

async function startMonitoring() {
  console.log(`${colors.blue}🚀 بدء مراقبة اتصال قاعدة البيانات...${colors.reset}`);
  console.log(`📍 DATABASE_URL: ${process.env.DATABASE_URL ? 'موجود' : 'غير موجود'}`);
  console.log('──────────────────────────────────────────────────');
  console.log(`${colors.gray}💡 اضغط Ctrl+C لإيقاف المراقبة${colors.reset}`);
  
  // فحص أولي
  await checkConnection();
  
  // فحص دوري كل 10 ثواني
  const interval = setInterval(async () => {
    await checkConnection();
    
    // عرض الإحصائيات كل دقيقة
    if (stats.checks % 6 === 0) {
      showStats();
    }
  }, 10000);
  
  // التعامل مع إيقاف البرنامج
  process.on('SIGINT', async () => {
    clearInterval(interval);
    console.log('\n\n🛑 إيقاف المراقبة...');
    showStats();
    await prisma.$disconnect();
    process.exit(0);
  });
}

// بدء المراقبة
startMonitoring().catch(error => {
  console.error(`${colors.red}❌ خطأ في بدء المراقبة:${colors.reset}`, error);
  process.exit(1);
}); 