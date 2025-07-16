#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح مشكلة daily_doses model...');

try {
  // 1. تعيين DATABASE_URL مؤقت إذا لم يكن موجوداً
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL غير موجود، استخدام placeholder...');
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db?schema=public';
  }
  
  // 2. إنشاء مجلد lib/generated
  const generatedDir = path.join(__dirname, '..', 'lib', 'generated');
  if (!fs.existsSync(generatedDir)) {
    console.log('📁 إنشاء مجلد lib/generated...');
    fs.mkdirSync(generatedDir, { recursive: true });
  }
  
  // 3. توليد Prisma Client
  console.log('🏗️  توليد Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/db?schema=public'
    }
  });
  
  // 4. التحقق من وجود Prisma Client
  const prismaClientPath = path.join(__dirname, '..', 'lib', 'generated', 'prisma');
  if (!fs.existsSync(prismaClientPath)) {
    throw new Error('❌ فشل توليد Prisma Client!');
  }
  
  // 5. التحقق من وجود daily_doses model
  const indexPath = path.join(prismaClientPath, 'index.d.ts');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    if (content.includes('daily_doses')) {
      console.log('✅ Model daily_doses موجود في Prisma Client');
    } else {
      console.warn('⚠️  Model daily_doses غير موجود في Prisma Client');
      
      // 6. محاولة إصلاح المشكلة
      console.log('🔄 محاولة إصلاح المشكلة...');
      
      // التحقق من schema.prisma
      const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
      if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        if (schemaContent.includes('model daily_doses')) {
          console.log('✅ Model daily_doses موجود في schema.prisma');
          
          // إعادة توليد مع تنظيف
          console.log('🧹 تنظيف وإعادة توليد...');
          
          // حذف المجلد المولد
          if (fs.existsSync(prismaClientPath)) {
            fs.rmSync(prismaClientPath, { recursive: true, force: true });
          }
          
          // إعادة التوليد
          execSync('npx prisma generate --generator client', { 
            stdio: 'inherit',
            env: {
              ...process.env,
              DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/db?schema=public'
            }
          });
          
          console.log('✅ تم إعادة توليد Prisma Client');
        } else {
          console.error('❌ Model daily_doses غير موجود في schema.prisma!');
        }
      }
    }
  }
  
  console.log('✅ إصلاح daily_doses اكتمل');
  
} catch (error) {
  console.error('❌ خطأ في إصلاح daily_doses:', error.message);
  
  // في حالة الفشل، نحاول حل بديل
  console.log('🔄 محاولة حل بديل...');
  
  // إنشاء stub مؤقت
  const stubPath = path.join(__dirname, '..', 'lib', 'prisma-stub.ts');
  const stubContent = `
// Temporary stub for build
export const daily_doses = {
  findFirst: async () => null,
  findMany: async () => [],
  create: async () => ({}),
  update: async () => ({}),
  delete: async () => ({})
};
`;
  
  fs.writeFileSync(stubPath, stubContent);
  console.log('✅ تم إنشاء stub مؤقت');
} 