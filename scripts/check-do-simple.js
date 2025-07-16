const { Pool } = require('pg');

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
      SELECT email, name
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('\nآخر المستخدمين:');
    usersList.rows.forEach(user => {
      console.log(`- ${user.email} (${user.name})`);
    });

    // المقالات
    const articlesResult = await pool.query('SELECT COUNT(*) as count FROM articles');
    console.log(`\nعدد المقالات: ${articlesResult.rows[0].count}`);
    
    const articlesList = await pool.query(`
      SELECT title, views, status
      FROM articles
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('\nآخر المقالات:');
    articlesList.rows.forEach(article => {
      console.log(`- "${article.title}" (${article.views} مشاهدة) - ${article.status}`);
    });

    // التصنيفات
    const categoriesResult = await pool.query('SELECT COUNT(*) as count FROM categories');
    console.log(`\nعدد التصنيفات: ${categoriesResult.rows[0].count}`);

    // البحث عن المستخدمين المعروفين
    console.log('\nالبحث عن المستخدمين المعروفين:');
    const knownEmails = ['admin@sabq.ai', 'editor@sabq.ai', 'user@sabq.ai', 'admin@sabq.org'];
    
    for (const email of knownEmails) {
      const result = await pool.query("SELECT COUNT(*) as count FROM users WHERE email = $1", [email]);
      if (result.rows[0].count > 0) {
        console.log(`✅ ${email} موجود`);
      } else {
        console.log(`❌ ${email} غير موجود`);
      }
    }

  } catch (error) {
    console.error('خطأ:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase(); 