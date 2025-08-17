const { PrismaClient } = require('@prisma/client');

async function setupMuqtarabDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 بدء إنشاء جداول وحدة مُقترَب...');
    
    // 1. إنشاء جدول الزوايا
    console.log('📝 إنشاء جدول الزوايا...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS muqtarab_corners (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        author_bio TEXT,
        cover_image TEXT,
        description TEXT,
        category_id VARCHAR(255),
        ai_enabled BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // 2. إنشاء جدول المقالات
    console.log('📝 إنشاء جدول المقالات...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS muqtarab_articles (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        corner_id VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        cover_image TEXT,
        author_name VARCHAR(255),
        author_bio TEXT,
        author_avatar TEXT,
        tags TEXT[] DEFAULT '{}',
        is_featured BOOLEAN DEFAULT false,
        read_time INTEGER,
        publish_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'draft',
        ai_sentiment VARCHAR(100),
        ai_compatibility_score INTEGER DEFAULT 0,
        ai_summary TEXT,
        ai_keywords TEXT[] DEFAULT '{}',
        ai_mood VARCHAR(100),
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // 3. إنشاء جدول التفاعلات
    console.log('📝 إنشاء جدول التفاعلات...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS muqtarab_interactions (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        article_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        interaction_type VARCHAR(100) NOT NULL,
        metadata JSONB,
        session_id VARCHAR(255),
        ip_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // 4. إنشاء جدول التحليلات
    console.log('📝 إنشاء جدول التحليلات...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS muqtarab_analytics (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        article_id VARCHAR(255),
        corner_id VARCHAR(255),
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        ip_hash VARCHAR(255),
        view_duration INTEGER,
        scroll_depth DECIMAL(5,2),
        completion_rate DECIMAL(5,2),
        referrer_source VARCHAR(100),
        referrer_url TEXT,
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        device_type VARCHAR(50),
        browser_type VARCHAR(100),
        operating_system VARCHAR(100),
        screen_resolution VARCHAR(50),
        country_code VARCHAR(5),
        city VARCHAR(100),
        bounce_rate BOOLEAN DEFAULT false,
        return_visitor BOOLEAN DEFAULT false,
        visit_hour INTEGER,
        visit_day INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // 5. إنشاء جدول المتابعين
    console.log('📝 إنشاء جدول المتابعين...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS muqtarab_followers (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        corner_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        notifications_enabled BOOLEAN DEFAULT true,
        email_notifications BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // 6. إنشاء جدول التعليقات
    console.log('📝 إنشاء جدول التعليقات...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS muqtarab_comments (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        article_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        guest_name VARCHAR(255),
        guest_email VARCHAR(255),
        content TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT false,
        is_hidden BOOLEAN DEFAULT false,
        parent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // 7. إنشاء الفهارس
    console.log('📝 إنشاء الفهارس...');
    
    // فهارس الزوايا
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_corners_slug ON muqtarab_corners(slug);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_corners_active ON muqtarab_corners(is_active);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_corners_creator ON muqtarab_corners(created_by);`;
    
    // فهارس المقالات
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_articles_corner ON muqtarab_articles(corner_id);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_articles_slug ON muqtarab_articles(slug);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_articles_status ON muqtarab_articles(status);`;
    
    // فهارس التفاعلات
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_interactions_article ON muqtarab_interactions(article_id);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_interactions_user ON muqtarab_interactions(user_id);`;
    
    // فهارس التحليلات
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_analytics_article ON muqtarab_analytics(article_id);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_analytics_created ON muqtarab_analytics(created_at);`;
    
    // فهارس المتابعين
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS idx_muqtarab_followers_unique ON muqtarab_followers(corner_id, user_id);`;
    
    // فهارس التعليقات  
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_muqtarab_comments_article ON muqtarab_comments(article_id);`;
    
    // 8. إضافة بيانات تجريبية
    console.log('📝 إضافة بيانات تجريبية...');
    await prisma.$executeRaw`
      INSERT INTO muqtarab_corners (name, slug, author_name, description, ai_enabled, is_active, is_featured) 
      VALUES 
      ('زاوية أحمد الرحالة', 'ahmed-rahala', 'أحمد الرحالة', 'زاوية تحليلية مختصة في الشؤون الاقتصادية والاجتماعية', true, true, true),
      ('كتابات سارة', 'sara-writings', 'سارة أحمد', 'مقالات متنوعة في الثقافة والمجتمع', true, true, false),
      ('رؤى تقنية', 'tech-insights', 'محمد التقني', 'تحليلات في عالم التقنية والذكاء الاصطناعي', true, true, false)
      ON CONFLICT (slug) DO NOTHING;
    `;
    
    // 9. التحقق من الجداول المُنشأة
    console.log('📋 التحقق من الجداول المُنشأة...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'muqtarab_%'
      ORDER BY table_name;
    `;
    
    console.log('✅ تم إنشاء جداول وحدة مُقترَب بنجاح!');
    console.log('📋 الجداول المُنشأة:');
    tables.forEach(table => {
      console.log(`  ✓ ${table.table_name}`);
    });
    
    // 10. إحصائيات سريعة
    const cornersCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM muqtarab_corners;`;
    console.log(`📊 عدد الزوايا: ${cornersCount[0].count}`);
    
    return { success: true, tablesCount: tables.length };
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الجداول:', error.message);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة
setupMuqtarabDatabase()
  .then(result => {
    if (result.success) {
      console.log('🎉 تم الانتهاء من إعداد قاعدة البيانات بنجاح!');
      process.exit(0);
    } else {
      console.error('💥 فشل في إعداد قاعدة البيانات:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 خطأ غير متوقع:', error);
    process.exit(1);
  });