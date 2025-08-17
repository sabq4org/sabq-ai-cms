const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDefaultUser() {
  try {
    console.log('🔧 إنشاء user افتراضي للنظام...\n');
    
    // التحقق من وجود user افتراضي
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: 'system@sabq.org' },
          { email: 'default@sabq.org' }
        ]
      }
    });
    
    if (existingUser) {
      console.log('✅ User افتراضي موجود بالفعل:', existingUser.email);
      console.log('📋 معرف User:', existingUser.id);
      return existingUser;
    }
    
    // إنشاء user افتراضي جديد
    const defaultUser = await prisma.users.create({
      data: {
        id: `user_${Date.now()}_system`,
        email: 'system@sabq.org',
        name: 'النظام الافتراضي',
        role: 'admin',
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم إنشاء user افتراضي جديد:');
    console.log(`   📧 البريد: ${defaultUser.email}`);
    console.log(`   👤 الاسم: ${defaultUser.name}`);
    console.log(`   🆔 المعرف: ${defaultUser.id}`);
    
    return defaultUser;
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء user افتراضي:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultUser();
