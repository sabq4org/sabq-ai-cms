#!/usr/bin/env node

/**
 * 🔍 تشخيص مشاكل API الجرعات الذكية
 * تحقق من الاتصال بقاعدة البيانات والجداول المطلوبة
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugDosesAPI() {
  console.log('🔍 فحص API الجرعات الذكية...\n');

  try {
    // 1. فحص الاتصال بقاعدة البيانات
    console.log('1️⃣ فحص الاتصال بقاعدة البيانات...');
    await prisma.$connect();
    console.log('✅ الاتصال بقاعدة البيانات ناجح\n');

    // 2. فحص جدول daily_doses
    console.log('2️⃣ فحص جدول daily_doses...');
    try {
      const dosesCount = await prisma.daily_doses.count();
      console.log(`✅ جدول daily_doses موجود، عدد الجرعات: ${dosesCount}\n`);
    } catch (error) {
      console.log('❌ خطأ في جدول daily_doses:', error.message);
      console.log('💡 قد تحتاج إلى تشغيل: npx prisma migrate dev\n');
    }

    // 3. فحص جدول smart_dose_feedback
    console.log('3️⃣ فحص جدول smart_dose_feedback...');
    try {
      const feedbackCount = await prisma.smart_dose_feedback.count();
      console.log(`✅ جدول smart_dose_feedback موجود، عدد التفاعلات: ${feedbackCount}\n`);
    } catch (error) {
      console.log('❌ خطأ في جدول smart_dose_feedback:', error.message);
      console.log('💡 قد تحتاج إلى تشغيل: npx prisma migrate dev\n');
    }

    // 4. فحص جدول articles للمقالات
    console.log('4️⃣ فحص جدول articles...');
    try {
      const articlesCount = await prisma.articles.count({
        where: {
          is_published: true
        }
      });
      console.log(`✅ جدول articles موجود، عدد المقالات المنشورة: ${articlesCount}\n`);
    } catch (error) {
      console.log('❌ خطأ في جدول articles:', error.message, '\n');
    }

    // 5. فحص متغير OPENAI_API_KEY
    console.log('5️⃣ فحص متغير OPENAI_API_KEY...');
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    if (hasOpenAIKey) {
      console.log('✅ متغير OPENAI_API_KEY موجود\n');
    } else {
      console.log('❌ متغير OPENAI_API_KEY غير موجود');
      console.log('💡 تم تعطيل توليد الجرعات بالذكاء الاصطناعي\n');
    }

    // 6. محاولة إنشاء جرعة تجريبية
    console.log('6️⃣ محاولة إنشاء جرعة تجريبية...');
    try {
      const testDose = await prisma.daily_doses.create({
        data: {
          id: `test_dose_${Date.now()}`,
          period: 'morning',
          date: new Date(),
          title: 'جرعة اختبار',
          subtitle: 'هذه جرعة للاختبار فقط',
          topics: ['اختبار'],
          generated_by_ai: false,
          status: 'published',
          is_global: true,
          views: 0,
          interaction_count: 0,
          share_count: 0,
          metadata: { test: true }
        }
      });
      
      console.log('✅ تم إنشاء جرعة تجريبية بنجاح:', testDose.id);
      
      // حذف الجرعة التجريبية
      await prisma.daily_doses.delete({
        where: { id: testDose.id }
      });
      console.log('✅ تم حذف الجرعة التجريبية\n');
      
    } catch (error) {
      console.log('❌ فشل إنشاء جرعة تجريبية:', error.message, '\n');
    }

    console.log('🎯 نتيجة التشخيص:');
    console.log('-------------------');
    if (hasOpenAIKey) {
      console.log('✅ API الجرعات الذكية يجب أن يعمل بشكل طبيعي');
    } else {
      console.log('⚠️  API الجرعات الذكية سيعمل في وضع fallback (بدون AI)');
    }

  } catch (error) {
    console.error('❌ خطأ عام في التشخيص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التشخيص
debugDosesAPI()
  .then(() => {
    console.log('\n🏁 انتهى التشخيص');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ في تشغيل التشخيص:', error);
    process.exit(1);
  });