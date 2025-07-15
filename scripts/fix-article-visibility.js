#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

// استبدل هذا بـ URL موقعك
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// دالة لعمل طلب HTTP باستخدام curl
function httpRequest(url, options = {}) {
  try {
    let curlCmd = `curl -s "${url}"`;
    
    if (options.method === 'POST') {
      curlCmd = `curl -s -X POST "${url}" -H "Content-Type: application/json"`;
      if (options.body) {
        curlCmd += ` -d '${options.body}'`;
      }
    }
    
    const result = execSync(curlCmd, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    console.error('خطأ في الطلب:', error.message);
    return null;
  }
}

async function diagnoseArticleVisibility() {
  console.log('🔍 بدء تشخيص مشكلة ظهور المقالات...\n');

  try {
    // 1. التحقق من حالة الكاش
    console.log('1️⃣ التحقق من حالة Redis Cache:');
    const cacheStatus = httpRequest(`${BASE_URL}/api/cache/clear`);
    if (cacheStatus) {
      console.log('   - حالة الكاش:', cacheStatus.message);
      console.log('   - متصل:', cacheStatus.cacheReady ? '✅' : '❌');
    } else {
      console.log('   - ❌ فشل الاتصال بـ API');
    }

    // 2. جلب آخر المقالات المنشورة
    console.log('\n2️⃣ جلب آخر المقالات المنشورة:');
    const latestArticles = httpRequest(`${BASE_URL}/api/articles?status=published&limit=5&sortBy=published_at`);
    
    if (latestArticles.success && latestArticles.articles) {
      console.log(`   - عدد المقالات: ${latestArticles.articles.length}`);
      
      const latestArticle = latestArticles.articles[0];
      if (latestArticle) {
        console.log('\n   آخر مقال منشور:');
        console.log(`   - ID: ${latestArticle.id}`);
        console.log(`   - العنوان: ${latestArticle.title}`);
        console.log(`   - التصنيف ID: ${latestArticle.category_id}`);
        console.log(`   - اسم التصنيف: ${latestArticle.category_name || 'غير محدد'}`);
        console.log(`   - الحالة: ${latestArticle.status}`);
        console.log(`   - تاريخ النشر: ${latestArticle.published_at || latestArticle.created_at}`);

        // 3. التحقق من ظهور المقال في قسمه
        if (latestArticle.category_id) {
          console.log(`\n3️⃣ التحقق من ظهور المقال في قسم "${latestArticle.category_name}":`);
          const categoryArticles = httpRequest(
            `${BASE_URL}/api/articles?category_id=${latestArticle.category_id}&status=published`
          );

          const foundInCategory = categoryArticles.articles?.find(a => a.id === latestArticle.id);
          console.log(`   - موجود في القسم: ${foundInCategory ? '✅' : '❌'}`);

          if (!foundInCategory) {
            console.log('\n   ⚠️ المقال غير موجود في قسمه! المشكلة محتملة:');
            console.log('   - الكاش قديم في صفحة القسم');
            console.log('   - category_id قد يكون غير صحيح');
            console.log('   - قد يكون هناك فلترة إضافية تحجب المقال');
          }
        }

        // 4. التحقق من البيانات الأساسية
        console.log('\n4️⃣ فحص البيانات الأساسية:');
        console.log(`   - له category_id: ${latestArticle.category_id ? '✅' : '❌'}`);
        console.log(`   - الحالة published: ${latestArticle.status === 'published' ? '✅' : '❌'}`);
        console.log(`   - له تاريخ نشر: ${latestArticle.published_at ? '✅' : '❌'}`);
        console.log(`   - ليس محذوف: ${latestArticle.status !== 'deleted' ? '✅' : '❌'}`);
      }
    }

    // 5. اقتراح الحلول
    console.log('\n5️⃣ الحلول المقترحة:');
    console.log('   1. مسح الكاش الكامل للمقالات');
    console.log('   2. التحقق من category_id في قاعدة البيانات');
    console.log('   3. التأكد من عدم وجود فلترة إضافية في الكود');

    // السؤال عن مسح الكاش
    console.log('\n❓ هل تريد مسح الكاش الآن؟ (y/n)');
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
  }
}

async function clearCache(type = 'all') {
  console.log('\n🧹 جاري مسح الكاش...');
  
  try {
    const result = httpRequest(`${BASE_URL}/api/cache/clear`, {
      method: 'POST',
      body: JSON.stringify({ type })
    });
    
    if (result.success) {
      console.log('✅ تم مسح الكاش بنجاح:', result.cleared.join(', '));
      console.log('\n📝 الخطوات التالية:');
      console.log('   1. قم بتحديث صفحة الموقع');
      console.log('   2. تحقق من ظهور المقال في جميع الأقسام');
      console.log('   3. إذا استمرت المشكلة، راجع قاعدة البيانات');
    } else {
      console.error('❌ فشل مسح الكاش:', result.error);
    }
  } catch (error) {
    console.error('❌ خطأ في مسح الكاش:', error.message);
  }
}

// تشغيل السكريبت
async function main() {
  await diagnoseArticleVisibility();
  
  // معالجة الإدخال من المستخدم
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('', async (answer) => {
    if (answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes') {
      await clearCache();
    } else {
      console.log('تم الإلغاء.');
    }
    rl.close();
    process.exit(0);
  });
}

// بدء التشغيل
main().catch(console.error); 