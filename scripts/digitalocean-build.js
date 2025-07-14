#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DigitalOcean build process...');

// المتغيرات المطلوبة (ضرورية للعمل)
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET'
];

// المتغيرات الموصى بها (تحسن الوظائف)
const recommendedVars = [
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'OPENAI_API_KEY',
  'ELEVENLABS_API_KEY'
];

// التحقق من المتغيرات المطلوبة
const missingRequired = requiredVars.filter(varName => !process.env[varName]);
const missingRecommended = recommendedVars.filter(varName => !process.env[varName]);

if (missingRequired.length > 0) {
  console.error('❌ المتغيرات المطلوبة التالية مفقودة:');
  missingRequired.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nيرجى إضافة هذه المتغيرات في إعدادات DigitalOcean App Platform');
  process.exit(1);
}

if (missingRecommended.length > 0) {
  console.warn('⚠️  المتغيرات الموصى بها التالية مفقودة:');
  missingRecommended.forEach(varName => console.warn(`   - ${varName}`));
  console.warn('\nالنظام سيعمل ولكن بعض الميزات قد لا تكون متاحة');
}

// إضافة NEXTAUTH_SECRET إذا لم يكن موجوداً
if (!process.env.NEXTAUTH_SECRET && process.env.JWT_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.JWT_SECRET;
  console.log('ℹ️  تم استخدام JWT_SECRET كقيمة لـ NEXTAUTH_SECRET');
}

try {
  // Step 1: Ensure Prisma Client is generated
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Step 2: Verify Prisma Client exists
  const prismaClientPath = path.join(__dirname, '..', 'lib', 'generated', 'prisma');
  if (!fs.existsSync(prismaClientPath)) {
    console.warn('⚠️  Prisma Client path not found, but continuing...');
  } else {
    console.log('✅ Prisma Client generated successfully');
  }
  
  console.log('🎉 DigitalOcean build preparation completed!');
  
} catch (error) {
  console.error('❌ Build preparation failed:', error.message);
  // لا نوقف العملية، نترك Next.js build يحاول
  console.log('⚠️  Continuing with Next.js build anyway...');
} 