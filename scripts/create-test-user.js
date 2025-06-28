#!/usr/bin/env node

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    // إنشاء مستخدم تجريبي
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'مستخدم تجريبي',
        role: 'editor',
        isVerified: true
      }
    });
    
    console.log('تم إنشاء المستخدم:', {
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 