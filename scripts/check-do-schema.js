const { Pool } = require('pg');

const defaultDbUrl = 'postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/defaultdb?sslmode=require';

async function checkSchema() {
  const pool = new Pool({
    connectionString: defaultDbUrl
  });

  try {
    console.log('🔍 فحص بنية قاعدة البيانات في DigitalOcean...\n');

    // التحقق من أعمدة جدول users
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 أعمدة جدول users:');
    usersColumns.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // التحقق من أعمدة جدول articles
    const articlesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'articles'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 أعمدة جدول articles:');
    articlesColumns.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // التحقق من وجود جدول roles
    const rolesExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'roles'
      )
    `);
    
    console.log(`\n📌 جدول roles موجود: ${rolesExists.rows[0].exists ? '✅ نعم' : '❌ لا'}`);
    
    // التحقق من العلاقات
    const foreignKeys = await pool.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('users', 'articles')
    `);
    
    console.log('\n🔗 العلاقات (Foreign Keys):');
    foreignKeys.rows.forEach(fk => {
      console.log(`- ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema(); 