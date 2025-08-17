const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReporters() {
  try {
    const count = await prisma.reporters.count();
    console.log('📊 عدد المراسلين في جدول reporters:', count);
    
    if (count > 0) {
      const reporters = await prisma.reporters.findMany({
        take: 5,
        select: { id: true, full_name: true, slug: true, is_active: true, user_id: true }
      });
      console.log('🔍 عينة من المراسلين:', reporters);
    } else {
      console.log('✅ جدول reporters فارغ - يمكن حذفه بأمان');
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkReporters();
