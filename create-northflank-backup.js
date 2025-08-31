#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// إعدادات قاعدة البيانات الحالية (Supabase)
const CURRENT_DATABASE_URL = 'postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres';

async function createNorthflankBackup() {
  console.log('🔄 إنشاء نسخة احتياطية لـ Northflank');
  console.log('='.repeat(55));
  console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-SA')}`);
  console.log('🎯 التنسيق: SQL مضغوط (gzip)');
  console.log('📦 المتوافق مع: Northflank Import');
  
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
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sqlFile = path.join(backupDir, `northflank-backup-${timestamp}.sql`);
    const gzipFile = path.join(backupDir, `northflank-backup-${timestamp}.sql.gz`);
    
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
    
    // 2. الجداول المهمة فقط (تجنب الجداول النظامية والحساسة)
    const importantTables = [
      'users', 'roles', 'categories', 'articles', 'comments', 
      'interactions', 'tags', 'article_tags', 'user_interests',
      'user_preferences', 'site_settings', 'reporters', 'team_members',
      'media_assets', 'activity_logs', 'loyalty_points', 'daily_doses',
      'dose_contents', 'deep_analyses', 'smart_entities', 'smart_entity_types',
      'smart_terms', 'timeline_events', 'forum_categories', 'forum_topics',
      'forum_replies', 'forum_reputation', 'muqtarab_articles', 'muqtarab_corners',
      'opinion_articles', 'audio_newsletters'
    ];
    
    // 3. التحقق من وجود الجداول
    console.log('\n📋 التحقق من الجداول المتاحة...');
    const availableTables = [];
    let totalRecords = 0;
    
    for (const tableName of importantTables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const count = parseInt(result.rows[0].count);
        if (count > 0) {
          availableTables.push({ name: tableName, count });
          totalRecords += count;
          console.log(`   ✅ ${tableName}: ${count} سجل`);
        } else {
          console.log(`   ⚪ ${tableName}: فارغ`);
        }
      } catch (error) {
        console.log(`   ❌ ${tableName}: غير موجود`);
      }
    }
    
    console.log(`\n📊 إجمالي البيانات المهمة: ${totalRecords} سجل في ${availableTables.length} جدول`);
    
    // 4. إنشاء النسخة الاحتياطية
    console.log('\n💾 إنشاء ملف SQL...');
    
    let backupContent = `-- SABQ CMS Northflank Backup
-- Created: ${new Date().toISOString()}
-- Source: Supabase PostgreSQL
-- Target: Northflank PostgreSQL
-- Records: ${totalRecords}
-- Tables: ${availableTables.length}

-- بسم الله الرحمن الرحيم
-- نظام إدارة المحتوى الذكي - صحيفة سبق

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- تعطيل الفحوص المؤقتة لتسريع الاستيراد
SET check_function_bodies = false;
SET search_path = public, pg_catalog;

`;

    // 5. نسخ البيانات جدول بجدول
    for (const table of availableTables) {
      console.log(`   📦 معالجة ${table.name}...`);
      
      try {
        // الحصول على أعمدة الجدول
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position
        `, [table.name]);
        
        const columns = columnsResult.rows.map(col => col.column_name);
        
        // جلب البيانات
        const dataResult = await client.query(`SELECT * FROM "${table.name}" ORDER BY id`);
        
        backupContent += `\n-- Table: ${table.name} (${table.count} records)\n`;
        backupContent += `-- Columns: ${columns.join(', ')}\n`;
        
        if (dataResult.rows.length > 0) {
          // إضافة أمر حذف البيانات الموجودة (اختياري)
          backupContent += `TRUNCATE TABLE "${table.name}" RESTART IDENTITY CASCADE;\n\n`;
          
          // إضافة البيانات
          for (const row of dataResult.rows) {
            const values = columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') {
                // تنظيف النص وتجنب مشاكل الترميز
                const cleanValue = value.replace(/'/g, "''").replace(/\\/g, '\\\\');
                return `'${cleanValue}'`;
              }
              if (typeof value === 'boolean') return value ? 'true' : 'false';
              if (value instanceof Date) return `'${value.toISOString()}'`;
              if (typeof value === 'object') {
                const jsonStr = JSON.stringify(value).replace(/'/g, "''").replace(/\\/g, '\\\\');
                return `'${jsonStr}'`;
              }
              return value;
            });
            
            backupContent += `INSERT INTO "${table.name}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
          }
          
          backupContent += `\n`;
        }
        
        console.log(`      ✅ ${dataResult.rows.length} سجل`);
        
      } catch (tableError) {
        console.log(`      ⚠️ خطأ: ${tableError.message}`);
        backupContent += `-- ERROR processing table ${table.name}: ${tableError.message}\n\n`;
      }
    }
    
    // إضافة تعليقات ختامية
    backupContent += `\n-- End of SABQ CMS Backup
-- Total records exported: ${totalRecords}
-- Export completed: ${new Date().toISOString()}
-- الحمد لله رب العالمين

-- Reset sequences (important for auto-increment)
`;

    // إعادة تعيين sequences للجداول المهمة
    for (const table of availableTables) {
      if (table.count > 0) {
        backupContent += `SELECT setval(pg_get_serial_sequence('"${table.name}"', 'id'), COALESCE(MAX(id), 1)) FROM "${table.name}";\n`;
      }
    }
    
    // 6. حفظ الملف
    console.log('\n💾 حفظ ملف SQL...');
    fs.writeFileSync(sqlFile, backupContent);
    const sqlSize = (fs.statSync(sqlFile).size / 1024 / 1024).toFixed(2);
    console.log(`   ✅ حجم SQL: ${sqlSize} MB`);
    
    // 7. ضغط الملف بـ gzip
    console.log('\n🗜️ ضغط الملف لـ Northflank...');
    try {
      execSync(`gzip -9 "${sqlFile}"`);
      const gzipSize = (fs.statSync(`${sqlFile}.gz`).size / 1024 / 1024).toFixed(2);
      const compressionRatio = ((1 - (fs.statSync(`${sqlFile}.gz`).size / fs.statSync(sqlFile + '.tmp').size || 1)) * 100).toFixed(1);
      
      console.log(`   ✅ حجم مضغوط: ${gzipSize} MB`);
      console.log(`   📊 نسبة الضغط: ${compressionRatio}%`);
    } catch (gzipError) {
      console.log(`   ⚠️ خطأ في الضغط: ${gzipError.message}`);
      console.log('   💡 يمكنك رفع ملف SQL العادي');
    }
    
    // 8. إنشاء تعليمات الاستيراد
    const instructionsFile = path.join(backupDir, 'NORTHFLANK_IMPORT_INSTRUCTIONS.md');
    const instructions = `# 📋 تعليمات استيراد النسخة الاحتياطية إلى Northflank

## 📁 الملفات:
- **المضغوط**: \`${path.basename(sqlFile)}.gz\` (${fs.existsSync(`${sqlFile}.gz`) ? (fs.statSync(`${sqlFile}.gz`).size / 1024 / 1024).toFixed(2) : 'غير متاح'} MB)
- **العادي**: \`${path.basename(sqlFile)}\` (${sqlSize} MB)

## 🚀 خطوات الاستيراد في Northflank:

### 1️⃣ افتح Northflank Dashboard
- سجل دخولك إلى [Northflank](https://northflank.com)
- اذهب إلى مشروعك
- افتح قاعدة البيانات

### 2️⃣ اذهب إلى Import/Export
- في قاعدة البيانات، ابحث عن تبويب **"Import"** أو **"Backup"**
- اختر **"Import a backup from an existing source"**

### 3️⃣ رفع الملف
- اختر **"Upload a backup file from your machine"**
- ارفع الملف المضغوط: \`${path.basename(sqlFile)}.gz\`
- أو الملف العادي: \`${path.basename(sqlFile)}\` إذا لم يعمل المضغوط

### 4️⃣ تأكيد الاستيراد
⚠️ **تحذير**: هذا سيستبدل جميع البيانات في قاعدة البيانات الحالية

- تأكد من أنك تريد المتابعة
- اضغط **"Import"** أو **"Upload"**

### 5️⃣ انتظار الاستيراد
- سيستغرق بضع دقائق حسب حجم البيانات
- ستحصل على إشعار عند الانتهاء

## 📊 البيانات المستوردة:
- **إجمالي السجلات**: ${totalRecords}
- **عدد الجداول**: ${availableTables.length}
- **الجداول المهمة**:
${availableTables.map(t => `  - ${t.name}: ${t.count} سجل`).join('\n')}

## ✅ بعد الاستيراد:

### 1. تحديث Amplify Environment Variables:
\`\`\`
DATABASE_URL
postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7

DIRECT_URL
postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7
\`\`\`

### 2. اختبار محلي:
\`\`\`bash
# تحديث .env.local محلياً
DATABASE_URL="postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7"

# اختبار الاتصال
npm run dev
\`\`\`

### 3. النشر:
\`\`\`bash
git add .
git commit -m "Switch to Northflank database"
git push
\`\`\`

## 🆘 في حالة وجود مشاكل:

### خطأ في رفع الملف:
- جرب الملف غير المضغوط
- تأكد من أن الملف أقل من حد الرفع المسموح

### أخطاء في الاستيراد:
- تحقق من أن قاعدة البيانات فارغة أو جاهزة للكتابة عليها
- تأكد من أن Prisma schema متطابق

### أخطاء في الاتصال:
- تحقق من أن Internal Connection يعمل في Northflank
- راجع متغيرات البيئة في Amplify

---
**تم إنشاؤه**: ${new Date().toLocaleString('ar-SA')}
**المصدر**: Supabase PostgreSQL  
**الهدف**: Northflank PostgreSQL
`;

    fs.writeFileSync(instructionsFile, instructions);
    
    console.log('\n🎉 النسخة الاحتياطية جاهزة لـ Northflank!');
    console.log('='.repeat(55));
    console.log(`📁 المجلد: ${backupDir}`);
    console.log(`📄 الملفات:`);
    if (fs.existsSync(`${sqlFile}.gz`)) {
      console.log(`   🗜️ مضغوط: ${path.basename(sqlFile)}.gz`);
    }
    console.log(`   📄 عادي: ${path.basename(sqlFile)}`);
    console.log(`   📋 التعليمات: NORTHFLANK_IMPORT_INSTRUCTIONS.md`);
    
    console.log(`\n📊 الإحصائيات:`);
    console.log(`   📦 ${availableTables.length} جدول`);
    console.log(`   📊 ${totalRecords} سجل`);
    console.log(`   💾 ${sqlSize} MB (غير مضغوط)`);
    if (fs.existsSync(`${sqlFile}.gz`)) {
      const gzSize = (fs.statSync(`${sqlFile}.gz`).size / 1024 / 1024).toFixed(2);
      console.log(`   🗜️ ${gzSize} MB (مضغوط)`);
    }
    
    return {
      success: true,
      backupFile: fs.existsSync(`${sqlFile}.gz`) ? `${sqlFile}.gz` : sqlFile,
      instructionsFile,
      stats: { tables: availableTables.length, records: totalRecords }
    };
    
  } catch (error) {
    console.log(`\n❌ فشل في إنشاء النسخة الاحتياطية: ${error.message}`);
    return { success: false, error: error.message };
    
  } finally {
    await client.end();
  }
}

async function main() {
  const result = await createNorthflankBackup();
  
  if (result.success) {
    console.log('\n🚀 النسخة جاهزة للرفع إلى Northflank!');
    console.log('\n📝 الخطوات:');
    console.log('1. افتح Northflank Dashboard');
    console.log('2. اذهب إلى قاعدة البيانات > Import');
    console.log('3. ارفع الملف المضغوط');
    console.log('4. انتظر الاستيراد');
    console.log('5. حدث متغيرات Amplify');
    
  } else {
    console.log('\n❌ فشل في إنشاء النسخة');
  }
}

main().catch(console.error);
