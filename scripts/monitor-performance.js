#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// إعدادات المراقبة
const config = {
  baseUrl: process.env.MONITOR_URL || 'http://localhost:3000',
  endpoints: [
    { path: '/api/articles?limit=10', name: 'جلب المقالات' },
    { path: '/api/categories', name: 'جلب التصنيفات' },
    { path: '/api/health', name: 'فحص الصحة' }
  ],
  iterations: 5,
  delay: 1000 // تأخير بين الاختبارات بالمللي ثانية
};

// ألوان للطرفية
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// دالة لقياس وقت الاستجابة
async function measureResponseTime(url) {
  return new Promise((resolve) => {
    const start = performance.now();
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const end = performance.now();
        const duration = end - start;
        resolve({
          duration,
          statusCode: res.statusCode,
          size: Buffer.byteLength(data, 'utf8')
        });
      });
    }).on('error', (err) => {
      resolve({
        duration: -1,
        statusCode: 0,
        error: err.message
      });
    });
  });
}

// دالة لتحليل الأداء
function analyzePerformance(results) {
  const times = results.map(r => r.duration).filter(d => d > 0);
  if (times.length === 0) return null;
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
  
  return { avg, min, max, median };
}

// دالة لعرض النتائج
function displayResults(endpoint, results, analysis) {
  console.log(`\n${colors.cyan}📊 ${endpoint.name}${colors.reset}`);
  console.log(`   المسار: ${endpoint.path}`);
  
  if (!analysis) {
    console.log(`   ${colors.red}❌ فشلت جميع المحاولات${colors.reset}`);
    return;
  }
  
  // تحديد اللون حسب الأداء
  let color = colors.green;
  if (analysis.avg > 2000) color = colors.red;
  else if (analysis.avg > 1000) color = colors.yellow;
  
  console.log(`   ${color}⏱️  متوسط الوقت: ${analysis.avg.toFixed(0)}ms${colors.reset}`);
  console.log(`   📉 أقل وقت: ${analysis.min.toFixed(0)}ms`);
  console.log(`   📈 أعلى وقت: ${analysis.max.toFixed(0)}ms`);
  console.log(`   📊 الوسيط: ${analysis.median.toFixed(0)}ms`);
  
  // عرض الأخطاء إن وجدت
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.log(`   ${colors.red}⚠️  أخطاء: ${errors.length}/${results.length}${colors.reset}`);
  }
}

// دالة لتوليد تقرير الأداء
function generateReport(allResults) {
  console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}📈 تقرير الأداء الإجمالي${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}\n`);
  
  let totalAvg = 0;
  let endpointCount = 0;
  
  for (const [endpoint, results] of allResults) {
    const analysis = analyzePerformance(results);
    if (analysis) {
      totalAvg += analysis.avg;
      endpointCount++;
    }
  }
  
  if (endpointCount > 0) {
    const overallAvg = totalAvg / endpointCount;
    let status = '🟢 ممتاز';
    let color = colors.green;
    
    if (overallAvg > 2000) {
      status = '🔴 بطيء';
      color = colors.red;
    } else if (overallAvg > 1000) {
      status = '🟡 متوسط';
      color = colors.yellow;
    }
    
    console.log(`${color}الحالة العامة: ${status}${colors.reset}`);
    console.log(`متوسط الاستجابة الكلي: ${overallAvg.toFixed(0)}ms\n`);
  }
  
  // توصيات
  console.log(`${colors.cyan}💡 توصيات:${colors.reset}`);
  if (totalAvg / endpointCount > 2000) {
    console.log('- تحقق من فهارس قاعدة البيانات');
    console.log('- راجع استعلامات N+1');
    console.log('- فعّل التخزين المؤقت');
  } else if (totalAvg / endpointCount > 1000) {
    console.log('- فكر في استخدام Redis للتخزين المؤقت');
    console.log('- حسّن حجم الصور');
    console.log('- استخدم CDN للملفات الثابتة');
  } else {
    console.log('- الأداء جيد! استمر في المراقبة');
  }
}

// الدالة الرئيسية
async function main() {
  console.log(`${colors.blue}🚀 بدء مراقبة الأداء...${colors.reset}`);
  console.log(`URL الأساسي: ${config.baseUrl}`);
  console.log(`عدد التكرارات: ${config.iterations}\n`);
  
  const allResults = new Map();
  
  for (const endpoint of config.endpoints) {
    const results = [];
    const url = `${config.baseUrl}${endpoint.path}`;
    
    console.log(`${colors.yellow}🔄 اختبار ${endpoint.name}...${colors.reset}`);
    
    for (let i = 0; i < config.iterations; i++) {
      process.stdout.write(`   محاولة ${i + 1}/${config.iterations}...`);
      const result = await measureResponseTime(url);
      results.push(result);
      
      if (result.error) {
        process.stdout.write(` ${colors.red}❌${colors.reset}\n`);
      } else {
        process.stdout.write(` ${colors.green}✓${colors.reset} (${result.duration.toFixed(0)}ms)\n`);
      }
      
      // تأخير بين الطلبات
      if (i < config.iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
    }
    
    const analysis = analyzePerformance(results);
    displayResults(endpoint, results, analysis);
    allResults.set(endpoint, results);
  }
  
  generateReport(allResults);
}

// تشغيل المراقبة
main().catch(console.error); 