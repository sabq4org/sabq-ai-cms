#!/usr/bin/env node

/**
 * الحصول على بيانات للاختبار من قاعدة البيانات
 * يجلب معرفات صحيحة للمستخدمين والتصنيفات لاستخدامها في الاختبارات
 */

const { PrismaClient } = require('@prisma/client');

async function getTestData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 جلب بيانات الاختبار من قاعدة البيانات...');
    
    // جلب مستخدم واحد للاختبار
    const user = await prisma.users.findFirst({
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    // جلب تصنيف واحد للاختبار
    const category = await prisma.categories.findFirst({
      select: {
        id: true,
        name: true,
        slug: true
      },
      where: {
        is_active: true
      }
    });
    
    console.log('📊 بيانات الاختبار:');
    console.log('المستخدم:', user);
    console.log('التصنيف:', category);
    
    if (!user) {
      console.warn('⚠️  لا يوجد مستخدمون في قاعدة البيانات');
    }
    
    if (!category) {
      console.warn('⚠️  لا يوجد تصنيفات في قاعدة البيانات');
    }
    
    return {
      user,
      category,
      hasValidData: !!(user && category)
    };
    
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الاختبار:', error);
    return {
      user: null,
      category: null,
      hasValidData: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  getTestData().then(data => {
    if (data.hasValidData) {
      console.log('\n✅ تم جلب بيانات الاختبار بنجاح');
      console.log('يمكن الآن تشغيل اختبارات إنشاء المقالات');
    } else {
      console.log('\n❌ لا توجد بيانات كافية للاختبار');
      console.log('تأكد من وجود مستخدمين وتصنيفات في قاعدة البيانات');
    }
  }).catch(console.error);
}

module.exports = getTestData;