const { PrismaClient } = require('../lib/generated/prisma');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function exportCategories() {
  try {
    console.log('🔍 جاري تصدير التصنيفات من قاعدة البيانات...');
    
    // جلب جميع التصنيفات من قاعدة البيانات
    const categories = await prisma.category.findMany({
      orderBy: {
        displayOrder: 'asc'
      },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });
    
    console.log(`✅ تم العثور على ${categories.length} تصنيف`);
    
    // تنسيق البيانات للتصدير
    const exportData = {
      exportDate: new Date().toISOString(),
      totalCategories: categories.length,
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        name_ar: category.name,
        name_en: category.nameEn,
        slug: category.slug,
        description: category.description,
        color: category.color,
        icon: category.icon,
        display_order: category.displayOrder,
        is_active: category.isActive,
        parent_id: category.parentId,
        metadata: category.metadata,
        article_count: category._count.articles,
        created_at: category.createdAt,
        updated_at: category.updatedAt
      }))
    };
    
    // حفظ البيانات في ملف
    const exportPath = path.join(process.cwd(), 'data', 'categories-export.json');
    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`💾 تم حفظ التصنيفات في: ${exportPath}`);
    
    // إنشاء ملف SQL للاستيراد المباشر
    const sqlPath = path.join(process.cwd(), 'data', 'categories-import.sql');
    let sqlContent = `-- تصدير التصنيفات من قاعدة البيانات المحلية
-- تاريخ التصدير: ${new Date().toISOString()}
-- عدد التصنيفات: ${categories.length}

-- حذف التصنيفات الموجودة (اختياري)
-- DELETE FROM categories;

-- إدراج التصنيفات
`;
    
    for (const category of categories) {
      sqlContent += `INSERT INTO categories (id, name, name_en, slug, description, color, icon, display_order, is_active, parent_id, metadata, created_at, updated_at) VALUES (
  ${category.id},
  '${category.name.replace(/'/g, "''")}',
  ${category.nameEn ? `'${category.nameEn.replace(/'/g, "''")}'` : 'NULL'},
  '${category.slug}',
  ${category.description ? `'${category.description.replace(/'/g, "''")}'` : 'NULL'},
  ${category.color ? `'${category.color}'` : 'NULL'},
  ${category.icon ? `'${category.icon}'` : 'NULL'},
  ${category.displayOrder},
  ${category.isActive ? 1 : 0},
  ${category.parentId || 'NULL'},
  ${category.metadata ? `'${JSON.stringify(category.metadata).replace(/'/g, "''")}'` : 'NULL'},
  '${category.createdAt.toISOString()}',
  '${category.updatedAt.toISOString()}'
) ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  name_en = VALUES(name_en),
  description = VALUES(description),
  color = VALUES(color),
  icon = VALUES(icon),
  display_order = VALUES(display_order),
  is_active = VALUES(is_active),
  parent_id = VALUES(parent_id),
  metadata = VALUES(metadata),
  updated_at = VALUES(updated_at);

`;
    }
    
    await fs.writeFile(sqlPath, sqlContent);
    console.log(`📄 تم إنشاء ملف SQL في: ${sqlPath}`);
    
    // عرض ملخص التصنيفات
    console.log('\n📊 ملخص التصنيفات:');
    categories.forEach(category => {
      console.log(`  - ${category.name} (${category.slug}): ${category._count.articles} مقال`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في تصدير التصنيفات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
exportCategories(); 