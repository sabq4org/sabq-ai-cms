const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// معلومات قواعد البيانات
const OLD_DATABASE_URL = process.env.OLD_DATABASE_URL;
const NEW_DATABASE_URL = process.env.NEW_DATABASE_URL || process.env.DATABASE_URL;

// ألوان للـ console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkDatabases() {
  log('\n🔍 فحص قواعد البيانات...', 'blue');
  
  if (!OLD_DATABASE_URL) {
    log('❌ خطأ: OLD_DATABASE_URL غير موجود', 'red');
    log('   استخدم: OLD_DATABASE_URL="..." NEW_DATABASE_URL="..." node migrate-to-northflank.js', 'yellow');
    process.exit(1);
  }
  
  if (!NEW_DATABASE_URL) {
    log('❌ خطأ: NEW_DATABASE_URL غير موجود', 'red');
    process.exit(1);
  }
  
  log('✅ تم العثور على قواعد البيانات', 'green');
  log(`   القديمة: ${OLD_DATABASE_URL.substring(0, 30)}...`);
  log(`   الجديدة: ${NEW_DATABASE_URL.substring(0, 30)}...`);
}

async function createBackup() {
  log('\n📦 إنشاء نسخة احتياطية...', 'blue');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-${timestamp}.sql`;
  
  try {
    execSync(`pg_dump "${OLD_DATABASE_URL}" --data-only --no-owner --no-acl -f ${backupFile}`, {
      stdio: 'inherit'
    });
    
    const stats = fs.statSync(backupFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    log(`✅ تم إنشاء النسخة الاحتياطية: ${backupFile} (${sizeMB} MB)`, 'green');
    return backupFile;
  } catch (error) {
    log('❌ فشل إنشاء النسخة الاحتياطية', 'red');
    throw error;
  }
}

async function prepareNewDatabase() {
  log('\n🔧 تحضير قاعدة البيانات الجديدة...', 'blue');
  
  try {
    // تشغيل Prisma migrations
    log('   تشغيل Prisma migrations...', 'yellow');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: NEW_DATABASE_URL },
      stdio: 'inherit'
    });
    
    log('✅ قاعدة البيانات جاهزة', 'green');
  } catch (error) {
    log('⚠️  تحذير: فشل تشغيل migrations', 'yellow');
    log('   قد تكون الجداول موجودة بالفعل', 'yellow');
  }
}

async function importData(backupFile) {
  log('\n📥 استيراد البيانات...', 'blue');
  
  try {
    // إزالة القيود مؤقتاً للاستيراد السريع
    const disableConstraints = `
      SET session_replication_role = 'replica';
    `;
    
    const enableConstraints = `
      SET session_replication_role = 'origin';
    `;
    
    // استيراد البيانات
    log('   بدء الاستيراد...', 'yellow');
    
    // كتابة الأوامر في ملف مؤقت
    const importFile = 'import-commands.sql';
    fs.writeFileSync(importFile, `${disableConstraints}\n\\i ${backupFile}\n${enableConstraints}`);
    
    execSync(`psql "${NEW_DATABASE_URL}" -f ${importFile}`, {
      stdio: 'inherit'
    });
    
    // حذف الملف المؤقت
    fs.unlinkSync(importFile);
    
    log('✅ تم استيراد البيانات بنجاح', 'green');
  } catch (error) {
    log('❌ فشل استيراد البيانات', 'red');
    throw error;
  }
}

async function verifyMigration() {
  log('\n🔍 التحقق من النقل...', 'blue');
  
  const { Client } = require('pg');
  
  const oldClient = new Client({ connectionString: OLD_DATABASE_URL });
  const newClient = new Client({ connectionString: NEW_DATABASE_URL });
  
  try {
    await oldClient.connect();
    await newClient.connect();
    
    const tables = [
      'users',
      'articles', 
      'categories',
      'interactions',
      'reporters',
      'tags'
    ];
    
    let allMatch = true;
    
    for (const table of tables) {
      try {
        const oldResult = await oldClient.query(`SELECT COUNT(*) FROM ${table}`);
        const newResult = await newClient.query(`SELECT COUNT(*) FROM ${table}`);
        
        const oldCount = parseInt(oldResult.rows[0].count);
        const newCount = parseInt(newResult.rows[0].count);
        const match = oldCount === newCount;
        
        if (!match) allMatch = false;
        
        log(`   ${table}: ${oldCount} → ${newCount} ${match ? '✅' : '❌'}`, match ? 'green' : 'red');
      } catch (err) {
        log(`   ${table}: ⚠️ لا يمكن المقارنة`, 'yellow');
      }
    }
    
    if (allMatch) {
      log('\n🎉 تم نقل جميع البيانات بنجاح!', 'green');
    } else {
      log('\n⚠️  بعض الجداول بها اختلافات', 'yellow');
    }
    
  } finally {
    await oldClient.end();
    await newClient.end();
  }
}

async function migrate() {
  log('🚀 بدء نقل البيانات إلى Northflank', 'bright');
  log('=====================================\n', 'bright');
  
  try {
    // 1. فحص قواعد البيانات
    await checkDatabases();
    
    // 2. إنشاء نسخة احتياطية
    const backupFile = await createBackup();
    
    // 3. تحضير قاعدة البيانات الجديدة
    await prepareNewDatabase();
    
    // 4. استيراد البيانات
    await importData(backupFile);
    
    // 5. التحقق من النقل
    await verifyMigration();
    
    log('\n✅ اكتمل نقل البيانات بنجاح!', 'green');
    log('\n📝 الخطوات التالية:', 'blue');
    log('   1. تحقق من التطبيق في Northflank');
    log('   2. اختبر الوظائف الأساسية');
    log('   3. حدّث DNS إذا كان كل شيء يعمل');
    
    // الاحتفاظ بالنسخة الاحتياطية
    log(`\n💾 النسخة الاحتياطية محفوظة في: ${backupFile}`, 'yellow');
    
  } catch (error) {
    log('\n❌ فشل نقل البيانات', 'red');
    console.error(error);
    process.exit(1);
  }
}

// تشغيل النقل
migrate();
