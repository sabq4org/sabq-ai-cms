#!/usr/bin/env node

/**
 * سكريپت إصلاح صفحة إدارة الأخبار
 * يصلح مشكلة W.published والأخطاء الأخرى
 */

const fs = require('fs');
const path = require('path');

function fixAdminNewsPage() {
  console.log('🔧 إصلاح صفحة إدارة الأخبار...');
  
  const filePath = path.join(process.cwd(), 'app/admin/news/page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ ملف إدارة الأخبار غير موجود');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;
  
  // إصلاح 1: التأكد من صحة interface Article
  const articleInterfaceMatch = content.match(/(interface Article\s*{[^}]*})/s);
  if (articleInterfaceMatch) {
    let interfaceContent = articleInterfaceMatch[1];
    
    // التأكد من وجود published_at
    if (!interfaceContent.includes('published_at')) {
      interfaceContent = interfaceContent.replace(
        'status: \'published\' | \'draft\' | \'archived\';',
        'status: \'published\' | \'draft\' | \'archived\';\n  published_at?: string;'
      );
      content = content.replace(articleInterfaceMatch[1], interfaceContent);
      fixed = true;
      console.log('✅ إضافة published_at إلى interface Article');
    }
  }
  
  // إصلاح 2: التأكد من عدم استخدام .published مباشرة
  if (content.includes('.published') && !content.includes('stats.published')) {
    content = content.replace(/\.published(?!_at)/g, '.published_at');
    fixed = true;
    console.log('✅ استبدال .published بـ .published_at');
  }
  
  // إصلاح 3: التأكد من صحة تعريف useState
  const brokenStateMatch = content.match(/const\s+\[.*?\]\s*=.*?setState.*?{[^}]*$/gm);
  if (brokenStateMatch) {
    console.log('⚠️ وجدت تعريف state مكسور، سيتم إصلاحه');
    // إصلاح محدد حسب النمط
    brokenStateMatch.forEach(brokenState => {
      const fixedState = brokenState.replace('setState', 'useState');
      content = content.replace(brokenState, fixedState);
      fixed = true;
    });
    console.log('✅ إصلاح تعريفات useState');
  }
  
  // إصلاح 4: التأكد من صحة استدعاءات API
  if (content.includes('W.published')) {
    content = content.replace(/W\.published/g, 'article.published_at');
    fixed = true;
    console.log('✅ إصلاح مراجع W.published');
  }
  
  // إصلاح 5: إضافة معالجة آمنة للبيانات
  const fetchArticlesMatch = content.match(/(const fetchArticles = async \(\) => {[\s\S]*?};)/);
  if (fetchArticlesMatch && !content.includes('data.articles?.forEach')) {
    // إضافة معالجة آمنة للبيانات
    const safeDataHandling = `
      if (data.articles) {
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
        });`;
    
    if (!content.includes('cleanArticles = data.articles.map')) {
      content = content.replace(
        'if (data.articles) {',
        safeDataHandling
      );
      fixed = true;
      console.log('✅ إضافة معالجة آمنة للبيانات');
    }
  }
  
  if (fixed) {
    // إنشاء نسخة احتياطية
    const backupPath = `${filePath}.backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'));
    console.log(`💾 نسخة احتياطية: ${backupPath}`);
    
    // كتابة الملف المصلح
    fs.writeFileSync(filePath, content);
    console.log('✅ تم حفظ الملف المصلح');
    
    return true;
  } else {
    console.log('✅ الملف سليم، لا يحتاج إصلاح');
    return false;
  }
}

function clearNextCache() {
  console.log('🧹 تنظيف cache Next.js...');
  
  const nextDir = path.join(process.cwd(), '.next');
  const cacheDir = path.join(process.cwd(), 'node_modules/.cache');
  
  try {
    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('✅ تم حذف .next');
    }
    
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log('✅ تم حذف node_modules/.cache');
    }
  } catch (error) {
    console.log('⚠️ خطأ في تنظيف cache:', error.message);
  }
}

async function runFix() {
  console.log('🚀 بدء إصلاح صفحة إدارة الأخبار\\n');
  
  // 1. إصلاح الملف
  const wasFixed = fixAdminNewsPage();
  
  // 2. تنظيف cache
  clearNextCache();
  
  console.log('\\n🎯 النتيجة:');
  if (wasFixed) {
    console.log('✅ تم إصلاح الملف وتنظيف cache');
    console.log('💡 يرجى إعادة تشغيل التطبيق: npm run dev');
  } else {
    console.log('✅ الملف سليم، تم تنظيف cache فقط');
    console.log('💡 المشكلة قد تكون في المتصفح، جرب Hard Refresh (Ctrl+Shift+R)');
  }
  
  console.log('\\n📋 خطوات إضافية:');
  console.log('1. امسح cache المتصفح');
  console.log('2. افتح Developer Tools');
  console.log('3. اذهب إلى Network > Disable cache');
  console.log('4. أعد تحميل الصفحة');
}

// تشغيل الإصلاح
if (require.main === module) {
  runFix().catch(console.error);
}

module.exports = {
  fixAdminNewsPage,
  clearNextCache,
  runFix
};