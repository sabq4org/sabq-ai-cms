// سكريبت ترحيل البيانات من JSON إلى MySQL
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// إعدادات قاعدة البيانات
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: 'j3uar_sabq_user',
  password: 'hugsiP-tiswaf-vitte2',
  database: 'j3uar_sabq_db',
  charset: 'utf8mb4',
  multipleStatements: true
};

// دالة لتوليد UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// دالة لتحويل التاريخ لصيغة MySQL
function formatDateForMySQL(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

async function migrate() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔌 الاتصال بقاعدة البيانات...');
    
    // التحقق من الاتصال
    await connection.execute('SELECT 1');
    console.log('✅ تم الاتصال بنجاح');
    
    // ترحيل المستخدمين
    console.log('\n📤 ترحيل المستخدمين...');
    try {
      const users = JSON.parse(
        await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8')
      );
      
      let userCount = 0;
      for (const user of users) {
        const userId = user.id || generateUUID();
        await connection.execute(
          `INSERT IGNORE INTO users (id, email, password_hash, name, avatar, role, is_admin, is_verified, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            user.email,
            user.password || user.password_hash || 'temp_password',
            user.name || user.display_name,
            user.avatar,
            user.role || 'user',
            user.is_admin || false,
            user.is_verified !== false,
            formatDateForMySQL(user.created_at) || new Date()
          ]
        );
        userCount++;
      }
      console.log(`✅ تم ترحيل ${userCount} مستخدم`);
    } catch (error) {
      console.log('⚠️ لم يتم العثور على ملف المستخدمين أو حدث خطأ:', error.message);
    }
    
    // ترحيل الفئات (إضافة للفئات الموجودة)
    console.log('\n📤 ترحيل الفئات الإضافية...');
    try {
      const categories = JSON.parse(
        await fs.readFile(path.join(__dirname, '../data/categories.json'), 'utf8')
      );
      
      let categoryCount = 0;
      for (const category of categories) {
        await connection.execute(
          `INSERT IGNORE INTO categories (id, name, slug, description, color, icon) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            category.id || generateUUID(),
            category.name,
            category.slug,
            category.description || '',
            category.color || '#000000',
            category.icon || 'folder'
          ]
        );
        categoryCount++;
      }
      console.log(`✅ تم ترحيل ${categoryCount} فئة إضافية`);
    } catch (error) {
      console.log('⚠️ لم يتم العثور على ملف الفئات أو حدث خطأ:', error.message);
    }
    
    // ترحيل المقالات
    console.log('\n📤 ترحيل المقالات...');
    try {
      const articles = JSON.parse(
        await fs.readFile(path.join(__dirname, '../data/articles.json'), 'utf8')
      );
      
      let articleCount = 0;
      for (const article of articles) {
        const articleId = article.id || generateUUID();
        
        // الحصول على معرف الفئة
        let categoryId = article.category_id;
        if (!categoryId && article.category) {
          const [rows] = await connection.execute(
            'SELECT id FROM categories WHERE slug = ? LIMIT 1',
            [article.category]
          );
          if (rows.length > 0) {
            categoryId = rows[0].id;
          }
        }
        
        await connection.execute(
          `INSERT IGNORE INTO articles 
           (id, title, slug, content, excerpt, author_id, category_id, status, views, 
            featured, breaking, featured_image, metadata, tags, published_at, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            articleId,
            article.title,
            article.slug,
            article.content || article.body || '',
            article.excerpt || article.summary || '',
            article.author_id || article.author || null,
            categoryId,
            article.status || 'published',
            article.views || 0,
            article.featured || false,
            article.breaking || false,
            article.featured_image || article.image || article.thumbnail,
            JSON.stringify(article.metadata || {}),
            JSON.stringify(article.tags || []),
            formatDateForMySQL(article.published_at || article.created_at),
            formatDateForMySQL(article.created_at) || new Date()
          ]
        );
        articleCount++;
      }
      console.log(`✅ تم ترحيل ${articleCount} مقال`);
    } catch (error) {
      console.log('⚠️ لم يتم العثور على ملف المقالات أو حدث خطأ:', error.message);
    }
    
    // ترحيل التفاعلات
    console.log('\n📤 ترحيل التفاعلات...');
    try {
      const interactions = JSON.parse(
        await fs.readFile(path.join(__dirname, '../data/interactions.json'), 'utf8')
      );
      
      let interactionCount = 0;
      for (const interaction of interactions) {
        try {
          await connection.execute(
            `INSERT IGNORE INTO interactions (user_id, article_id, type, metadata, created_at) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              interaction.user_id || interaction.userId,
              interaction.article_id || interaction.articleId,
              interaction.type || 'like',
              JSON.stringify(interaction.metadata || {}),
              formatDateForMySQL(interaction.created_at) || new Date()
            ]
          );
          interactionCount++;
        } catch (err) {
          // تجاهل الأخطاء الفردية (مثل المقالات غير الموجودة)
        }
      }
      console.log(`✅ تم ترحيل ${interactionCount} تفاعل`);
    } catch (error) {
      console.log('⚠️ لم يتم العثور على ملف التفاعلات أو حدث خطأ:', error.message);
    }
    
    // ترحيل نقاط الولاء
    console.log('\n📤 ترحيل نقاط الولاء...');
    try {
      const loyaltyPoints = JSON.parse(
        await fs.readFile(path.join(__dirname, '../data/loyalty_points.json'), 'utf8')
      );
      
      let pointsCount = 0;
      for (const point of loyaltyPoints) {
        await connection.execute(
          `INSERT INTO loyalty_points (user_id, points, action, metadata, created_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            point.user_id || point.userId,
            point.points || 0,
            point.action || 'unknown',
            JSON.stringify(point.metadata || {}),
            formatDateForMySQL(point.created_at) || new Date()
          ]
        );
        pointsCount++;
      }
      console.log(`✅ تم ترحيل ${pointsCount} سجل نقاط ولاء`);
    } catch (error) {
      console.log('⚠️ لم يتم العثور على ملف نقاط الولاء أو حدث خطأ:', error.message);
    }
    
    // ترحيل التحليلات العميقة
    console.log('\n📤 ترحيل التحليلات العميقة...');
    try {
      const deepAnalyses = JSON.parse(
        await fs.readFile(path.join(__dirname, '../data/deep_analyses.json'), 'utf8')
      );
      
      let analysisCount = 0;
      for (const analysis of deepAnalyses) {
        try {
          await connection.execute(
            `INSERT IGNORE INTO deep_analyses 
             (article_id, ai_summary, key_points, tags, sentiment, created_at) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              analysis.article_id || analysis.articleId,
              analysis.ai_summary || analysis.summary,
              JSON.stringify(analysis.key_points || analysis.keyPoints || []),
              JSON.stringify(analysis.tags || []),
              analysis.sentiment || 'neutral',
              formatDateForMySQL(analysis.created_at) || new Date()
            ]
          );
          analysisCount++;
        } catch (err) {
          // تجاهل الأخطاء الفردية
        }
      }
      console.log(`✅ تم ترحيل ${analysisCount} تحليل عميق`);
    } catch (error) {
      console.log('⚠️ لم يتم العثور على ملف التحليلات العميقة أو حدث خطأ:', error.message);
    }
    
    // ترحيل البلوكات الذكية
    console.log('\n📤 ترحيل البلوكات الذكية...');
    try {
      const smartBlocks = JSON.parse(
        await fs.readFile(path.join(__dirname, '../data/smart_blocks.json'), 'utf8')
      );
      
      let blockCount = 0;
      for (const block of smartBlocks) {
        await connection.execute(
          `INSERT IGNORE INTO smart_blocks 
           (id, name, type, position, content, settings, status, order_index, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            block.id || generateUUID(),
            block.name,
            block.type,
            block.position,
            JSON.stringify(block.content || {}),
            JSON.stringify(block.settings || {}),
            block.status || 'active',
            block.order_index || block.order || 0,
            formatDateForMySQL(block.created_at) || new Date()
          ]
        );
        blockCount++;
      }
      console.log(`✅ تم ترحيل ${blockCount} بلوك ذكي`);
    } catch (error) {
      console.log('⚠️ لم يتم العثور على ملف البلوكات الذكية أو حدث خطأ:', error.message);
    }
    
    // ترحيل الرسائل
    console.log('\n📤 ترحيل الرسائل...');
    try {
      const messages = JSON.parse(
        await fs.readFile(path.join(__dirname, '../data/messages.json'), 'utf8')
      );
      
      let messageCount = 0;
      for (const message of messages) {
        await connection.execute(
          `INSERT IGNORE INTO messages 
           (id, name, email, subject, message, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            message.id || generateUUID(),
            message.name,
            message.email,
            message.subject || 'بدون عنوان',
            message.message,
            message.status || 'unread',
            formatDateForMySQL(message.created_at) || new Date()
          ]
        );
        messageCount++;
      }
      console.log(`✅ تم ترحيل ${messageCount} رسالة`);
    } catch (error) {
      console.log('⚠️ لم يتم العثور على ملف الرسائل أو حدث خطأ:', error.message);
    }
    
    console.log('\n🎉 تمت عملية الترحيل بنجاح!');
    
    // عرض إحصائيات
    console.log('\n📊 إحصائيات قاعدة البيانات:');
    const tables = ['users', 'categories', 'articles', 'interactions', 'loyalty_points', 'deep_analyses', 'smart_blocks', 'messages'];
    
    for (const table of tables) {
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`   - ${table}: ${rows[0].count} سجل`);
    }
    
  } catch (error) {
    console.error('\n❌ خطأ في الترحيل:', error);
  } finally {
    await connection.end();
    console.log('\n🔌 تم إغلاق الاتصال بقاعدة البيانات');
  }
}

// تشغيل الترحيل
console.log('🚀 بدء ترحيل البيانات إلى MySQL...\n');
migrate().catch(console.error); 