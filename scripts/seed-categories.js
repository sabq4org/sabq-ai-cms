const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

const categories = [
  {
    name: 'تقنية',
    nameEn: 'Technology',
    slug: 'technology',
    description: 'أخبار وتطورات التقنية والذكاء الاصطناعي',
    color: '#8B5CF6',
    icon: '💻',
    displayOrder: 1,
    isActive: true
  },
  {
    name: 'رياضة',
    nameEn: 'Sports',
    slug: 'sports',
    description: 'أخبار رياضية محلية وعالمية',
    color: '#F59E0B',
    icon: '⚽',
    displayOrder: 2,
    isActive: true
  },
  {
    name: 'اقتصاد',
    nameEn: 'Economy',
    slug: 'economy',
    description: 'تقارير السوق والمال والأعمال والطاقة',
    color: '#10B981',
    icon: '💰',
    displayOrder: 3,
    isActive: true
  },
  {
    name: 'سياسة',
    nameEn: 'Politics',
    slug: 'politics',
    description: 'مستجدات السياسة المحلية والدولية وتحليلاتها',
    color: '#EF4444',
    icon: '🏛️',
    displayOrder: 4,
    isActive: true
  },
  {
    name: 'محليات',
    nameEn: 'Local',
    slug: 'local',
    description: 'أخبار المناطق والمدن السعودية',
    color: '#3B82F6',
    icon: '🗺️',
    displayOrder: 5,
    isActive: true
  },
  {
    name: 'ثقافة ومجتمع',
    nameEn: 'Culture',
    slug: 'culture',
    description: 'فعاليات ثقافية، مناسبات، قضايا اجتماعية',
    color: '#EC4899',
    icon: '🎭',
    displayOrder: 6,
    isActive: true
  },
  {
    name: 'مقالات رأي',
    nameEn: 'Opinion',
    slug: 'opinion',
    description: 'تحليلات ووجهات نظر كتاب الرأي',
    color: '#7C3AED',
    icon: '✍️',
    displayOrder: 7,
    isActive: true
  },
  {
    name: 'منوعات',
    nameEn: 'Misc',
    slug: 'misc',
    description: 'أخبار خفيفة، لقطات، طرائف وأحداث غير تقليدية',
    color: '#6B7280',
    icon: '🎉',
    displayOrder: 8,
    isActive: true
  }
];

async function seedCategories() {
  console.log('🌱 بدء إضافة التصنيفات...');
  
  try {
    for (const category of categories) {
      // التحقق من وجود التصنيف
      const existingCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: category.slug },
            { name: category.name }
          ]
        }
      });

      if (existingCategory) {
        // تحديث التصنيف الموجود
        const updated = await prisma.category.update({
          where: { id: existingCategory.id },
          data: category
        });
        console.log(`✅ تم تحديث التصنيف: ${category.name}`);
      } else {
        // إنشاء تصنيف جديد
        const created = await prisma.category.create({
          data: category
        });
        console.log(`✅ تم إنشاء التصنيف: ${category.name}`);
      }
    }

    // عرض جميع التصنيفات
    const allCategories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    
    console.log('\n📋 جميع التصنيفات:');
    console.log('─'.repeat(80));
    allCategories.forEach(cat => {
      console.log(`${cat.displayOrder}. ${cat.icon || '📁'} ${cat.name} (${cat.nameEn || 'N/A'}) - ${cat.isActive ? '✅ نشط' : '❌ غير نشط'}`);
      console.log(`   اللون: ${cat.color || 'N/A'} | Slug: ${cat.slug}`);
      if (cat.description) {
        console.log(`   الوصف: ${cat.description}`);
      }
      console.log('─'.repeat(80));
    });

    console.log('\n✨ تمت إضافة التصنيفات بنجاح!');
    console.log(`📊 إجمالي التصنيفات: ${allCategories.length}`);
    console.log(`✅ التصنيفات النشطة: ${allCategories.filter(c => c.isActive).length}`);
    console.log(`❌ التصنيفات غير النشطة: ${allCategories.filter(c => !c.isActive).length}`);
  } catch (error) {
    console.error('❌ خطأ في إضافة التصنيفات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories(); 