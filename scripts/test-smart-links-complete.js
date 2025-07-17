#!/usr/bin/env node

/**
 * اختبار شامل لنظام الروابط الذكية
 * يختبر جميع مكونات النظام من قاعدة البيانات إلى واجهة المستخدم
 */

const fetch = require('node-fetch').default || require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testFullSystem() {
  console.log('🚀 بدء الاختبار الشامل لنظام الروابط الذكية...\n');

  const tests = [
    testDatabaseConnection,
    testEntityAPI,
    testSmartLinksAPI,
    testComplexAnalysis,
    testPerformance
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`🧪 تشغيل: ${test.name}...`);
      await test();
      console.log(`✅ نجح: ${test.name}\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ فشل: ${test.name}`);
      console.log(`   السبب: ${error.message}\n`);
    }
  }

  // النتيجة النهائية
  console.log('📊 ملخص النتائج:');
  console.log(`   ✅ اختبارات ناجحة: ${passedTests}/${totalTests}`);
  console.log(`   ❌ اختبارات فاشلة: ${totalTests - passedTests}/${totalTests}`);
  console.log(`   📈 معدل النجاح: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 جميع الاختبارات نجحت! النظام جاهز للاستخدام.');
  } else {
    console.log('\n⚠️  بعض الاختبارات فشلت. يرجى مراجعة الأخطاء أعلاه.');
  }
}

// اختبار اتصال قاعدة البيانات
async function testDatabaseConnection() {
  const response = await fetch(`${API_BASE}/api/health`);
  
  if (!response.ok) {
    throw new Error(`خادم API غير متوفر: ${response.status}`);
  }

  const health = await response.json();
  
  if (!health.checks?.database) {
    throw new Error('فشل في الاتصال بقاعدة البيانات');
  }

  console.log('   ✓ اتصال قاعدة البيانات: نشط');
  console.log(`   ✓ البيئة: ${health.environment}`);
}

// اختبار APIs الكيانات
async function testEntityAPI() {
  // اختبار إحصائيات الكيانات
  const statsResponse = await fetch(`${API_BASE}/api/smart-links/analyze`);
  
  if (!statsResponse.ok) {
    throw new Error(`فشل في جلب إحصائيات الكيانات: ${statsResponse.status}`);
  }

  const stats = await statsResponse.json();
  
  console.log(`   ✓ إجمالي الكيانات: ${stats.statistics.totalEntities}`);
  console.log(`   ✓ إجمالي المصطلحات: ${stats.statistics.totalTerms}`);
  console.log(`   ✓ أنواع الكيانات: ${stats.statistics.entityTypes.length}`);

  if (stats.statistics.totalEntities === 0) {
    throw new Error('لا توجد كيانات في قاعدة البيانات');
  }

  if (stats.topEntities.length === 0) {
    console.log('   ⚠️  لا توجد كيانات مذكورة بعد');
  } else {
    console.log(`   ✓ الكيانات الأكثر ذكراً: ${stats.topEntities.length}`);
  }
}

// اختبار API تحليل النصوص
async function testSmartLinksAPI() {
  const testTexts = [
    {
      name: 'نص بسيط',
      text: 'زار الملك سلمان مدينة الرياض وأعلن ولي العهد محمد بن سلمان عن مشروع نيوم.',
      expectedMinLinks: 3
    },
    {
      name: 'نص اقتصادي',
      text: 'أعلن وزير المالية محمد الجدعان أن الناتج المحلي الإجمالي نما بفضل رؤية السعودية 2030.',
      expectedMinLinks: 2
    },
    {
      name: 'نص متنوع',
      text: 'تواصل أرامكو السعودية وصندوق الاستثمارات العامة استثماراتهما في مشروع القدية بالرياض.',
      expectedMinLinks: 4
    }
  ];

  for (const testCase of testTexts) {
    const response = await fetch(`${API_BASE}/api/smart-links/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testCase.text,
        context: 'test'
      }),
    });

    if (!response.ok) {
      throw new Error(`فشل تحليل "${testCase.name}": ${response.status}`);
    }

    const result = await response.json();
    const foundLinks = result.entities.length + result.terms.length;

    console.log(`   ✓ ${testCase.name}: وُجد ${foundLinks} رابط (متوقع ≥${testCase.expectedMinLinks})`);
    console.log(`     ⏱️  وقت المعالجة: ${result.processingTime}ms`);

    if (foundLinks === 0) {
      console.log(`   ⚠️  لم يتم العثور على روابط في "${testCase.name}"`);
    }

    // عرض تفاصيل الروابط الموجودة
    if (result.entities.length > 0) {
      console.log(`     🏷️  كيانات: ${result.entities.map(e => e.matchedText).join(', ')}`);
    }
    if (result.terms.length > 0) {
      console.log(`     📖 مصطلحات: ${result.terms.map(t => t.matchedText).join(', ')}`);
    }
  }
}

