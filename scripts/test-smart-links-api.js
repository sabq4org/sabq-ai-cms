#!/usr/bin/env node

/**
 * سكريبت اختبار API الروابط الذكية
 * يختبر تحليل النصوص واستخراج الكيانات والمصطلحات
 */

const fetch = require('node-fetch').default || require('node-fetch');

const API_BASE = 'http://localhost:3001';

// نصوص تجريبية للاختبار
const testTexts = [
  {
    name: 'خبر سياسي',
    text: `أعلن ولي العهد السعودي الأمير محمد بن سلمان عن إطلاق مشروع نيوم الجديد في منطقة تبوك، والذي يأتي ضمن رؤية السعودية 2030 لتنويع الاقتصاد وتقليل الاعتماد على النفط. المشروع الذي يقع في شمال غرب المملكة سيضم مدينة ذا لاين المستقبلية.`
  },
  {
    name: 'خبر اقتصادي',
    text: `أعلن وزير المالية محمد الجدعان أن الناتج المحلي الإجمالي للمملكة سجل نمواً قوياً خلال الربع الثالث من العام. وأشار إلى أن صندوق الاستثمارات العامة يواصل استثماراته في مشروع القدية وشركة أرامكو السعودية.`
  },
  {
    name: 'نص بسيط',
    text: `زار الملك سلمان مدينة الرياض وجدة لافتتاح عدة مشاريع تنموية جديدة.`
  }
];

async function testAnalyzeAPI(text, testName) {
  console.log(`\n🧪 اختبار: ${testName}`);
  console.log(`📝 النص: ${text.substring(0, 100)}...`);
  
  try {
    const response = await fetch(`${API_BASE}/api/smart-links/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        context: 'test'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`❌ فشل الطلب: ${response.status} - ${errorData.error}`);
      return;
    }

    const data = await response.json();
    
    console.log(`⚡ وقت المعالجة: ${data.processingTime}ms`);
    console.log(`📊 إجمالي المطابقات: ${data.totalMatches}`);
    
    // عرض الكيانات المكتشفة
    if (data.entities.length > 0) {
      console.log(`\n👥 الكيانات المكتشفة (${data.entities.length}):`);
      data.entities.forEach((entity, index) => {
        console.log(`   ${index + 1}. "${entity.matchedText}" → ${entity.entity.name_ar}`);
        console.log(`      النوع: ${entity.entity.entity_type.icon} ${entity.entity.entity_type.name_ar}`);
        console.log(`      الثقة: ${(entity.confidence * 100).toFixed(1)}%`);
        console.log(`      الأهمية: ${entity.entity.importance_score}/10`);
        console.log(`      الرابط: ${entity.suggestedLink.type} - ${entity.suggestedLink.url || 'tooltip'}`);
      });
    }
    
    // عرض المصطلحات المكتشفة
    if (data.terms.length > 0) {
      console.log(`\n📖 المصطلحات المكتشفة (${data.terms.length}):`);
      data.terms.forEach((term, index) => {
        console.log(`   ${index + 1}. "${term.matchedText}" → ${term.term.term}`);
        console.log(`      التعريف: ${term.term.definition}`);
        console.log(`      الفئة: ${term.term.category}`);
      });
    }
    
    if (data.totalMatches === 0) {
      console.log('🤷 لم يتم العثور على أي مطابقات');
    }
    
  } catch (error) {
    console.log(`❌ خطأ في الطلب: ${error.message}`);
  }
}

async function testStatisticsAPI() {
  console.log('\n📊 اختبار API الإحصائيات...');
  
  try {
    const response = await fetch(`${API_BASE}/api/smart-links/analyze`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`❌ فشل الطلب: ${response.status} - ${errorData.error}`);
      return;
    }

    const data = await response.json();
    
    console.log('\n📈 إحصائيات النظام:');
    console.log(`   🏷️ إجمالي الكيانات: ${data.statistics.totalEntities}`);
    console.log(`   📖 إجمالي المصطلحات: ${data.statistics.totalTerms}`);
    console.log(`   🔗 إجمالي الروابط: ${data.statistics.totalLinks}`);
    
    console.log('\n📁 أنواع الكيانات:');
    data.statistics.entityTypes.forEach(type => {
      console.log(`   ${type.icon} ${type.type}: ${type.count}`);
    });
    
    if (data.topEntities.length > 0) {
      console.log('\n🔥 الكيانات الأكثر ذكراً:');
      data.topEntities.slice(0, 5).forEach((entity, index) => {
        console.log(`   ${index + 1}. ${entity.icon} ${entity.name} (${entity.mentions} مرة)`);
      });
    }
    
  } catch (error) {
    console.log(`❌ خطأ في طلب الإحصائيات: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 بدء اختبار نظام الروابط الذكية...');
  console.log(`🌐 API Base: ${API_BASE}`);
  
  // اختبار API الإحصائيات أولاً
  await testStatisticsAPI();
  
  // اختبار تحليل النصوص
  for (const testCase of testTexts) {
    await testAnalyzeAPI(testCase.text, testCase.name);
    await new Promise(resolve => setTimeout(resolve, 500)); // انتظار قصير
  }
  
  console.log('\n✅ انتهت جميع الاختبارات!');
  console.log('\n💡 لعرض المزيد من التفاصيل، تحقق من وحدة التحكم في المتصفح أو logs الخادم.');
}

// تشغيل الاختبارات
runTests().catch(error => {
  console.error('❌ خطأ عام في الاختبارات:', error);
  process.exit(1);
}); 