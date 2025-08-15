#!/usr/bin/env node

/**
 * سكريبت بسيط لاستعادة التصنيفات الأساسية
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// التصنيفات الأساسية من initial_categories.sql
const categories = [
  {
    id: 'sports',
    name: 'رياضة',
    slug: 'sports',
    icon: '⚽',
    color: '#10b981',
    description: 'أخبار رياضية شاملة من كرة القدم والرياضات الأخرى',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'technology', 
    name: 'تقنية',
    slug: 'technology',
    icon: '💻',
    color: '#8b5cf6',
    description: 'أحدث أخبار التقنية والابتكار',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'economy',
    name: 'اقتصاد', 
    slug: 'economy',
    icon: '💰',
    color: '#f59e0b',
    description: 'أخبار اقتصادية ومالية محلية ودولية',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'politics',
    name: 'سياسة',
    slug: 'politics', 
    icon: '🏛️',
    color: '#ef4444',
    description: 'أخبار سياسية محلية ودولية',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'health',
    name: 'صحة',
    slug: 'health',
    icon: '🏥', 
    color: '#06b6d4',
    description: 'أخبار طبية ونصائح صحية',
    displayOrder: 5,
    isActive: true
  },
  {
    id: 'culture',
    name: 'ثقافة',
    slug: 'culture',
    icon: '🎭',
    color: '#ec4899', 
    description: 'أخبار ثقافية وفنية',
    displayOrder: 6,
    isActive: true
  },
  {
    id: 'entertainment',
    name: 'ترفيه',
    slug: 'entertainment',
    icon: '🎬',
    color: '#84cc16',
    description: 'أخبار الترفيه والفن', 
    displayOrder: 7,
    isActive: true
  },
  {
    id: 'education',
    name: 'تعليم',
    slug: 'education',
    icon: '📚',
    color: '#3b82f6',
    description: 'أخبار تعليمية وأكاديمية',
    displayOrder: 8,
    isActive: true
  },
  {
    id: 'local',
    name: 'محليات',
    slug: 'local', 
    icon: '🏙️',
    color: '#6366f1',
    description: 'أخبار محلية وحوادث',
    displayOrder: 9,
    isActive: true
  },
  {
    id: 'international',
    name: 'عالمية',
    slug: 'international',
    icon: '🌍',
    color: '#14b8a6',
    description: 'أخبار عالمية ودولية',
    displayOrder: 10,
    isActive: true
  },
  {
    id: 'science', 
    name: 'علوم',
    slug: 'science',
    icon: '🔬',
    color: '#8b5cf6',
    description: 'أخبار علمية وبحثية',
    displayOrder: 11,
    isActive: true
  },
  {
    id: 'environment',
    name: 'بيئة',
    slug: 'environment',
    icon: '🌱',
    color: '#22c55e',
    description: 'أخبار بيئية ومناخية',
    displayOrder: 12,
    isActive: true
  },
  {
    id: 'travel',
    name: 'سفر',
    slug: 'travel',
    icon: '✈️',
    color: '#06b6d4',
    description: 'أخبار السفر والسياحة',
    displayOrder: 13,
    isActive: true
  },
  {
    id: 'automotive',
    name: 'سيارات',
    slug: 'automotive',
    icon: '🚗',
    color: '#dc2626',
    description: 'أخبار السيارات والنقل',
    displayOrder: 14,
    isActive: true
  },
  {
    id: 'general',
    name: 'أخبار عامة',
    slug: 'general',
    icon: '📰',
    color: '#6b7280',
    description: 'أخبار متنوعة وعامة',
    displayOrder: 15,
    isActive: true
  }
];

async function restoreCategories() {
  console.log('🔄 بدء استعادة التصنيفات...');
  console.log('=' .repeat(60));
  
  try {
    await prisma.$connect();
    console.log('✅ متصل بقاعدة البيانات');
    
    // عرض الوضع الحالي
    const currentCount = await prisma.category.count();
    console.log(`📊 التصنيفات الحالية: ${currentCount}`);
    
    let success = 0;
    let updated = 0;
    let errors = 0;
    
    for (const category of categories) {
      try {
        const result = await prisma.category.upsert({
          where: { slug: category.slug },
          update: {
            name: category.name,
            icon: category.icon,
            color: category.color,
            description: category.description,
            displayOrder: category.displayOrder,
            isActive: category.isActive
          },
          create: category
        });
        
        // التحقق من العملية
        const existing = await prisma.category.findUnique({
          where: { slug: category.slug }
        });
        
        if (existing) {
          console.log(`✅ [${success + 1}] ${category.name} (${category.slug}) - ${category.icon}`);
          success++;
        } else {
          updated++;
        }
        
      } catch (error) {
        console.log(`❌ خطأ في ${category.name}: ${error.message}`);
        errors++;
      }
    }
    
    console.log('=' .repeat(60));
    console.log(`📊 النتائج:`);
    console.log(`   ✅ نجح: ${success}`);
    console.log(`   🔄 محدث: ${updated}`);
    console.log(`   ❌ أخطاء: ${errors}`);
    
    // عرض النتيجة النهائية
    const finalCount = await prisma.category.count();
    console.log(`📁 إجمالي التصنيفات الآن: ${finalCount}`);
    
    // عرض قائمة التصنيفات المضافة
    console.log('\n📋 التصنيفات المضافة:');
    const allCategories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    
    allCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.icon} ${cat.name} (${cat.slug})`);
    });
    
    console.log('\n🎉 تمت استعادة التصنيفات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
if (require.main === module) {
  restoreCategories()
    .then(() => {
      console.log('✅ انتهت العملية بنجاح');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشلت العملية:', error);
      process.exit(1);
    });
}

module.exports = { restoreCategories };
