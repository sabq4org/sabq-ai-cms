#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// إعدادات قاعدة البيانات الحالية (Supabase)
const CURRENT_DATABASE_URL = 'postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres';

async function createBackup() {
  console.log('🔄 إنشاء نسخة احتياطية من قاعدة البيانات الحالية');
  console.log('='.repeat(60));
  console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-SA')}`);
  console.log('🗄️ المصدر: Supabase PostgreSQL');
  
  const client = new Client({
    connectionString: CURRENT_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 30000
  });

  try {
    console.log('\n⏳ الاتصال بقاعدة البيانات...');
    await client.connect();
    console.log('✅ تم الاتصال بنجاح');
    
    // إنشاء مجلد للنسخ الاحتياطية
    const backupDir = path.join(__dirname, 'database-backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `sabq-cms-backup-${timestamp}.sql`);
    
    // 1. معلومات عامة عن قاعدة البيانات
    console.log('\n📊 جمع معلومات قاعدة البيانات...');
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as pg_version,
        now() as backup_time
    `);
    
    const info = dbInfo.rows[0];
    console.log(`   📁 قاعدة البيانات: ${info.database_name}`);
    console.log(`   👤 المستخدم: ${info.current_user}`);
    console.log(`   🔧 الإصدار: ${info.pg_version.split(' ')[1]}`);
    
    // 2. فحص الجداول الموجودة
    console.log('\n📋 فحص الجداول الموجودة...');
    const tables = await client.query(`
      SELECT 
        schemaname, 
        tablename,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_name = tablename AND table_schema = schemaname) as column_count
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    console.log(`   📊 عدد الجداول: ${tables.rows.length}`);
    
    let backupContent = `-- SABQ CMS Database Backup
-- Created: ${new Date().toISOString()}
-- Source: ${CURRENT_DATABASE_URL.replace(/:[^:@]+@/, ':****@')}
-- Database: ${info.database_name}
-- PostgreSQL Version: ${info.pg_version}

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

`;

    // 3. نسخ احتياطي لكل جدول
    let totalRecords = 0;
    const tableData = [];
    
    for (const table of tables.rows) {
      console.log(`\n📦 معالجة الجدول: ${table.tablename}`);
      
      try {
        // عد السجلات
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table.tablename}"`);
        const recordCount = parseInt(countResult.rows[0].count);
        totalRecords += recordCount;
        
        console.log(`   📊 عدد السجلات: ${recordCount}`);
        
        if (recordCount > 0) {
          // الحصول على بنية الجدول
          console.log(`   🏗️ جمع بنية الجدول...`);
          const columnsResult = await client.query(`
            SELECT 
              column_name, 
              data_type, 
              is_nullable,
              column_default
            FROM information_schema.columns 
            WHERE table_name = $1 AND table_schema = 'public'
            ORDER BY ordinal_position
          `, [table.tablename]);
          
          const columns = columnsResult.rows.map(col => col.column_name);
          
          // جمع البيانات
          console.log(`   💾 جمع البيانات...`);
          const dataResult = await client.query(`SELECT * FROM "${table.tablename}"`);
          
          // إضافة إلى النسخة الاحتياطية
          backupContent += `\n-- Table: ${table.tablename} (${recordCount} records)\n`;
          
          if (recordCount > 0) {
            backupContent += `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE;\n`;
            
            for (const row of dataResult.rows) {
              const values = columns.map(col => {
                const value = row[col];
                if (value === null) return 'NULL';
                if (typeof value === 'string') {
                  return `'${value.replace(/'/g, "''")}'`;
                }
                if (typeof value === 'boolean') return value ? 'true' : 'false';
                if (value instanceof Date) return `'${value.toISOString()}'`;
                if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
                return value;
              });
              
              backupContent += `INSERT INTO "${table.tablename}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
            }
          }
          
          tableData.push({
            name: table.tablename,
            records: recordCount,
            columns: columns.length
          });
          
        } else {
          console.log(`   ⚪ الجدول فارغ - تخطي البيانات`);
          tableData.push({
            name: table.tablename,
            records: 0,
            columns: table.column_count
          });
        }
        
      } catch (tableError) {
        console.log(`   ⚠️ خطأ في معالجة الجدول ${table.tablename}: ${tableError.message}`);
        backupContent += `-- ERROR backing up table ${table.tablename}: ${tableError.message}\n`;
      }
    }
    
    // 4. حفظ النسخة الاحتياطية
    console.log(`\n💾 حفظ النسخة الاحتياطية...`);
    fs.writeFileSync(backupFile, backupContent);
    
    // 5. إنشاء تقرير JSON
    const reportFile = path.join(backupDir, `sabq-cms-backup-report-${timestamp}.json`);
    const report = {
      backup_date: new Date().toISOString(),
      source_database: {
        url: CURRENT_DATABASE_URL.replace(/:[^:@]+@/, ':****@'),
        name: info.database_name,
        user: info.current_user,
        version: info.pg_version
      },
      backup_files: {
        sql: backupFile,
        report: reportFile
      },
      statistics: {
        total_tables: tables.rows.length,
        total_records: totalRecords,
        tables_with_data: tableData.filter(t => t.records > 0).length,
        empty_tables: tableData.filter(t => t.records === 0).length
      },
      table_details: tableData
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n🎉 تمت النسخة الاحتياطية بنجاح!');
    console.log('='.repeat(60));
    console.log(`📊 الإحصائيات:`);
    console.log(`   🗃️ إجمالي الجداول: ${tables.rows.length}`);
    console.log(`   📦 جداول تحتوي على بيانات: ${tableData.filter(t => t.records > 0).length}`);
    console.log(`   📊 إجمالي السجلات: ${totalRecords}`);
    console.log(`   💾 حجم النسخة: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB`);
    
    console.log(`\n📁 الملفات المحفوظة:`);
    console.log(`   🗄️ SQL: ${backupFile}`);
    console.log(`   📋 التقرير: ${reportFile}`);
    
    console.log(`\n📋 تفاصيل الجداول:`);
    tableData.forEach((table, index) => {
      const status = table.records > 0 ? '✅' : '⚪';
      console.log(`   ${status} ${table.name}: ${table.records} سجل, ${table.columns} عمود`);
    });
    
    console.log('\n💡 لاستعادة النسخة الاحتياطية:');
    console.log(`   psql "NEW_DATABASE_URL" < "${backupFile}"`);
    
    // إنشاء سكريبت استعادة
    const restoreScript = `#!/bin/bash
# سكريبت استعادة النسخة الاحتياطية
# تم إنشاؤه: ${new Date().toISOString()}

echo "🔄 استعادة النسخة الاحتياطية لـ SABQ CMS"
echo "=========================================="

# تحقق من وجود DATABASE_URL
if [ -z "\$DATABASE_URL" ]; then
  echo "❌ يرجى تعيين DATABASE_URL"
  echo "مثال: export DATABASE_URL='postgresql://user:pass@host:port/db'"
  exit 1
fi

echo "📊 معلومات النسخة الاحتياطية:"
echo "   التاريخ: ${new Date().toISOString()}"
echo "   الجداول: ${tables.rows.length}"
echo "   السجلات: ${totalRecords}"
echo "   المصدر: Supabase"

echo ""
read -p "⚠️  هذا سيحذف البيانات الموجودة. هل تريد المتابعة؟ (y/N): " confirm

if [[ \$confirm == "y" || \$confirm == "Y" ]]; then
  echo "⏳ بدء الاستعادة..."
  psql "\$DATABASE_URL" < "${backupFile}"
  echo "✅ تمت الاستعادة!"
else
  echo "❌ تم إلغاء العملية"
fi
`;

    const restoreScriptFile = path.join(backupDir, `restore-backup-${timestamp}.sh`);
    fs.writeFileSync(restoreScriptFile, restoreScript);
    fs.chmodSync(restoreScriptFile, 0o755); // جعل الملف قابل للتنفيذ
    
    console.log(`   🔧 سكريبت الاستعادة: ${restoreScriptFile}`);
    
    return {
      success: true,
      backupFile,
      reportFile,
      restoreScript: restoreScriptFile,
      statistics: report.statistics
    };
    
  } catch (error) {
    console.log(`\n❌ فشل في إنشاء النسخة الاحتياطية: ${error.message}`);
    console.log(`📝 كود الخطأ: ${error.code || 'غير محدد'}`);
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
    
  } finally {
    await client.end();
    console.log('\n🔌 تم إنهاء الاتصال');
  }
}

async function main() {
  const result = await createBackup();
  
  if (result.success) {
    console.log('\n🚀 النسخة الاحتياطية جاهزة! يمكنك الآن تغيير قاعدة البيانات بأمان.');
    
    console.log('\n📝 الخطوات التالية:');
    console.log('1. تحديث DATABASE_URL في .env.local للقاعدة الجديدة');
    console.log('2. تشغيل: npx prisma db push (لإنشاء الجداول في القاعدة الجديدة)');
    console.log('3. استعادة البيانات باستخدام سكريبت الاستعادة إذا لزم الأمر');
    
  } else {
    console.log('\n❌ فشل في إنشاء النسخة الاحتياطية');
    console.log('تأكد من صحة الاتصال بقاعدة البيانات الحالية');
  }
}

main().catch(console.error);
