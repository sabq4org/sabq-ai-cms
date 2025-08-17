#!/usr/bin/env node

/**
 * سكريپت إصلاح واجهة إدارة الأخبار
 * يضيف معالجة محسنة للأخطاء وdebugging
 */

const fs = require('fs');
const path = require('path');

function enhanceAdminNewsPage() {
  console.log('🔧 تحسين صفحة إدارة الأخبار...');
  
  const filePath = path.join(process.cwd(), 'app/admin/news/page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ ملف صفحة إدارة الأخبار غير موجود');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // إضافة logging محسن في بداية fetchArticles
  const originalFetchPattern = /const fetchArticles = async \(\) => \{[\s\S]*?setLoading\(true\);/;
  const enhancedFetchStart = `const fetchArticles = async () => {
    setLoading(true);
    console.log('🚀 بدء جلب الأخبار...', {
      filterStatus,
      selectedCategory,
      timestamp: new Date().toISOString()
    });`;
  
  if (content.match(originalFetchPattern)) {
    content = content.replace(originalFetchPattern, enhancedFetchStart);
    modified = true;
    console.log('✅ تم تحسين logging في fetchArticles');
  }
  
  // إضافة معالجة محسنة للبيانات
  const dataProcessingPattern = /if \(data\.articles\) \{[\s\S]*?setArticles\(sortedArticles\);/;
  const enhancedDataProcessing = `if (data.articles) {
        console.log('📦 معالجة البيانات...', {
          total: data.total,
          articlesReceived: data.articles.length,
          firstArticleTitle: data.articles[0]?.title?.substring(0, 50)
        });
        
        // تنظيف البيانات وإضافة معالجة آمنة
        const cleanArticles = data.articles.map((article: any) => ({
          ...article,
          published_at: article.published_at || article.created_at,
          status: article.status || 'draft'
        })).filter((article: any) => {
          const title = article.title?.toLowerCase() || '';
          const isTestArticle = title.includes('test') || 
                                title.includes('تجربة') || 
                                title.includes('demo') ||
                                title.includes('example');
          
          return !isTestArticle && article.status !== 'scheduled';
        });
        
        // ترتيب الأخبار حسب التاريخ (الأحدث أولاً) مع حماية من undefined
        const sortedArticles = cleanArticles.sort((a: any, b: any) => {
          if (!a || !b) return 0;
          
          const dateA = new Date(a.published_at || a.created_at || 0).getTime();
          const dateB = new Date(b.published_at || b.created_at || 0).getTime();
          
          // التحقق من صحة التواريخ
          if (isNaN(dateA) || isNaN(dateB)) {
            console.warn('⚠️ تاريخ غير صالح في المقال:', { a: a.id, b: b.id });
            return 0;
          }
          
          return dateB - dateA;
        });
        
        console.log('✅ تم معالجة البيانات بنجاح:', {
          originalCount: data.articles.length,
          filteredCount: cleanArticles.length,
          finalCount: sortedArticles.length,
          status: filterStatus
        });
        
        setArticles(sortedArticles);`;
  
  if (content.match(dataProcessingPattern)) {
    content = content.replace(dataProcessingPattern, enhancedDataProcessing);
    modified = true;
    console.log('✅ تم تحسين معالجة البيانات');
  }
  
  // إضافة معالجة محسنة للأخطاء
  const errorHandlingPattern = /} catch \(error\) \{[\s\S]*?toast\.error\('حدث خطأ في جلب الأخبار'\);[\s\S]*?\}/;
  const enhancedErrorHandling = `} catch (error) {
      console.error('❌ خطأ مفصل في جلب الأخبار:', {
        error: error.message,
        filterStatus,
        selectedCategory,
        timestamp: new Date().toISOString()
      });
      
      // معلومات إضافية للتشخيص
      if (error instanceof TypeError) {
        console.error('🔍 خطأ في النوع - قد تكون مشكلة في API response');
      } else if (error instanceof SyntaxError) {
        console.error('🔍 خطأ في parsing JSON - قد تكون مشكلة في API format');
      }
      
      toast.error(\`حدث خطأ في جلب الأخبار: \${error.message || 'خطأ غير معروف'}\`);
      setArticles([]); // تأكد من إفراغ المقالات عند الخطأ
    }`;
  
  if (content.match(errorHandlingPattern)) {
    content = content.replace(errorHandlingPattern, enhancedErrorHandling);
    modified = true;
    console.log('✅ تم تحسين معالجة الأخطاء');
  }
  
  // إضافة debug info في useEffect
  const useEffectPattern = /useEffect\(\(\) => \{[\s\S]*?console\.log\('🎯 بدء تحميل البيانات الأولية\.\.\.'\);/;
  const enhancedUseEffect = `useEffect(() => {
    console.log('🎯 بدء تحميل البيانات الأولية...', {
      timestamp: new Date().toISOString(),
      location: window.location.href,
      userAgent: navigator.userAgent.substring(0, 50)
    });`;
  
  if (content.match(useEffectPattern)) {
    content = content.replace(useEffectPattern, enhancedUseEffect);
    modified = true;
    console.log('✅ تم تحسين useEffect logging');
  }
  
  if (modified) {
    // إنشاء نسخة احتياطية
    const backupPath = `${filePath}.backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'));
    console.log(`💾 نسخة احتياطية: ${backupPath}`);
    
    // كتابة الملف المحسن
    fs.writeFileSync(filePath, content);
    console.log('✅ تم حفظ الملف المحسن');
    
    return true;
  } else {
    console.log('ℹ️ لم يتم إجراء تعديلات - الملف قد يكون محسن بالفعل');
    return false;
  }
}

function addClientSideDebugging() {
  console.log('\\n🔍 إضافة client-side debugging...');
  
  const debugScript = `
// إضافة debugging للمتصفح
if (typeof window !== 'undefined') {
  window.sabqDebug = {
    logs: [],
    addLog: function(message, data) {
      const log = { timestamp: new Date().toISOString(), message, data };
      this.logs.push(log);
      console.log('🔍 SABQ Debug:', message, data);
      
      // الاحتفاظ بآخر 100 log فقط
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(-100);
      }
    },
    getLogs: function() {
      return this.logs;
    },
    exportLogs: function() {
      const blob = new Blob([JSON.stringify(this.logs, null, 2)], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sabq-debug-logs.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  // تسجيل أخطاء JavaScript العامة
  window.addEventListener('error', function(e) {
    window.sabqDebug.addLog('JavaScript Error', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error?.stack
    });
  });
  
  // تسجيل Unhandled Promise Rejections
  window.addEventListener('unhandledrejection', function(e) {
    window.sabqDebug.addLog('Unhandled Promise Rejection', {
      reason: e.reason,
      promise: e.promise
    });
  });
  
  console.log('🛠️ SABQ Debug tools loaded. Use window.sabqDebug for debugging.');
}`;
  
  const publicPath = path.join(process.cwd(), 'public/sabq-debug.js');
  fs.writeFileSync(publicPath, debugScript);
  console.log('✅ تم إنشاء ملف debugging: public/sabq-debug.js');
  
  return true;
}

async function testEnhancedPage() {
  console.log('\\n🧪 اختبار الصفحة المحسنة...');
  
  try {
    const fetch = require('node-fetch');
    
    // انتظار قليل لإعادة بناء الصفحة
    console.log('⏳ انتظار إعادة بناء الصفحة...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // اختبار تحميل الصفحة
    const response = await fetch('http://localhost:3002/admin/news');
    
    if (response.ok) {
      console.log('✅ الصفحة تحمل بنجاح');
      const html = await response.text();
      
      if (html.includes('إدارة الأخبار')) {
        console.log('✅ المحتوى موجود في HTML');
      } else {
        console.log('⚠️ المحتوى قد لا يظهر بشكل صحيح');
      }
    } else {
      console.log(`❌ فشل تحميل الصفحة: HTTP ${response.status}`);
    }
    
    // اختبار API
    const apiResponse = await fetch('http://localhost:3002/api/admin/news?status=published');
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log(`✅ API يعمل: ${data.total} أخبار منشورة`);
    } else {
      console.log(`❌ API لا يعمل: HTTP ${apiResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ خطأ في الاختبار: ${error.message}`);
  }
}

async function runEnhancement() {
  console.log('🚀 بدء تحسين واجهة إدارة الأخبار\\n');
  
  try {
    // 1. تحسين صفحة الإدارة
    const enhanced = enhanceAdminNewsPage();
    
    // 2. إضافة أدوات debugging
    addClientSideDebugging();
    
    // 3. اختبار الصفحة
    if (enhanced) {
      await testEnhancedPage();
    }
    
    console.log('\\n🎯 تم الانتهاء من التحسين');
    
    if (enhanced) {
      console.log('\\n💡 التوصيات:');
      console.log('1. تحقق من console المتصفح لرسائل debugging مفصلة');
      console.log('2. استخدم window.sabqDebug.getLogs() لرؤية جميع logs');
      console.log('3. استخدم window.sabqDebug.exportLogs() لتصدير logs');
      console.log('4. أعد تحميل الصفحة بـ hard refresh (Ctrl+Shift+R)');
    }
    
  } catch (error) {
    console.error('❌ خطأ في عملية التحسين:', error);
  }
}

// تشغيل التحسين
if (require.main === module) {
  runEnhancement().catch(console.error);
}

module.exports = {
  enhanceAdminNewsPage,
  addClientSideDebugging,
  testEnhancedPage,
  runEnhancement
};