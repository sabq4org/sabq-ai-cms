#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DigitalOcean build process...');

// التحقق من متغيرات Cloudinary
const requiredVars = [
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ المتغيرات التالية مفقودة:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nيرجى إضافة جميع المتغيرات المطلوبة في إعدادات DigitalOcean App Platform');
  process.exit(1);
}

try {
  // Step 1: Ensure Prisma Client is generated
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Step 2: Verify Prisma Client exists
  const prismaClientPath = path.join(__dirname, '..', 'lib', 'generated', 'prisma');
  if (!fs.existsSync(prismaClientPath)) {
    throw new Error('Prisma Client was not generated successfully');
  }
  
  console.log('✅ Prisma Client generated successfully');
  
  // Step 3: Run Next.js build
  console.log('🏗️ Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('🎉 DigitalOcean build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 