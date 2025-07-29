const { PrismaClient } = require('@prisma/client');

async function removeCoverImage() {
  const prisma = new PrismaClient();
  
  try {
    // تحديث تصنيف ميديا لحذف cover_image
    const result = await prisma.category.update({
      where: { id: 'cat-010' },
      data: {
        metadata: {
          icon: '🎬',
          color_hex: '#F59E0B'
        }
      }
    });
    
    console.log('✅ تم حذف صورة تصنيف ميديا بنجاح');
    console.log('التحديث:', result);
  } catch (error) {
    console.error('❌ خطأ في حذف الصورة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeCoverImage();
