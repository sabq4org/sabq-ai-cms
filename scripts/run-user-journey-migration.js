const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function runMigration() {
  console.log('🚀 بدء إضافة جداول رحلة المستخدم المعرفية...');
  
  try {
    // قراءة ملف SQL
    const sqlPath = path.join(__dirname, 'add-user-journey-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // تقسيم SQL إلى أوامر منفصلة
    const statements = sql
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    // تنفيذ كل أمر على حدة
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 تنفيذ: ${statement.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(statement);
      }
    }
    
    console.log('✅ تم إنشاء جداول رحلة المستخدم بنجاح!');
    
    // التحقق من الجداول المنشأة
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_reading_sessions', 'user_insights', 'user_similar_readers')
    `;
    
    console.log('📊 الجداول المنشأة:', tables);
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الجداول:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الترحيل
runMigration()
  .then(() => {
    console.log('✨ اكتمل الترحيل بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 فشل الترحيل:', error);
    process.exit(1);
  }); 