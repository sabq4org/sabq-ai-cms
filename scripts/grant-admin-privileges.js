#!/usr/bin/env node

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function grantAdminPrivileges() {
  try {
    console.log('🔄 البحث عن المستخدم user@sabq.ai...');
    
    // البحث عن المستخدم
    const user = await prisma.users.findUnique({
      where: {
        email: 'user@sabq.ai'
      }
    });
    
    if (!user) {
      console.error('❌ المستخدم user@sabq.ai غير موجود في قاعدة البيانات');
      return;
    }
    
    console.log('✅ تم العثور على المستخدم:', user.name);
    console.log('📋 الصلاحيات الحالية:', user.role);
    console.log('🔐 حالة المسؤول:', user.is_admin ? 'نعم' : 'لا');
    
    // تحديث الصلاحيات
    const updatedUser = await prisma.users.update({
      where: {
        id: user.id
      },
      data: {
        role: 'admin',
        is_admin: true,
        updated_at: new Date()
      }
    });
    
    console.log('\n✅ تم تحديث الصلاحيات بنجاح!');
    console.log('📋 الصلاحيات الجديدة:', updatedUser.role);
    console.log('🔐 حالة المسؤول:', updatedUser.is_admin ? 'نعم' : 'لا');
    console.log('\n🎉 يمكنك الآن حذف المقالات وإدارة المحتوى بصلاحيات كاملة!');
    
  } catch (error) {
    console.error('❌ خطأ في تحديث الصلاحيات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
grantAdminPrivileges(); 