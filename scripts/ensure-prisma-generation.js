#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Ensuring Prisma client generation...');

try {
  // التحقق من وجود مجلد lib/generated
  const generatedDir = path.join(process.cwd(), 'lib', 'generated');
  if (!fs.existsSync(generatedDir)) {
    console.log('📁 Creating lib/generated directory...');
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  // التحقق من وجود ملف prisma schema
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Error: prisma/schema.prisma not found!');
    process.exit(1);
  }

  // توليد Prisma Client
  console.log('🏗️  Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_HIDE_UPDATE_MESSAGE: '1'
    }
  });

  console.log('✅ Prisma client generated successfully!');

  // التحقق من وجود الملفات المولدة
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
  if (!fs.existsSync(prismaClientPath)) {
    console.error('❌ Error: Prisma client was not generated properly!');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Error during Prisma generation:', error.message);
  
  // محاولة إصلاح المشكلة
  console.log('🔄 Attempting to fix the issue...');
  
  try {
    // حذف node_modules/@prisma وإعادة التثبيت
    const prismaModulesPath = path.join(process.cwd(), 'node_modules', '@prisma');
    if (fs.existsSync(prismaModulesPath)) {
      console.log('🗑️  Cleaning up old Prisma modules...');
      fs.rmSync(prismaModulesPath, { recursive: true, force: true });
    }
    
    // إعادة تثبيت @prisma/client
    console.log('📦 Reinstalling @prisma/client...');
    execSync('npm install @prisma/client', { stdio: 'inherit' });
    
    // إعادة محاولة التوليد
    console.log('🔄 Retrying Prisma generation...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('✅ Prisma client generated successfully after retry!');
  } catch (retryError) {
    console.error('❌ Failed to generate Prisma client after retry:', retryError.message);
    process.exit(1);
  }
}

console.log('🚀 Build preparation complete!');
process.exit(0); 