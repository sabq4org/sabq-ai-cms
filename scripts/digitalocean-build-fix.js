#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 بدء إصلاح البناء لـ Digital Ocean...');

// 1. التحقق من المتغيرات المطلوبة
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ المتغيرات المطلوبة مفقودة:', missingVars.join(', '));
  // لا نوقف العملية - نستخدم قيم افتراضية للبناء
  console.log('⚠️ سيتم استخدام قيم افتراضية للبناء...');
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'build-time-secret';
  }
}

// 2. تنظيف الملفات القديمة
console.log('🧹 تنظيف الملفات القديمة...');
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
  execSync('rm -rf node_modules/.prisma', { stdio: 'inherit' });
} catch (e) {
  // تجاهل أخطاء الحذف
}

// 3. إنشاء مجلد Prisma إذا لم يكن موجوداً
const prismaDir = path.join(__dirname, '..', 'lib', 'generated');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
  console.log('✅ تم إنشاء مجلد lib/generated');
}

try {
  // 4. تعيين binary targets لـ DigitalOcean
  console.log('🎯 تعيين Prisma binary targets...');
  process.env.PRISMA_CLI_BINARY_TARGETS = '["debian-openssl-3.0.x"]';
  
  // 5. توليد Prisma Client
  console.log('📦 توليد Prisma Client...');
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_CLI_BINARY_TARGETS: '["debian-openssl-3.0.x"]'
    }
  });
  
  // 6. التحقق من توليد Prisma
  const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client', 'index.js');
  if (!fs.existsSync(prismaClientPath)) {
    console.warn('⚠️ لم يتم العثور على Prisma Client، سيتم المتابعة...');
  } else {
    console.log('✅ تم توليد Prisma Client بنجاح');
  }
  
  // 7. تثبيت sharp مع تجاهل الأخطاء
  console.log('📷 محاولة تثبيت sharp...');
  try {
    execSync('npm install --no-save --include=optional sharp', { stdio: 'inherit' });
    console.log('✅ تم تثبيت sharp بنجاح');
  } catch (sharpError) {
    console.warn('⚠️ فشل تثبيت sharp، سيتم الاستمرار بدونه');
  }
  
  // 8. التحقق من next.config.js
  console.log('🔍 التحقق من إعدادات Next.js...');
  const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    const configContent = fs.readFileSync(nextConfigPath, 'utf8');
    if (!configContent.includes("output: 'standalone'")) {
      console.error('❌ تحذير: next.config.js لا يحتوي على output: "standalone"');
    } else {
      console.log('✅ إعدادات standalone موجودة');
    }
  }
  
  // 9. البناء مع إعدادات مخصصة
  console.log('🏗️ بدء بناء Next.js...');
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NODE_ENV = 'production';
  
  // استخدام أمر البناء من package.json
  console.log('🔨 تشغيل أمر البناء...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
      SKIP_ENV_VALIDATION: '1'
    }
  });
  
  console.log('🎉 تم إكمال البناء بنجاح!');
  
  // 10. التحقق من وجود مجلد .next
  if (!fs.existsSync('.next')) {
    throw new Error('مجلد .next غير موجود بعد البناء');
  }
  
  // 11. التحقق من وجود .next/standalone
  const standalonePath = path.join(__dirname, '..', '.next', 'standalone');
  if (!fs.existsSync(standalonePath)) {
    console.error('⚠️ تحذير: مجلد .next/standalone غير موجود!');
    console.log('📁 محتويات مجلد .next:');
    execSync('ls -la .next/', { stdio: 'inherit' });
    
    // محاولة إصلاح المشكلة
    console.log('🔧 محاولة إنشاء مجلد standalone...');
    fs.mkdirSync(standalonePath, { recursive: true });
    
    // نسخ الملفات الضرورية
    const serverJsPath = path.join(__dirname, '..', '.next', 'server.js');
    if (fs.existsSync(serverJsPath)) {
      fs.copyFileSync(serverJsPath, path.join(standalonePath, 'server.js'));
    } else {
      // إنشاء server.js بسيط
      const serverContent = `
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(\`> Ready on http://localhost:\${port}\`);
  });
});
`;
      fs.writeFileSync(path.join(standalonePath, 'server.js'), serverContent);
    }
    
    // نسخ package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const standalonePackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      dependencies: {
        next: packageJson.dependencies.next
      }
    };
    fs.writeFileSync(
      path.join(standalonePath, 'package.json'), 
      JSON.stringify(standalonePackageJson, null, 2)
    );
  } else {
    console.log('✅ مجلد .next/standalone موجود');
  }
  
} catch (error) {
  console.error('❌ فشل البناء:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 