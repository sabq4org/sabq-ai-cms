#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 بدء عملية البناء المحسّنة لـ DigitalOcean...');

// متغيرات البيئة المطلوبة
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY'
];

// التحقق من متغيرات البيئة
console.log('🔍 التحقق من متغيرات البيئة...');
const missingVars = [];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: مفقود`);
  } else {
    console.log(`✅ ${varName}: موجود`);
  }
});

if (missingVars.length > 0) {
  console.error('\n❌ متغيرات البيئة المطلوبة مفقودة:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\nيرجى إضافة هذه المتغيرات في إعدادات DigitalOcean App Platform');
  process.exit(1);
}

// تنظيف البناء السابق
console.log('\n🧹 تنظيف البناء السابق...');
const dirsToClean = ['.next', 'node_modules/.cache', '.turbo'];
dirsToClean.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   حذف ${dir}...`);
    execSync(`rm -rf ${dir}`, { stdio: 'inherit' });
  }
});

// إنشاء مجلد .next
if (!fs.existsSync('.next')) {
  fs.mkdirSync('.next', { recursive: true });
}

// تثبيت التبعيات
console.log('\n📦 تثبيت التبعيات...');
execSync('npm ci --legacy-peer-deps', { stdio: 'inherit' });

// توليد Prisma Client
console.log('\n🔧 توليد Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit' });

// بناء التطبيق
console.log('\n🔨 بناء التطبيق...');
try {
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
} catch (error) {
  console.error('❌ فشل البناء:', error.message);
  process.exit(1);
}

// إنشاء prerender-manifest.json إذا لم يكن موجودًا
const prerenderManifestPath = path.join('.next', 'prerender-manifest.json');
if (!fs.existsSync(prerenderManifestPath)) {
  console.log('\n📝 إنشاء prerender-manifest.json...');
  const manifest = {
    version: 3,
    routes: {},
    dynamicRoutes: {},
    notFoundRoutes: [],
    preview: {
      previewModeId: "preview-mode-id",
      previewModeSigningKey: "preview-mode-signing-key",
      previewModeEncryptionKey: "preview-mode-encryption-key"
    }
  };
  fs.writeFileSync(prerenderManifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ تم إنشاء prerender-manifest.json');
}

// التحقق من وجود الملفات المطلوبة
console.log('\n🔍 التحقق من ملفات البناء...');
const requiredFiles = [
  '.next/standalone/server.js',
  '.next/static',
  '.next/server',
  'package.json'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length > 0) {
  console.warn('⚠️  ملفات مفقودة:');
  missingFiles.forEach(f => console.warn(`   - ${f}`));
}

// نسخ الملفات المطلوبة إلى standalone
if (fs.existsSync('.next/standalone')) {
  console.log('\n📋 نسخ الملفات المطلوبة...');
  
  // نسخ .next/static
  if (fs.existsSync('.next/static')) {
    execSync('cp -r .next/static .next/standalone/.next/', { stdio: 'inherit' });
  }
  
  // نسخ public
  if (fs.existsSync('public')) {
    execSync('cp -r public .next/standalone/', { stdio: 'inherit' });
  }
  
  // نسخ .next/server إذا لزم الأمر
  if (fs.existsSync('.next/server') && !fs.existsSync('.next/standalone/.next/server')) {
    execSync('cp -r .next/server .next/standalone/.next/', { stdio: 'inherit' });
  }
}

console.log('\n✅ اكتمل البناء بنجاح!');
console.log('📊 معلومات البناء:');
console.log(`   - Node.js: ${process.version}`);
console.log(`   - النظام: ${process.platform} ${process.arch}`);
console.log(`   - الذاكرة: ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`); 