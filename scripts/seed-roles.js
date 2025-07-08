const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

const defaultRoles = [
  {
    id: 'admin',
    name: 'admin',
    display_name: 'مدير النظام',
    description: 'صلاحيات كاملة على النظام',
    permissions: JSON.stringify([
      'articles.create', 'articles.edit', 'articles.delete', 'articles.publish',
      'articles.schedule', 'articles.review', 'submissions.view', 'submissions.approve',
      'submissions.comment', 'ai.generate', 'ai.enhance', 'ai.analyze',
      'analytics.view_all', 'analytics.export', 'calendar.view', 'calendar.edit',
      'calendar.assign', 'blocks.create', 'blocks.edit', 'blocks.delete',
      'blocks.reorder', 'team.view', 'team.add', 'team.edit', 'team.remove',
      'logs.view', 'logs.export', 'logs.filter', 'settings.view', 'settings.edit',
      'comments.moderate', 'comments.reply', 'media.upload', 'media.manage',
      'templates.edit', 'templates.create'
    ]),
    is_system: true,
    updated_at: new Date()
  },
  {
    id: 'editor',
    name: 'editor',
    display_name: 'محرر',
    description: 'إدارة المحتوى والمقالات',
    permissions: JSON.stringify([
      'articles.create', 'articles.edit', 'articles.delete', 'articles.publish',
      'articles.review', 'submissions.view', 'submissions.approve', 'submissions.comment',
      'ai.generate', 'ai.enhance', 'analytics.view_own', 'media.upload', 'media.manage',
      'comments.moderate', 'comments.reply'
    ]),
    is_system: true,
    updated_at: new Date()
  },
  {
    id: 'writer',
    name: 'writer',
    display_name: 'كاتب',
    description: 'كتابة وتعديل المقالات',
    permissions: JSON.stringify([
      'articles.create', 'articles.edit', 'analytics.view_own',
      'media.upload', 'ai.generate', 'ai.enhance'
    ]),
    is_system: true,
    updated_at: new Date()
  },
  {
    id: 'reviewer',
    name: 'reviewer',
    display_name: 'مراجع',
    description: 'مراجعة ونشر المحتوى',
    permissions: JSON.stringify([
      'articles.review', 'articles.publish', 'submissions.view',
      'submissions.approve', 'submissions.comment', 'analytics.view_own',
      'comments.moderate'
    ]),
    is_system: true,
    updated_at: new Date()
  },
  {
    id: 'member',
    name: 'member',
    display_name: 'عضو',
    description: 'صلاحيات أساسية',
    permissions: JSON.stringify([
      'analytics.view_own'
    ]),
    is_system: false,
    updated_at: new Date()
  }
];

async function seedRoles() {
  console.log('🌱 بدء إضافة الأدوار الافتراضية...');

  for (const role of defaultRoles) {
    try {
      // التحقق من وجود الدور
      const existingRole = await prisma.roles.findUnique({
        where: { id: role.id }
      });

      if (existingRole) {
        console.log(`⚠️  الدور ${role.display_name} موجود بالفعل`);
        continue;
      }

      // إضافة الدور
      await prisma.roles.create({
        data: role
      });

      console.log(`✅ تم إضافة الدور: ${role.display_name}`);
    } catch (error) {
      console.error(`❌ خطأ في إضافة الدور ${role.display_name}:`, error);
    }
  }

  await prisma.$disconnect();
  console.log('✨ اكتملت عملية إضافة الأدوار');
}

seedRoles().catch((error) => {
  console.error('خطأ في تشغيل السكريبت:', error);
  process.exit(1);
}); 