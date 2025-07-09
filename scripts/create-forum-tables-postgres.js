const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ خطأ: يجب تعيين متغيرات البيئة NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createForumTables() {
  console.log('🚀 بدء إنشاء جداول منتدى سبق في Supabase...\n');
  
  try {
    // قراءة محتوى ملف SQL
    const sqlContent = fs.readFileSync(
      path.join(__dirname, '../database/create_forum_tables_postgres.sql'), 
      'utf8'
    );
    
    // تقسيم المحتوى إلى أوامر منفصلة
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        if (stmt.length === 0) return false;
        const lines = stmt.split('\n');
        const hasNonCommentLine = lines.some(line => {
          const trimmedLine = line.trim();
          return trimmedLine.length > 0 && !trimmedLine.startsWith('--');
        });
        return hasNonCommentLine;
      });

    console.log(`📋 عدد الأوامر المطلوب تنفيذها: ${statements.length}\n`);

    // تنفيذ كل أمر
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // تحديد نوع الأمر
      let commandType = 'أمر';
      if (statement.includes('CREATE TABLE')) {
        commandType = 'إنشاء جدول';
      } else if (statement.includes('INSERT INTO')) {
        commandType = 'إدخال بيانات';
      } else if (statement.includes('CREATE INDEX')) {
        commandType = 'إنشاء فهرس';
      } else if (statement.includes('CREATE TRIGGER')) {
        commandType = 'إنشاء مشغل';
      } else if (statement.includes('CREATE TYPE')) {
        commandType = 'إنشاء نوع';
      } else if (statement.includes('CREATE FUNCTION')) {
        commandType = 'إنشاء دالة';
      }
      
      try {
        console.log(`⏳ تنفيذ ${commandType} ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement
        });

        if (error) {
          // إذا كان الخطأ بسبب وجود العنصر مسبقاً، نتجاوزه
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.code === '42P07' || // duplicate table
              error.code === '42710' || // duplicate object
              error.code === '23505') { // duplicate key
            console.log(`⚠️  العنصر موجود مسبقاً - تم التجاوز\n`);
          } else {
            console.error(`❌ خطأ: ${error.message}\n`);
          }
        } else {
          console.log(`✅ تم بنجاح\n`);
        }
      } catch (error) {
        console.error(`❌ خطأ: ${error.message}\n`);
      }
    }

    console.log('🎉 تم إنشاء جداول المنتدى بنجاح!\n');
    
    // التحقق من الجداول المنشأة
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'forum_%');

    if (tables && tables.length > 0) {
      console.log('📊 الجداول المنشأة:');
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    }
    
    console.log('\n✨ منتدى سبق جاهز للاستخدام!');
    console.log('🔗 رابط المنتدى: http://localhost:3000/forum');
    console.log('🔧 لوحة التحكم: http://localhost:3000/dashboard/forum');

  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
    process.exit(1);
  }
}

// دالة بديلة لتنفيذ SQL مباشرة إذا لم تكن exec_sql متاحة
async function executeSqlDirect() {
  console.log('🚀 بدء إنشاء جداول منتدى سبق في Supabase (طريقة مباشرة)...\n');
  
  try {
    // قراءة محتوى ملف SQL
    const sqlContent = fs.readFileSync(
      path.join(__dirname, '../database/create_forum_tables_postgres.sql'), 
      'utf8'
    );
    
    console.log('📝 محتوى SQL تم قراءته بنجاح');
    console.log('⚠️  ملاحظة: يجب تنفيذ أوامر SQL يدوياً في Supabase SQL Editor');
    console.log('\n📋 الخطوات:');
    console.log('1. افتح Supabase Dashboard');
    console.log('2. اذهب إلى SQL Editor');
    console.log('3. انسخ والصق محتوى الملف التالي:');
    console.log(`   ${path.join(__dirname, '../database/create_forum_tables_postgres.sql')}`);
    console.log('4. اضغط على Run');
    console.log('\n✅ بعد تنفيذ SQL، ستكون جداول المنتدى جاهزة للاستخدام!');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

// محاولة تنفيذ السكريبت
createForumTables().catch((error) => {
  console.log('⚠️  فشل التنفيذ التلقائي، جرب الطريقة اليدوية:\n');
  executeSqlDirect();
}); 