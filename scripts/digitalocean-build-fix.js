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

// 2. إنشاء مجلد Prisma إذا لم يكن موجوداً
const prismaDir = path.join(__dirname, '..', 'lib', 'generated');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
  console.log('✅ تم إنشاء مجلد lib/generated');
}

try {
  // 3. توليد Prisma Client
  console.log('📦 توليد Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 4. تثبيت sharp مع تجاهل الأخطاء
  console.log('📷 محاولة تثبيت sharp...');
  try {
    execSync('npm install --no-save --include=optional sharp', { stdio: 'inherit' });
    console.log('✅ تم تثبيت sharp بنجاح');
  } catch (sharpError) {
    console.warn('⚠️ فشل تثبيت sharp، سيتم الاستمرار بدونه');
  }
  
  // 5. البناء
  console.log('🏗️ بدء بناء Next.js...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('🎉 تم إكمال البناء بنجاح!');
  
} catch (error) {
  console.error('❌ فشل البناء:', error.message);
  process.exit(1);
} 