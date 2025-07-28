#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح مشاكل البناء في الإنتاج...\n');

// 1. التحقق من DATABASE_URL
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
  console.error('❌ DATABASE_URL غير صحيح أو يشير إلى localhost');
  console.log('📝 يجب تعيين DATABASE_URL لقاعدة البيانات الحقيقية');
  
  // استخدام قاعدة بيانات Supabase الافتراضية
  const defaultDbUrl = 'postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres';
  console.log('✅ استخدام قاعدة البيانات الافتراضية');
  process.env.DATABASE_URL = defaultDbUrl;
}

// 2. إنشاء ملفات ضرورية
const requiredDirs = [
  'lib/generated',
  '.next',
  'public/audio'
];

requiredDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ تم إنشاء المجلد: ${dir}`);
  }
});

// 3. التحقق من وجود sharp
try {
  require.resolve('sharp');
  console.log('✅ sharp موجود');
} catch (e) {
  console.log('⚠️ sharp غير موجود - سيتم تثبيته أثناء البناء');
}

// 4. تعيين متغيرات البيئة الضرورية
const requiredEnvVars = {
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  JWT_SECRET: process.env.JWT_SECRET || 'production-jwt-secret',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'production-nextauth-secret',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://sabq-ai-cms.com'
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
    console.log(`✅ تم تعيين ${key}`);
  }
});

// 5. إنشاء ملف .env.production إذا لزم الأمر
const envProductionPath = path.join(process.cwd(), '.env.production');
if (!fs.existsSync(envProductionPath)) {
  const envContent = `
DATABASE_URL="${process.env.DATABASE_URL}"
JWT_SECRET="${process.env.JWT_SECRET}"
NEXTAUTH_SECRET="${process.env.NEXTAUTH_SECRET}"
NEXTAUTH_URL="${process.env.NEXTAUTH_URL}"
NODE_ENV=production
`;
  
  fs.writeFileSync(envProductionPath, envContent.trim());
  console.log('✅ تم إنشاء .env.production');
}

console.log('\n✅ اكتملت إصلاحات البناء');
console.log('🚀 يمكنك الآن تشغيل: npm run build\n'); 