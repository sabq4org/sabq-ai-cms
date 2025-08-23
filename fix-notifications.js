const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * مُصحح مشكلة الإشعارات - إضافة مستخدمين مهتمين بالتصنيفات
 */
async function fixNotificationInterests() {
  console.log('🔧 إصلاح مشكلة الإشعارات...\n');

  try {
    // 1. جلب جميع المستخدمين النشطين
    const activeUsers = await prisma.users.findMany({
      where: { status: 'active' },
      select: { id: true, email: true, role: true, interests: true }
    });

    console.log(`👥 عدد المستخدمين النشطين: ${activeUsers.length}`);

    // 2. جلب جميع التصنيفات
    const categories = await prisma.categories.findMany({
      select: { id: true, name: true, slug: true }
    });

    console.log(`📂 عدد التصنيفات: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.id})`);
    });

    // 3. إضافة اهتمامات للمستخدمين
    console.log('\n📝 إضافة اهتمامات للمستخدمين...');

    for (const user of activeUsers) {
      console.log(`\n👤 معالجة المستخدم: ${user.email}`);
      
      // الاهتمامات الحالية
      const currentInterests = user.interests || [];
      console.log(`  الاهتمامات الحالية: ${JSON.stringify(currentInterests)}`);

      // إضافة اهتمامات أساسية للجميع
      const basicInterests = ['محليات', 'أخبار', 'عام'];
      
      // اهتمامات إضافية للمشرفين
      const adminInterests = user.role === 'admin' ? ['تقنية', 'اقتصاد', 'رياضة'] : [];
      
      const newInterests = [...new Set([...currentInterests, ...basicInterests, ...adminInterests])];

      // تحديث اهتمامات المستخدم
      await prisma.users.update({
        where: { id: user.id },
        data: { interests: newInterests }
      });

      console.log(`  ✅ تم تحديث الاهتمامات: ${JSON.stringify(newInterests)}`);

      // إنشاء user_interests صريحة
      for (const category of categories) {
        // تحقق من وجود الاهتمام مسبقاً
        const existingInterest = await prisma.user_interests.findUnique({
          where: {
            user_id_category_id: {
              user_id: user.id,
              category_id: category.id
            }
          }
        });

        if (!existingInterest) {
          // إنشاء اهتمام جديد
          await prisma.user_interests.create({
            data: {
              user_id: user.id,
              category_id: category.id,
              interest_level: user.role === 'admin' ? 'high' : 'medium',
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          console.log(`    ➕ تم ربط التصنيف: ${category.name}`);
        }
      }
    }

    // 4. اختبار البحث عن المستخدمين المهتمين
    console.log('\n🔍 اختبار البحث عن المستخدمين المهتمين...');
    
    const testCategoryId = 'category_local_news';
    
    // البحث المباشر في user_interests
    const directInterests = await prisma.user_interests.findMany({
      where: {
        category_id: testCategoryId,
        is_active: true
      },
      include: {
        users: { select: { email: true } }
      }
    });

    console.log(`📊 المستخدمون المهتمون بـ ${testCategoryId}:`);
    directInterests.forEach(interest => {
      console.log(`  - ${interest.users.email} (${interest.interest_level})`);
    });

    // 5. إنشاء إشعار تجريبي
    console.log('\n🔔 إنشاء إشعار تجريبي...');
    
    if (directInterests.length > 0) {
      const testUser = directInterests[0];
      
      const notification = await prisma.smartNotifications.create({
        data: {
          user_id: testUser.user_id,
          title: '🧪 اختبار الإشعارات بعد الإصلاح',
          message: 'تم إصلاح نظام الإشعارات وهو يعمل الآن بشكل صحيح',
          type: 'article_recommendation',
          priority: 'high',
          category: 'اختبار',
          data: {
            testMode: true,
            fixedAt: new Date().toISOString()
          },
          status: 'sent',
          delivery_channels: ['web'],
          ai_optimized: true,
          created_at: new Date(),
          sent_at: new Date()
        }
      });

      console.log(`✅ تم إنشاء إشعار اختباري: ${notification.id}`);
    }

    // 6. إحصائيات نهائية
    const totalNotifications = await prisma.smartNotifications.count();
    const totalInterests = await prisma.user_interests.count();

    console.log('\n📊 الإحصائيات النهائية:');
    console.log(`  - إجمالي الإشعارات: ${totalNotifications}`);
    console.log(`  - إجمالي الاهتمامات: ${totalInterests}`);
    console.log(`  - المستخدمون النشطون: ${activeUsers.length}`);
    console.log(`  - التصنيفات: ${categories.length}`);

    console.log('\n✅ تم إصلاح نظام الإشعارات بنجاح!');
    console.log('\n💡 الخطوات التالية:');
    console.log('  1. اختبر نشر مقال جديد من الواجهة');
    console.log('  2. تحقق من وصول الإشعارات');
    console.log('  3. راقب logs الخادم للتأكد من عمل المحرك');

  } catch (error) {
    console.error('❌ خطأ في الإصلاح:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
fixNotificationInterests()
  .then(() => {
    console.log('\n🏁 انتهاء عملية الإصلاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 فشل الإصلاح:', error);
    process.exit(1);
  });
