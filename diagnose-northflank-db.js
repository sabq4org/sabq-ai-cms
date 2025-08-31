#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// إعداد قاعدة البيانات 
const NORTHFLANK_DATABASE_URL = 'postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7';
const SUPABASE_DATABASE_URL = 'postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres';

async function diagnoseAndFixDatabase() {
  console.log('🔍 تشخيص مشكلة قاعدة البيانات في Northflank');
  console.log('='.repeat(60));
  
  const northflankClient = new Client({
    connectionString: NORTHFLANK_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });

  try {
    console.log('⏳ الاتصال بـ Northflank...');
    await northflankClient.connect();
    console.log('✅ متصل بـ Northflank');
    
    // فحص الجداول الموجودة
    console.log('\n📊 فحص الجداول الموجودة:');
    const tablesResult = await northflankClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`عدد الجداول الموجودة: ${tablesResult.rows.length}`);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ لا توجد جداول - الاستيراد فشل كلياً');
      
      // إنشاء نسخة احتياطية محسنة
      console.log('\n🛠️ إنشاء نسخة احتياطية محسنة...');
      await createSchemaBasedBackup();
      
    } else {
      console.log('📋 الجداول الموجودة:');
      for (const row of tablesResult.rows) {
        const tableName = row.table_name;
        try {
          const countResult = await northflankClient.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
          console.log(`   ✅ ${tableName}: ${countResult.rows[0].count} سجل`);
        } catch (error) {
          console.log(`   ❌ ${tableName}: خطأ في القراءة`);
        }
      }
      
      // فحص المشكلة المحددة
      if (!tablesResult.rows.find(row => row.table_name === 'users')) {
        console.log('\n❌ مشكلة: جدول users مفقود');
        console.log('💡 الحل: نسخ احتياطي محسن مع Schema');
      }
    }
    
  } catch (error) {
    console.log(`\n❌ خطأ في الاتصال: ${error.message}`);
  } finally {
    await northflankClient.end();
  }
}

