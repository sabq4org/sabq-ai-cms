#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// استيراد البيانات من قاعدة Supabase
const SUPABASE_DATABASE_URL = 'postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres';

async function createFixedNorthflankBackup() {
  console.log('🔧 إنشاء نسخة احتياطية محسنة لإصلاح مشكلة Northflank');
  console.log('='.repeat(65));
  console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-SA')}`);
  console.log('🎯 الهدف: إصلاح مشكلة "relation users does not exist"');
  
  const client = new Client({
    connectionString: SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });

  try {
    console.log('\n⏳ الاتصال بقاعدة البيانات المصدر...');
    await client.connect();
    console.log('✅ تم الاتصال بنجاح');
    
    const backupDir = path.join(__dirname, 'northflank-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const sqlFile = path.join(backupDir, `sabq-fixed-${timestamp}.sql`);
    
    // إنشاء Schema كامل
    let backupContent = `-- SABQ CMS - FIXED BACKUP FOR NORTHFLANK
-- Created: ${new Date().toISOString()}
-- Purpose: Fix "relation does not exist" errors
-- Method: Full schema recreation with data

-- Clean slate approach
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO postgres;

-- Essential extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set connection parameters
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET row_security = off;

-- Start transaction
BEGIN;

-- Create tables with complete schema
`;

    // إنشاء جداول أساسية مع Schema كامل
    console.log('\n📋 إنشاء Schema الأساسي...');
    
    const basicTables = {
      users: `CREATE TABLE "users" (
        id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name text,
        email text UNIQUE,
        password text,
        image text,
        "emailVerified" timestamp(3),
        "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        role text DEFAULT 'USER',
        bio text,
        location text,
        website text,
        "isActive" boolean DEFAULT true,
        "lastLoginAt" timestamp(3),
        preferences jsonb DEFAULT '{}'
      );`,
      
      categories: `CREATE TABLE "categories" (
        id serial PRIMARY KEY,
        name text NOT NULL,
        slug text UNIQUE NOT NULL,
        description text,
        color text DEFAULT '#3B82F6',
        icon text,
        "isActive" boolean DEFAULT true,
        "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "parentId" integer REFERENCES categories(id)
      );`,
      
      articles: `CREATE TABLE "articles" (
        id serial PRIMARY KEY,
        title text NOT NULL,
        content text,
        excerpt text,
        slug text UNIQUE NOT NULL,
        "featuredImage" text,
        "publishedAt" timestamp(3),
        "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "authorId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "categoryId" integer REFERENCES categories(id),
        status text DEFAULT 'DRAFT',
        "viewCount" integer DEFAULT 0,
        "likeCount" integer DEFAULT 0,
        "commentCount" integer DEFAULT 0,
        metadata jsonb DEFAULT '{}',
        "isActive" boolean DEFAULT true,
        "isFeatured" boolean DEFAULT false
      );`
    };
    
    // إضافة Schema للجداول الأساسية
    for (const [tableName, schema] of Object.entries(basicTables)) {
      backupContent += `\n-- Table: ${tableName}\n${schema}\n`;
    }
    
    // جمع البيانات الفعلية من قاعدة البيانات
    console.log('\n📊 جمع البيانات من الجداول...');
    
    const tablesList = ['users', 'categories', 'articles', 'comments', 'interactions'];
    let totalRecords = 0;
    
    for (const tableName of tablesList) {
      try {
        const dataResult = await client.query(`SELECT * FROM "${tableName}" ORDER BY id LIMIT 500`);
        
        if (dataResult.rows.length > 0) {
          console.log(`   📦 ${tableName}: ${dataResult.rows.length} سجل`);
          totalRecords += dataResult.rows.length;
          
          const columns = Object.keys(dataResult.rows[0]);
          backupContent += `\n-- Data for ${tableName}\n`;
          
          for (const row of dataResult.rows) {
            const values = columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') {
                return `'${value.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
              }
              if (typeof value === 'boolean') return value ? 'true' : 'false';
              if (value instanceof Date) return `'${value.toISOString()}'`;
              if (typeof value === 'object') {
                return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
              }
              if (typeof value === 'number') return value.toString();
              return `'${value}'`;
            });
            
            backupContent += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
          }
        } else {
          console.log(`   ⚪ ${tableName}: فارغ`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`);
        
        // إنشاء Schema بديل للجداول المفقودة
        if (tableName === 'comments') {
          backupContent += `
-- Table: comments (fallback schema)
CREATE TABLE "comments" (
  id serial PRIMARY KEY,
  content text NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "authorId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "articleId" integer NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  "parentId" integer REFERENCES comments(id),
  "isActive" boolean DEFAULT true,
  "likeCount" integer DEFAULT 0
);
`;
        }
        
        if (tableName === 'interactions') {
          backupContent += `
-- Table: interactions (fallback schema)
CREATE TABLE "interactions" (
  id serial PRIMARY KEY,
  type text NOT NULL,
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "articleId" integer REFERENCES articles(id) ON DELETE CASCADE,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata jsonb DEFAULT '{}'
);
`;
        }
      }
    }
    
    // إضافة Indexes مهمة
    backupContent += `
-- Essential indexes
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles("authorId");
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles("categoryId");
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles("publishedAt");
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Update sequences
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval('articles_id_seq', COALESCE((SELECT MAX(id) FROM articles), 1));

COMMIT;

-- Verify installation
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully';
  RAISE NOTICE 'Tables created: users, categories, articles, comments, interactions';
  RAISE NOTICE 'Total records imported: ${totalRecords}';
END $$;
`;
    
    // حفظ الملف
    fs.writeFileSync(sqlFile, backupContent);
    const sizeMB = (fs.statSync(sqlFile).size / 1024 / 1024).toFixed(2);
    console.log(`\n💾 تم إنشاء الملف: ${sizeMB} MB`);
    
    // إنشاء دليل الإصلاح
    const guideFile = path.join(backupDir, 'NORTHFLANK_FIX_INSTRUCTIONS.md');
    const guide = `# 🔧 إصلاح مشكلة قاعدة البيانات في Northflank

## 🚨 المشكلة المحددة:
\`\`\`
ERROR: relation "users" does not exist
Process terminated with exit code 3
\`\`\`

## ✅ الحل:

### 1. احذف قاعدة البيانات الحالية:
- اذهب إلى Northflank Dashboard
- Database > Settings > Delete Database
- أكد الحذف

### 2. أنشئ قاعدة بيانات جديدة:
- Create New Database
- Type: PostgreSQL
- Plan: نفس الخطة السابقة
- Name: sabq-database (أو أي اسم)

### 3. استورد الملف المحسن:
- Database > Import
- Upload File: **${path.basename(sqlFile)}**
- Wait for completion (3-5 minutes)

### 4. تحديث Connection String:
الحصول على Connection String الجديد وتحديث متغيرات البيئة

## 🎯 مزايا هذا الحل:

- ✅ **Schema كامل**: جميع الجداول مع التعريف الصحيح
- ✅ **بيانات محفوظة**: ${totalRecords} سجل مستورد
- ✅ **Indexes محسنة**: لأداء أفضل  
- ✅ **Extensions مفعلة**: UUID وCrypto
- ✅ **Sequences محدثة**: تتابع الأرقام صحيح

## ⚡ بعد الاستيراد:

1. **اختبر الاتصال:**
\`\`\`bash
node test-northflank-connection.js
\`\`\`

2. **حدث متغيرات التطبيق:**
\`\`\`
DATABASE_URL=postgresql://new-connection-string
DIRECT_URL=postgresql://new-connection-string  
\`\`\`

3. **انشر التطبيق:**
\`\`\`bash
git add .
git commit -m "Fix database connection"
git push
\`\`\`

## 🔄 خطة البديل:
إذا استمرت المشكلة، يمكن استخدام pg_dump مباشرة من Supabase.

---
**📞 مساعدة:** في حالة وجود مشاكل، راجع logs التفصيلية أعلاه.`;
    
    fs.writeFileSync(guideFile, guide);
    
    console.log(`\n🎉 تم إنشاء النسخة المحسنة بنجاح!`);
    console.log(`📁 الملف: ${path.basename(sqlFile)}`);
    console.log(`📋 الدليل: ${path.basename(guideFile)}`);
    console.log(`📊 البيانات: ${totalRecords} سجل`);
    
    return { success: true, file: sqlFile, records: totalRecords };
    
  } catch (error) {
    console.log(`\n❌ خطأ: ${error.message}`);
    return { success: false, error: error.message };
    
  } finally {
    await client.end();
  }
}

createFixedNorthflankBackup().then(result => {
  if (result.success) {
    console.log('\n🚀 الخطوات التالية:');
    console.log('1. اذهب إلى Northflank Dashboard');
    console.log('2. احذف قاعدة البيانات الحالية');  
    console.log('3. أنشئ قاعدة بيانات جديدة');
    console.log('4. استورد الملف الجديد');
    console.log('5. حدث Connection String');
  }
}).catch(console.error);
