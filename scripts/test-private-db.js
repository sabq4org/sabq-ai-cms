const { Pool } = require('pg');

const privateDbUrl = 'postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@private-db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25061/sabq_app_pool?sslmode=require';

async function testConnection() {
  console.log('محاولة الاتصال بقاعدة البيانات الخاصة sabq_app_pool...\n');
  
  const pool = new Pool({
    connectionString: privateDbUrl
  });

  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ الاتصال ناجح!');
    console.log('الوقت الحالي على الخادم:', result.rows[0].now);
    
    // التحقق من الجداول
    const tables = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log('\nالجداول الموجودة:');
    tables.rows.forEach(t => console.log(`- ${t.tablename}`));
    
  } catch (error) {
    console.error('❌ فشل الاتصال:', error.message || error);
    console.error('نوع الخطأ:', error.code);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('\nملاحظة: هذه قاعدة بيانات خاصة (Private) ولا يمكن الوصول إليها إلا من داخل شبكة DigitalOcean.');
      console.log('الحلول الممكنة:');
      console.log('1. استخدام قاعدة البيانات العامة (defaultdb) بدلاً منها');
      console.log('2. تشغيل السكريبت من داخل خادم في DigitalOcean');
      console.log('3. استخدام VPN للاتصال بشبكة DigitalOcean الخاصة');
    }
  } finally {
    await pool.end();
  }
}

testConnection(); 