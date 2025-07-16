const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parse/sync');

// قاعدة البيانات العامة في DigitalOcean
const defaultDbUrl = 'postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/defaultdb?sslmode=require';

const pool = new Pool({
  connectionString: defaultDbUrl
});

async function clearExistingData() {
  console.log('🧹 مسح البيانات الموجودة...');
  
  const tables = [
    'loyalty_points',
    'comments',
    'articles',
    'activity_logs',
    'users',
    'categories',
    'roles'
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
  console.log('🚀 بدء الهجرة إلى DigitalOcean...\n');
  
  try {
    // مسح البيانات الموجودة
    await clearExistingData();
    
    // 1. استيراد الأدوار
    await importCSV('roles.csv', 'roles', async (row) => {
      await pool.query(
        'INSERT INTO roles (id, name, permissions, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
        [row.id, row.name, row.permissions, row.created_at, row.updated_at]
      );
    });
    
    // 2. استيراد المستخدمين
    await importCSV('users.csv', 'users', async (row) => {
      // تحويل القيم الفارغة إلى null
      const roleId = row.role_id || null;
      const profilePic = row.profile_picture || null;
      const bio = row.bio || null;
      const emailVerified = row.email_verified_at || null;
      
      await pool.query(`
        INSERT INTO users (
          id, email, name, password_hash, role_id, is_active,
          profile_picture, bio, email_verified_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        row.id, row.email, row.name, row.password_hash, roleId,
        row.is_active === 'true', profilePic, bio, emailVerified,
        row.created_at, row.updated_at
      ]);
    });
    
    // 3. استيراد التصنيفات
    await importCSV('categories.csv', 'categories', async (row) => {
      // تصحيح أسماء الحقول
      const color = row.color || '#6B7280';
      const icon = row.icon || '📁';
      const displayOrder = parseInt(row.order_index || row.display_order || '0');
      const isFeatured = row.featured === 'true' || row.is_featured === 'true';
      
      await pool.query(`
        INSERT INTO categories (
          id, name, name_en, slug, description, color, icon,
          is_active, display_order, is_featured, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        row.id, row.name, row.name_en || row.name, row.slug,
        row.description || null, color, icon,
        row.is_active !== 'false', displayOrder, isFeatured,
        row.created_at, row.updated_at
      ]);
    });
    
    // 4. استيراد المقالات
    await importCSV('articles.csv', 'articles', async (row) => {
      const views = parseInt(row.views || '0');
      const readingTime = parseInt(row.reading_time || '5');
      const isBreaking = row.breaking === 'true' || row.is_breaking === 'true';
      const isFeatured = row.featured === 'true' || row.is_featured === 'true';
      
      await pool.query(`
        INSERT INTO articles (
          id, title, slug, content, excerpt, featured_image,
          author_id, category_id, status, views, reading_time,
          is_breaking, is_featured, published_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        row.id, row.title, row.slug, row.content, row.excerpt,
        row.featured_image || null, row.author_id, row.category_id,
        row.status || 'draft', views, readingTime,
        isBreaking, isFeatured, row.published_at || null,
        row.created_at, row.updated_at
      ]);
    });
    
    // 5. استيراد سجلات الأنشطة
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
    
  } catch (error) {
    console.error('❌ خطأ في الهجرة:', error);
  } finally {
    await pool.end();
  }
}

// تشغيل الهجرة
migrate(); 