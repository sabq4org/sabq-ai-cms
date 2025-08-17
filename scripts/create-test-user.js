const { PrismaClient } = require('../lib/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // التحقق من وجود المستخدم
    const existingUser = await prisma.users.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('المستخدم التجريبي موجود بالفعل:', existingUser.email);
      return;
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash('password123', 10);

    // إنشاء المستخدم
    const user = await prisma.users.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'مستخدم تجريبي',
        role: 'admin',
        is_admin: true,
        is_verified: true,
        status: 'active'
      }
    });

    console.log('تم إنشاء المستخدم التجريبي بنجاح:');
    console.log('البريد الإلكتروني:', user.email);
    console.log('كلمة المرور: password123');
    console.log('الصلاحيات: مدير');

  } catch (error) {
    console.error('خطأ في إنشاء المستخدم:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 