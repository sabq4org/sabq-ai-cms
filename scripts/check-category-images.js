const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkCategoryImages() {
  console.log('🔍 فحص صور التصنيفات في قاعدة البيانات...\n');
  
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { display_order: 'asc' }
    });
    
    console.log(`📊 إجمالي التصنيفات: ${categories.length}\n`);
    
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.slug}):`);
      console.log(`   - ID: ${category.id}`);
      console.log(`   - نشط: ${category.is_active ? '✅' : '❌'}`);
      
      if (category.metadata && typeof category.metadata === 'object') {
        console.log(`   - metadata: ${JSON.stringify(category.metadata, null, 2)}`);
        
        if (category.metadata.cover_image) {
          console.log(`   - 🖼️ صورة الغلاف: ${category.metadata.cover_image}`);
        } else {
          console.log(`   - ⚠️ لا توجد صورة غلاف في metadata`);
        }
      } else {
        console.log(`   - ⚠️ لا توجد metadata`);
      }
      
      console.log('');
    });
    
    // إحصائيات
    const withImages = categories.filter(cat => 
      cat.metadata && 
      typeof cat.metadata === 'object' && 
      cat.metadata.cover_image
    ).length;
    
    console.log('📈 الإحصائيات:');
    console.log(`   - التصنيفات مع صور: ${withImages}`);
    console.log(`   - التصنيفات بدون صور: ${categories.length - withImages}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoryImages(); 