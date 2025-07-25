const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function createDefaultRoles() {
  console.log('🔧 إنشاء الأدوار الافتراضية...');

  const defaultRoles = [
    {
      id: 'admin',
      name: 'admin',
      display_name: 'مسؤول عام',
      description: 'صلاحيات كاملة للنظام',
      permissions: JSON.stringify([
        'users.view', 'users.create', 'users.edit', 'users.delete',
        'articles.view', 'articles.create', 'articles.edit', 'articles.delete', 'articles.publish',
        'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
        'team.view', 'team.add', 'team.edit', 'team.remove',
        'settings.view', 'settings.edit',
        'logs.view'
      ]),
      is_system: true
    },
    {
      id: 'editor',
      name: 'editor',
      display_name: 'محرر أول',
      description: 'إدارة المحتوى والمقالات',
      permissions: JSON.stringify([
        'articles.view', 'articles.create', 'articles.edit', 'articles.publish',
        'categories.view', 'categories.create', 'categories.edit',
        'media.upload', 'media.view'
      ]),
      is_system: true
    },
    {
      id: 'content-manager',
      name: 'content-manager',
      display_name: 'مدير محتوى',
      description: 'إدارة وتنظيم المحتوى',
      permissions: JSON.stringify([
        'articles.view', 'articles.create', 'articles.edit',
        'categories.view', 'categories.create',
        'media.upload', 'media.view'
      ]),
      is_system: true
    },
    {
      id: 'correspondent',
      name: 'correspondent',
      display_name: 'مراسل',
      description: 'كتابة وإعداد المقالات',
      permissions: JSON.stringify([
        'articles.view', 'articles.create', 'articles.edit',
        'media.upload', 'media.view'
      ]),
      is_system: true
    },
    {
      id: 'moderator',
      name: 'moderator',
      display_name: 'مشرف',
      description: 'مراجعة المحتوى والتعليقات',
      permissions: JSON.stringify([
        'articles.view', 'articles.edit',
        'comments.view', 'comments.moderate'
      ]),
      is_system: true
    }
  ];

  try {
    // حذف الأدوار الموجودة (إذا كانت)
    await prisma.roles.deleteMany({
      where: {
        is_system: true
      }
    });

    // إنشاء الأدوار الجديدة
    for (const role of defaultRoles) {
      await prisma.roles.create({
        data: {
          ...role,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log(`✅ تم إنشاء دور: ${role.display_name}`);
    }

    console.log('🎉 تم إنشاء جميع الأدوار الافتراضية بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الأدوار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultRoles();
