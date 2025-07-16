const { Pool } = require('pg');

// الاتصال بـ defaultdb (public connection)
const defaultDbUrl = 'postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/defaultdb?sslmode=require';

async function checkDatabase() {
  const pool = new Pool({
    connectionString: defaultDbUrl
  });

  try {
    console.log('التحقق من قاعدة البيانات defaultdb...\n');

    // المستخدمون
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`عدد المستخدمين: ${usersResult.rows[0].count}`);
    
    const usersList = await pool.query(`
      SELECT u.email, u.name, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      ORDER BY u.created_at DESC 
      LIMIT 10
    `);
    
    console.log('\nآخر المستخدمين:');
    usersList.rows.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - الدور: ${user.role_name || 'لا يوجد'}`);
    });

    // المقالات
    const articlesResult = await pool.query('SELECT COUNT(*) as count FROM articles');
    console.log(`\nعدد المقالات: ${articlesResult.rows[0].count}`);
    
    const articlesList = await pool.query(`
      SELECT a.title, u.name as author_name, a.views, a.status
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    console.log('\nآخر المقالات:');
    articlesList.rows.forEach(article => {
      console.log(`- "${article.title}" بواسطة ${article.author_name} (${article.views} مشاهدة) - ${article.status}`);
    });

    // التصنيفات
    const categoriesResult = await pool.query('SELECT COUNT(*) as count FROM categories');
    console.log(`\nعدد التصنيفات: ${categoriesResult.rows[0].count}`);

    // التحقق من admin@sabq.ai
    const adminCheck = await pool.query("SELECT * FROM users WHERE email = 'admin@sabq.ai'");
    if (adminCheck.rows.length > 0) {
      console.log('\n✅ تم العثور على admin@sabq.ai');
    } else {
      console.log('\n❌ لم يتم العثور على admin@sabq.ai');
    }

  } catch (error) {
    console.error('خطأ:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase(); 