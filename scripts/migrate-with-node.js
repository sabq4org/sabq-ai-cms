const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// إعدادات الاتصال
const supabaseConfig = {
  host: 'db.uopckyrdhlvsxnvcobbw.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'AVNS_Br4uKMaWR6wxTIpZ7xj',
  ssl: { rejectUnauthorized: false }
};

const doConfig = {
  host: 'db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com',
  port: 25060,
  database: 'sabq_app_pool',
  user: 'doadmin',
  password: 'AVNS_Br4uKMaWR6wxTIpZ7xj',
  ssl: { rejectUnauthorized: false }
};

const supabase = new Pool(supabaseConfig);
const digitalOcean = new Pool(doConfig);

console.log('🚀 بدء الهجرة من Supabase إلى DigitalOcean...\n');

async function migrate() {
  try {
    // 1. الحصول على قائمة الجداول من Supabase
    console.log('📋 جلب قائمة الجداول...');
    const tablesResult = await supabase.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma%'
      ORDER BY tablename;
    `);
    
    const tables = tablesResult.rows.map(row => row.tablename);
    console.log(`✅ وجدت ${tables.length} جدول: ${tables.join(', ')}\n`);

    // 2. إنشاء البنية في DigitalOcean
    console.log('🏗️  إنشاء البنية في DigitalOcean...');
    
    for (const table of tables) {
      try {
        console.log(`  - إنشاء جدول ${table}...`);
        
        // الحصول على تعريف الجدول
        const createTableQuery = await supabase.query(`
          SELECT 
            'CREATE TABLE IF NOT EXISTS ' || quote_ident($1) || ' (' ||
            string_agg(
              quote_ident(column_name) || ' ' || 
              data_type || 
              CASE 
                WHEN character_maximum_length IS NOT NULL 
                THEN '(' || character_maximum_length || ')'
                ELSE ''
              END ||
              CASE 
                WHEN is_nullable = 'NO' THEN ' NOT NULL'
                ELSE ''
              END,
              ', '
            ) || ');' AS create_statement
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          GROUP BY table_name;
        `, [table]);
        
        if (createTableQuery.rows[0]) {
          await digitalOcean.query(createTableQuery.rows[0].create_statement);
          console.log(`    ✅ تم إنشاء ${table}`);
        }
      } catch (err) {
        console.log(`    ⚠️  خطأ في ${table}: ${err.message}`);
      }
    }

    // 3. نسخ البيانات
    console.log('\n💾 نسخ البيانات...');
    
    for (const table of tables) {
      try {
        console.log(`  - نسخ بيانات ${table}...`);
        
        // عد السجلات
        const countResult = await supabase.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(countResult.rows[0].count);
        
        if (count === 0) {
          console.log(`    ⏭️  الجدول فارغ`);
          continue;
        }
        
        // نسخ البيانات على دفعات
        const batchSize = 1000;
        let offset = 0;
        
        while (offset < count) {
          const dataResult = await supabase.query(
            `SELECT * FROM ${table} LIMIT $1 OFFSET $2`,
            [batchSize, offset]
          );
          
          if (dataResult.rows.length > 0) {
            // بناء استعلام الإدراج
            const columns = Object.keys(dataResult.rows[0]);
            const values = dataResult.rows.map(row => 
              columns.map(col => row[col])
            );
            
            // إدراج البيانات
            for (const row of values) {
              try {
                await digitalOcean.query(
                  `INSERT INTO ${table} (${columns.join(', ')}) 
                   VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
                   ON CONFLICT DO NOTHING`,
                  row
                );
              } catch (err) {
                // تجاهل أخطاء التكرار
              }
            }
          }
          
          offset += batchSize;
          process.stdout.write(`\r    ✅ تم نسخ ${Math.min(offset, count)}/${count} سجل`);
        }
        
        console.log('');
      } catch (err) {
        console.log(`    ❌ خطأ في ${table}: ${err.message}`);
      }
    }

    // 4. التحقق النهائي
    console.log('\n🔍 التحقق من النتائج...');
    
    const finalTablesResult = await digitalOcean.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`📊 عدد الجداول في DigitalOcean: ${finalTablesResult.rows[0].count}`);
    
    // عرض إحصائيات بعض الجداول
    const statsQueries = ['users', 'articles', 'categories'];
    for (const table of statsQueries) {
      try {
        const result = await digitalOcean.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  - ${table}: ${result.rows[0].count} سجل`);
      } catch (err) {
        // تجاهل إذا لم يوجد الجدول
      }
    }

    console.log('\n✅ اكتملت الهجرة بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في الهجرة:', error.message);
  } finally {
    await supabase.end();
    await digitalOcean.end();
  }
}

// تشغيل الهجرة
migrate(); 