#!/usr/bin/env node

/**
 * تطبيق Migration فصل المحتوى مباشرة
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applySeparationMigration() {
  console.log('🚀 بدء تطبيق Migration فصل المحتوى...\n');
  
  try {
    // قراءة ملف SQL
    const sqlFile = path.join(__dirname, '..', 'prisma', 'migrations', 'create_separated_tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // تقسيم SQL إلى عبارات منفصلة
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 تم العثور على ${sqlStatements.length} عبارة SQL`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      
      try {
        console.log(`⏳ تنفيذ العبارة ${i + 1}/${sqlStatements.length}...`);
        
        // تنفيذ العبارة
        await prisma.$executeRawUnsafe(statement);
        successCount++;
        
        // تحديد نوع العملية
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE "([^"]+)"/);
          console.log(`  ✅ تم إنشاء جدول: ${tableName ? tableName[1] : 'غير معروف'}`);
        } else if (statement.includes('CREATE INDEX')) {
          console.log(`  ✅ تم إنشاء فهرس`);
        } else if (statement.includes('ALTER TABLE')) {
          console.log(`  ✅ تم تحديث جدول`);
        } else {
          console.log(`  ✅ تم تنفيذ العبارة`);
        }
        
      } catch (error) {
        errorCount++;
        
        // تجاهل أخطاء "already exists"
        if (error.message.includes('already exists')) {
          console.log(`  ⚠️ العنصر موجود بالفعل (تم تجاهله)`);
          successCount++; // نعتبرها نجاح
          errorCount--;
        } else {
          console.error(`  ❌ خطأ في العبارة ${i + 1}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📊 نتائج تطبيق Migration:`);
    console.log(`✅ عبارات نجحت: ${successCount}`);
    console.log(`❌ عبارات فشلت: ${errorCount}`);
    console.log(`📋 إجمالي العبارات: ${sqlStatements.length}`);
    console.log(`${'═'.repeat(60)}`);
    
    if (errorCount === 0) {
      console.log(`\n🎉 تم تطبيق Migration بنجاح!`);
    } else {
      console.log(`\n⚠️ تم التطبيق مع بعض الأخطاء`);
    }
    
    // التحقق من الجداول المُنشأة
    console.log('\n🔍 التحقق من الجداول الجديدة...');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('news_articles', 'opinion_articles', 'news_analytics', 'opinion_analytics')
      ORDER BY table_name;
    `;
    
    console.log('\n📋 الجداول المُنشأة:');
    if (tables.length === 0) {
      console.log('❌ لم يتم إنشاء أي جداول جديدة');
    } else {
      tables.forEach(table => {
        console.log(`✅ ${table.table_name}`);
      });
    }
    
    return { success: errorCount === 0, successCount, errorCount, tablesCreated: tables.length };
    
  } catch (error) {
    console.error('❌ خطأ عام في تطبيق Migration:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التطبيق
if (require.main === module) {
  applySeparationMigration().catch(console.error);
}

module.exports = { applySeparationMigration };