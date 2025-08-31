#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// إعدادات قاعدة البيانات الحالية (Supabase)
const CURRENT_DATABASE_URL = 'postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres';

async function createNorthflankBackup() {
  console.log('🔄 إنشاء نسخة احتياطية محسنة لـ Northflank');
  console.log('='.repeat(55));
  console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-SA')}`);
  console.log('🎯 التنسيق: SQL مضغوط (gzip)');
  console.log('📦 متوافق مع: Northflank Import Backup');
  
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
    const backupDir = path.join(__dirname, 'northflank-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const sqlFile = path.join(backupDir, `sabq-northflank-${timestamp}.sql`);
    
    // الجداول المهمة فقط
    const importantTables = [
      'users', 'roles', 'categories', 'articles', 'comments', 
      'interactions', 'tags', 'article_tags', 'user_interests',
      'user_preferences', 'site_settings', 'reporters', 'team_members',
      'media_assets', 'activity_logs', 'daily_doses',
      'dose_contents', 'deep_analyses', 'smart_entities', 
      'smart_entity_types', 'smart_terms'
    ];
    
    console.log('\n📋 فحص الجداول وجمع البيانات...');
    const availableTables = [];
    let totalRecords = 0;
    
    for (const tableName of importantTables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const count = parseInt(result.rows[0].count);
        availableTables.push({ name: tableName, count });
        totalRecords += count;
        
        if (count > 0) {
          console.log(`   ✅ ${tableName}: ${count} سجل`);
        } else {
          console.log(`   ⚪ ${tableName}: فارغ`);
        }
      } catch (error) {
        console.log(`   ❌ ${tableName}: غير موجود`);
      }
    }
    
    console.log(`\n📊 الإجمالي: ${totalRecords} سجل في ${availableTables.length} جدول`);
    
    // إنشاء محتوى SQL
    console.log('\n💾 إنشاء ملف SQL...');
    
    let backupContent = `-- SABQ CMS - Northflank Backup
-- Created: ${new Date().toISOString()}
-- Records: ${totalRecords}

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;

BEGIN;

`;

    // نسخ البيانات للجداول التي تحتوي على بيانات
    const tablesWithData = availableTables.filter(t => t.count > 0);
    
    for (const table of tablesWithData) {
      console.log(`   📦 نسخ ${table.name}...`);
      
      try {
        const columnsResult = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position
        `, [table.name]);
        
        const columns = columnsResult.rows.map(col => col.column_name);
        const dataResult = await client.query(`SELECT * FROM "${table.name}" ORDER BY id LIMIT 1000`);
        
        backupContent += `\n-- Table: ${table.name}\n`;
        backupContent += `TRUNCATE TABLE "${table.name}" RESTART IDENTITY CASCADE;\n\n`;
        
        for (const row of dataResult.rows) {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`;
            }
            if (typeof value === 'boolean') return value ? 'true' : 'false';
            if (value instanceof Date) return `'${value.toISOString()}'`;
            if (typeof value === 'object') {
              return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            }
            return value;
          });
          
          backupContent += `INSERT INTO "${table.name}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        console.log(`      ✅ ${dataResult.rows.length} سجل`);
        
      } catch (tableError) {
        console.log(`      ⚠️ خطأ في ${table.name}`);
      }
    }
    
    backupContent += '\nCOMMIT;\n';
    
    // حفظ الملف
    fs.writeFileSync(sqlFile, backupContent);
    const sqlSizeMB = (fs.statSync(sqlFile).size / 1024 / 1024).toFixed(2);
    console.log(`   ✅ تم الحفظ: ${sqlSizeMB} MB`);
    
    // ضغط الملف
    console.log('\n🗜️ ضغط الملف...');
    let gzipFile = null;
    try {
      execSync(`gzip -c "${sqlFile}" > "${sqlFile}.gz"`);
      gzipFile = `${sqlFile}.gz`;
      const gzipSizeMB = (fs.statSync(gzipFile).size / 1024 / 1024).toFixed(2);
      console.log(`   ✅ مضغوط: ${gzipSizeMB} MB`);
    } catch (gzipError) {
      console.log(`   ⚠️ فشل الضغط، سيتم استخدام الملف العادي`);
    }
    
    // دليل الاستيراد
    const guideFile = path.join(backupDir, 'UPLOAD_TO_NORTHFLANK.md');
    const guide = `# 🚀 رفع النسخة الاحتياطية إلى Northflank

## الملف المطلوب:
${gzipFile ? `- المضغوط: ${path.basename(gzipFile)} (${(fs.statSync(gzipFile).size / 1024 / 1024).toFixed(2)} MB)` : ''}
- العادي: ${path.basename(sqlFile)} (${sqlSizeMB} MB)

## الخطوات:
1. افتح Northflank Dashboard
2. اذهب إلى قاعدة البيانات > Import  
3. اختر "Import a backup from an existing source"
4. ارفع الملف ${gzipFile ? 'المضغوط' : 'العادي'}
5. انتظر الاستيراد (2-5 دقائق)

## بعد الاستيراد:
حدث متغيرات Amplify:

DATABASE_URL
postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7

DIRECT_URL  
postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7

## اختبار:
npm run dev

## النشر:
git add . && git commit -m "Switch to Northflank" && git push
`;
    
    fs.writeFileSync(guideFile, guide);
    
    console.log('\n🎉 النسخة جاهزة للرفع!');
    console.log(`📁 المجلد: ${backupDir}`);
    console.log(`📄 الملفات: ${gzipFile ? path.basename(gzipFile) : path.basename(sqlFile)}`);
    console.log(`📋 الدليل: ${path.basename(guideFile)}`);
    
    return { success: true, stats: { tables: tablesWithData.length, records: totalRecords } };
    
  } catch (error) {
    console.log(`\n❌ فشل: ${error.message}`);
    return { success: false, error: error.message };
    
  } finally {
    await client.end();
  }
}

createNorthflankBackup().then(result => {
  if (result.success) {
    console.log('\n🚀 اذهب الآن إلى Northflank وارفع الملف!');
  }
}).catch(console.error);
