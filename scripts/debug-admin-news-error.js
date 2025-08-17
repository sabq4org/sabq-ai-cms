#!/usr/bin/env node

/**
 * سكريپت تشخيص مشكلة صفحة إدارة الأخبار
 * يحلل API ويبحث عن سبب خطأ W.published
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testAdminNewsAPI() {
  console.log('🔍 اختبار API إدارة الأخبار...');
  
  try {
    // جرب عدة تحليلات مختلفة
    const testConfigs = [
      { status: 'published', description: 'الأخبار المنشورة' },
      { status: 'draft', description: 'المسودات' },
      { status: 'all', description: 'جميع الأخبار' },
    ];
    
    for (const config of testConfigs) {
      console.log(`\\n📊 اختبار: ${config.description}`);
      
      const params = new URLSearchParams({
        status: config.status,
        limit: '5',
        sort: 'published_at',
        order: 'desc',
        article_type: 'news'
      });
      
      const url = `http://localhost:3002/api/admin/news?${params}`;
      console.log(`🌐 الرابط: ${url}`);
      
      try {
        const response = await fetch(url);
        console.log(`📡 حالة الاستجابة: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ النتيجة:`, {
            success: data.success,
            total: data.total,
            articlesCount: data.articles?.length || 0,
            hasArticles: data.articles && data.articles.length > 0
          });
          
          if (data.articles && data.articles.length > 0) {
            const firstArticle = data.articles[0];
            console.log(`📰 عينة من المقال الأول:`, {
              id: firstArticle.id,
              title: firstArticle.title?.substring(0, 50) + '...',
              status: firstArticle.status,
              published_at: firstArticle.published_at,
              hasPublishedField: firstArticle.hasOwnProperty('published'),
              hasPublishedAtField: firstArticle.hasOwnProperty('published_at'),
              allFields: Object.keys(firstArticle)
            });
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ خطأ HTTP:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText.substring(0, 200)
          });
        }
      } catch (fetchError) {
        console.error(`❌ خطأ في الطلب:`, fetchError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام في اختبار API:', error);
  }
}

function checkClientSideCode() {
  console.log('\\n🔍 فحص كود صفحة الإدارة...');
  
  const adminNewsPath = path.join(process.cwd(), 'app/admin/news/page.tsx');
  
  if (!fs.existsSync(adminNewsPath)) {
    console.log('❌ ملف صفحة إدارة الأخبار غير موجود');
    return;
  }
  
  const content = fs.readFileSync(adminNewsPath, 'utf8');
  
  // فحص المشاكل المحتملة
  const issues = [];
  
  // البحث عن استخدام خاطئ لخاصية published
  if (content.includes('.published') && !content.includes('stats.published')) {
    issues.push('استخدام مباشر لخاصية .published (يجب أن تكون published_at أو status)');
  }
  
  // البحث عن تعريفات متغيرات مكسورة
  const brokenVarPattern = /const\s+\[.*?\]\s*=.*?(?:setState|useState).*?{[^}]*$/gm;
  const brokenVars = content.match(brokenVarPattern);
  if (brokenVars) {
    issues.push(`متغيرات state مكسورة: ${brokenVars.length}`);
  }
  
  // البحث عن استدعاءات API مكسورة
  if (content.includes('W.published')) {
    issues.push('مراجع مكسورة إلى W.published - مشكلة في كود JavaScript المصغر');
  }
  
  // البحث عن أخطاء في interface Article
  const articleInterfaceMatch = content.match(/interface Article\s*{([^}]*)}/s);
  if (articleInterfaceMatch) {
    const interfaceContent = articleInterfaceMatch[1];
    if (!interfaceContent.includes('published_at') && !interfaceContent.includes('status')) {
      issues.push('interface Article لا يحتوي على published_at أو status');
    }
  }
  
  console.log(`📋 نتائج الفحص:`);
  if (issues.length === 0) {
    console.log('✅ لم يتم العثور على مشاكل واضحة في الكود');
  } else {
    issues.forEach((issue, index) => {
      console.log(`❌ ${index + 1}. ${issue}`);
    });
  }
  
  // فحص الاستيرادات
  const imports = content.match(/import.*from.*/g) || [];
  console.log(`\\n📦 الاستيرادات (${imports.length}):`, imports.slice(0, 5));
  
  // فحص hooks
  const hooks = content.match(/use[A-Z]\\w+/g) || [];
  console.log(`🪝 Hooks المُستخدمة:`, [...new Set(hooks)]);
}

function checkBuildErrors() {
  console.log('\\n🔨 فحص أخطاء البناء...');
  
  // فحص next.config.js
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    console.log('✅ next.config.js موجود');
  } else {
    console.log('❌ next.config.js مفقود');
  }
  
  // فحص package.json
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    try {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log('✅ package.json صالح');
      console.log(`📦 Dependencies: ${Object.keys(packageContent.dependencies || {}).length}`);
      console.log(`🔧 DevDependencies: ${Object.keys(packageContent.devDependencies || {}).length}`);
    } catch (error) {
      console.log('❌ package.json مكسور:', error.message);
    }
  }
  
  // فحص .next folder
  const nextBuildPath = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextBuildPath)) {
    console.log('✅ مجلد .next موجود (التطبيق مبني)');
  } else {
    console.log('⚠️ مجلد .next غير موجود (التطبيق غير مبني)');
  }
}

async function suggestFixes() {
  console.log('\\n🔧 اقتراحات الإصلاح:');
  console.log('═══════════════════════════════════');
  
  console.log('1. 🧹 تنظيف التخزين المؤقت:');
  console.log('   rm -rf .next node_modules/.cache');
  console.log('   npm install');
  console.log('   npm run dev');
  
  console.log('\\n2. 🔍 فحص كود JavaScript:');
  console.log('   - تأكد من عدم وجود خطأ في تعريف interface Article');
  console.log('   - تحقق من استخدام published_at بدلاً من published');
  console.log('   - راجع استدعاءات API');
  
  console.log('\\n3. 🐛 تشخيص متقدم:');
  console.log('   - افتح Developer Tools في المتصفح');
  console.log('   - ابحث عن خطأ W.published في Console');
  console.log('   - راجع Network tab لطلبات API');
  
  console.log('\\n4. 💾 استعادة نسخة احتياطية:');
  console.log('   - git checkout app/admin/news/page.tsx');
  console.log('   - أو استخدم نسخة احتياطية معروفة');
}

async function runDiagnosis() {
  console.log('🚀 بدء تشخيص شامل لمشكلة صفحة إدارة الأخبار\\n');
  
  // 1. اختبار API
  await testAdminNewsAPI();
  
  // 2. فحص كود العميل
  checkClientSideCode();
  
  // 3. فحص أخطاء البناء
  checkBuildErrors();
  
  // 4. اقتراح إصلاحات
  await suggestFixes();
  
  console.log('\\n🎯 خلاصة التشخيص:');
  console.log('═══════════════════════════════════');
  console.log('❌ المشكلة: TypeError: undefined is not an object (evaluating W.published)');
  console.log('🔍 السبب المحتمل: خطأ في كود JavaScript المصغر أو interface Article');
  console.log('💡 الحل المقترح: تنظيف cache وإعادة بناء التطبيق');
}

// تشغيل التشخيص
if (require.main === module) {
  runDiagnosis().catch(console.error);
}

module.exports = {
  testAdminNewsAPI,
  checkClientSideCode,
  checkBuildErrors,
  suggestFixes,
  runDiagnosis
};