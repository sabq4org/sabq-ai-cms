const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProfiles() {
  try {
    console.log('🧹 تنظيف البروفايلات المعطلة...');
    
    // حذف البروفايلات المعطلة
    const deletedProfiles = await prisma.reporters.deleteMany({
      where: {
        OR: [
          { slug: 'a' },
          { slug: 'h' },
          { slug: '' }
        ]
      }
    });
    
    console.log(`✅ تم حذف ${deletedProfiles.count} بروفايل معطل`);
    
    // إعادة تشغيل إنشاء البروفايلات
    console.log('\n📝 إعادة إنشاء البروفايلات...');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixProfiles();
