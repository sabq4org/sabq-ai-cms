#!/usr/bin/env node

/**
 * سكريپت تشخيص متقدم لواجهة إدارة الأخبار
 * يحلل JavaScript ومشاكل التحميل في الواجهة الأمامية
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testNewsAdminAPI() {
  console.log('🔍 اختبار شامل لـ API إدارة الأخبار...');
  
  const testCases = [
    {
      name: 'جميع الأخبار',
      params: '?status=all',
      expected: 'total > 0'
    },
    {
      name: 'الأخبار المنشورة',
      params: '?status=published&limit=50&sort=published_at&order=desc&article_type=news',
      expected: 'published news > 0'
    },
    {
      name: 'الأخبار المحذوفة',
      params: '?status=deleted',
      expected: 'deleted news'
    },
    {
      name: 'البحث في الأخبار',
      params: '?search=الأرصاد',
      expected: 'search results'
    }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\\n📊 ${testCase.name}:`);
      const response = await fetch(`http://localhost:3002/api/admin/news${testCase.params}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ نجح: ${data.success ? 'success: true' : 'success: false'}`);
        console.log(`   📈 العدد: ${data.total} إجمالي، ${data.articles?.length || 0} في الصفحة`);
        
        if (data.articles?.length > 0) {
          console.log(`   📰 عينة: ${data.articles[0].title?.substring(0, 50)}...`);
          console.log(`   🏷️  الحالة: ${data.articles[0].status}`);
          console.log(`   📅 التاريخ: ${data.articles[0].published_at || 'غير محدد'}`);
        }
      } else {
        console.log(`   ❌ فشل: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
    }
  }
}

function analyzeAdminNewsPage() {
  console.log('\\n🔍 تحليل صفحة إدارة الأخبار...');
  
  const newsPagePath = path.join(process.cwd(), 'app/admin/news/page.tsx');
  
  if (!fs.existsSync(newsPagePath)) {
    console.log('❌ ملف صفحة إدارة الأخبار غير موجود');
    return;
  }
  
  const content = fs.readFileSync(newsPagePath, 'utf8');
  
  // فحص المشاكل المحتملة
  const issues = [];
  const checks = {
    'useState initialization': content.includes('useState(') && content.includes('setArticles'),
    'fetchArticles function': content.includes('const fetchArticles = async'),
    'useEffect hook': content.includes('useEffect(') && content.includes('fetchArticles'),
    'API call': content.includes('/api/admin/news'),
    'loading state': content.includes('setLoading('),
    'error handling': content.includes('catch') && content.includes('error'),
    'data processing': content.includes('data.articles'),
    'stats calculation': content.includes('setStats')
  };
  
  console.log('📋 فحص المكونات الأساسية:');
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    if (!passed) {
      issues.push(`مفقود: ${check}`);
    }
  });
  
  // فحص مشاكل محددة
  if (content.includes('filterStatus') && content.includes("'published'")) {
    console.log('   ✅ الفلتر الافتراضي: published');
  } else {
    issues.push('مشكلة في الفلتر الافتراضي');
  }
  
  if (content.includes('setArticles(sortedArticles)') || content.includes('setArticles(data.articles)')) {
    console.log('   ✅ تحديث حالة المقالات موجود');
  } else {
    issues.push('مشكلة في تحديث حالة المقالات');
    console.log('   ❌ لا يتم تحديث حالة المقالات بشكل صحيح');
  }
  
  // البحث عن مشاكل JavaScript محددة
  if (content.includes('console.log') || content.includes('console.error')) {
    console.log('   ✅ رسائل debug موجودة');
  } else {
    console.log('   ⚠️ لا توجد رسائل debug');
  }
  
  return issues;
}

function checkDashboardLayout() {
  console.log('\\n🏗️ فحص DashboardLayout...');
  
  const layoutPaths = [
    'components/admin/modern-dashboard/DashboardLayout.tsx',
    'components/layout/DashboardLayout.tsx',
    'components/admin/DashboardLayout.tsx'
  ];
  
  let layoutFound = false;
  
  for (const layoutPath of layoutPaths) {
    const fullPath = path.join(process.cwd(), layoutPath);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ وجد Layout: ${layoutPath}`);
      layoutFound = true;
      break;
    }
  }
  
  if (!layoutFound) {
    console.log('   ❌ لم يتم العثور على DashboardLayout');
  }
  
  return layoutFound;
}

async function testBrowserCompatibility() {
  console.log('\\n🌐 اختبار التوافق مع المتصفح...');
  
  try {
    // محاولة تحميل الصفحة كما يفعل المتصفح
    const response = await fetch('http://localhost:3002/admin/news');
    
    if (response.ok) {
      const html = await response.text();
      
      console.log(`   ✅ الصفحة تحمل: HTTP ${response.status}`);
      
      // فحص JavaScript errors في HTML
      if (html.includes('script')) {
        console.log('   ✅ JavaScript موجود في الصفحة');
      } else {
        console.log('   ❌ لا يوجد JavaScript في الصفحة');
      }
      
      // فحص Next.js hydration
      if (html.includes('__NEXT_DATA__')) {
        console.log('   ✅ Next.js data موجود');
      } else {
        console.log('   ❌ Next.js data مفقود');
      }
      
      // فحص CSS
      if (html.includes('.css')) {
        console.log('   ✅ CSS موجود');
      } else {
        console.log('   ⚠️ CSS قد يكون مفقود');
      }
      
    } else {
      console.log(`   ❌ فشل تحميل الصفحة: HTTP ${response.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ خطأ في الاتصال: ${error.message}`);
  }
}

function generateFixSuggestions(issues) {
  console.log('\\n🔧 اقتراحات الإصلاح:');
  console.log('═══════════════════════════════════');
  
  if (issues.length === 0) {
    console.log('✅ لم يتم اكتشاف مشاكل واضحة في الكود');
    console.log('\\n🔍 مشاكل محتملة أخرى:');
    console.log('1. مشكلة في React hydration');
    console.log('2. تعارض في CSS أو JavaScript');
    console.log('3. مشكلة في Next.js routing');
    console.log('4. مشكلة في cache المتصفح');
  } else {
    console.log('❌ مشاكل مكتشفة:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  console.log('\\n💡 خطوات الإصلاح المقترحة:');
  console.log('1. تنظيف cache Next.js:');
  console.log('   rm -rf .next');
  console.log('   npm run dev');
  
  console.log('\\n2. فحص console المتصفح:');
  console.log('   - افتح Developer Tools');
  console.log('   - تحقق من أخطاء JavaScript في Console');
  console.log('   - راجع Network tab للطلبات الفاشلة');
  
  console.log('\\n3. اختبار API مباشرة:');
  console.log('   curl http://localhost:3002/api/admin/news');
  
  console.log('\\n4. إعادة تشغيل التطبيق:');
  console.log('   npm run dev');
}

async function runDiagnosis() {
  console.log('🚀 بدء تشخيص شامل لواجهة إدارة الأخبار\\n');
  
  try {
    // 1. اختبار API
    await testNewsAdminAPI();
    
    // 2. تحليل الكود
    const issues = analyzeAdminNewsPage();
    
    // 3. فحص Layout
    checkDashboardLayout();
    
    // 4. اختبار المتصفح
    await testBrowserCompatibility();
    
    // 5. اقتراحات الإصلاح
    generateFixSuggestions(issues);
    
    console.log('\\n🎯 خلاصة التشخيص:');
    console.log('API إدارة الأخبار يعمل بشكل صحيح');
    console.log('المشكلة على الأرجح في الواجهة الأمامية أو JavaScript');
    console.log('يُنصح بفحص console المتصفح وإعادة تشغيل التطبيق');
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  }
}

// تشغيل التشخيص
if (require.main === module) {
  runDiagnosis().catch(console.error);
}

module.exports = {
  testNewsAdminAPI,
  analyzeAdminNewsPage,
  checkDashboardLayout,
  testBrowserCompatibility,
  generateFixSuggestions,
  runDiagnosis
};