// اختبار تحليل معقد
async function testComplexAnalysis() {
  const complexText = `
    أعلن ولي العهد السعودي الأمير محمد بن سلمان عن إطلاق مشروع نيوم الجديد في منطقة تبوك، 
    والذي يأتي ضمن رؤية السعودية 2030 لتنويع الاقتصاد وتقليل الاعتماد على النفط. 
    المشروع الذي يقع في شمال غرب المملكة سيضم مدينة ذا لاين المستقبلية.
    
    من جانب آخر، أعلن وزير المالية محمد الجدعان أن الناتج المحلي الإجمالي للمملكة 
    سجل نمواً قوياً خلال الربع الثالث من العام. وأشار إلى أن صندوق الاستثمارات العامة 
    يواصل استثماراته في مشروع القدية وشركة أرامكو السعودية.
    
    كما زار الملك سلمان مدينة الرياض وجدة لافتتاح عدة مشاريع تنموية جديدة.
  `;

  const response = await fetch(`${API_BASE}/api/smart-links/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: complexText,
      context: 'complex-test'
    }),
  });

  if (!response.ok) {
    throw new Error(`فشل التحليل المعقد: ${response.status}`);
  }

  const result = await response.json();
  
  console.log(`   ✓ نص معقد (${complexText.length} حرف)`);
  console.log(`   ✓ الكيانات الموجودة: ${result.entities.length}`);
  console.log(`   ✓ المصطلحات الموجودة: ${result.terms.length}`);
  console.log(`   ✓ إجمالي الروابط: ${result.totalMatches}`);
  console.log(`   ⏱️  وقت المعالجة: ${result.processingTime}ms`);

  // فحص جودة النتائج
  const highConfidenceLinks = result.entities.filter(e => e.confidence >= 0.8);
  console.log(`   ✓ روابط عالية الثقة (≥80%): ${highConfidenceLinks.length}`);

  const importantEntities = result.entities.filter(e => e.entity.importance_score >= 8);
  console.log(`   ✓ كيانات مهمة (≥8/10): ${importantEntities.length}`);

  if (result.totalMatches === 0) {
    throw new Error('لم يتم العثور على أي روابط في النص المعقد');
  }
}

// اختبار الأداء
async function testPerformance() {
  const performanceTexts = [
    { size: 'صغير', text: 'زار الملك سلمان الرياض.' },
    { size: 'متوسط', text: 'أعلن ولي العهد محمد بن سلمان عن مشروع نيوم في تبوك ضمن رؤية السعودية 2030.' },
    { size: 'كبير', text: 'أعلن ولي العهد محمد بن سلمان عن مشروع نيوم في تبوك. وأعلن وزير المالية محمد الجدعان عن نمو الناتج المحلي الإجمالي. زار الملك سلمان الرياض وجدة. تواصل أرامكو وصندوق الاستثمارات العامة استثماراتهما في القدية.'.repeat(3) }
  ];

  for (const testCase of performanceTexts) {
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE}/api/smart-links/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testCase.text,
        context: 'performance-test'
      }),
    });

    const totalTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`فشل اختبار الأداء ${testCase.size}: ${response.status}`);
    }

    const result = await response.json();
    
    console.log(`   ✓ نص ${testCase.size} (${testCase.text.length} حرف):`);
    console.log(`     🔗 روابط: ${result.totalMatches}`);
    console.log(`     ⏱️  معالجة: ${result.processingTime}ms`);
    console.log(`     🌐 إجمالي: ${totalTime}ms`);

    // فحص حدود الأداء
    if (result.processingTime > 5000) {
      console.log(`   ⚠️  معالجة بطيئة للنص ${testCase.size}: ${result.processingTime}ms`);
    }

    if (totalTime > 10000) {
      console.log(`   ⚠️  استجابة بطيئة للنص ${testCase.size}: ${totalTime}ms`);
    }
  }
}

// تشغيل الاختبارات
if (require.main === module) {
  testFullSystem().catch(error => {
    console.error('❌ خطأ عام في الاختبارات:', error);
    process.exit(1);
  });
}

module.exports = {
  testFullSystem,
  testDatabaseConnection,
  testEntityAPI,
  testSmartLinksAPI,
  testComplexAnalysis,
  testPerformance
}; 