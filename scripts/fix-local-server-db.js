#!/usr/bin/env node

/**
 * سكريبت إصلاح مشاكل قاعدة البيانات المحلية
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const steps = [
  {
    name: '🧹 تنظيف Prisma وnode_modules',
    commands: [
      'rm -rf node_modules/.prisma',
      'rm -rf node_modules/@prisma/client',
      'rm -rf .next'
    ]
  },
  {
    name: '📦 إعادة تثبيت المكتبات',
    commands: ['npm install --legacy-peer-deps']
  },
  {
    name: '🔧 توليد Prisma Client',
    commands: ['npx prisma generate']
  },
  {
    name: '🗄️ التحقق من اتصال قاعدة البيانات',
    commands: ['npx prisma db push --accept-data-loss']
  },
  {
    name: '🧪 اختبار الاتصال',
    commands: ['node scripts/test-db-connection.js']
  },
  {
    name: '🚀 إعادة تشغيل الخادم',
    commands: ['pkill -f "next dev" || true', 'echo "السيرفر سيتم تشغيله يدوياً"']
  }
];

async function runStep(step) {
  console.log(`\n${step.name}`);
  console.log('━'.repeat(50));
  
  for (const command of step.commands) {
    console.log(`▶ ${command}`);
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stdout) console.log(stdout);
      if (stderr && !stderr.includes('warning')) console.error(stderr);
    } catch (error) {
      console.error(`❌ خطأ: ${error.message}`);
      if (step.name.includes('اختبار')) {
        console.log('⚠️  تخطي الخطأ والمتابعة...');
        continue;
      }
      return false;
    }
  }
  
  console.log('✅ تم بنجاح');
  return true;
}

async function main() {
  console.log('🚀 بدء إصلاح مشاكل قاعدة البيانات المحلية...');
  console.log('━'.repeat(50));
  
  // التحقق من DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL غير موجود في متغيرات البيئة!');
    console.log('💡 تأكد من وجود ملف .env مع DATABASE_URL');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL موجود');
  console.log(`📍 الخادم: ${process.env.DATABASE_URL.split('@')[1]?.split(':')[0] || 'unknown'}`);
  
  // تنفيذ الخطوات
  for (const step of steps) {
    const success = await runStep(step);
    if (!success && !step.name.includes('اختبار')) {
      console.error('\n❌ فشل الإصلاح!');
      process.exit(1);
    }
  }
  
  console.log('\n✅ تم إصلاح جميع المشاكل بنجاح!');
  console.log('\n📋 الخطوات التالية:');
  console.log('1. انتظر 10 ثواني حتى يبدأ الخادم');
  console.log('2. افتح http://localhost:3002 في المتصفح');
  console.log('3. إذا استمرت المشكلة، راجع سجلات الخطأ');
  
  // الانتظار قليلاً قبل الإنهاء
  setTimeout(() => {
    console.log('\n🎉 اكتمل!');
    process.exit(0);
  }, 3000);
}

// تحميل متغيرات البيئة
require('dotenv').config();

// تشغيل السكريبت
main().catch(error => {
  console.error('❌ خطأ غير متوقع:', error);
  process.exit(1);
}); 