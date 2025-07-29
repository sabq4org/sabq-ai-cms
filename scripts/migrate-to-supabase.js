const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs').promises;
const path = require('path');

// إعدادات قواعد البيانات
const AWS_RDS_URL = "postgresql://postgres:%2A7gzOMPcDco8l4If%3AO-CVb9Ehztq@database-1.cluster-cluyg244y2cj.eu-north-1.rds.amazonaws.com:5432/sabqcms";
const SUPABASE_URL = process.env.SUPABASE_PRODUCTION_URL || process.env.DATABASE_URL;

async function migrateToSupabase() {
  console.log('🚀 بدء عملية الترحيل من AWS RDS إلى Supabase...\n');
  
  // التحقق من وجود URL Supabase
  if (!SUPABASE_URL) {
    console.error('❌ خطأ: يرجى تعيين SUPABASE_PRODUCTION_URL في متغيرات البيئة');
    console.log('مثال: SUPABASE_PRODUCTION_URL="postgresql://postgres:password@host:5432/postgres"');
    process.exit(1);
  }

  try {
    // 1. إنشاء مجلد للنسخ الاحتياطية
    const backupDir = path.join(process.cwd(), 'database_backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `aws-rds-backup-${timestamp}.sql`);
    
    console.log('📦 1. أخذ نسخة احتياطية من AWS RDS...');
    console.log(`   الملف: ${backupFile}`);
    
    // تصدير البيانات من AWS RDS
    const dumpCommand = `pg_dump "${AWS_RDS_URL}" --no-owner --no-privileges --no-tablespaces > "${backupFile}"`;
    
    try {
      await execAsync(dumpCommand);
      console.log('✅ تم إنشاء النسخة الاحتياطية بنجاح\n');
    } catch (error) {
      console.error('❌ فشل في إنشاء النسخة الاحتياطية:', error.message);
      console.log('\n💡 تأكد من:');
      console.log('   - تثبيت pg_dump على جهازك');
      console.log('   - السماح بالاتصال من IP الخاص بك في AWS RDS');
      process.exit(1);
    }
    
    // التحقق من حجم الملف
    const stats = await fs.stat(backupFile);
    console.log(`📊 حجم النسخة الاحتياطية: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);
    
    // 2. اختياري: تنظيف الملف من أي إعدادات خاصة بـ AWS
    console.log('🧹 2. تنظيف ملف النسخة الاحتياطية...');
    let sqlContent = await fs.readFile(backupFile, 'utf8');
    
    // إزالة أي تعليقات أو إعدادات خاصة بـ AWS
    sqlContent = sqlContent.replace(/-- AWS .*/g, '');
    sqlContent = sqlContent.replace(/-- RDS .*/g, '');
    
    const cleanedFile = path.join(backupDir, `supabase-ready-${timestamp}.sql`);
    await fs.writeFile(cleanedFile, sqlContent);
    console.log('✅ تم تنظيف الملف\n');
    
    // 3. الاستيراد إلى Supabase
    console.log('📥 3. استيراد البيانات إلى Supabase...');
    console.log('⚠️  تحذير: سيتم استبدال البيانات الموجودة في Supabase!');
    console.log('   اضغط Ctrl+C للإلغاء، أو انتظر 5 ثوان للمتابعة...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const importCommand = `psql "${SUPABASE_URL}" < "${cleanedFile}"`;
    
    try {
      const { stdout, stderr } = await execAsync(importCommand);
      if (stderr) {
        console.log('⚠️  تحذيرات:', stderr);
      }
      console.log('✅ تم استيراد البيانات بنجاح\n');
    } catch (error) {
      console.error('❌ فشل في استيراد البيانات:', error.message);
      console.log('\n💡 حلول محتملة:');
      console.log('   1. تحقق من صحة رابط Supabase');
      console.log('   2. تأكد من أن قاعدة البيانات فارغة أو قم بحذف الجداول الموجودة');
      console.log('   3. قم بتشغيل الاستيراد يدوياً:');
      console.log(`      psql "${SUPABASE_URL}" < "${cleanedFile}"`);
      process.exit(1);
    }
    
    // 4. التحقق من البيانات
    console.log('🔍 4. التحقق من البيانات المستوردة...');
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: SUPABASE_URL
        }
      }
    });
    
    try {
      const counts = {
        articles: await prisma.articles.count(),
        users: await prisma.users.count(),
        categories: await prisma.categories.count(),
        deepAnalyses: await prisma.deep_analyses.count().catch(() => 0)
      };
      
      console.log('📊 إحصائيات قاعدة البيانات:');
      console.log(`   - المقالات: ${counts.articles}`);
      console.log(`   - المستخدمون: ${counts.users}`);
      console.log(`   - التصنيفات: ${counts.categories}`);
      console.log(`   - التحليلات العميقة: ${counts.deepAnalyses}`);
      
      await prisma.$disconnect();
    } catch (error) {
      console.error('⚠️  خطأ في التحقق:', error.message);
    }
    
    console.log('\n✅ اكتملت عملية الترحيل بنجاح!');
    console.log('\n📋 الخطوات التالية:');
    console.log('1. حدث متغيرات البيئة في منصة النشر');
    console.log('2. اختبر الموقع محلياً مع قاعدة البيانات الجديدة');
    console.log('3. انشر التطبيق');
    console.log('4. راقب السجلات للتأكد من عدم وجود أخطاء');
    
  } catch (error) {
    console.error('\n❌ خطأ غير متوقع:', error);
    process.exit(1);
  }
}

// التحقق من المتطلبات
async function checkRequirements() {
  console.log('🔍 التحقق من المتطلبات...\n');
  
  // التحقق من pg_dump
  try {
    await execAsync('pg_dump --version');
    console.log('✅ pg_dump متوفر');
  } catch {
    console.error('❌ pg_dump غير مثبت. يرجى تثبيت PostgreSQL client tools');
    process.exit(1);
  }
  
  // التحقق من psql
  try {
    await execAsync('psql --version');
    console.log('✅ psql متوفر');
  } catch {
    console.error('❌ psql غير مثبت. يرجى تثبيت PostgreSQL client tools');
    process.exit(1);
  }
  
  console.log();
}

// تشغيل العملية
(async () => {
  await checkRequirements();
  await migrateToSupabase();
})(); 