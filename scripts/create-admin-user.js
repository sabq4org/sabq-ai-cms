const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔄 إنشاء مستخدم مدير...');
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    // إنشاء المستخدم
    const user = await prisma.users.upsert({
      where: {
        email: 'admin@sabq.org'
      },
      update: {
        password_hash: hashedPassword,
        role: 'admin',
        is_admin: true,
        is_verified: true
      },
      create: {
        id: 'admin-user-1',
        name: 'مدير سبق',
        email: 'admin@sabq.org',
        password_hash: hashedPassword,
        role: 'admin',
        is_admin: true,
        is_verified: true,
        avatar: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم إنشاء المستخدم المدير بنجاح:');
    console.log(`📧 البريد الإلكتروني: ${user.email}`);
    console.log(`👤 الاسم: ${user.name}`);
    console.log(`🔑 الدور: ${user.role}`);
    console.log(`🔐 كلمة المرور: admin123456`);
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 