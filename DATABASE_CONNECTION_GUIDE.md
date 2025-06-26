# دليل ربط قاعدة البيانات لموقع سبق

## 📊 بيانات قاعدة البيانات

```
Database: j3uar_sabq_db
Username: j3uar_sabq_user
Password: [محفوظة بشكل آمن]
```

## 🔧 الخطوة 1: إعداد الاتصال

### أ. تثبيت مكتبات MySQL

```bash
npm install mysql2 @types/mysql2
npm install dotenv
```

### ب. إنشاء ملف `.env.local`

```env
# قاعدة البيانات MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=j3uar_sabq_db
DB_USER=j3uar_sabq_user
DB_PASSWORD=hugsiP-tiswaf-vitte2

# Database URL (لـ Prisma أو TypeORM)
DATABASE_URL="mysql://j3uar_sabq_user:hugsiP-tiswaf-vitte2@localhost:3306/j3uar_sabq_db"
```

### ج. إنشاء ملف `.env.production`

```env
# نفس البيانات مع تغيير HOST إذا لزم
DB_HOST=your-production-host.com
DB_PORT=3306
DB_NAME=j3uar_sabq_db
DB_USER=j3uar_sabq_user
DB_PASSWORD=hugsiP-tiswaf-vitte2
```

## 🏗️ الخطوة 2: إنشاء الجداول

### نسخ والصق في phpMyAdmin أو MySQL Console:

```sql
-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar TEXT,
    role VARCHAR(50) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المقالات
CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    author_id VARCHAR(36),
    category_id VARCHAR(36),
    status VARCHAR(50) DEFAULT 'draft',
    views INT DEFAULT 0,
    featured_image TEXT,
    metadata JSON,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#000000',
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التفاعلات
CREATE TABLE IF NOT EXISTS interactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(255) NOT NULL,
    article_id VARCHAR(36) NOT NULL,
    type ENUM('like', 'save', 'view', 'share') NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_interaction (user_id, article_id, type),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_article (article_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول نقاط الولاء
CREATE TABLE IF NOT EXISTS loyalty_points (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(255) NOT NULL,
    points INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التحليلات العميقة
CREATE TABLE IF NOT EXISTS deep_analyses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    article_id VARCHAR(36) NOT NULL,
    ai_summary TEXT,
    key_points JSON,
    tags JSON,
    sentiment VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_article (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول البلوكات الذكية
CREATE TABLE IF NOT EXISTS smart_blocks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    position VARCHAR(50) NOT NULL,
    content JSON NOT NULL,
    settings JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_position (position),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الرسائل
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجلات النشاط
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(36),
    metadata JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🔌 الخطوة 3: إنشاء ملف اتصال قاعدة البيانات

### إنشاء `lib/db.ts`:

```typescript
import mysql from 'mysql2/promise';

// إنشاء pool للاتصالات
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// دالة مساعدة للاستعلامات
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// دالة للتحقق من الاتصال
export async function checkConnection() {
  try {
    await pool.execute('SELECT 1');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export default pool;
```

## 📝 الخطوة 4: تحديث APIs لاستخدام قاعدة البيانات

### مثال: `app/api/articles/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const articles = await query(
      `SELECT * FROM articles 
       WHERE status = ? 
       ORDER BY published_at DESC 
       LIMIT ?`,
      [status, limit]
    );
    
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const result = await query(
      `INSERT INTO articles (title, slug, content, excerpt, author_id, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.title, data.slug, data.content, data.excerpt, data.author_id, 'draft']
    );
    
    return NextResponse.json({ 
      message: 'Article created successfully',
      id: result.insertId 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
```

## 🔄 الخطوة 5: ترحيل البيانات الموجودة

### سكريبت لنقل البيانات من JSON إلى MySQL:

```javascript
// scripts/migrate-to-mysql.js
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'j3uar_sabq_user',
    password: 'hugsiP-tiswaf-vitte2',
    database: 'j3uar_sabq_db'
  });

  try {
    // ترحيل المقالات
    const articles = JSON.parse(
      await fs.readFile(path.join(__dirname, '../data/articles.json'), 'utf8')
    );
    
    for (const article of articles) {
      await connection.execute(
        `INSERT INTO articles (id, title, slug, content, excerpt, status, views, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [
          article.id,
          article.title,
          article.slug,
          article.content,
          article.excerpt,
          article.status || 'published',
          article.views || 0,
          article.created_at || new Date()
        ]
      );
    }
    
    console.log('✅ Articles migrated successfully');
    
    // كرر نفس العملية للجداول الأخرى...
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await connection.end();
  }
}

migrate();
```

## 🚀 الخطوة 6: تشغيل الترحيل

```bash
# تشغيل سكريبت الترحيل
node scripts/migrate-to-mysql.js
```

## ⚡ نصائح الأداء

1. **استخدم Indexes** للحقول المستخدمة في البحث
2. **استخدم Connection Pooling** لتحسين الأداء
3. **فعّل Query Caching** في MySQL
4. **استخدم Prepared Statements** للأمان

## 🔒 الأمان

1. **لا تشارك كلمة المرور** في GitHub
2. **استخدم SSL** للاتصال بقاعدة البيانات
3. **قيّد صلاحيات المستخدم** في قاعدة البيانات
4. **فعّل التشفير** للبيانات الحساسة

---

*تم الإنشاء في: ${new Date().toLocaleDateString('ar-SA')}* 