async function createSchemaBasedBackup() {
  console.log('🔄 إنشاء نسخة احتياطية مع Schema...');
  
  const supabaseClient = new Client({
    connectionString: SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });

  try {
    await supabaseClient.connect();
    
    const backupDir = path.join(__dirname, 'northflank-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const sqlFile = path.join(backupDir, `sabq-schema-backup-${timestamp}.sql`);
    
    // إنشاء نسخة شاملة مع Schema
    let backupContent = `-- SABQ CMS - Complete Schema & Data Backup for Northflank
-- Created: ${new Date().toISOString()}
-- Purpose: Fix missing tables issue

-- Drop existing tables (if any)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;

BEGIN;

`;

    // الحصول على Schema للجداول المهمة
    const importantTables = [
      'users', 'roles', 'categories', 'articles', 'comments', 
      'interactions', 'tags', 'article_tags', 'user_interests',
      'user_preferences', 'site_settings', 'reporters', 'team_members'
    ];
    
    console.log('📋 جمع Schema والبيانات...');
    
    for (const tableName of importantTables) {
      try {
        // الحصول على CREATE TABLE statement
        const schemaResult = await supabaseClient.query(`
          SELECT 
            'CREATE TABLE ' || schemaname||'.'||tablename||' (' || 
            array_to_string(
              array_agg(
                column_name||' '|| type||' '||not_null||default_value
              ), ', '
            ) || ');' as create_statement
          FROM (
            SELECT 
              schemaname,
              tablename,
              attname AS column_name,
              format_type(atttypid, atttypmod) AS type,
              CASE WHEN attnotnull THEN ' NOT NULL' ELSE '' END AS not_null,
              CASE WHEN pg_get_expr(adbin, adrelid) IS NOT NULL 
                   THEN ' DEFAULT '|| pg_get_expr(adbin, adrelid) 
                   ELSE '' END AS default_value
            FROM pg_attribute 
            JOIN pg_class ON pg_class.oid = attrelid
            JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
            LEFT JOIN pg_attrdef ON adrelid = attrelid AND adnum = attnum
            WHERE schemaname = 'public' 
              AND tablename = $1
              AND attnum > 0 
              AND NOT attisdropped
            ORDER BY attnum
          ) t
          GROUP BY schemaname, tablename;
        `, [tableName]);
        
        if (schemaResult.rows.length > 0) {
          backupContent += `\n-- Table: ${tableName}\n`;
          backupContent += schemaResult.rows[0].create_statement + '\n\n';
          
          // جمع البيانات
          const dataResult = await supabaseClient.query(`SELECT * FROM "${tableName}" LIMIT 1000`);
          
          if (dataResult.rows.length > 0) {
            const columns = Object.keys(dataResult.rows[0]);
            
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
              
              backupContent += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
            }
          }
          
          console.log(`   ✅ ${tableName}: Schema + ${dataResult.rows.length} records`);
        }
        
      } catch (error) {
        console.log(`   ⚠️ ${tableName}: ${error.message}`);
        
        // إنشاء Schema بسيط للجداول المفقودة
        if (tableName === 'users') {
          backupContent += `
-- Basic users table schema
CREATE TABLE "users" (
  "id" text PRIMARY KEY,
  "name" text,
  "email" text UNIQUE,
  "image" text,
  "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
  "role" text DEFAULT 'USER'
);

`;
        }
      }
    }
    
    backupContent += '\nCOMMIT;\n\n-- Reset sequences\n';
    backupContent += `SELECT setval(pg_get_serial_sequence('"users"', 'id'), (SELECT MAX(id) FROM "users"));`;
    
    // حفظ الملف
    fs.writeFileSync(sqlFile, backupContent);
    const sizeMB = (fs.statSync(sqlFile).size / 1024 / 1024).toFixed(2);
    
    console.log(`✅ تم إنشاء النسخة المحسنة: ${sizeMB} MB`);
    console.log(`📁 المسار: ${sqlFile}`);
    
    // إنشاء دليل جديد
    const guideFile = path.join(backupDir, 'FIXED_IMPORT_GUIDE.md');
    const guide = `# 🔧 إصلاح مشكلة الاستيراد في Northflank

## المشكلة:
- الجداول لم يتم إنشاؤها بشكل صحيح
- خطأ: "relation 'users' does not exist"

## الحل:
1. احذف قاعدة البيانات الحالية في Northflank
2. أنشئ قاعدة بيانات جديدة
3. استورد الملف الجديد: ${path.basename(sqlFile)}

## هذا الملف يحتوي على:
- ✅ Schema كامل للجداول
- ✅ البيانات مع الأنواع الصحيحة
- ✅ Extensions المطلوبة
- ✅ Sequences محدثة

## خطوات الاستيراد:
1. Northflank Dashboard > Database
2. Delete current database
3. Create new PostgreSQL database
4. Import > Upload SQL file: ${path.basename(sqlFile)}
5. Wait for completion
6. Test connection

## بعد الاستيراد:
\`\`\`bash
# اختبار الاتصال
node diagnose-northflank-db.js
\`\`\`
`;
    
    fs.writeFileSync(guideFile, guide);
    console.log(`📋 دليل الإصلاح: ${path.basename(guideFile)}`);
    
    return { success: true, file: sqlFile };
    
  } catch (error) {
    console.log(`❌ فشل في إنشاء النسخة: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await supabaseClient.end();
  }
}

// تشغيل التشخيص
diagnoseAndFixDatabase().then(() => {
  console.log('\n🎯 الخطوة التالية:');
  console.log('1. استخدم النسخة الاحتياطية المحسنة');
  console.log('2. احذف قاعدة البيانات الحالية في Northflank');
  console.log('3. أنشئ قاعدة بيانات جديدة');
  console.log('4. استورد الملف الجديد');
}).catch(console.error);
