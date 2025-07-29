/**
 * Script لاختبار عرض الصور في بيئة الإنتاج
 */

const fetch = require('node-fetch');

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://sabq.io';
const TEST_URLS = [
  '/', // الصفحة الرئيسية
  '/news', // صفحة الأخبار
  '/categories', // صفحة التصنيفات
];

// ألوان للـ console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function checkImages(url) {
  console.log(`\n${colors.blue}🔍 فحص الصور في: ${url}${colors.reset}`);
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // استخراج جميع روابط الصور
    const imgRegex = /<img[^>]+src="([^"]+)"/g;
    const srcRegex = /src="([^"]+)"/g;
    
    const images = [];
    let match;
    
    // البحث عن img tags
    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }
    
    // البحث عن src attributes في Next/Image
    const nextImageRegex = /<Image[^>]+src="([^"]+)"/g;
    while ((match = nextImageRegex.exec(html)) !== null) {
      images.push(match[1]);
    }
    
    console.log(`📸 عدد الصور المكتشفة: ${images.length}`);
    
    // تصنيف الصور
    const imageTypes = {
      cloudinary: [],
      s3: [],
      local: [],
      external: [],
      invalid: []
    };
    
    images.forEach(img => {
      if (img.includes('res.cloudinary.com')) {
        imageTypes.cloudinary.push(img);
      } else if (img.includes('s3.amazonaws.com')) {
        imageTypes.s3.push(img);
      } else if (img.startsWith('/')) {
        imageTypes.local.push(img);
      } else if (img.startsWith('http')) {
        imageTypes.external.push(img);
      } else {
        imageTypes.invalid.push(img);
      }
    });
    
    // عرض الإحصائيات
    console.log('\n📊 تصنيف الصور:');
    console.log(`  ☁️  Cloudinary: ${imageTypes.cloudinary.length} ${imageTypes.cloudinary.length > 0 ? colors.green + '✓' + colors.reset : ''}`);
    console.log(`  📦 S3: ${imageTypes.s3.length} ${imageTypes.s3.length > 0 ? colors.yellow + '⚠️' + colors.reset : ''}`);
    console.log(`  📁 محلية: ${imageTypes.local.length} ${imageTypes.local.length > 0 ? colors.yellow + '⚠️' + colors.reset : ''}`);
    console.log(`  🌐 خارجية: ${imageTypes.external.length}`);
    console.log(`  ❌ غير صالحة: ${imageTypes.invalid.length} ${imageTypes.invalid.length > 0 ? colors.red + '✗' + colors.reset : ''}`);
    
    // عرض أمثلة من الصور المشكلة
    if (imageTypes.s3.length > 0) {
      console.log('\n⚠️  صور S3 (قد تحتاج تحويل):');
      imageTypes.s3.slice(0, 3).forEach(img => {
        console.log(`  - ${img.substring(0, 80)}...`);
      });
    }
    
    if (imageTypes.local.length > 0) {
      console.log('\n⚠️  صور محلية (قد لا تعمل في الإنتاج):');
      imageTypes.local.slice(0, 3).forEach(img => {
        console.log(`  - ${img}`);
      });
    }
    
    if (imageTypes.invalid.length > 0) {
      console.log('\n❌ صور غير صالحة:');
      imageTypes.invalid.slice(0, 3).forEach(img => {
        console.log(`  - ${img}`);
      });
    }
    
    // اختبار عينة من الصور
    console.log('\n🧪 اختبار عينة من الصور...');
    const samplesToTest = [
      ...imageTypes.cloudinary.slice(0, 2),
      ...imageTypes.s3.slice(0, 1),
      ...imageTypes.local.slice(0, 1)
    ];
    
    for (const img of samplesToTest) {
      const testUrl = img.startsWith('/') ? `${PRODUCTION_URL}${img}` : img;
      try {
        const imgResponse = await fetch(testUrl, { method: 'HEAD' });
        const status = imgResponse.status;
        const contentType = imgResponse.headers.get('content-type');
        
        if (status === 200 && contentType && contentType.startsWith('image/')) {
          console.log(`  ${colors.green}✓${colors.reset} ${img.substring(0, 60)}...`);
        } else {
          console.log(`  ${colors.red}✗${colors.reset} ${img.substring(0, 60)}... (${status})`);
        }
      } catch (error) {
        console.log(`  ${colors.red}✗${colors.reset} ${img.substring(0, 60)}... (خطأ في الاتصال)`);
      }
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ خطأ في فحص ${url}: ${error.message}${colors.reset}`);
  }
}

async function main() {
  console.log(`${colors.blue}🚀 بدء اختبار الصور في الإنتاج${colors.reset}`);
  console.log(`📍 URL الإنتاج: ${PRODUCTION_URL}\n`);
  
  for (const path of TEST_URLS) {
    await checkImages(`${PRODUCTION_URL}${path}`);
    console.log('\n' + '='.repeat(60));
  }
  
  console.log(`\n${colors.green}✅ اكتمل الاختبار${colors.reset}`);
  console.log('\n💡 توصيات:');
  console.log('  1. حول جميع صور S3 والمحلية إلى Cloudinary');
  console.log('  2. تأكد من أن جميع الصور تستخدم HTTPS');
  console.log('  3. استخدم صور placeholder من Cloudinary للصور المفقودة');
}

main().catch(console.error); 