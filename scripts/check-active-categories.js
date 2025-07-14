const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('🔍 التحقق من التصنيفات في قاعدة البيانات...\n');
    
    // جلب جميع التصنيفات
    const allCategories = await prisma.categories.findMany({
      orderBy: { display_order: 'asc' }
    });
    
    console.log(`📊 إجمالي التصنيفات: ${allCategories.length}`);
    console.log(`✅ التصنيفات النشطة: ${allCategories.filter(c => c.is_active).length}`);
    console.log(`❌ التصنيفات غير النشطة: ${allCategories.filter(c => !c.is_active).length}\n`);
    
    console.log('📋 قائمة التصنيفات:');
    console.log('─'.repeat(80));
    
    allCategories.forEach(cat => {
      const status = cat.is_active ? '✅' : '❌';
      console.log(`${status} ${cat.name.padEnd(20)} | ID: ${cat.id} | Slug: ${cat.slug}`);
    });
    
    // التحقق من التصنيفات النشطة فقط
    console.log('\n🎯 التصنيفات النشطة فقط:');
    console.log('─'.repeat(80));
    
    const activeCategories = await prisma.categories.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' }
    });
    
    if (activeCategories.length === 0) {
      console.log('⚠️  لا توجد تصنيفات نشطة!');
    } else {
      activeCategories.forEach(cat => {
        console.log(`• ${cat.name} (${cat.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories(); 