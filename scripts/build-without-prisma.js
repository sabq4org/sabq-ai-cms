#!/usr/bin/env node

/**
 * سكريبت البناء بدون Prisma
 * تاريخ الإنشاء: 2025-01-29
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 بدء البناء بدون Prisma...');

try {
  // إعداد متغيرات البيئة
  process.env.SKIP_PRISMA = 'true';
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  
  // إنشاء Prisma Client placeholder
  const prismaClientPath = path.join('lib', 'generated', 'prisma', 'index.js');
  const placeholderContent = `
// Prisma Client placeholder for build
const prisma = {
  // Placeholder methods
  user: { 
    findMany: () => [], 
    findUnique: () => null, 
    create: () => ({}),
    update: () => ({}),
    delete: () => ({})
  },
  article: { 
    findMany: () => [], 
    findUnique: () => null, 
    create: () => ({}),
    update: () => ({}),
    delete: () => ({})
  },
  category: { 
    findMany: () => [], 
    findUnique: () => null, 
    create: () => ({}),
    update: () => ({}),
    delete: () => ({})
  },
  // Add other models as needed
};

module.exports = prisma;
  `;
  
  if (!fs.existsSync(path.dirname(prismaClientPath))) {
    fs.mkdirSync(path.dirname(prismaClientPath), { recursive: true });
  }
  fs.writeFileSync(prismaClientPath, placeholderContent);
  console.log('✅ تم إنشاء Prisma Client placeholder');
  
  // تشغيل البناء
  console.log('🔨 تشغيل Next.js build...');
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_PRISMA: 'true',
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });
  
  console.log('✅ تم الانتهاء من البناء بنجاح!');
} catch (error) {
  console.error('❌ خطأ في البناء:', error.message);
  process.exit(1);
} 