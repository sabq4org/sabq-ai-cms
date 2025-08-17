const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDummyNotifications() {
  try {
    console.log('🧹 بدء حذف الإشعارات التجريبية/الوهمية...');

    // قائمة بالكلمات والعبارات التي تشير إلى إشعارات تجريبية
    const dummyPatterns = [
      'تجريبي',
      'إشعار تجريبي',
      'اختبار',
      'تم إصلاح',
      'إصلاح النظام',
      'إصلاح المشاكل',
      'experimental',
      'test notification'
    ];

    // حذف الإشعارات التي تحتوي على كلمات تجريبية في العنوان
    const deletedByTitle = await prisma.smartNotifications.deleteMany({
      where: {
        OR: dummyPatterns.map(pattern => ({
          title: {
            contains: pattern
          }
        }))
      }
    });

    console.log(`✅ تم حذف ${deletedByTitle.count} إشعار بناءً على العنوان`);

    // حذف الإشعارات التي تحتوي على كلمات تجريبية في الرسالة
    const deletedByMessage = await prisma.smartNotifications.deleteMany({
      where: {
        OR: dummyPatterns.map(pattern => ({
          message: {
            contains: pattern
          }
        }))
      }
    });

    console.log(`✅ تم حذف ${deletedByMessage.count} إشعار بناءً على الرسالة`);

    const total = deletedByTitle.count + deletedByMessage.count;
    console.log(`\n🎉 تم حذف إجمالي ${total} إشعار تجريبي/وهمي`);

  } catch (error) {
    console.error('❌ خطأ في حذف الإشعارات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
cleanupDummyNotifications();
