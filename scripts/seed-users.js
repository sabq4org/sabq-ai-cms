const { PrismaClient } = require('../lib/generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedUsers() {
  console.log('🌱 بدء إضافة المستخدمين...');

  const users = [
    {
      id: 'user-admin-001',
      email: 'admin@sabq.ai',
      name: 'مدير النظام',
      password_hash: await hashPassword('Test@123456'),
      role: 'admin',
      is_verified: true,
      is_admin: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'user-editor-001',
      email: 'editor@sabq.ai',
      name: 'محرر المحتوى',
      password_hash: await hashPassword('Test@123456'),
      role: 'editor',
      is_verified: true,
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'user-regular-001',
      email: 'user@sabq.ai',
      name: 'مستخدم عادي',
      password_hash: await hashPassword('Test@123456'),
      role: 'user',
      is_verified: true,
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'user-admin-prod',
      email: 'admin@sabq.org',
      name: 'مدير الإنتاج',
      password_hash: await hashPassword('admin123456'),
      role: 'admin',
      is_verified: true,
      is_admin: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  for (const user of users) {
    try {
      await prisma.users.upsert({
        where: { email: user.email },
        update: user,
        create: user
      });
      console.log(`✅ تم إضافة المستخدم: ${user.name} (${user.email})`);
    } catch (error) {
      console.error(`❌ خطأ في إضافة ${user.email}:`, error.message);
    }
  }

  console.log('✨ اكتمل إضافة المستخدمين');
}

seedUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 