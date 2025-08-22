const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function applyIndexes() {
  try {
    console.log('🚀 بدء تطبيق الفهارس...')
    
    // تطبيق الفهارس مباشرة
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
      ON smart_notifications(user_id, read_at);
    `
    console.log('✅ تم إضافة فهرس المستخدم والحالة')

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
      ON smart_notifications(user_id, created_at DESC);
    `
    console.log('✅ تم إضافة فهرس المستخدم والتاريخ')

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_type 
      ON smart_notifications(user_id, type);
    `
    console.log('✅ تم إضافة فهرس النوع والمستخدم')

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_status_created 
      ON smart_notifications(user_id, read_at, created_at DESC);
    `
    console.log('✅ تم إضافة الفهرس المركب')

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_notifications_status 
      ON smart_notifications(status);
    `
    console.log('✅ تم إضافة فهرس الحالة العامة')

    // تحليل الجدول لتحسين الأداء
    await prisma.$executeRaw`ANALYZE smart_notifications;`
    console.log('✅ تم تحليل الجدول')

    console.log('🎉 تم تطبيق جميع الفهارس بنجاح!')
    
  } catch (error) {
    if (error.message.includes('does not exist')) {
      console.log('ℹ️ جدول الإشعارات غير موجود، سيتم إنشاؤه عند أول استخدام')
    } else {
      console.error('❌ خطأ في تطبيق الفهارس:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

applyIndexes()
