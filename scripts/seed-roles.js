// سكريبت لإنشاء الأدوار الافتراضية
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultRoles = [
  {
    id: 'role-admin',
    name: 'admin',
    display_name: 'مدير النظام',
    description: 'صلاحيات كاملة لإدارة النظام',
    permissions: [
      'manage_users',
      'manage_articles',
      'manage_categories',
      'manage_settings',
      'manage_roles',
      'view_analytics',
      'moderate_comments'
    ],
    is_system: true
  },
  {
    id: 'role-editor',
    name: 'editor',
    display_name: 'محرر',
    description: 'إدارة المحتوى والمقالات',
    permissions: [
      'create_articles',
      'edit_articles',
      'delete_articles',
      'manage_categories',
      'moderate_comments'
    ],
    is_system: true
  },
  {
    id: 'role-writer',
    name: 'writer',
    display_name: 'كاتب',
    description: 'كتابة ونشر المقالات',
    permissions: [
      'create_articles',
      'edit_own_articles',
      'view_analytics'
    ],
    is_system: true
  },
  {
    id: 'role-moderator',
    name: 'moderator',
    display_name: 'مشرف',
    description: 'إدارة التعليقات والمحتوى',
    permissions: [
      'moderate_comments',
      'view_articles',
      'edit_articles'
    ],
    is_system: true
  },
  {
    id: 'role-viewer',
    name: 'viewer',
    display_name: 'مستعرض',
    description: 'عرض المحتوى فقط',
    permissions: [
      'view_articles',
      'view_analytics'
    ],
    is_system: true
  },
  {
    id: 'role-user',
    name: 'user',
    display_name: 'مستخدم',
    description: 'مستخدم عادي',
    permissions: [
      'view_articles',
      'comment_articles'
    ],
    is_system: true
  }
];

async function seedRoles() {
  try {
    console.log('🌱 بدء إنشاء الأدوار الافتراضية...');
    
    // التحقق من وجود أدوار
    const existingRolesCount = await prisma.roles.count();
    console.log(`📊 الأدوار الموجودة حالياً: ${existingRolesCount}`);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const roleData of defaultRoles) {
      try {
        // التحقق من وجود الدور
        const existingRole = await prisma.roles.findUnique({
          where: { name: roleData.name }
        });
        
        if (existingRole) {
          console.log(`⏭️ الدور موجود: ${roleData.name}`);
          skippedCount++;
          continue;
        }
        
        // إنشاء الدور
        await prisma.roles.create({
          data: {
            ...roleData,
            permissions: JSON.stringify(roleData.permissions),
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        
        console.log(`✅ تم إنشاء: ${roleData.display_name} (${roleData.name})`);
        createdCount++;
        
      } catch (roleError) {
        console.error(`❌ فشل إنشاء الدور ${roleData.name}:`, roleError);
      }
    }
    
    console.log('\n📊 النتائج:');
    console.log(`✅ تم إنشاء: ${createdCount} أدوار`);
    console.log(`⏭️ تم تخطي: ${skippedCount} أدوار (موجودة مسبقاً)`);
    
    // التحقق النهائي
    const finalCount = await prisma.roles.count();
    console.log(`📊 إجمالي الأدوار الآن: ${finalCount}`);
    
    if (finalCount > 0) {
      console.log('\n🎉 تم إنشاء الأدوار بنجاح!');
      console.log('💡 يمكنك الآن تحديث صفحة إدارة الفريق');
    }
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الأدوار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإنشاء إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  seedRoles();
}

export default seedRoles;
