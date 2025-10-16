#!/usr/bin/env node

/**
 * سكربت اختبار أداء صفحة تفاصيل الخبر
 * يقارن بين النسخة القديمة والمحسّنة
 */

const https = require('https');
const http = require('http');

// إعدادات الاختبار
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  testArticleIds: [
    // أضف معرفات المقالات للاختبار
    'test-article-1',
    'test-article-2',
    'test-article-3',
  ],
  iterations: 10, // عدد مرات الاختبار لكل endpoint
  endpoints: {
    original: '/api/articles',
    optimized: '/api/articles',
    fastOptimized: '/api/articles',
  },
};

// دالة لقياس وقت الطلب
async function measureRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;

    protocol
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          try {
            const parsedData = JSON.parse(data);
            resolve({
              success: true,
              responseTime,
              statusCode: res.statusCode,
              cached: res.headers['x-cache'] === 'HIT',
              data: parsedData,
            });
          } catch (error) {
            resolve({
              success: false,
              responseTime,
              statusCode: res.statusCode,
              error: 'Failed to parse JSON',
            });
          }
        });
      })
      .on('error', (error) => {
        reject({
          success: false,
          error: error.message,
          responseTime: Date.now() - startTime,
        });
      });
  });
}

// دالة لحساب الإحصائيات
function calculateStats(results) {
  const responseTimes = results.map((r) => r.responseTime);
  const successCount = results.filter((r) => r.success).length;
  const cacheHits = results.filter((r) => r.cached).length;

  responseTimes.sort((a, b) => a - b);

  return {
    total: results.length,
    success: successCount,
    failed: results.length - successCount,
    cacheHitRate: ((cacheHits / results.length) * 100).toFixed(2) + '%',
    responseTime: {
      min: Math.min(...responseTimes),
      max: Math.max(...responseTimes),
      avg: (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2),
      median: responseTimes[Math.floor(responseTimes.length / 2)],
      p95: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99: responseTimes[Math.floor(responseTimes.length * 0.99)],
    },
  };
}

// دالة لاختبار endpoint واحد
async function testEndpoint(endpointName, endpointPath, articleId) {
  console.log(`\n🧪 اختبار ${endpointName} للمقال: ${articleId}`);
  
  const results = [];
  const url = `${CONFIG.baseUrl}${endpointPath}/${articleId}`;

  for (let i = 0; i < CONFIG.iterations; i++) {
    try {
      const result = await measureRequest(url);
      results.push(result);
      
      const status = result.success ? '✅' : '❌';
      const cache = result.cached ? '💾' : '🔄';
      console.log(
        `  ${status} ${cache} الطلب ${i + 1}/${CONFIG.iterations}: ${result.responseTime}ms`
      );
      
      // انتظار قصير بين الطلبات
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`  ❌ خطأ في الطلب ${i + 1}:`, error.message);
      results.push({ success: false, error: error.message, responseTime: 0 });
    }
  }

  return results;
}

// دالة لطباعة النتائج
function printResults(endpointName, stats) {
  console.log(`\n📊 نتائج ${endpointName}:`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  إجمالي الطلبات: ${stats.total}`);
  console.log(`  ✅ نجح: ${stats.success}`);
  console.log(`  ❌ فشل: ${stats.failed}`);
  console.log(`  💾 معدل الإصابة في الكاش: ${stats.cacheHitRate}`);
  console.log('\n  ⏱️ أوقات الاستجابة:');
  console.log(`    • الأدنى: ${stats.responseTime.min}ms`);
  console.log(`    • المتوسط: ${stats.responseTime.avg}ms`);
  console.log(`    • الوسيط: ${stats.responseTime.median}ms`);
  console.log(`    • P95: ${stats.responseTime.p95}ms`);
  console.log(`    • P99: ${stats.responseTime.p99}ms`);
  console.log(`    • الأعلى: ${stats.responseTime.max}ms`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// دالة لمقارنة النتائج
function compareResults(originalStats, optimizedStats) {
  console.log('\n🔍 المقارنة بين النسخة القديمة والمحسّنة:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const avgImprovement =
    ((originalStats.responseTime.avg - optimizedStats.responseTime.avg) /
      originalStats.responseTime.avg) *
    100;

  const p95Improvement =
    ((originalStats.responseTime.p95 - optimizedStats.responseTime.p95) /
      originalStats.responseTime.p95) *
    100;

  console.log(`  📈 تحسين المتوسط: ${avgImprovement.toFixed(2)}%`);
  console.log(`  📈 تحسين P95: ${p95Improvement.toFixed(2)}%`);
  console.log(
    `  💾 تحسين معدل الكاش: ${originalStats.cacheHitRate} → ${optimizedStats.cacheHitRate}`
  );

  if (avgImprovement > 50) {
    console.log('\n  🎉 تحسين ممتاز! أكثر من 50%');
  } else if (avgImprovement > 25) {
    console.log('\n  ✅ تحسين جيد! بين 25-50%');
  } else if (avgImprovement > 0) {
    console.log('\n  ⚠️ تحسين طفيف. قد يحتاج لمزيد من التحسين');
  } else {
    console.log('\n  ❌ لا يوجد تحسين. يحتاج لمراجعة');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// الدالة الرئيسية
async function main() {
  console.log('🚀 بدء اختبار أداء صفحة تفاصيل الخبر');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  URL الأساسي: ${CONFIG.baseUrl}`);
  console.log(`  عدد التكرارات: ${CONFIG.iterations}`);
  console.log(`  عدد المقالات: ${CONFIG.testArticleIds.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const allResults = {
    original: [],
    optimized: [],
    fastOptimized: [],
  };

  // اختبار كل مقال
  for (const articleId of CONFIG.testArticleIds) {
    console.log(`\n📰 اختبار المقال: ${articleId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // اختبار النسخة الأصلية
    const originalResults = await testEndpoint(
      'النسخة الأصلية',
      CONFIG.endpoints.original,
      articleId
    );
    allResults.original.push(...originalResults);

    // اختبار النسخة المحسّنة
    const optimizedResults = await testEndpoint(
      'النسخة المحسّنة',
      `${CONFIG.endpoints.optimized}-optimized`,
      articleId
    );
    allResults.optimized.push(...optimizedResults);

    // اختبار النسخة السريعة
    const fastOptimizedResults = await testEndpoint(
      'النسخة السريعة',
      `${CONFIG.endpoints.fastOptimized}/fast-optimized`,
      articleId
    );
    allResults.fastOptimized.push(...fastOptimizedResults);
  }

  // حساب وطباعة الإحصائيات الإجمالية
  console.log('\n\n📊 الإحصائيات الإجمالية');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const originalStats = calculateStats(allResults.original);
  const optimizedStats = calculateStats(allResults.optimized);
  const fastOptimizedStats = calculateStats(allResults.fastOptimized);

  printResults('النسخة الأصلية', originalStats);
  printResults('النسخة المحسّنة', optimizedStats);
  printResults('النسخة السريعة', fastOptimizedStats);

  // مقارنة النتائج
  compareResults(originalStats, optimizedStats);

  console.log('✅ اكتمل الاختبار بنجاح!\n');
}

// تشغيل الاختبار
main().catch((error) => {
  console.error('❌ خطأ في تشغيل الاختبار:', error);
  process.exit(1);
});

