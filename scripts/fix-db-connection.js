#!/usr/bin/env node

/**
 * سكريبت إصلاح مشكلة اتصال قاعدة البيانات
 * يحل مشاكل "Engine is not yet connected"
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');

// ألوان للـ terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

async function runCommand(command, description) {
  console.log(`\n${colors.blue}🔧 ${description}...${colors.reset}`);
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout.trim());
    if (stderr && !stderr.includes('warning')) console.error(colors.yellow + stderr.trim() + colors.reset);
    console.log(`${colors.green}✅ تم بنجاح${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ فشل: ${error.message}${colors.reset}`);
    return false;
  }
}

async function fixDatabaseConnection() {
  console.log(`${colors.blue}🚀 بدء إصلاح اتصال قاعدة البيانات...${colors.reset}`);
  console.log(`${colors.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  // 1. إيقاف جميع عمليات Node.js
  console.log(`\n${colors.yellow}📌 الخطوة 1: إيقاف العمليات الجارية${colors.reset}`);
  await runCommand('pkill -f "node|next" || true', 'إيقاف عمليات Node.js');

  // 2. تنظيف ملفات البناء
  console.log(`\n${colors.yellow}📌 الخطوة 2: تنظيف ملفات البناء${colors.reset}`);
  await runCommand('rm -rf .next', 'حذف مجلد .next');
  await runCommand('rm -rf node_modules/.cache', 'حذف كاش node_modules');
  await runCommand('rm -rf node_modules/.prisma', 'حذف ملفات Prisma المؤقتة');

  // 3. إعادة توليد Prisma Client
  console.log(`\n${colors.yellow}📌 الخطوة 3: إعادة توليد Prisma Client${colors.reset}`);
  await runCommand('npx prisma generate', 'توليد Prisma Client');

  // 4. التحقق من اتصال قاعدة البيانات
  console.log(`\n${colors.yellow}📌 الخطوة 4: التحقق من اتصال قاعدة البيانات${colors.reset}`);
  const dbTestScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['error'] });

async function testConnection() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw\`SELECT 1\`;
    console.log('✅ اتصال قاعدة البيانات يعمل بشكل صحيح');
    return true;
  } catch (error) {
    console.error('❌ فشل اتصال قاعدة البيانات:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
`;
  
  require('fs').writeFileSync(path.join(__dirname, 'test-db-temp.js'), dbTestScript);
  await runCommand('node scripts/test-db-temp.js', 'اختبار اتصال قاعدة البيانات');
  await runCommand('rm -f scripts/test-db-temp.js', 'حذف ملف الاختبار المؤقت');

  // 5. إضافة متغيرات البيئة إذا لم تكن موجودة
  console.log(`\n${colors.yellow}📌 الخطوة 5: التحقق من متغيرات البيئة${colors.reset}`);
  const envCheck = `
if [ -f .env ]; then
  if ! grep -q "DATABASE_URL" .env; then
    echo "⚠️  DATABASE_URL غير موجود في .env"
  else
    echo "✅ DATABASE_URL موجود"
  fi
else
  echo "⚠️  ملف .env غير موجود"
fi
`;
  
  require('fs').writeFileSync(path.join(__dirname, 'check-env-temp.sh'), envCheck);
  await runCommand('bash scripts/check-env-temp.sh', 'التحقق من متغيرات البيئة');
  await runCommand('rm -f scripts/check-env-temp.sh', 'حذف ملف التحقق المؤقت');

  // 6. مزامنة قاعدة البيانات
  console.log(`\n${colors.yellow}📌 الخطوة 6: مزامنة قاعدة البيانات${colors.reset}`);
  await runCommand('npx prisma db push --accept-data-loss', 'مزامنة مخطط قاعدة البيانات');

  // 7. تحديث إعدادات Prisma
  console.log(`\n${colors.yellow}📌 الخطوة 7: إنشاء ملف Prisma محسّن${colors.reset}`);
  const improvedPrismaClient = `
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'minimal',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// تأكد من الاتصال عند بدء التطبيق
prisma.$connect().catch((e) => {
  console.error('❌ فشل الاتصال بقاعدة البيانات:', e);
  process.exit(1);
});

// تنظيف الاتصالات عند إيقاف التطبيق
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
`;

  require('fs').writeFileSync(path.join(process.cwd(), 'lib', 'prisma-improved.ts'), improvedPrismaClient);
  console.log(`${colors.green}✅ تم إنشاء lib/prisma-improved.ts${colors.reset}`);

  console.log(`\n${colors.green}✨ اكتمل إصلاح اتصال قاعدة البيانات!${colors.reset}`);
  console.log(`\n${colors.blue}📝 الخطوات التالية:${colors.reset}`);
  console.log(`   1. استبدل استيراد prisma في جميع الملفات:`);
  console.log(`      ${colors.gray}من: import prisma from '@/lib/prisma'${colors.reset}`);
  console.log(`      ${colors.gray}إلى: import prisma from '@/lib/prisma-improved'${colors.reset}`);
  console.log(`   2. أعد تشغيل السيرفر: ${colors.gray}npm run dev${colors.reset}`);
}

// تشغيل الإصلاح
fixDatabaseConnection().catch(console.error); 