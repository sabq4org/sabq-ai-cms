#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 بدء إصلاح البناء لـ Digital Ocean...');

// 1. التحقق من المتغيرات المطلوبة
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ المتغيرات المطلوبة مفقودة:', missingVars.join(', '));
  process.exit(1);
}

// 2. تنظيف الملفات القديمة
console.log('🧹 تنظيف الملفات القديمة...');
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
  execSync('rm -rf node_modules/.prisma', { stdio: 'inherit' });
} catch (e) {
  // تجاهل أخطاء الحذف
}

// 3. إنشاء مجلد Prisma إذا لم يكن موجوداً
const prismaDir = path.join(__dirname, '..', 'lib', 'generated');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
  console.log('✅ تم إنشاء مجلد lib/generated');
}

try {
  // 4. تعيين binary targets لـ DigitalOcean
  console.log('🎯 تعيين Prisma binary targets...');
  process.env.PRISMA_CLI_BINARY_TARGETS = '["debian-openssl-3.0.x"]';
  
  // 5. توليد Prisma Client
  console.log('📦 توليد Prisma Client...');
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_CLI_BINARY_TARGETS: '["debian-openssl-3.0.x"]'
    }
  });
  
  // 6. التحقق من توليد Prisma
  const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client', 'index.js');
  if (!fs.existsSync(prismaClientPath)) {
    throw new Error('فشل توليد Prisma Client');
  }
  console.log('✅ تم توليد Prisma Client بنجاح');
  
  // 7. تثبيت sharp مع تجاهل الأخطاء
  console.log('📷 محاولة تثبيت sharp...');
  try {
    execSync('npm install --no-save --include=optional sharp', { stdio: 'inherit' });
    console.log('✅ تم تثبيت sharp بنجاح');
  } catch (sharpError) {
    console.warn('⚠️ فشل تثبيت sharp، سيتم الاستمرار بدونه');
  }
  
  // 8. البناء مع إعدادات مخصصة
  console.log('🏗️ بدء بناء Next.js...');
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NODE_ENV = 'production';
  
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });
  
  console.log('🎉 تم إكمال البناء بنجاح!');
  
  // 9. التحقق من وجود مجلد .next
  if (!fs.existsSync('.next')) {
    throw new Error('مجلد .next غير موجود بعد البناء');
  }
  
} catch (error) {
  console.error('❌ فشل البناء:', error.message);
  process.exit(1);
} 