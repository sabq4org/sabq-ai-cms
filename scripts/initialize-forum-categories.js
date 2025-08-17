const { PrismaClient } = require('../lib/generated/prisma');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const initialCategories = [
  {
    name: 'نقاش عام',
    name_ar: 'نقاش عام',
    slug: 'general',
    description: 'مناقشات عامة حول مختلف المواضيع',
    color: '#3B82F6',
    icon: 'MessageCircle',
    display_order: 1,
    is_active: true
  },
  {
    name: 'اقتراحات وتطوير',
    name_ar: 'اقتراحات وتطوير',
    slug: 'suggestions',
    description: 'اقتراحاتكم لتطوير منصة سبق',
    color: '#10B981',
    icon: 'Lightbulb',
    display_order: 2,
    is_active: true
  },
  {
    name: 'مساعدة ودعم',
    name_ar: 'مساعدة ودعم',
    slug: 'support',
    description: 'احصل على المساعدة والدعم التقني',
    color: '#F59E0B',
    icon: 'HelpCircle',
    display_order: 3,
    is_active: true
  },
  {
    name: 'أخبار ومستجدات',
    name_ar: 'أخبار ومستجدات',
    slug: 'news',
    description: 'آخر الأخبار والمستجدات من فريق سبق',
    color: '#EF4444',
    icon: 'Newspaper',
    display_order: 4,
    is_active: true
  },
  {
    name: 'التقنية والذكاء الاصطناعي',
    name_ar: 'التقنية والذكاء الاصطناعي',
    slug: 'technology',
    description: 'مناقشات حول التقنية والذكاء الاصطناعي',
    color: '#8B5CF6',
    icon: 'Cpu',
    display_order: 5,
    is_active: true
  }
];

async function initializeForumCategories() {
  try {
    console.log('🔄 بدء إدراج فئات المنتدى...');

    // التحقق من وجود فئات موجودة
    const existingCategories = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM forum_categories
    `;
    
    const count = Number(existingCategories[0]?.count || 0);
    
    if (count > 0) {
      console.log(`⚠️  توجد ${count} فئة موجودة بالفعل. هل تريد المتابعة؟`);
      console.log('لإعادة تشغيل الـ script مع حذف البيانات الموجودة، استخدم: npm run reset-forum');
      return;
    }

    // إدراج الفئات الأولية
    for (const category of initialCategories) {
      const categoryId = uuidv4();
      
      await prisma.$executeRaw`
        INSERT INTO forum_categories (
          id, name, name_ar, slug, description, color, icon, display_order, is_active, created_at, updated_at
        ) VALUES (
          ${categoryId}, ${category.name}, ${category.name_ar}, ${category.slug}, 
          ${category.description}, ${category.color}, ${category.icon}, 
          ${category.display_order}, ${category.is_active}, NOW(), NOW()
        )
      `;
      
      console.log(`✅ تم إدراج الفئة: ${category.name_ar}`);
    }

    console.log(`🎉 تم إدراج ${initialCategories.length} فئة بنجاح!`);
    
    // عرض الفئات المُدرجة
    console.log('\n📋 الفئات المُدرجة:');
    const categories = await prisma.$queryRaw`
      SELECT name_ar, slug, color, is_active FROM forum_categories ORDER BY display_order
    `;
    
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name_ar} (${cat.slug}) - ${cat.color}`);
    });

  } catch (error) {
    console.error('❌ خطأ في إدراج فئات المنتدى:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة
if (require.main === module) {
  initializeForumCategories()
    .then(() => {
      console.log('\n✨ تم إعداد فئات المنتدى بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل في إعداد فئات المنتدى:', error);
      process.exit(1);
    });
}

module.exports = { initializeForumCategories }; 