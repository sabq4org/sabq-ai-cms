#!/usr/bin/env node
/**
 * 🔍 التحقق من تطبيق Migration على قاعدة البيانات
 * 
 * يتحقق من وجود حقل icon_url في جدول categories
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMigration() {
  console.log('🔍 جاري التحقق من تطبيق migration...\n');

  try {
    // محاولة query بسيط
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      AND column_name IN ('icon', 'icon_url')
      ORDER BY column_name;
    `;

    console.log('✅ نتيجة الفحص:\n');
    console.table(result);

    // التحقق من وجود الحقول
    const hasIcon = result.some(r => r.column_name === 'icon');
    const hasIconUrl = result.some(r => r.column_name === 'icon_url');
    const iconLength = result.find(r => r.column_name === 'icon')?.character_maximum_length;
    const iconUrlLength = result.find(r => r.column_name === 'icon_url')?.character_maximum_length;

    console.log('\n📊 التقرير:\n');
    console.log(`✓ حقل 'icon' موجود: ${hasIcon ? '✅ نعم' : '❌ لا'}`);
    console.log(`  - الطول الأقصى: ${iconLength || 'غير معروف'} حرف`);
    console.log(`  - متوقع: 2000 حرف`);
    console.log(`  - الحالة: ${iconLength >= 2000 ? '✅ صحيح' : '⚠️ يحتاج تحديث'}\n`);
    
    console.log(`✓ حقل 'icon_url' موجود: ${hasIconUrl ? '✅ نعم' : '❌ لا'}`);
    if (hasIconUrl) {
      console.log(`  - الطول الأقصى: ${iconUrlLength || 'غير معروف'} حرف`);
      console.log(`  - متوقع: 2000 حرف`);
      console.log(`  - الحالة: ${iconUrlLength >= 2000 ? '✅ صحيح' : '⚠️ يحتاج تحديث'}\n`);
    }

    // الحكم النهائي
    if (hasIcon && hasIconUrl && iconLength >= 2000 && iconUrlLength >= 2000) {
      console.log('\n✅ ✅ ✅ Migration مطبّق بنجاح! ✅ ✅ ✅\n');
      console.log('يمكنك الآن استخدام قسم التصنيفات بدون مشاكل.\n');
      process.exit(0);
    } else if (!hasIconUrl) {
      console.log('\n❌ Migration غير مطبّق!\n');
      console.log('الحل:');
      console.log('1. شغّل: npx prisma migrate deploy');
      console.log('2. أو راجع: RUN_MIGRATION_VERCEL.md\n');
      process.exit(1);
    } else {
      console.log('\n⚠️ Migration مطبّق جزئياً\n');
      console.log('قد تحتاج لتطبيق التحديثات يدوياً.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ خطأ في الفحص:', error.message);
    console.error('\nالسبب المحتمل:');
    console.error('- قاعدة البيانات غير متصلة');
    console.error('- مشكلة في DATABASE_URL');
    console.error('- الصلاحيات غير كافية\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigration();
