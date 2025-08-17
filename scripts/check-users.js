const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 فحص المستخدمين في قاعدة البيانات...');
    
    // فحص جدول users
    const users = await prisma.$queryRaw`
      SELECT id, name, email, role FROM users LIMIT 5;
    `;
    
    console.log('👥 المستخدمين الموجودين:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // فحص إذا كان admin موجود
    const adminUser = await prisma.$queryRaw`
      SELECT * FROM users WHERE id = 'admin' OR email LIKE '%admin%' LIMIT 1;
    `;
    
    console.log('\n🔑 المستخدم admin:');
    if (adminUser.length > 0) {
      console.log('✅ موجود:', adminUser[0]);
    } else {
      console.log('❌ غير موجود - يحتاج إنشاء');
    }
    
    // اقتراح معرف مستخدم صالح
    if (users.length > 0) {
      console.log('\n💡 معرفات المستخدمين الصالحة:');
      users.forEach(user => {
        console.log(`  - "${user.id}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص المستخدمين:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();