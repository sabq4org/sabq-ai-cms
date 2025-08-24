#!/usr/bin/env node

/**
 * إنشاء مستخدم إداري جديد بكلمة مرور معروفة
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('👑 إنشاء مستخدم إداري جديد...');
  
  try {
    const email = 'admin@sabq.org';
    const password = 'admin123';
    const name = 'مدير النظام';

    // التحقق من وجود المستخدم
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('🔄 المستخدم موجود، سيتم تحديث كلمة المرور...');
      
      // تشفير كلمة المرور الجديدة
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // تحديث المستخدم
      const updatedUser = await prisma.users.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'admin',
          is_admin: true,
          name: name
        }
      });

      console.log('✅ تم تحديث المستخدم بنجاح:');
      console.log(`   📧 البريد: ${updatedUser.email}`);
      console.log(`   👤 الاسم: ${updatedUser.name}`);
      console.log(`   🔑 الدور: ${updatedUser.role}`);
      console.log(`   🔒 كلمة المرور: ${password}`);
      
    } else {
      console.log('➕ إنشاء مستخدم جديد...');
      
      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // إنشاء المستخدم
      const newUser = await prisma.users.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'admin',
          is_admin: true,
          is_verified: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log('✅ تم إنشاء المستخدم بنجاح:');
      console.log(`   📧 البريد: ${newUser.email}`);
      console.log(`   👤 الاسم: ${newUser.name}`);
      console.log(`   🔑 الدور: ${newUser.role}`);
      console.log(`   🔒 كلمة المرور: ${password}`);
    }

    console.log('\n🎯 يمكنك الآن تسجيل الدخول باستخدام:');
    console.log(`   📧 البريد: ${email}`);
    console.log(`   🔒 كلمة المرور: ${password}`);

  } catch (error) {
    console.error('💥 خطأ في إنشاء المستخدم:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
