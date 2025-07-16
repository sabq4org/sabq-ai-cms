#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Ensuring Prisma client generation...');

try {
  // التحقق من وجود DATABASE_URL للبيئة الإنتاجية
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not found in production, using placeholder...');
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db?schema=public';
  }
  
  // توليد Prisma Client
  console.log('🏗️  Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // التحقق من وجود Prisma Client
  const prismaClientPath = path.join(__dirname, '..', 'lib', 'generated', 'prisma');
  
  if (fs.existsSync(prismaClientPath)) {
    console.log('✅ Prisma client generated successfully!');
    
    // التحقق من وجود daily_doses model
    const indexPath = path.join(prismaClientPath, 'index.d.ts');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      if (content.includes('daily_doses')) {
        console.log('✅ Model daily_doses found in Prisma Client');
      } else {
        console.warn('⚠️  Model daily_doses NOT found in Prisma Client - please check schema.prisma');
      }
    }
  } else {
    console.error('❌ Prisma client path not found!');
    // محاولة إنشاء المجلد وإعادة التوليد
    console.log('📁 Creating directory and retrying...');
    fs.mkdirSync(prismaClientPath, { recursive: true });
    execSync('npx prisma generate', { stdio: 'inherit' });
  }
  
  console.log('🚀 Build preparation complete!');
  
} catch (error) {
  console.error('❌ Prisma generation failed:', error.message);
  console.error('📝 Full error:', error);
  
  // في حالة الفشل، نحاول مرة أخرى مع إعدادات مختلفة
  console.log('🔄 Attempting fallback generation...');
  try {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db?schema=public';
    execSync('npx prisma generate --generator client', { stdio: 'inherit' });
    console.log('✅ Fallback generation succeeded!');
  } catch (fallbackError) {
    console.error('❌ Fallback generation also failed:', fallbackError.message);
    // نستمر على أي حال
  }
} 