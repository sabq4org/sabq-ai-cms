const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCategoryImages() {
  console.log('🔄 بدء إصلاح روابط صور التصنيفات...');

  try {
    // جلب جميع التصنيفات
    const categories = await prisma.category.findMany();

    for (const category of categories) {
      if (category.metadata && typeof category.metadata === 'object') {
        const metadata = category.metadata;
        
        // إذا كانت الصورة تبدأ بـ /uploads
        if (metadata.cover_image && metadata.cover_image.startsWith('/uploads/')) {
          console.log(`📸 تصنيف ${category.name}:`, metadata.cover_image);
          
          // يمكنك هنا:
          // 1. رفع الصورة إلى Cloudinary
          // 2. أو تحديث المسار إلى رابط خارجي
          // 3. أو إزالة الصورة مؤقتاً
          
          // مثال: إزالة الصورة المحلية مؤقتاً
          const updatedMetadata = {
            ...metadata,
            cover_image: '' // أو ضع رابط صورة افتراضية
          };
          
          await prisma.category.update({
            where: { id: category.id },
            data: { metadata: updatedMetadata }
          });
          
          console.log(`✅ تم تحديث ${category.name}`);
        }
      }
    }

    console.log('✨ تم إصلاح جميع روابط الصور!');
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
fixCategoryImages(); 