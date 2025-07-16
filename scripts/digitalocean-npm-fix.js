#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح مشاكل npm لـ DigitalOcean...');

// التحقق من وجود package-lock.json
const lockPath = path.join(__dirname, '..', 'package-lock.json');
const backupPath = path.join(__dirname, '..', 'package-lock.backup.json');

try {
  // 1. نسخ احتياطي من package-lock.json إذا كان موجوداً
  if (fs.existsSync(lockPath)) {
    console.log('📋 حفظ نسخة احتياطية من package-lock.json...');
    fs.copyFileSync(lockPath, backupPath);
  }
  
  // 2. محاولة npm ci أولاً
  console.log('📦 محاولة npm ci...');
  try {
    execSync('npm ci', { stdio: 'inherit' });
    console.log('✅ npm ci نجح!');
  } catch (ciError) {
    console.log('⚠️  npm ci فشل، محاولة الحل البديل...');
    
    // 3. حذف node_modules و package-lock.json
    console.log('🗑️  حذف node_modules و package-lock.json...');
    if (fs.existsSync('node_modules')) {
      fs.rmSync('node_modules', { recursive: true, force: true });
    }
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
    
    // 4. تثبيت بـ npm install
    console.log('📦 تثبيت التبعيات بـ npm install...');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    
    console.log('✅ تم تثبيت التبعيات بنجاح!');
  }
  
  // 5. التحقق من وجود Prisma
  console.log('🔍 التحقق من Prisma...');
  const prismaPath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
  if (!fs.existsSync(prismaPath)) {
    console.log('⚠️  Prisma Client غير موجود، جاري التثبيت...');
    execSync('npm install @prisma/client', { stdio: 'inherit' });
  }
  
  console.log('✅ إصلاح npm اكتمل بنجاح!');
  
} catch (error) {
  console.error('❌ خطأ في إصلاح npm:', error.message);
  
  // استعادة النسخة الاحتياطية
  if (fs.existsSync(backupPath)) {
    console.log('♻️  استعادة النسخة الاحتياطية...');
    fs.copyFileSync(backupPath, lockPath);
  }
  
  process.exit(1);
} 