/**
 * سكريبت تهجير نقاط الولاء من ملف JSON إلى قاعدة البيانات
 * 
 * يقرأ الملف data/user_loyalty_points.json
 * ويحول كل سجل إلى entries في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function migrateLoyaltyPoints() {
  try {
    console.log('🚀 بدء تهجير نقاط الولاء إلى قاعدة البيانات...');

    // قراءة ملف JSON
    const loyaltyFilePath = path.join(process.cwd(), 'data', 'user_loyalty_points.json');
    
    let loyaltyData;
    try {
      const fileContent = await fs.readFile(loyaltyFilePath, 'utf-8');
      loyaltyData = JSON.parse(fileContent);
    } catch (error) {
      console.error('❌ فشل في قراءة ملف نقاط الولاء:', error);
      return;
    }

    if (!loyaltyData.users || !Array.isArray(loyaltyData.users)) {
      console.log('⚠️ لا توجد بيانات مستخدمين في الملف');
      return;
    }

    console.log(`📊 تم العثور على ${loyaltyData.users.length} مستخدم`);

    let migratedCount = 0;
    let totalPoints = 0;

    for (const user of loyaltyData.users) {
      const { user_id, history = [] } = user;
      
      if (!user_id || user_id === 'anonymous') continue;

      console.log(`\n👤 معالجة المستخدم: ${user_id}`);
      console.log(`📈 عدد السجلات في التاريخ: ${history.length}`);

      // تهجير كل سجل في التاريخ
      for (const record of history) {
        if (!record.points || record.points === 0) continue;

        try {
          await prisma.loyalty_points.create({
            data: {
              id: `${user_id}_${new Date(record.timestamp).getTime()}_${Math.random().toString(36).substr(2, 6)}`,
              user_id: user_id,
              points: record.points,
              action: record.action || 'unknown',
              reference_id: record.article_id || null,
              reference_type: record.article_id ? 'article' : null,
              metadata: {
                description: record.description || `${record.action} action`,
                migrated_from_json: true,
                original_timestamp: record.timestamp
              },
              created_at: new Date(record.timestamp)
            }
          });

          totalPoints += record.points;
          migratedCount++;
        } catch (error) {
          console.error(`❌ خطأ في تهجير سجل للمستخدم ${user_id}:`, error.message);
        }
      }

      // إذا لم تكن هناك سجلات في التاريخ ولكن هناك نقاط إجمالية، أنشئ سجل واحد
      if (history.length === 0 && user.total_points > 0) {
        try {
          await prisma.loyalty_points.create({
            data: {
              id: `${user_id}_initial_${Date.now()}`,
              user_id: user_id,
              points: user.total_points,
              action: 'initial_migration',
              reference_id: null,
              reference_type: null,
              metadata: {
                description: 'نقاط مهاجرة من النظام القديم',
                migrated_from_json: true,
                total_points: user.total_points
              },
              created_at: new Date(user.created_at || new Date())
            }
          });

          totalPoints += user.total_points;
          migratedCount++;
        } catch (error) {
          console.error(`❌ خطأ في تهجير النقاط الإجمالية للمستخدم ${user_id}:`, error.message);
        }
      }
    }

    console.log('\n✅ تم انتهاء التهجير بنجاح!');
    console.log(`📊 الإحصائيات:`);
    console.log(`   - عدد السجلات المهاجرة: ${migratedCount}`);
    console.log(`   - إجمالي النقاط المهاجرة: ${totalPoints}`);
    console.log(`   - عدد المستخدمين: ${loyaltyData.users.length}`);

    // التحقق من صحة التهجير
    const dbPointsCount = await prisma.loyalty_points.count();
    const dbTotalPoints = await prisma.loyalty_points.aggregate({
      _sum: { points: true }
    });

    console.log('\n🔍 التحقق من قاعدة البيانات:');
    console.log(`   - إجمالي السجلات في قاعدة البيانات: ${dbPointsCount}`);
    console.log(`   - إجمالي النقاط في قاعدة البيانات: ${dbTotalPoints._sum.points || 0}`);

  } catch (error) {
    console.error('❌ خطأ عام في التهجير:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التهجير
if (require.main === module) {
  migrateLoyaltyPoints();
}

module.exports = { migrateLoyaltyPoints };
