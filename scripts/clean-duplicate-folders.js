const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDuplicateFolders() {
  try {
    console.log('🔄 تنظيف المجلدات المكررة...');
    
    // الحصول على جميع المجلدات
    const allFolders = await prisma.mediaFolder.findMany({
      orderBy: [
        { parentId: 'asc' },
        { name: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    const duplicatesToDelete = [];
    const seenFolders = new Map();

    for (const folder of allFolders) {
      const key = `${folder.name}-${folder.parentId || 'root'}`;
      
      if (seenFolders.has(key)) {
        // هذا مجلد مكرر - احتفظ بالأقدم
        duplicatesToDelete.push(folder.id);
        console.log(`⚠️  مجلد مكرر: "${folder.name}" في ${folder.parentId || 'الجذر'} - سيتم حذفه`);
      } else {
        seenFolders.set(key, folder);
      }
    }

    if (duplicatesToDelete.length > 0) {
      console.log(`🗑️  سيتم حذف ${duplicatesToDelete.length} مجلد مكرر...`);
      
      const result = await prisma.mediaFolder.deleteMany({
        where: {
          id: {
            in: duplicatesToDelete
          }
        }
      });

      console.log(`✅ تم حذف ${result.count} مجلد مكرر بنجاح`);
    } else {
      console.log('✅ لا توجد مجلدات مكررة');
    }

  } catch (error) {
    console.error('❌ خطأ في تنظيف المجلدات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicateFolders();
