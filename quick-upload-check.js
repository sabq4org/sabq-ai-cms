#!/usr/bin/env node

/**
 * 🔍 أداة فحص سريعة لحالة APIs الرفع
 * للاستخدام السريع لتشخيص المشاكل
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 فحص سريع لحالة APIs رفع الصور...\n');

// 1. فحص ملفات API
const apiFiles = [
  'app/api/upload-image-safe/route.ts',
  'app/api/upload/route.ts', 
  'app/api/upload-image/route.ts'
];

console.log('📁 فحص ملفات API:');
apiFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${file}: ${exists ? '✅ موجود' : '❌ مفقود'}`);
  
  if (exists) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasErrorHandling = content.includes('catch') && content.includes('error');
    const hasCloudinary = content.includes('cloudinary') || content.includes('CLOUDINARY');
    console.log(`     - معالجة الأخطاء: ${hasErrorHandling ? '✅' : '❌'}`);
    console.log(`     - تكامل Cloudinary: ${hasCloudinary ? '✅' : '❌'}`);
  }
});

// 2. فحص متغيرات البيئة  
console.log('\n🔧 فحص متغيرات البيئة:');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const cloudinaryVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  cloudinaryVars.forEach(varName => {
    const hasVar = envContent.includes(varName);
    const isEmpty = envContent.includes(`${varName}=`) && 
                   envContent.split(`${varName}=`)[1]?.split('\n')[0]?.trim() === '';
    
    console.log(`   ${varName}: ${hasVar ? (isEmpty ? '⚠️ فارغ' : '✅ موجود') : '❌ مفقود'}`);
  });
} else {
  console.log('   ❌ ملف .env غير موجود');
}

// 3. فحص مجلدات الرفع
console.log('\n📂 فحص مجلدات الرفع:');
const publicUploads = path.join(process.cwd(), 'public', 'uploads');
const uploadsExists = fs.existsSync(publicUploads);
console.log(`   public/uploads: ${uploadsExists ? '✅ موجود' : '❌ مفقود'}`);

if (uploadsExists) {
  const subDirs = ['general', 'articles', 'featured', 'avatar', 'authors'];
  subDirs.forEach(dir => {
    const dirPath = path.join(publicUploads, dir);
    const exists = fs.existsSync(dirPath);
    console.log(`     ${dir}: ${exists ? '✅' : '❌'}`);
  });
}

// 4. فحص package.json للتبعيات المطلوبة
console.log('\n📦 فحص التبعيات:');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const allDeps = { 
    ...packageContent.dependencies, 
    ...packageContent.devDependencies 
  };
  
  const requiredDeps = ['cloudinary', 'formidable', 'multer'];
  requiredDeps.forEach(dep => {
    const hasDepression = allDeps[dep] !== undefined;
    console.log(`   ${dep}: ${hasDepression ? '✅ ' + allDeps[dep] : '❌ مفقود'}`);
  });
} else {
  console.log('   ❌ package.json غير موجود');
}

// 5. التوصيات السريعة
console.log('\n💡 التوصيات السريعة:');
console.log('   1. تأكد من تشغيل الخادم المحلي على localhost:3000');
console.log('   2. افحص متغيرات Cloudinary في .env');
console.log('   3. تأكد من وجود مجلدات الرفع في public/uploads');
console.log('   4. راجع console logs في المتصفح للأخطاء التفصيلية');
console.log('   5. استخدم Network tab في Developer Tools لمراقبة requests');

console.log('\n🚀 للتشخيص الشامل، شغل: node debug-upload-apis.js');

// 6. إنشاء ملف تشخيص سريع
const quickReport = {
  timestamp: new Date().toISOString(),
  apiFiles: apiFiles.map(file => ({
    path: file,
    exists: fs.existsSync(path.join(process.cwd(), file))
  })),
  envExists: fs.existsSync(envPath),
  uploadsExists,
  recommendations: [
    'تحقق من تشغيل الخادم المحلي',
    'راجع متغيرات Cloudinary',
    'تأكد من وجود مجلدات الرفع',
    'افحص browser console للأخطاء'
  ]
};

fs.writeFileSync('upload-quick-check.json', JSON.stringify(quickReport, null, 2));
console.log('\n📋 تم حفظ التقرير السريع: upload-quick-check.json');
