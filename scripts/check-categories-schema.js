const { Pool } = require('pg');

const defaultDbUrl = 'postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/defaultdb?sslmode=require';

async function checkCategoriesSchema() {
  const pool = new Pool({
    connectionString: defaultDbUrl
  });

  try {
    // التحقق من أعمدة جدول categories
    const categoriesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'categories'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 أعمدة جدول categories:');
    categoriesColumns.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await pool.end();
  }
}

checkCategoriesSchema(); 