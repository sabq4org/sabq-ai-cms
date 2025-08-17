#!/usr/bin/env node

/**
 * تشخيص سريع لحالة مشروع "سبق الذكية"
 * Quick diagnosis for Sabq AI CMS project status
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔍 تشخيص سريع لمشروع "سبق الذكية"');
console.log('=' .repeat(50));

// التحقق من الملفات الأساسية
function checkFiles() {
  console.log('\n📁 فحص الملفات الأساسية:');
  
  const essentialFiles = [
    'package.json',
    'next.config.js', 
    'prisma/schema.prisma',
    '.env',
    'app/',
    'components/',
    'lib/',
    'arabic_sentiment_system/',
    'smart_notifications_system/',
    'user_tracking_system/'
  ];
  
  essentialFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  });
}

// التحقق من Dependencies
function checkDependencies() {
  console.log('\n📦 فحص Dependencies:');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = Object.keys(packageJson.dependencies || {}).length;
    const devDeps = Object.keys(packageJson.devDependencies || {}).length;
    
    console.log(`  ✅ Dependencies: ${deps}`);
    console.log(`  ✅ Dev Dependencies: ${devDeps}`);
    console.log(`  ✅ إجمالي الحزم: ${deps + devDeps}`);
    
    // فحص حزم مهمة
    const importantPackages = [
      'next', 'react', 'prisma', '@prisma/client', 
      'typescript', 'tailwindcss', '@tanstack/react-query',
      'zustand', 'socket.io-client', 'chart.js'
    ];
    
    console.log('\n  🔍 الحزم المهمة:');
    importantPackages.forEach(pkg => {
      const exists = packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg];
      console.log(`    ${exists ? '✅' : '❌'} ${pkg} ${exists ? `(${exists})` : ''}`);
    });
    
  } catch (error) {
    console.log('  ❌ خطأ في قراءة package.json');
  }
}

// التحقق من قاعدة البيانات
function checkDatabase() {
  console.log('\n🗄️ فحص قاعدة البيانات:');
  
  try {
    if (fs.existsSync('prisma/schema.prisma')) {
      const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
      const modelMatches = schemaContent.match(/model\s+\w+/g);
      const models = modelMatches ? modelMatches.length : 0;
      
      console.log(`  ✅ Prisma Schema موجود`);
      console.log(`  ✅ عدد النماذج: ${models}`);
      
      // فحص نماذج مهمة
      const importantModels = [
        'users', 'articles', 'categories', 'comments', 
        'UserSessions', 'EmailJob', 'analytics'
      ];
      
      console.log('\n  🔍 النماذج المهمة:');
      importantModels.forEach(model => {
        const exists = schemaContent.includes(`model ${model}`);
        console.log(`    ${exists ? '✅' : '❌'} ${model}`);
      });
      
    } else {
      console.log('  ❌ Prisma Schema غير موجود');
    }
  } catch (error) {
    console.log('  ❌ خطأ في قراءة قاعدة البيانات');
  }
}

// التحقق من الأنظمة الذكية
function checkAISystems() {
  console.log('\n🧠 فحص الأنظمة الذكية:');
  
  const aiSystems = [
    {
      name: 'تحليل المشاعر العربية',
      path: 'arabic_sentiment_system',
      files: ['api/sentiment_api.py', 'models/arabic_bert_sentiment.py', 'requirements.txt']
    },
    {
      name: 'الإشعارات الذكية', 
      path: 'smart_notifications_system',
      files: ['engines/notification_engine.py', 'apis/notification_api.py', 'requirements.txt']
    },
    {
      name: 'تتبع المستخدمين',
      path: 'user_tracking_system', 
      files: ['tracking/behavior_tracker.py', 'analytics/user_analytics.py']
    },
    {
      name: 'محرك التوصيات',
      path: 'ml_recommendation_engine',
      files: ['recommendation_engine.py', 'models/collaborative_filter.py']
    }
  ];
  
  aiSystems.forEach(system => {
    console.log(`\n  📊 ${system.name}:`);
    const systemExists = fs.existsSync(system.path);
    console.log(`    ${systemExists ? '✅' : '❌'} المجلد الرئيسي: ${system.path}`);
    
    if (systemExists && system.files) {
      system.files.forEach(file => {
        const filePath = path.join(system.path, file);
        const exists = fs.existsSync(filePath);
        console.log(`    ${exists ? '✅' : '❌'} ${file}`);
      });
    }
  });
}

// التحقق من المكونات الذكية
function checkSmartComponents() {
  console.log('\n⚛️ فحص المكونات الذكية:');
  
  const smartComponents = [
    'components/smart-integration/SmartRecommendations.tsx',
    'components/smart-integration/IntelligentNotifications.tsx', 
    'components/smart-integration/UserProfileDashboard.tsx',
    'components/smart-integration/PersonalizationSettings.tsx',
    'components/smart-integration/AdminControlPanel.tsx',
    'components/smart-integration/AnalyticsDashboard.tsx',
    'components/smart-integration/ContentManagement.tsx',
    'components/smart-integration/RealTimeUpdates.tsx'
  ];
  
  smartComponents.forEach(component => {
    const exists = fs.existsSync(component);
    const name = path.basename(component, '.tsx');
    console.log(`  ${exists ? '✅' : '❌'} ${name}`);
  });
}

// التحقق من متغيرات البيئة
function checkEnvironment() {
  console.log('\n🔧 فحص متغيرات البيئة:');
  
  const envFiles = ['.env', '.env.local', '.env.production'];
  envFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  });
  
  // فحص متغيرات مهمة
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET', 
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  console.log('\n  🔑 المتغيرات المطلوبة:');
  requiredVars.forEach(envVar => {
    const exists = process.env[envVar] !== undefined;
    console.log(`    ${exists ? '✅' : '❌'} ${envVar}`);
  });
}

// فحص إعدادات البناء
function checkBuildConfig() {
  console.log('\n🏗️ فحص إعدادات البناء:');
  
  try {
    // فحص TypeScript config
    if (fs.existsSync('tsconfig.json')) {
      console.log('  ✅ TypeScript config موجود');
    } else {
      console.log('  ❌ TypeScript config مفقود');
    }
    
    // فحص Next.js config
    if (fs.existsSync('next.config.js')) {
      console.log('  ✅ Next.js config موجود');
    } else {
      console.log('  ❌ Next.js config مفقود');
    }
    
    // فحص Tailwind config
    if (fs.existsSync('tailwind.config.js') || fs.existsSync('tailwind.config.ts')) {
      console.log('  ✅ Tailwind config موجود');
    } else {
      console.log('  ❌ Tailwind config مفقود');
    }
    
    // فحص Jest config للاختبارات
    if (fs.existsSync('jest.config.js')) {
      console.log('  ✅ Jest config موجود');
    } else {
      console.log('  ❌ Jest config مفقود');
    }
    
  } catch (error) {
    console.log('  ❌ خطأ في فحص إعدادات البناء');
  }
}

// فحص Docker
function checkDocker() {
  console.log('\n🐳 فحص Docker:');
  
  const dockerFiles = [
    'Dockerfile',
    'docker-compose.yml',
    'arabic_sentiment_system/Dockerfile',
    'smart_notifications_system/Dockerfile'
  ];
  
  dockerFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  });
}

// إحصائيات المشروع
function getProjectStats() {
  console.log('\n📊 إحصائيات المشروع:');
  
  try {
    // عدد الملفات
    const countFiles = (dir, ext = '') => {
      if (!fs.existsSync(dir)) return 0;
      
      let count = 0;
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.') && !item.name.includes('node_modules')) {
          count += countFiles(path.join(dir, item.name), ext);
        } else if (item.isFile() && (ext === '' || item.name.endsWith(ext))) {
          count++;
        }
      }
      return count;
    };
    
    console.log(`  📁 إجمالي الملفات: ${countFiles('.')}`);
    console.log(`  ⚛️ ملفات TypeScript/JS: ${countFiles('.', '.ts') + countFiles('.', '.tsx') + countFiles('.', '.js') + countFiles('.', '.jsx')}`);
    console.log(`  🎨 ملفات CSS: ${countFiles('.', '.css')}`);
    console.log(`  🐍 ملفات Python: ${countFiles('.', '.py')}`);
    console.log(`  📄 ملفات Markdown: ${countFiles('.', '.md')}`);
    
    // حجم المشروع
    const sizeOf = (dir) => {
      if (!fs.existsSync(dir)) return 0;
      
      let size = 0;
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.startsWith('.') && !item.name.includes('node_modules')) {
          size += sizeOf(fullPath);
        } else if (item.isFile()) {
          try {
            size += fs.statSync(fullPath).size;
          } catch (e) {}
        }
      }
      return size;
    };
    
    const totalSize = sizeOf('.');
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`  💾 حجم المشروع: ${sizeMB} MB`);
    
  } catch (error) {
    console.log('  ❌ خطأ في حساب الإحصائيات');
  }
}

// ملخص الحالة
function getSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📋 ملخص الحالة:');
  
  const checks = [
    { name: 'الملفات الأساسية', status: fs.existsSync('package.json') && fs.existsSync('app/') },
    { name: 'قاعدة البيانات', status: fs.existsSync('prisma/schema.prisma') },
    { name: 'الأنظمة الذكية', status: fs.existsSync('arabic_sentiment_system/') },
    { name: 'المكونات التفاعلية', status: fs.existsSync('components/smart-integration/') },
    { name: 'التوثيق', status: fs.existsSync('README.md') && fs.existsSync('docs/') }
  ];
  
  const completedChecks = checks.filter(check => check.status).length;
  const completionPercentage = Math.round((completedChecks / checks.length) * 100);
  
  console.log(`\n🎯 نسبة الإنجاز: ${completionPercentage}% (${completedChecks}/${checks.length})`);
  
  checks.forEach(check => {
    console.log(`  ${check.status ? '✅' : '❌'} ${check.name}`);
  });
  
  console.log('\n🚀 التوصية:');
  if (completionPercentage >= 80) {
    console.log('  ✅ المشروع جاهز تقريباً! يحتاج إصلاحات بسيطة فقط.');
    console.log('  💡 يمكن البدء في التفعيل خلال 2-3 ساعات.');
  } else if (completionPercentage >= 60) {
    console.log('  🔄 المشروع في مرحلة متقدمة لكن يحتاج عمل إضافي.');
    console.log('  💡 قد يحتاج يوم عمل إضافي للتفعيل الكامل.');
  } else {
    console.log('  ⚠️ المشروع يحتاج عمل إضافي كبير.');
    console.log('  💡 يحتاج عدة أيام للتفعيل الكامل.');
  }
}

// تشغيل جميع الفحوصات
function runDiagnosis() {
  try {
    checkFiles();
    checkDependencies();
    checkDatabase();
    checkAISystems();
    checkSmartComponents();
    checkEnvironment();
    checkBuildConfig();
    checkDocker();
    getProjectStats();
    getSummary();
    
    console.log('\n✅ تم إكمال التشخيص بنجاح!');
    console.log('📞 هل تريد البدء في التفعيل؟');
    
  } catch (error) {
    console.error('\n❌ خطأ في التشخيص:', error.message);
  }
}

// تشغيل التشخيص
runDiagnosis();
