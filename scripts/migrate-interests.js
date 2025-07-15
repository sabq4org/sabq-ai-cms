const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

// نظام الـ mapping
const INTEREST_TO_CATEGORY_MAPPING = {
  // اهتمامات متطابقة
  'politics': 'politics',
  'economy': 'economy',
  'sports': 'sports',
  'technology': 'technology',
  'tech': 'technology',
  'culture': 'culture',
  
  // اهتمامات تحتاج تحويل
  'health': 'misc',
  'travel': 'misc',
  'entertainment': 'misc',
  'lifestyle': 'misc',
  'food': 'misc',
  'fashion': 'misc',
  
  // تصنيفات فعلية
  'local': 'local',
  'opinion': 'opinion',
  'misc': 'misc',
  
  // اهتمامات بالعربية
  'سياسة': 'politics',
  'اقتصاد': 'economy',
  'رياضة': 'sports',
  'تقنية': 'technology',
  'تكنولوجيا': 'technology',
  'ثقافة': 'culture',
  'صحة': 'misc',
  'سفر': 'misc',
  'ترفيه': 'misc',
  'محليات': 'local',
  'رأي': 'opinion',
  'منوعات': 'misc'
};

function mapInterestToCategory(interest) {
  const mapped = INTEREST_TO_CATEGORY_MAPPING[interest.toLowerCase()];
  return mapped || 'misc';
}

function categorySlugToId(categorySlug) {
  const slugToIdMap = {
    'technology': '1',
    'sports': '2',
    'economy': '3',
    'politics': '4',
    'local': '5',
    'culture': '6',
    'opinion': '7',
    'misc': '8'
  };
  
  return slugToIdMap[categorySlug] || '8';
}

function normalizeUserInterests(interests) {
  const mapped = interests.map(mapInterestToCategory);
  const unique = [...new Set(mapped)];
  return unique.length > 0 ? unique : ['misc'];
}

async function migrateInterests() {
  try {
    console.log('🚀 بدء هجرة الاهتمامات إلى النظام الجديد...\n');

    // جلب جميع تفضيلات المستخدمين مع مفتاح 'interests'
    const userPreferences = await prisma.user_preferences.findMany({
      where: {
        key: 'interests'
      }
    });

    console.log(`📊 تم العثور على ${userPreferences.length} مستخدم لديه اهتمامات\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const preference of userPreferences) {
      try {
        const preferenceData = preference.value || {};
        const currentInterests = preferenceData.interests || [];

        if (!Array.isArray(currentInterests) || currentInterests.length === 0) {
          console.log(`⏭️  تخطي المستخدم ${preference.user_id} - لا توجد اهتمامات`);
          skippedCount++;
          continue;
        }

        // تطبيق نظام الـ mapping
        const normalizedInterests = normalizeUserInterests(currentInterests);
        const finalCategoryIds = normalizedInterests.map(slug => categorySlugToId(slug));

        console.log(`🔄 تحويل اهتمامات المستخدم ${preference.user_id}:`);
        console.log(`   الأصلية: ${currentInterests.join(', ')}`);
        console.log(`   المحولة: ${normalizedInterests.join(', ')}`);
        console.log(`   المعرفات: ${finalCategoryIds.join(', ')}`);

        // تحديث التفضيلات
        const updatedData = {
          ...preferenceData,
          interests: finalCategoryIds,
          originalInterests: currentInterests, // حفظ النسخة الأصلية
          migrated: true,
          migratedAt: new Date().toISOString()
        };

        await prisma.user_preferences.update({
          where: { id: preference.id },
          data: {
            value: updatedData,
            updated_at: new Date()
          }
        });

        console.log(`✅ تم تحديث اهتمامات المستخدم ${preference.user_id}\n`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ خطأ في هجرة اهتمامات المستخدم ${preference.user_id}:`, error);
        skippedCount++;
      }
    }

    console.log('\n🎉 تمت هجرة الاهتمامات بنجاح!');
    console.log(`✅ تم تحديث: ${migratedCount} مستخدم`);
    console.log(`⏭️  تم تخطي: ${skippedCount} مستخدم`);

    // إحصائيات إضافية
    const stats = await getMigrationStats();
    console.log('\n📈 إحصائيات بعد الهجرة:');
    Object.entries(stats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} مستخدم`);
    });

  } catch (error) {
    console.error('❌ خطأ في هجرة الاهتمامات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getMigrationStats() {
  const preferences = await prisma.user_preferences.findMany({
    where: { key: 'interests' }
  });

  const stats = {};
  
  preferences.forEach(pref => {
    const data = pref.value || {};
    const interests = data.interests || [];
    
    interests.forEach(categoryId => {
      const categorySlug = ['technology', 'sports', 'economy', 'politics', 'local', 'culture', 'opinion', 'misc'][parseInt(categoryId) - 1] || 'unknown';
      stats[categorySlug] = (stats[categorySlug] || 0) + 1;
    });
  });

  return stats;
}

// تشغيل الهجرة
migrateInterests(); 