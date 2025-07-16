#!/usr/bin/env node

const { PrismaClient } = require('../lib/generated/prisma');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// إنشاء واجهة للإدخال
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// دالة للسؤال
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// دالة لعرض النسخ المتاحة
function listAvailableBackups() {
  console.log('\n📦 النسخ الاحتياطية المتاحة:\n');
  
  // النسخ من مجلد data
  console.log('📁 من مجلد data:');
  console.log('1. data/articles_backup_20250623_161538.json - نسخة كاملة (23 يونيو)');
  console.log('2. data/articles_backup.json - نسخة عامة');
  
  // النسخ من مجلد backups
  console.log('\n📁 من مجلد backups:');
  console.log('3. backups/migration_20250716_083938/ - ملفات CSV (16 يوليو)');
  console.log('4. backups/articles_backup_2025-06-23T13-34-14.json - نسخة مقالات');
}

// دالة لاستعادة من ملف JSON
async function restoreFromJSON(filePath) {
  const prisma = new PrismaClient();
  
  try {
    console.log(`\n📖 قراءة الملف: ${filePath}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // إحصائيات
    console.log('\n📊 محتوى النسخة الاحتياطية:');
    if (data.articles) console.log(`- المقالات: ${data.articles.length}`);
    if (data.users) console.log(`- المستخدمون: ${data.users.length}`);
    if (data.categories) console.log(`- التصنيفات: ${data.categories.length}`);
    
    const confirm = await question('\n⚠️  هل تريد المتابعة؟ سيتم حذف البيانات الحالية! (نعم/لا): ');
    if (confirm.toLowerCase() !== 'نعم' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ تم إلغاء العملية');
      return;
    }
    
    console.log('\n🔄 بدء الاستعادة...');
    
    // حذف البيانات الحالية
    console.log('🗑️ حذف البيانات الحالية...');
    await prisma.$transaction([
      prisma.interactions.deleteMany(),
      prisma.articles.deleteMany(),
      prisma.categories.deleteMany(),
      prisma.users.deleteMany()
    ]);
    
    // استعادة المستخدمين
    if (data.users && data.users.length > 0) {
      console.log(`👥 استعادة ${data.users.length} مستخدم...`);
      for (const user of data.users) {
        await prisma.users.create({
          data: {
            ...user,
            created_at: new Date(user.created_at || user.createdAt),
            updated_at: new Date(user.updated_at || user.updatedAt)
          }
        });
      }
    }
    
    // استعادة التصنيفات
    if (data.categories && data.categories.length > 0) {
      console.log(`🏷️ استعادة ${data.categories.length} تصنيف...`);
      for (const category of data.categories) {
        await prisma.categories.create({
          data: {
            ...category,
            created_at: new Date(category.created_at || category.createdAt),
            updated_at: new Date(category.updated_at || category.updatedAt)
          }
        });
      }
    }
    
    // استعادة المقالات
    if (data.articles && data.articles.length > 0) {
      console.log(`📰 استعادة ${data.articles.length} مقال...`);
      for (const article of data.articles) {
        await prisma.articles.create({
          data: {
            ...article,
            created_at: new Date(article.created_at || article.createdAt),
            updated_at: new Date(article.updated_at || article.updatedAt),
            published_at: article.published_at ? new Date(article.published_at) : null
          }
        });
      }
    }
    
    console.log('\n✅ تمت الاستعادة بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في الاستعادة:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// دالة لاستعادة من ملفات CSV
async function restoreFromCSV(dirPath) {
  console.log('\n📁 استعادة من ملفات CSV...');
  console.log('⚠️  هذه الميزة تحتاج لتطوير إضافي');
  console.log('يمكنك استخدام: node scripts/restore-from-csv.js');
}

// البرنامج الرئيسي
async function main() {
  console.log('🔄 استعادة النسخة الاحتياطية إلى Digital Ocean');
  console.log('==========================================\n');
  
  // التحقق من DATABASE_URL
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
    console.log('⚠️  تحذير: يبدو أنك تستخدم قاعدة بيانات محلية!');
    console.log('تأكد من تعيين DATABASE_URL لـ Digital Ocean في .env.local');
    console.log('مثال:');
    console.log('DATABASE_URL=postgresql://doadmin:[PASSWORD]@db-sabq-ai-1755...?sslmode=require\n');
  }
  
  listAvailableBackups();
  
  const choice = await question('\n📝 اختر رقم النسخة (1-4) أو مسار ملف آخر: ');
  
  let filePath;
  switch(choice) {
    case '1':
      filePath = 'data/articles_backup_20250623_161538.json';
      break;
    case '2':
      filePath = 'data/articles_backup.json';
      break;
    case '3':
      await restoreFromCSV('backups/migration_20250716_083938/');
      rl.close();
      return;
    case '4':
      filePath = 'backups/articles_backup_2025-06-23T13-34-14.json';
      break;
    default:
      filePath = choice;
  }
  
  if (fs.existsSync(filePath)) {
    await restoreFromJSON(filePath);
  } else {
    console.error('❌ الملف غير موجود:', filePath);
  }
  
  rl.close();
}

// تشغيل البرنامج
main().catch(console.error); 