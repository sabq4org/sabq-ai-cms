import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMediaFolder() {
  try {
    console.log('Testing database connection...');
    
    // اختبار بسيط للاتصال بقاعدة البيانات
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✅ Connection successful:', result);
    
    // البحث عن مستخدم موجود بالفعل
    console.log('Fetching a user from the database...');
    const user = await prisma.users.findFirst({
      where: {
        is_admin: true
      }
    });
    
    if (!user) {
      console.log('❌ No users found in the database.');
      return;
    }
    
    console.log(`✅ Found user: ${user.name || user.email} (${user.id})`);
    
    // إنشاء مجلد وسائط للاختبار
    const folderName = `Test Folder ${new Date().toISOString()}`;
    const folderSlug = folderName.toLowerCase().replace(/\s+/g, '-').replace(/:/g, '-');
    
    console.log(`Creating folder: ${folderName} with slug: ${folderSlug}`);
    
    const newFolder = await prisma.mediaFolder.create({
      data: {
        name: folderName,
        slug: folderSlug,
        path: `/${folderSlug}`,
        createdById: user.id,
      },
    });
    
    console.log('✅ Test media folder created:', newFolder);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMediaFolder();
