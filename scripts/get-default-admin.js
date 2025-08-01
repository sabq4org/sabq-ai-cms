const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getDefaultAdmin() {
  try {
    // البحث عن مستخدم admin
    const adminUser = await prisma.$queryRaw`
      SELECT id, name, email, role 
      FROM users 
      WHERE role = 'admin' OR is_admin = true 
      ORDER BY created_at ASC 
      LIMIT 1;
    `;
    
    if (adminUser.length > 0) {
      const admin = adminUser[0];
      console.log(`export const DEFAULT_ADMIN_ID = "${admin.id}"; // ${admin.name} (${admin.email})`);
      return admin.id;
    } else {
      console.log('// لا يوجد مستخدم admin');
      return null;
    }
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getDefaultAdmin();