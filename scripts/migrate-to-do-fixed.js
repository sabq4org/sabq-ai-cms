const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parse/sync');

// قاعدة البيانات العامة في DigitalOcean
const defaultDbUrl = 'postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/defaultdb?sslmode=require';

const pool = new Pool({
  connectionString: defaultDbUrl
});

// خريطة الأدوار من role_id إلى role name
const roleMapping = {
  'role-admin': 'admin',
  'role-editor': 'editor',
  'role-user': 'user',
  'clywvnkjl000170ljqufvgfux': 'admin',  // Admin role من البيانات
  'clywvnkjl000070ljvg0lxdm4': 'editor', // Editor role
  'clywvnkjl000270ljq5pvj5jx': 'user'    // User role
};

async function clearExistingData() {
  console.log('🧹 مسح البيانات الموجودة...');
  
  const tables = [
    'loyalty_points',
    'comments',
    'articles',
    'activity_logs',
    'users',
    'categories'
  ];
  
  for (const table of tables) {
    try {
      await pool.query(`DELETE FROM ${table}`);
      console.log(`✅ تم مسح جدول ${table}`);
    } catch (error) {
      console.log(`⚠️ تجاهل خطأ في ${table}: ${error.message}`);
    }
  }
}

async function importCSV(filename, tableName, processRow) {
  console.log(`\n📥 استيراد ${tableName} من ${filename}...`);
  
  try {
    const content = await fs.readFile(path.join('backups/migration_20250716_083938', filename), 'utf-8');
    const records = csv.parse(content, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
      try {
        await processRow(record);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`❌ خطأ في معالجة سجل: ${error.message}`);
        if (errorCount <= 3) {
          console.error(`   البيانات: ${JSON.stringify(record).substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`✅ تم استيراد ${successCount} سجل بنجاح`);
    if (errorCount > 0) {
      console.log(`⚠️ فشل استيراد ${errorCount} سجل`);
    }
    
    return { success: successCount, errors: errorCount };
    
  } catch (error) {
    console.error(`❌ فشل قراءة الملف ${filename}: ${error.message}`);
    return { success: 0, errors: 0 };
  }
}

async function migrate() {
  console.log('🚀 بدء الهجرة إلى DigitalOcean (بنية محدثة)...\n');
  
  try {
    // مسح البيانات الموجودة
    await clearExistingData();
    
    // 1. استيراد المستخدمين (تحويل البنية)
    await importCSV('users.csv', 'users', async (row) => {
      // تحديد الدور بناءً على role_id أو email
      let role = 'user'; // القيمة الافتراضية
      
      if (row.role_id && roleMapping[row.role_id]) {
        role = roleMapping[row.role_id];
      } else if (row.email.includes('admin')) {
        role = 'admin';
      } else if (row.email.includes('editor')) {
        role = 'editor';
      }
      
      const isAdmin = role === 'admin';
      const isVerified = row.email_verified_at ? true : false;
      
      await pool.query(`
        INSERT INTO users (
          id, email, name, password_hash, avatar, role, is_admin,
          is_verified, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        row.id, 
        row.email, 
        row.name, 
        row.password_hash,
        row.profile_picture || null,  // avatar بدلاً من profile_picture
        role,                          // role كنص بدلاً من role_id
        isAdmin,                       // is_admin
        isVerified,                    // is_verified
        row.created_at, 
        row.updated_at
      ]);
    });
    
    // 2. استيراد التصنيفات
    await importCSV('categories.csv', 'categories', async (row) => {
      const color = row.color || '#6B7280';
      const icon = row.icon || '📁';
      const displayOrder = parseInt(row.order_index || row.display_order || '0');
      
      await pool.query(`
        INSERT INTO categories (
          id, name, name_en, slug, description, color, icon,
          is_active, display_order, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        row.id, row.name, row.name_en || row.name, row.slug,
        row.description || null, color, icon,
        row.is_active !== 'false', displayOrder,
        row.created_at, row.updated_at
      ]);
    });
    
    // 3. استيراد المقالات (تحويل البنية)
    await importCSV('articles.csv', 'articles', async (row) => {
      const views = parseInt(row.views || '0');
      const readingTime = parseInt(row.reading_time || '5');
      const isBreaking = row.breaking === 'true' || row.is_breaking === 'true';
      const isFeatured = row.featured === 'true' || row.is_featured === 'true';
      
      // التحقق من وجود التصنيف
      let categoryId = row.category_id;
      if (categoryId) {
        const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
        if (categoryCheck.rows.length === 0) {
          console.log(`⚠️ التصنيف ${categoryId} غير موجود، سيتم تعيين null`);
          categoryId = null;
        }
      }
      
      // التحقق من وجود المؤلف
      const authorCheck = await pool.query('SELECT id FROM users WHERE id = $1', [row.author_id]);
      if (authorCheck.rows.length === 0) {
        console.log(`⚠️ تخطي مقال "${row.title}" - المؤلف ${row.author_id} غير موجود`);
        throw new Error(`المؤلف ${row.author_id} غير موجود`);
      }
      
      await pool.query(`
        INSERT INTO articles (
          id, title, slug, content, excerpt, featured_image,
          author_id, category_id, status, views, reading_time,
          breaking, featured, allow_comments, published_at, 
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        row.id, 
        row.title, 
        row.slug, 
        row.content, 
        row.excerpt,
        row.featured_image || null, 
        row.author_id, 
        categoryId,         // قد يكون null إذا لم يوجد التصنيف
        row.status || 'draft', 
        views, 
        readingTime,
        isBreaking,         // breaking بدلاً من is_breaking
        isFeatured,         // featured بدلاً من is_featured
        true,               // allow_comments (افتراضي true)
        row.published_at || null,
        row.created_at, 
        row.updated_at
      ]);
    });
    
    // 4. استيراد سجلات الأنشطة
    await importCSV('activity_logs.csv', 'activity_logs', async (row) => {
      await pool.query(`
        INSERT INTO activity_logs (
          id, user_id, action, entity_type, entity_id,
          metadata, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        row.id, row.user_id, row.action, row.entity_type || null,
        row.entity_id || null, row.metadata || '{}', row.ip_address || null,
        row.user_agent || null, row.created_at
      ]);
    });
    
    console.log('\n✅ اكتملت الهجرة بنجاح!');
    
    // عرض ملخص البيانات
    console.log('\n📊 ملخص البيانات المُهاجرة:');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const articleCount = await pool.query('SELECT COUNT(*) FROM articles');
    const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
    
    console.log(`- المستخدمون: ${userCount.rows[0].count}`);
    console.log(`- المقالات: ${articleCount.rows[0].count}`);
    console.log(`- التصنيفات: ${categoryCount.rows[0].count}`);
    
    // عرض بعض المستخدمين
    console.log('\n👥 عينة من المستخدمين:');
    const users = await pool.query('SELECT email, name, role FROM users LIMIT 5');
    users.rows.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) - ${u.role}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في الهجرة:', error);
  } finally {
    await pool.end();
  }
}

// تشغيل الهجرة
migrate(); 