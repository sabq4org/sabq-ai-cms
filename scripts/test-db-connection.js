// سكريبت اختبار الاتصال بقاعدة البيانات
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔌 اختبار الاتصال بقاعدة البيانات...\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: 'j3uar_sabq_user',
    password: 'hugsiP-tiswaf-vitte2',
    database: 'j3uar_sabq_db',
    charset: 'utf8mb4'
  });
  
  try {
    // اختبار الاتصال
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ الاتصال بقاعدة البيانات نجح!\n');
    
    // عرض معلومات قاعدة البيانات
    const [dbInfo] = await connection.execute('SELECT DATABASE() as db, USER() as user, VERSION() as version');
    console.log('📊 معلومات قاعدة البيانات:');
    console.log(`   - اسم قاعدة البيانات: ${dbInfo[0].db}`);
    console.log(`   - المستخدم: ${dbInfo[0].user}`);
    console.log(`   - إصدار MySQL: ${dbInfo[0].version}\n`);
    
    // التحقق من الجداول
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 الجداول الموجودة (${tables.length}):`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    // إحصائيات سريعة
    if (tables.length > 0) {
      console.log('\n📈 إحصائيات سريعة:');
      
      try {
        const [articles] = await connection.execute('SELECT COUNT(*) as count FROM articles');
        console.log(`   - المقالات: ${articles[0].count}`);
      } catch (e) {}
      
      try {
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`   - المستخدمون: ${users[0].count}`);
      } catch (e) {}
      
      try {
        const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
        console.log(`   - الفئات: ${categories[0].count}`);
      } catch (e) {}
    }
    
    console.log('\n🎉 كل شيء يعمل بشكل صحيح!');
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
    console.error('\n💡 تأكد من:');
    console.error('   1. تشغيل خادم MySQL');
    console.error('   2. صحة بيانات الاتصال');
    console.error('   3. وجود قاعدة البيانات j3uar_sabq_db');
  } finally {
    await connection.end();
  }
}

testConnection(); 