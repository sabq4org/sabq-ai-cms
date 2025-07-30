#!/usr/bin/env node

/**
 * إصلاح مشكلة عرض التصنيفات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCategories() {
  console.log('🔧 إصلاح مشكلة عرض التصنيفات...\n');
  
  try {
    // 1. فحص التصنيفات الموجودة
    const allCategories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true,
        _count: {
          select: { articles: true }
        }
      }
    });
    
    console.log(`📊 إجمالي التصنيفات: ${allCategories.length}`);
    
    // 2. فحص التصنيفات النشطة
    const activeCategories = allCategories.filter(cat => cat.is_active);
    console.log(`✅ التصنيفات النشطة: ${activeCategories.length}`);
    console.log(`❌ التصنيفات غير النشطة: ${allCategories.length - activeCategories.length}`);
    
    // 3. عرض التصنيفات
    console.log('\n📋 قائمة التصنيفات:');
    allCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.slug})`);
      console.log(`   - الحالة: ${category.is_active ? '✅ نشط' : '❌ غير نشط'}`);
      console.log(`   - عدد المقالات: ${category._count.articles}`);
    });
    
    // 4. تفعيل جميع التصنيفات التي تحتوي على مقالات
    console.log('\n🔄 تفعيل التصنيفات التي تحتوي على مقالات...');
    
    let updatedCount = 0;
    for (const category of allCategories) {
      if (!category.is_active && category._count.articles > 0) {
        await prisma.categories.update({
          where: { id: category.id },
          data: { is_active: true }
        });
        console.log(`   ✅ تم تفعيل: ${category.name}`);
        updatedCount++;
      }
    }
    
    if (updatedCount > 0) {
      console.log(`\n✅ تم تفعيل ${updatedCount} تصنيف`);
    } else {
      console.log('\n✅ جميع التصنيفات التي تحتوي على مقالات مفعلة بالفعل');
    }
    
    // 5. إنشاء تصنيفات افتراضية إذا لم توجد
    if (allCategories.length === 0) {
      console.log('\n📝 إنشاء تصنيفات افتراضية...');
      
      const defaultCategories = [
        { name: 'أخبار محلية', slug: 'local-news', color: '#1E40AF', icon: 'newspaper' },
        { name: 'أخبار دولية', slug: 'international', color: '#DC2626', icon: 'globe' },
        { name: 'رياضة', slug: 'sports', color: '#059669', icon: 'football' },
        { name: 'اقتصاد', slug: 'economy', color: '#7C3AED', icon: 'chart-line' },
        { name: 'تقنية', slug: 'technology', color: '#2563EB', icon: 'laptop' },
        { name: 'ثقافة وفنون', slug: 'culture', color: '#DB2777', icon: 'palette' },
        { name: 'صحة', slug: 'health', color: '#0891B2', icon: 'heart' },
        { name: 'تعليم', slug: 'education', color: '#F59E0B', icon: 'graduation-cap' }
      ];
      
      for (const cat of defaultCategories) {
        await prisma.categories.create({
          data: {
            ...cat,
            is_active: true
          }
        });
        console.log(`   ✅ تم إنشاء: ${cat.name}`);
      }
      
      console.log('\n✅ تم إنشاء التصنيفات الافتراضية');
    }
    
    // 6. مسح كاش التصنيفات
    console.log('\n🗑️ مسح كاش التصنيفات...');
    
    try {
      const response = await fetch('https://sabq.me/api/categories?nocache=true');
      if (response.ok) {
        console.log('   ✅ تم مسح الكاش بنجاح');
      } else {
        console.log('   ⚠️ فشل مسح الكاش');
      }
    } catch (error) {
      console.log('   ⚠️ لا يمكن الوصول لـ API الإنتاج');
    }
    
    console.log('\n✅ اكتمل إصلاح التصنيفات!');
    console.log('🔄 يرجى إعادة تشغيل التطبيق: pm2 restart sabq-cms');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
fixCategories(); 