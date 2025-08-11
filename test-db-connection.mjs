import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // اختبار بسيط للاتصال بقاعدة البيانات
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✅ Connection successful:', result);
    
    // إنشاء مجلد وسائط للاختبار
    const folderName = `Test Folder ${new Date().toISOString()}`;
    const folderSlug = folderName.toLowerCase().replace(/\s+/g, '-');
    
    const newFolder = await prisma.mediaFolder.create({
      data: {
        name: folderName,
        slug: folderSlug,
        path: `/${folderSlug}`,
        createdById: '1', // استبدل هذا بمعرف مستخدم موجود
      },
    });
    
    console.log('✅ Test media folder created:', newFolder);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
