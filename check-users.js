#!/usr/bin/env node

/**
 * فحص المستخدمين الموجودين في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  console.log('🔍 فحص المستخدمين في قاعدة البيانات...');
  
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_admin: true,
        created_at: true
      },
      take: 10
    });

    console.log(`📊 تم العثور على ${users.length} مستخدم:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. المستخدم:`);
      console.log(`   📧 البريد: ${user.email}`);
      console.log(`   👤 الاسم: ${user.name}`);
      console.log(`   🔑 الدور: ${user.role}`);
      console.log(`   👑 مدير: ${user.is_admin ? 'نعم' : 'لا'}`);
      console.log(`   📅 تاريخ الإنشاء: ${user.created_at}`);
    });

    // البحث عن مستخدم admin محدد
    const adminUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: 'admin@sabq.org' },
          { email: 'admin@sabq.ai' },
          { role: 'admin' },
          { is_admin: true }
        ]
      }
    });

    if (adminUser) {
      console.log('\n🎯 مستخدم الإدارة الموجود:');
      console.log(`   📧 البريد: ${adminUser.email}`);
      console.log(`   👤 الاسم: ${adminUser.name}`);
      console.log(`   🔑 الدور: ${adminUser.role}`);
    } else {
      console.log('\n❌ لا يوجد مستخدم إدارة');
    }

  } catch (error) {
    console.error('💥 خطأ في فحص المستخدمين:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
