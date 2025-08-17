/**
 * سكريبت تشخيص وإصلاح نظام نقاط الولاء
 * 
 * يتحقق من:
 * 1. وجود بيانات في قاعدة البيانات
 * 2. صحة الحسابات
 * 3. وظائف API
 * 4. إصلاح المشاكل
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function diagnoseLoyaltySystem() {
  console.log('🔍 بدء تشخيص نظام نقاط الولاء...\n');

  try {
    // 1. فحص قاعدة البيانات
    console.log('📊 فحص قاعدة البيانات:');
    
    const totalRecords = await prisma.loyalty_points.count();
    const totalPointsSum = await prisma.loyalty_points.aggregate({
      _sum: { points: true }
    });
    const uniqueUsers = await prisma.loyalty_points.findMany({
      select: { user_id: true },
      distinct: ['user_id']
    });

    console.log(`   ✓ إجمالي سجلات النقاط: ${totalRecords}`);
    console.log(`   ✓ إجمالي النقاط: ${totalPointsSum._sum.points || 0}`);
    console.log(`   ✓ عدد المستخدمين: ${uniqueUsers.length}\n`);

    // 2. فحص ملف JSON
    console.log('📁 فحص ملف JSON:');
    
    const loyaltyFilePath = path.join(process.cwd(), 'data', 'user_loyalty_points.json');
    let jsonUsers = 0;
    let jsonTotalPoints = 0;
    
    try {
      const fileContent = await fs.readFile(loyaltyFilePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      
      if (jsonData.users) {
        jsonUsers = jsonData.users.length;
        jsonTotalPoints = jsonData.users.reduce((sum, user) => sum + (user.total_points || 0), 0);
      }
      
      console.log(`   ✓ مستخدمين في JSON: ${jsonUsers}`);
      console.log(`   ✓ نقاط في JSON: ${jsonTotalPoints}\n`);
      
    } catch (error) {
      console.log('   ⚠️ ملف JSON غير موجود أو تالف\n');
    }

    // 3. فحص أحدث التفاعلات
    console.log('🔄 آخر التفاعلات:');
    
    const recentPoints = await prisma.loyalty_points.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        user_id: true,
        points: true,
        action: true,
        created_at: true
      }
    });

    if (recentPoints.length > 0) {
      recentPoints.forEach((point, index) => {
        console.log(`   ${index + 1}. المستخدم: ${point.user_id.substring(0, 8)}... | النقاط: ${point.points} | الإجراء: ${point.action} | التاريخ: ${point.created_at.toLocaleString('ar-SA')}`);
      });
    } else {
      console.log('   ⚠️ لا توجد نقاط في قاعدة البيانات');
    }

    console.log('\n');

    // 4. إنشاء تقرير المستخدمين النشطين
    console.log('👥 أكثر المستخدمين نشاطاً:');
    
    const topUsers = await prisma.loyalty_points.groupBy({
      by: ['user_id'],
      _sum: { points: true },
      _count: { user_id: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 5
    });

    if (topUsers.length > 0) {
      topUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. المستخدم: ${user.user_id.substring(0, 8)}... | النقاط: ${user._sum.points} | التفاعلات: ${user._count.user_id}`);
      });
    } else {
      console.log('   ⚠️ لا توجد بيانات مستخدمين');
    }

    console.log('\n');

    // 5. فحص تكامل البيانات
    console.log('🔍 فحص تكامل البيانات:');
    
    const negativePoints = await prisma.loyalty_points.count({
      where: { points: { lt: 0 } }
    });
    
    const emptyActions = await prisma.loyalty_points.count({
      where: { action: '' }
    });

    console.log(`   ✓ سجلات بنقاط سالبة: ${negativePoints}`);
    console.log(`   ✓ سجلات بإجراءات فارغة: ${emptyActions}`);

    // 6. توصيات للإصلاح
    console.log('\n📋 التوصيات:');
    
    if (totalRecords === 0) {
      console.log('   ⚠️ قاعدة البيانات فارغة - يُنصح بتشغيل script تهجير البيانات');
    }
    
    if (jsonUsers > uniqueUsers.length) {
      console.log('   ⚠️ يوجد مستخدمون في JSON غير موجودين في قاعدة البيانات');
    }
    
    if (negativePoints > 0) {
      console.log('   ⚠️ يوجد سجلات بنقاط سالبة - قد تحتاج لتنظيف');
    }

    console.log('\n✅ انتهى التشخيص بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// دالة إصلاح مشاكل النقاط
async function fixLoyaltyIssues() {
  console.log('🔧 بدء إصلاح مشاكل نقاط الولاء...\n');

  try {
    // 1. إزالة السجلات المكررة
    console.log('🧹 تنظيف السجلات المكررة...');
    
    const duplicates = await prisma.$queryRaw`
      SELECT user_id, action, reference_id, DATE(created_at) as date, COUNT(*) as count
      FROM loyalty_points 
      GROUP BY user_id, action, reference_id, DATE(created_at)
      HAVING COUNT(*) > 1
    `;

    console.log(`   العثور على ${duplicates.length} مجموعة مكررة`);

    // 2. إصلاح النقاط السالبة غير المبررة
    console.log('⚖️ إصلاح النقاط السالبة...');
    
    const negativePointsFixed = await prisma.loyalty_points.updateMany({
      where: {
        points: { lt: 0 },
        action: { notIn: ['unlike', 'unsave', 'penalty'] }
      },
      data: { points: 0 }
    });

    console.log(`   تم إصلاح ${negativePointsFixed.count} سجل بنقاط سالبة`);

    // 3. إضافة وصف للإجراءات الفارغة
    console.log('📝 إصلاح الإجراءات الفارغة...');
    
    const emptyActionsFixed = await prisma.loyalty_points.updateMany({
      where: { action: '' },
      data: { action: 'unknown' }
    });

    console.log(`   تم إصلاح ${emptyActionsFixed.count} سجل بإجراء فارغ`);

    console.log('\n✅ تم انتهاء الإصلاح بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الإصلاح:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// دالة إضافة نقاط تجريبية لاختبار النظام
async function addTestPoints(userId = 'test_user', points = 10, action = 'test') {
  console.log(`🧪 إضافة نقاط تجريبية للمستخدم ${userId}...`);

  try {
    const result = await prisma.loyalty_points.create({
      data: {
        id: `test_${userId}_${Date.now()}`,
        user_id: userId,
        points: points,
        action: action,
        reference_id: null,
        reference_type: null,
        metadata: {
          description: 'نقاط تجريبية للاختبار',
          test: true
        },
        created_at: new Date()
      }
    });

    console.log(`✅ تمت إضافة ${points} نقطة للمستخدم ${userId}`);
    return result;

  } catch (error) {
    console.error('❌ خطأ في إضافة النقاط التجريبية:', error);
  }
}

// معالج سطر الأوامر
const command = process.argv[2];

if (require.main === module) {
  switch (command) {
    case 'diagnose':
      diagnoseLoyaltySystem();
      break;
    case 'fix':
      fixLoyaltyIssues();
      break;
    case 'test':
      const userId = process.argv[3] || 'test_user';
      const points = parseInt(process.argv[4]) || 10;
      addTestPoints(userId, points);
      break;
    default:
      console.log('📋 الأوامر المتاحة:');
      console.log('  node scripts/fix-loyalty-system.js diagnose   - تشخيص النظام');
      console.log('  node scripts/fix-loyalty-system.js fix        - إصلاح المشاكل');
      console.log('  node scripts/fix-loyalty-system.js test [user] [points] - إضافة نقاط تجريبية');
      break;
  }
}

module.exports = { diagnoseLoyaltySystem, fixLoyaltyIssues, addTestPoints };
