/**
 * أداة إصلاح وفحص خدمة الصور
 * تتحقق من وصول الصور وإصلاح مشاكل الروابط
 */
const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testImageService() {
  console.log('\n🔍 جاري اختبار خدمة الصور...\n');
  
  // اختبار API الصور
  try {
    const testUrl = 'https://res.cloudinary.com/sabq/image/upload/v1707301234/test.jpg';
    const apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/images/optimize?url=${encodeURIComponent(testUrl)}&w=400&h=300`;
    
    console.log(`🌐 اختبار API الصور: ${apiUrl}`);
    
    const response = await fetch(apiUrl, { method: 'HEAD' });
    console.log(`✅ استجابة API: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    console.log(`📋 نوع المحتوى: ${contentType}`);
  } catch (error) {
    console.error('❌ خطأ في API الصور:', error.message);
  }
  
  console.log('\n🔍 جاري فحص صور المقالات...\n');
  
  try {
    // الحصول على عينة من المقالات مع روابط صور
    const articles = await prisma.articles.findMany({
      where: {
        featured_image: {
          not: null,
          not: ''
        }
      },
      select: {
        id: true,
        title: true,
        featured_image: true
      },
      take: 5
    });
    
    if (articles.length === 0) {
      console.log('❓ لم يتم العثور على مقالات بصور');
      return;
    }
    
    console.log(`📊 تم العثور على ${articles.length} مقالات للاختبار\n`);
    
    for (const article of articles) {
      console.log(`🔹 مقال: ${article.title}`);
      console.log(`🔗 رابط الصورة: ${article.featured_image}`);
      
      try {
        const response = await fetch(article.featured_image, { method: 'HEAD' });
        console.log(`✅ الوصول: ${response.ok ? 'متاح' : 'غير متاح'} (${response.status})\n`);
      } catch (error) {
        console.log(`❌ خطأ: ${error.message}\n`);
      }
    }
  } catch (dbError) {
    console.error('❌ خطأ في قاعدة البيانات:', dbError.message);
  }
  
  console.log('\n🔍 جاري فحص صور التصنيفات...\n');
  
  try {
    // الحصول على التصنيفات مع صور الغلاف
    const categories = await prisma.categories.findMany({
      where: {
        OR: [
          {
            cover_image: {
              not: null,
              not: ''
            }
          },
          {
            metadata: {
              path: ['cover_image'],
              not: null
            }
          }
        ]
      },
      take: 5
    });
    
    if (categories.length === 0) {
      console.log('❓ لم يتم العثور على تصنيفات بصور');
      return;
    }
    
    console.log(`📊 تم العثور على ${categories.length} تصنيفات للاختبار\n`);
    
    for (const category of categories) {
      const coverImage = category.cover_image || 
                        (category.metadata && typeof category.metadata === 'object' && 
                        'cover_image' in category.metadata ? 
                        category.metadata.cover_image : null);
                        
      if (!coverImage) continue;
      
      console.log(`🔹 تصنيف: ${category.name}`);
      console.log(`🔗 رابط الصورة: ${coverImage}`);
      
      try {
        const response = await fetch(coverImage, { method: 'HEAD' });
        console.log(`✅ الوصول: ${response.ok ? 'متاح' : 'غير متاح'} (${response.status})\n`);
      } catch (error) {
        console.log(`❌ خطأ: ${error.message}\n`);
      }
    }
  } catch (dbError) {
    console.error('❌ خطأ في قاعدة البيانات:', dbError.message);
  }
  
  console.log('\n🔍 جاري فحص صور التحليل العميق...\n');
  
  try {
    // الحصول على تحليلات عميقة مع صور
    const analyses = await prisma.deep_analysis.findMany({
      where: {
        featured_image: {
          not: null,
          not: ''
        }
      },
      select: {
        id: true,
        title: true,
        featured_image: true
      },
      take: 5
    });
    
    if (analyses.length === 0) {
      console.log('❓ لم يتم العثور على تحليلات عميقة بصور');
      return;
    }
    
    console.log(`📊 تم العثور على ${analyses.length} تحليلات للاختبار\n`);
    
    for (const analysis of analyses) {
      console.log(`🔹 تحليل: ${analysis.title}`);
      console.log(`🔗 رابط الصورة: ${analysis.featured_image}`);
      
      try {
        const response = await fetch(analysis.featured_image, { method: 'HEAD' });
        console.log(`✅ الوصول: ${response.ok ? 'متاح' : 'غير متاح'} (${response.status})\n`);
      } catch (error) {
        console.log(`❌ خطأ: ${error.message}\n`);
      }
    }
  } catch (dbError) {
    console.error('❌ خطأ في قاعدة البيانات:', dbError.message);
  }
  
  await prisma.$disconnect();
}

testImageService()
  .catch(error => {
    console.error('❌ خطأ عام:', error);
    process.exit(1);
  });
