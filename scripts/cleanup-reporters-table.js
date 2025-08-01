const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupReporters() {
  try {
    console.log('🗑️ بدء تنظيف جدول reporters...');
    
    // حذف جميع البيانات التجريبية
    const deletedCount = await prisma.reporters.deleteMany({});
    console.log(`✅ تم حذف ${deletedCount.count} مراسل تجريبي من جدول reporters`);
    
    console.log('✅ تم تنظيف جدول reporters بنجاح');
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف جدول reporters:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupReporters();
