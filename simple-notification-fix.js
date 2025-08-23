const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixNotifications() {
  console.log('🚀 إصلاح نظام الإشعارات...\n');

  try {
    // 1. إحصائيات حالية
    console.log('📊 إحصائيات حالية:');
    const userCount = await prisma.users.count({ where: { status: 'active' } });
    const categoryCount = await prisma.categories.count();
    const interestCount = await prisma.user_interests.count();
    
    console.log('- المستخدمون النشطون:', userCount);
    console.log('- التصنيفات:', categoryCount);
    console.log('- الاهتمامات الموجودة:', interestCount);

    // 2. جلب البيانات
    console.log('\n👥 معالجة المستخدمين والتصنيفات...');
    const users = await prisma.users.findMany({
      where: { status: 'active' },
      select: { id: true, email: true, role: true }
    });

    const categories = await prisma.categories.findMany({
      select: { id: true, name: true }
    });

    console.log('- عدد المستخدمين للمعالجة:', users.length);
    console.log('- عدد التصنيفات:', categories.length);

    // 3. إنشاء اهتمامات للجميع
    console.log('\n🔗 ربط المستخدمين بالتصنيفات...');
    let createdCount = 0;

    for (const user of users) {
      for (const category of categories) {
        const exists = await prisma.user_interests.findUnique({
          where: {
            user_id_category_id: {
              user_id: user.id,
              category_id: category.id
            }
          }
        });

        if (!exists) {
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
          createdCount++;
        }
      }
    }

    console.log('- تم إنشاء', createdCount, 'اهتمام جديد');

    // 4. اختبار النظام
    console.log('\n🧪 اختبار النظام...');
    const testCategory = 'category_local_news';
    const interestedUsers = await prisma.user_interests.findMany({
      where: {
        category_id: testCategory,
        is_active: true
      },
      include: {
        users: { select: { email: true } }
      },
      take: 3
    });

    console.log('- المستخدمون المهتمون بالمحليات:', interestedUsers.length);
    interestedUsers.forEach(interest => {
      console.log('  *', interest.users.email);
    });

    // 5. إنشاء إشعار اختباري
    console.log('\n🔔 إنشاء إشعار اختباري...');
    if (interestedUsers.length > 0) {
      const testUser = interestedUsers[0];
      const notification = await prisma.smartNotifications.create({
        data: {
          user_id: testUser.user_id,
          title: '🎉 تم إصلاح نظام الإشعارات',
          message: 'الإشعارات تعمل الآن بشكل صحيح وستصلك عند نشر أخبار جديدة',
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

      console.log('- تم إنشاء إشعار اختباري:', notification.id);
      console.log('- للمستخدم:', testUser.users.email);
    }

    // 6. إحصائيات نهائية
    console.log('\n📈 النتائج النهائية:');
    const finalStats = await Promise.all([
      prisma.user_interests.count({ where: { is_active: true } }),
      prisma.smartNotifications.count(),
    ]);

    console.log('- إجمالي الاهتمامات:', finalStats[0]);
    console.log('- إجمالي الإشعارات:', finalStats[1]);

    console.log('\n✅ تم إصلاح النظام بنجاح!');
    console.log('\n📝 الخطوات التالية:');
    console.log('1. شغل الخادم: npm run dev');
    console.log('2. انشر مقالاً جديداً');
    console.log('3. تحقق من وصول الإشعارات');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixNotifications();
