#!/usr/bin/env node

/**
 * سكريبت إعداد متغيرات البيئة للبناء
 * تاريخ الإنشاء: 2025-01-29
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 إعداد متغيرات البيئة للبناء...');

// متغيرات البيئة المطلوبة للبناء
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

// متغيرات البيئة الافتراضية للبناء
const defaultEnvVars = {
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  PRISMA_GENERATE_DATAPROXY: 'false',
  PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary',
  PRISMA_CLI_MIGRATION_ENGINE_TYPE: 'binary',
  SKIP_EMAIL_VERIFICATION: 'true'
};

// التحقق من المتغيرات المطلوبة
console.log('📋 التحقق من متغيرات البيئة...');
const missingVars = [];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
    console.log(`   ❌ ${envVar} - مفقود`);
  } else {
    console.log(`   ✅ ${envVar} - موجود`);
  }
}

// إنشاء متغيرات افتراضية للمفقودة
if (missingVars.length > 0) {
  console.log('⚠️  إنشاء متغيرات افتراضية للمفقودة...');
  
  for (const envVar of missingVars) {
    let defaultValue = '';
    
    switch (envVar) {
      case 'JWT_SECRET':
        defaultValue = 'default-jwt-secret-for-build-only-' + Date.now();
        break;
      case 'CLOUDINARY_CLOUD_NAME':
        defaultValue = 'default-cloud-name';
        break;
      case 'CLOUDINARY_API_KEY':
        defaultValue = 'default-api-key';
        break;
      case 'CLOUDINARY_API_SECRET':
        defaultValue = 'default-api-secret';
        break;
      default:
        defaultValue = 'default-value';
    }
    
    process.env[envVar] = defaultValue;
    console.log(`   🔧 ${envVar} = ${defaultValue.substring(0, 20)}...`);
  }
}

// إضافة المتغيرات الافتراضية
for (const [key, value] of Object.entries(defaultEnvVars)) {
  if (!process.env[key]) {
    process.env[key] = value;
    console.log(`   🔧 ${key} = ${value}`);
  }
}

// إنشاء ملف .env.build إذا لم يكن موجوداً
const envBuildPath = path.join(process.cwd(), '.env.build');
if (!fs.existsSync(envBuildPath)) {
  console.log('📝 إنشاء ملف .env.build...');
  
  let envContent = '# متغيرات البيئة للبناء\n';
  envContent += '# تم إنشاؤها تلقائياً بواسطة سكريبت البناء\n\n';
  
  for (const [key, value] of Object.entries(process.env)) {
    if (requiredEnvVars.includes(key) || Object.keys(defaultEnvVars).includes(key)) {
      envContent += `${key}=${value}\n`;
    }
  }
  
  fs.writeFileSync(envBuildPath, envContent);
  console.log('✅ تم إنشاء ملف .env.build');
}

console.log('✅ تم الانتهاء من إعداد متغيرات البيئة'); 