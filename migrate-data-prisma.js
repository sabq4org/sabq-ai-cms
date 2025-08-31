#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// إعدادات قواعد البيانات
const SOURCE_DB = 'postgresql://postgres:AVNS_Br4uKMaWR6wxTIpZ7xj@db.uopckyrdhlvsxnvcobbw.supabase.co:5432/postgres';
const TARGET_DB = 'postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7';

// إنشاء اتصالين منفصلين
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: SOURCE_DB
    }
  }
});

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: TARGET_DB
    }
  }
});

async function migrateData() {
  console.log('🔄 نقل البيانات من Supabase إلى Northflank');
  console.log('='.repeat(60));
  console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-SA')}`);
  console.log('📤 المصدر: Supabase PostgreSQL');
  console.log('📥 الهدف: Northflank PostgreSQL');
  
  try {
    // 1. اختبار الاتصالات
    console.log('\n🔍 اختبار الاتصالات...');
    
    console.log('   📤 اختبار قاعدة البيانات المصدر (Supabase)...');
    await sourcePrisma.$queryRaw`SELECT 1`;
    console.log('   ✅ الاتصال بالمصدر ناجح');
    
    console.log('   📥 اختبار قاعدة البيانات الهدف (Northflank)...');
    await targetPrisma.$queryRaw`SELECT 1`;
    console.log('   ✅ الاتصال بالهدف ناجح');
    
    // 2. إحصائيات قبل النقل
    console.log('\n📊 إحصائيات قبل النقل...');
    
    const sourceStats = {
      users: await sourcePrisma.users.count(),
      articles: await sourcePrisma.articles.count(),
      categories: await sourcePrisma.categories.count(),
      comments: await sourcePrisma.comments.count(),
      interactions: await sourcePrisma.interactions.count()
    };
    
    console.log('   📤 البيانات في المصدر:');
    Object.entries(sourceStats).forEach(([table, count]) => {
      console.log(`      ${table}: ${count} سجل`);
    });
    
    const targetStats = {
      users: await targetPrisma.users.count().catch(() => 0),
      articles: await targetPrisma.articles.count().catch(() => 0),
      categories: await targetPrisma.categories.count().catch(() => 0),
      comments: await targetPrisma.comments.count().catch(() => 0),
      interactions: await targetPrisma.interactions.count().catch(() => 0)
    };
    
    console.log('   📥 البيانات في الهدف:');
    Object.entries(targetStats).forEach(([table, count]) => {
      console.log(`      ${table}: ${count} سجل`);
    });
    
    // 3. نقل البيانات (مرحلة بمرحلة)
    console.log('\n🚀 بدء نقل البيانات...');
    
    // أ) نقل الأدوار أولاً
    console.log('\n1️⃣ نقل الأدوار...');
    const roles = await sourcePrisma.roles.findMany();
    console.log(`   📦 وُجد ${roles.length} دور`);
    
    for (const role of roles) {
      try {
        await targetPrisma.roles.upsert({
          where: { id: role.id },
          update: role,
          create: role
        });
        console.log(`   ✅ تم نقل الدور: ${role.name}`);
      } catch (error) {
        console.log(`   ⚠️ خطأ في نقل الدور ${role.name}: ${error.message}`);
      }
    }
    
    // ب) نقل الفئات
    console.log('\n2️⃣ نقل الفئات...');
    const categories = await sourcePrisma.categories.findMany();
    console.log(`   📦 وُجد ${categories.length} فئة`);
    
    for (const category of categories) {
      try {
        await targetPrisma.categories.upsert({
          where: { id: category.id },
          update: category,
          create: category
        });
        console.log(`   ✅ تم نقل الفئة: ${category.name}`);
      } catch (error) {
        console.log(`   ⚠️ خطأ في نقل الفئة ${category.name}: ${error.message}`);
      }
    }
    
    // ج) نقل المستخدمين
    console.log('\n3️⃣ نقل المستخدمين...');
    const users = await sourcePrisma.users.findMany();
    console.log(`   📦 وُجد ${users.length} مستخدم`);
    
    for (const user of users) {
      try {
        await targetPrisma.users.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
        console.log(`   ✅ تم نقل المستخدم: ${user.email}`);
      } catch (error) {
        console.log(`   ⚠️ خطأ في نقل المستخدم ${user.email}: ${error.message}`);
      }
    }
    
    // د) نقل المقالات
    console.log('\n4️⃣ نقل المقالات...');
    const articles = await sourcePrisma.articles.findMany();
    console.log(`   📦 وُجد ${articles.length} مقال`);
    
    for (const article of articles) {
      try {
        await targetPrisma.articles.upsert({
          where: { id: article.id },
          update: article,
          create: article
        });
        console.log(`   ✅ تم نقل المقال: ${article.title?.substring(0, 50)}...`);
      } catch (error) {
        console.log(`   ⚠️ خطأ في نقل المقال ${article.title?.substring(0, 30)}: ${error.message}`);
      }
    }
    
    // هـ) نقل التعليقات
    console.log('\n5️⃣ نقل التعليقات...');
    const comments = await sourcePrisma.comments.findMany();
    console.log(`   📦 وُجد ${comments.length} تعليق`);
    
    for (const comment of comments) {
      try {
        await targetPrisma.comments.upsert({
          where: { id: comment.id },
          update: comment,
          create: comment
        });
        console.log(`   ✅ تم نقل التعليق من المستخدم: ${comment.user_id}`);
      } catch (error) {
        console.log(`   ⚠️ خطأ في نقل التعليق: ${error.message}`);
      }
    }
    
    // و) نقل التفاعلات
    console.log('\n6️⃣ نقل التفاعلات...');
    const interactions = await sourcePrisma.interactions.findMany();
    console.log(`   📦 وُجد ${interactions.length} تفاعل`);
    
    for (const interaction of interactions) {
      try {
        await targetPrisma.interactions.upsert({
          where: { id: interaction.id },
          update: interaction,
          create: interaction
        });
        console.log(`   ✅ تم نقل التفاعل: ${interaction.type}`);
      } catch (error) {
        console.log(`   ⚠️ خطأ في نقل التفاعل: ${error.message}`);
      }
    }
    
    // 4. إحصائيات بعد النقل
    console.log('\n📊 إحصائيات بعد النقل...');
    
    const finalStats = {
      users: await targetPrisma.users.count(),
      articles: await targetPrisma.articles.count(),
      categories: await targetPrisma.categories.count(),
      comments: await targetPrisma.comments.count(),
      interactions: await targetPrisma.interactions.count()
    };
    
    console.log('   📥 البيانات النهائية في Northflank:');
    Object.entries(finalStats).forEach(([table, count]) => {
      console.log(`      ${table}: ${count} سجل`);
    });
    
    // 5. مقارنة النتائج
    console.log('\n📈 مقارنة النتائج:');
    Object.entries(sourceStats).forEach(([table, sourceCount]) => {
      const targetCount = finalStats[table];
      const status = sourceCount === targetCount ? '✅' : '⚠️';
      console.log(`   ${status} ${table}: ${sourceCount} → ${targetCount}`);
    });
    
    console.log('\n🎉 تم نقل البيانات بنجاح!');
    
    return {
      success: true,
      sourceStats,
      finalStats
    };
    
  } catch (error) {
    console.log(`\n❌ فشل في نقل البيانات: ${error.message}`);
    console.log(`📝 كود الخطأ: ${error.code || 'غير محدد'}`);
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    console.log('\n🔌 تم إنهاء الاتصالات');
  }
}

async function main() {
  console.log('⚠️  هذا سينقل البيانات من Supabase إلى Northflank');
  console.log('📋 تأكد من أن قاعدة البيانات الجديدة جاهزة (Prisma schema مطبق)');
  console.log('');
  
  // إعطاء المستخدم فرصة للإلغاء
  console.log('⏳ سيبدأ النقل خلال 5 ثوانٍ...');
  console.log('💡 اضغط Ctrl+C إذا كنت تريد الإلغاء');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const result = await migrateData();
  
  if (result.success) {
    console.log('\n🚀 النقل مكتمل بنجاح!');
    console.log('\n📝 الخطوات التالية:');
    console.log('1. تحديث DATABASE_URL في .env.local');
    console.log('2. تحديث DATABASE_URL في Amplify environment variables');
    console.log('3. اختبار التطبيق محلياً');
    console.log('4. إعادة نشر التطبيق في Amplify');
    
  } else {
    console.log('\n❌ فشل النقل');
    console.log('تحقق من الأخطاء أعلاه وأعد المحاولة');
  }
}

main().catch(console.error);
