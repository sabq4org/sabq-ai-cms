const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRolesAndPermissions() {
  try {
    console.log('🚀 بدء إدخال البيانات الأساسية...');
    
    // إدخال الأدوار الأساسية
    const rolesData = [
      { name: 'super_admin', display_name: 'مدير النظام', description: 'صلاحيات كاملة على النظام بدون قيود', color: 'red', level: 0, is_system: true },
      { name: 'admin', display_name: 'مدير', description: 'إدارة كاملة للنظام والمحتوى', color: 'red', level: 1, is_system: true },
      { name: 'editor', display_name: 'محرر', description: 'تحرير ونشر المقالات والمحتوى', color: 'blue', level: 2, is_system: false },
      { name: 'correspondent', display_name: 'مراسل', description: 'كتابة الأخبار والتقارير الميدانية', color: 'purple', level: 3, is_system: false },
      { name: 'author', display_name: 'كاتب', description: 'كتابة المقالات والمحتوى', color: 'green', level: 4, is_system: false },
      { name: 'subscriber', display_name: 'مشترك', description: 'قراءة المحتوى المميز والتفاعل', color: 'yellow', level: 5, is_system: false },
      { name: 'user', display_name: 'مستخدم', description: 'قراءة المحتوى والتفاعل معه', color: 'gray', level: 6, is_system: false }
    ];
    
    const createdRoles = {};
    
    for (const roleData of rolesData) {
      try {
        const result = await prisma.$queryRaw`
          INSERT INTO roles (name, display_name, description, color, level, is_system)
          VALUES (${roleData.name}, ${roleData.display_name}, ${roleData.description}, ${roleData.color}, ${roleData.level}, ${roleData.is_system})
          ON CONFLICT (name) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            description = EXCLUDED.description,
            color = EXCLUDED.color,
            level = EXCLUDED.level
          RETURNING *
        `;
        createdRoles[roleData.name] = result[0];
        console.log(`✅ تم إنشاء/تحديث دور: ${roleData.display_name}`);
      } catch (error) {
        console.error(`❌ خطأ في إنشاء دور ${roleData.name}:`, error.message);
      }
    }
    
    // إدخال الصلاحيات الأساسية
    const permissionsData = [
      // مقالات
      { name: 'articles.view', display_name: 'عرض المقالات', description: 'عرض جميع المقالات', category: 'articles' },
      { name: 'articles.create', display_name: 'إنشاء مقال', description: 'إنشاء مقالات جديدة', category: 'articles' },
      { name: 'articles.edit', display_name: 'تحرير المقالات', description: 'تحرير المقالات الموجودة', category: 'articles' },
      { name: 'articles.delete', display_name: 'حذف المقالات', description: 'حذف المقالات', category: 'articles' },
      { name: 'articles.publish', display_name: 'نشر المقالات', description: 'نشر وإلغاء نشر المقالات', category: 'articles' },
      { name: 'articles.*', display_name: 'جميع صلاحيات المقالات', description: 'جميع صلاحيات المقالات', category: 'articles' },
      
      // مستخدمين
      { name: 'users.view', display_name: 'عرض المستخدمين', description: 'عرض قائمة المستخدمين', category: 'users' },
      { name: 'users.create', display_name: 'إضافة مستخدم', description: 'إضافة مستخدمين جدد', category: 'users' },
      { name: 'users.edit', display_name: 'تحرير المستخدمين', description: 'تحرير بيانات المستخدمين', category: 'users' },
      { name: 'users.delete', display_name: 'حذف المستخدمين', description: 'حذف المستخدمين', category: 'users' },
      { name: 'users.*', display_name: 'جميع صلاحيات المستخدمين', description: 'جميع صلاحيات المستخدمين', category: 'users' },
      
      // تصنيفات
      { name: 'categories.view', display_name: 'عرض التصنيفات', description: 'عرض التصنيفات', category: 'categories' },
      { name: 'categories.create', display_name: 'إنشاء تصنيف', description: 'إنشاء تصنيفات جديدة', category: 'categories' },
      { name: 'categories.edit', display_name: 'تحرير التصنيفات', description: 'تحرير التصنيفات', category: 'categories' },
      { name: 'categories.delete', display_name: 'حذف التصنيفات', description: 'حذف التصنيفات', category: 'categories' },
      { name: 'categories.*', display_name: 'جميع صلاحيات التصنيفات', description: 'جميع صلاحيات التصنيفات', category: 'categories' },
      
      // وسائط
      { name: 'media.view', display_name: 'عرض الوسائط', description: 'عرض مكتبة الوسائط', category: 'media' },
      { name: 'media.upload', display_name: 'رفع الوسائط', description: 'رفع ملفات جديدة', category: 'media' },
      { name: 'media.delete', display_name: 'حذف الوسائط', description: 'حذف الملفات', category: 'media' },
      { name: 'media.*', display_name: 'جميع صلاحيات الوسائط', description: 'جميع صلاحيات الوسائط', category: 'media' },
      
      // تعليقات
      { name: 'comments.view', display_name: 'عرض التعليقات', description: 'عرض التعليقات', category: 'comments' },
      { name: 'comments.create', display_name: 'إضافة تعليق', description: 'إضافة تعليقات جديدة', category: 'comments' },
      { name: 'comments.edit', display_name: 'تحرير التعليقات', description: 'تحرير التعليقات', category: 'comments' },
      { name: 'comments.delete', display_name: 'حذف التعليقات', description: 'حذف التعليقات', category: 'comments' },
      { name: 'comments.*', display_name: 'جميع صلاحيات التعليقات', description: 'جميع صلاحيات التعليقات', category: 'comments' },
      
      // إعدادات النظام
      { name: 'system.settings', display_name: 'إعدادات النظام', description: 'تعديل إعدادات النظام', category: 'system' },
      { name: 'system.backup', display_name: 'النسخ الاحتياطي', description: 'إنشاء واستعادة النسخ الاحتياطية', category: 'system' },
      { name: 'system.analytics', display_name: 'التحليلات', description: 'عرض تحليلات النظام', category: 'system' },
      
      // صلاحية الكل
      { name: '*', display_name: 'جميع الصلاحيات', description: 'صلاحيات كاملة على النظام', category: 'system' }
    ];
    
    const createdPermissions = {};
    
    for (const permData of permissionsData) {
      try {
        const result = await prisma.$queryRaw`
          INSERT INTO permissions (name, display_name, description, category)
          VALUES (${permData.name}, ${permData.display_name}, ${permData.description}, ${permData.category})
          ON CONFLICT (name) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            description = EXCLUDED.description,
            category = EXCLUDED.category
          RETURNING *
        `;
        createdPermissions[permData.name] = result[0];
        console.log(`✅ تم إنشاء/تحديث صلاحية: ${permData.display_name}`);
      } catch (error) {
        console.error(`❌ خطأ في إنشاء صلاحية ${permData.name}:`, error.message);
      }
    }
    
    // ربط الصلاحيات بالأدوار
    const rolePermissions = {
      'super_admin': ['*'],
      'admin': ['*'],
      'editor': ['articles.*', 'media.*', 'categories.view', 'comments.*'],
      'correspondent': ['articles.create', 'articles.edit', 'media.upload', 'media.view'],
      'author': ['articles.create', 'articles.edit', 'media.upload', 'media.view'],
      'subscriber': ['articles.view', 'comments.create'],
      'user': ['articles.view', 'comments.create']
    };
    
    for (const [roleName, permissions] of Object.entries(rolePermissions)) {
      const role = createdRoles[roleName];
      if (!role) continue;
      
      for (const permName of permissions) {
        const permission = createdPermissions[permName];
        if (!permission) continue;
        
        try {
          await prisma.$queryRaw`
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (${role.id}, ${permission.id})
            ON CONFLICT DO NOTHING
          `;
          console.log(`✅ ربط ${role.display_name} بـ ${permission.display_name}`);
        } catch (error) {
          console.error(`❌ خطأ في الربط:`, error.message);
        }
      }
    }
    
    // تحديث المستخدمين الحاليين
    console.log('\n📊 تحديث المستخدمين الحاليين...');
    
    for (const [roleName, roleData] of Object.entries(createdRoles)) {
      try {
        const result = await prisma.$queryRaw`
          UPDATE users 
          SET role_id = ${roleData.id}
          WHERE role = ${roleName}
        `;
        console.log(`✅ تم تحديث المستخدمين من دور ${roleName}`);
      } catch (error) {
        console.error(`❌ خطأ في تحديث المستخدمين:`, error.message);
      }
    }
    
    // عرض الإحصائيات النهائية
    const stats = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM roles) as roles_count,
        (SELECT COUNT(*) FROM permissions) as permissions_count,
        (SELECT COUNT(*) FROM role_permissions) as role_permissions_count,
        (SELECT COUNT(*) FROM users WHERE role_id IS NOT NULL) as users_with_roles
    `;
    
    console.log('\n📊 الإحصائيات النهائية:');
    console.log(`  - عدد الأدوار: ${stats[0].roles_count}`);
    console.log(`  - عدد الصلاحيات: ${stats[0].permissions_count}`);
    console.log(`  - عدد الربطات: ${stats[0].role_permissions_count}`);
    console.log(`  - المستخدمين مع أدوار: ${stats[0].users_with_roles}`);
    
    console.log('\n✅ تم إكمال إعداد نظام الأدوار والصلاحيات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل البذر
seedRolesAndPermissions();