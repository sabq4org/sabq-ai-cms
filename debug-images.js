#!/usr/bin/env node

/**
 * أداة تشخيص شاملة لمشكلة عدم ظهور الصور في الأخبار المميزة
 * Comprehensive Image Debug Tool for Featured News Display Issues
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('🔍 بدء تشخيص مشكلة الصور في الأخبار المميزة...\n');

// فحص متغيرات البيئة
function checkEnvironmentVariables() {
  console.log('📋 فحص متغيرات البيئة:');
  console.log('='.repeat(50));
  
  const envFile = path.join(__dirname, '.env');
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    // البحث عن متغيرات Cloudinary
    const cloudinaryVars = envContent.split('\n').filter(line => 
      line.includes('CLOUDINARY') && !line.startsWith('#')
    );
    
    if (cloudinaryVars.length > 0) {
      console.log('✅ متغيرات Cloudinary موجودة:');
      cloudinaryVars.forEach(variable => {
        const [key, value] = variable.split('=');
        console.log(`   ${key}: ${value ? '✓ محدد' : '❌ فارغ'}`);
      });
    } else {
      console.log('❌ لا توجد متغيرات Cloudinary');
    }
    
    // فحص NEXT_PUBLIC متغيرات
    const publicVars = envContent.split('\n').filter(line => 
      line.includes('NEXT_PUBLIC') && !line.startsWith('#')
    );
    
    if (publicVars.length > 0) {
      console.log('\n🌐 متغيرات عامة:');
      publicVars.forEach(variable => {
        const [key, value] = variable.split('=');
        console.log(`   ${key}: ${value ? '✓ محدد' : '❌ فارغ'}`);
      });
    }
  } else {
    console.log('❌ ملف .env غير موجود');
  }
  
  console.log('\n');
}

// فحص next.config.js
function checkNextConfig() {
  console.log('⚙️ فحص إعدادات Next.js:');
  console.log('='.repeat(50));
  
  const configFile = path.join(__dirname, 'next.config.js');
  if (fs.existsSync(configFile)) {
    const configContent = fs.readFileSync(configFile, 'utf8');
    
    // فحص remotePatterns
    if (configContent.includes('remotePatterns')) {
      console.log('✅ remotePatterns موجود في next.config.js');
      
      // فحص Cloudinary domain
      if (configContent.includes('res.cloudinary.com')) {
        console.log('✅ Cloudinary domain مضاف');
      } else {
        console.log('❌ Cloudinary domain غير مضاف');
      }
      
      // فحص S3 domains
      if (configContent.includes('s3.amazonaws.com')) {
        console.log('✅ S3 domains مضافة');
      } else {
        console.log('❌ S3 domains غير مضافة');
      }
      
    } else {
      console.log('❌ remotePatterns غير موجود في next.config.js');
    }
  } else {
    console.log('❌ next.config.js غير موجود');
  }
  
  console.log('\n');
}

// فحص مكونات الصور
function checkImageComponents() {
  console.log('🖼️ فحص مكونات الصور:');
  console.log('='.repeat(50));
  
  const componentsToCheck = [
    'components/ui/OptimizedImage.tsx',
    'components/ui/CloudImage.tsx',
    'components/ui/SmartImage.tsx',
    'components/FeaturedNewsBlock.tsx',
    'components/FeaturedNewsCarousel.tsx'
  ];
  
  componentsToCheck.forEach(component => {
    const filePath = path.join(__dirname, component);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${component} موجود`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // فحص Image import
      if (content.includes('next/image')) {
        console.log(`   ✓ يستخدم Next.js Image`);
      } else {
        console.log(`   ❌ لا يستخدم Next.js Image`);
      }
      
      // فحص error handling
      if (content.includes('onError') || content.includes('handleError')) {
        console.log(`   ✓ يحتوي على معالجة الأخطاء`);
      } else {
        console.log(`   ⚠️ لا يحتوي على معالجة الأخطاء`);
      }
      
    } else {
      console.log(`❌ ${component} غير موجود`);
    }
  });
  
  console.log('\n');
}

// فحص image-utils
function checkImageUtils() {
  console.log('🛠️ فحص image-utils:');
  console.log('='.repeat(50));
  
  const utilsFile = path.join(__dirname, 'lib/image-utils.ts');
  if (fs.existsSync(utilsFile)) {
    console.log('✅ lib/image-utils.ts موجود');
    
    const content = fs.readFileSync(utilsFile, 'utf8');
    
    // فحص getImageUrl function
    if (content.includes('export function getImageUrl')) {
      console.log('   ✓ دالة getImageUrl موجودة');
    } else {
      console.log('   ❌ دالة getImageUrl غير موجودة');
    }
    
    // فحص FALLBACK_IMAGES
    if (content.includes('FALLBACK_IMAGES')) {
      console.log('   ✓ صور احتياطية موجودة');
    } else {
      console.log('   ❌ صور احتياطية غير موجودة');
    }
    
    // فحص Cloudinary URL
    if (content.includes('cloudinary.com')) {
      console.log('   ✓ معالجة Cloudinary موجودة');
    } else {
      console.log('   ❌ معالجة Cloudinary غير موجودة');
    }
    
  } else {
    console.log('❌ lib/image-utils.ts غير موجود');
  }
  
  console.log('\n');
}

// فحص API endpoints
function checkAPIEndpoints() {
  console.log('🌐 فحص API endpoints:');
  console.log('='.repeat(50));
  
  const apiFiles = [
    'app/api/featured-news/route.ts',
    'pages/api/featured-news.ts'
  ];
  
  let foundAPI = false;
  
  apiFiles.forEach(apiFile => {
    const filePath = path.join(__dirname, apiFile);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${apiFile} موجود`);
      foundAPI = true;
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // فحص featured_image field
      if (content.includes('featured_image')) {
        console.log('   ✓ يستخدم featured_image field');
      } else {
        console.log('   ⚠️ لا يحتوي على featured_image field');
      }
      
    }
  });
  
  if (!foundAPI) {
    console.log('❌ لا توجد API endpoints للأخبار المميزة');
  }
  
  console.log('\n');
}

// فحص ملفات CSS
function checkCSS() {
  console.log('🎨 فحص ملفات CSS:');
  console.log('='.repeat(50));
  
  const cssFiles = [
    'styles/featured-news-carousel-fixes.css',
    'styles/globals.css',
    'app/globals.css'
  ];
  
  cssFiles.forEach(cssFile => {
    const filePath = path.join(__dirname, cssFile);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${cssFile} موجود`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // فحص image opacity rules
      if (content.includes('opacity') && content.includes('img')) {
        console.log('   ⚠️ يحتوي على قواعد opacity للصور');
      }
      
      // فحص display rules
      if (content.includes('display: none') || content.includes('visibility: hidden')) {
        console.log('   ⚠️ يحتوي على قواعد إخفاء محتملة');
      }
      
    } else {
      console.log(`❌ ${cssFile} غير موجود`);
    }
  });
  
  console.log('\n');
}

// اختبار URL
function testImageURL(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      const isImage = res.headers['content-type'] && res.headers['content-type'].startsWith('image/');
      resolve({
        status: res.statusCode,
        contentType: res.headers['content-type'],
        isImage: isImage,
        success: res.statusCode === 200 && isImage
      });
    });
    
    req.on('error', () => {
      resolve({ success: false, error: true });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, timeout: true });
    });
  });
}

// اختبار صور تجريبية
async function testSampleImages() {
  console.log('🧪 اختبار صور تجريبية:');
  console.log('='.repeat(50));
  
  const testImages = [
    'https://res.cloudinary.com/dybhezmvb/image/upload/v1/test.jpg',
    'https://ui-avatars.com/api/?name=Test&background=0D8ABC&color=fff&size=800',
    'https://via.placeholder.com/800x600/0D8ABC/FFFFFF?text=Test'
  ];
  
  for (const imageUrl of testImages) {
    console.log(`\n🔗 اختبار: ${imageUrl}`);
    try {
      const result = await testImageURL(imageUrl);
      
      if (result.success) {
        console.log('   ✅ الصورة تعمل بشكل صحيح');
      } else if (result.timeout) {
        console.log('   ⏰ انتهت مهلة الاتصال');
      } else if (result.error) {
        console.log('   ❌ خطأ في الاتصال');
      } else {
        console.log(`   ❌ فشل: ${result.status} - ${result.contentType}`);
      }
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
    }
  }
  
  console.log('\n');
}

// تشغيل الفحوصات
async function runDiagnostics() {
  console.log('🚀 تشخيص شامل لمشكلة الصور\n');
  
  checkEnvironmentVariables();
  checkNextConfig();
  checkImageComponents();
  checkImageUtils();
  checkAPIEndpoints();
  checkCSS();
  
  await testSampleImages();
  
  console.log('📝 ملخص التوصيات:');
  console.log('='.repeat(50));
  console.log('1. تأكد من أن متغيرات NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME محددة');
  console.log('2. تحقق من console.log في المتصفح لرؤية أخطاء تحميل الصور');
  console.log('3. تأكد من أن الصور موجودة فعلاً في Cloudinary');
  console.log('4. فحص Network tab في Developer Tools');
  console.log('5. تأكد من أن CSS لا يخفي الصور');
  console.log('\n✅ انتهى التشخيص');
}

// تشغيل الأداة
runDiagnostics().catch(console.error);
