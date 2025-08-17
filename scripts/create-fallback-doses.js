/**
 * إنشاء جرعات احتياطية في حالة عدم عمل قاعدة البيانات أو OpenAI
 */

const fs = require('fs');
const path = require('path');

const fallbackDoses = {
  morning: {
    id: 'fallback-morning',
    period: 'morning',
    main_text: 'ابدأ يومك بالأهم 👇',
    sub_text: 'ملخص ذكي لما فاتك من أحداث البارحة… قبل فنجان القهوة ☕️',
    topics: ['أخبار عامة', 'اقتصاد', 'تقنية'],
    view_count: 150,
    interaction_count: 12,
    created_at: new Date().toISOString()
  },
  noon: {
    id: 'fallback-noon',
    period: 'noon',
    main_text: 'منتصف النهار… وحرارة الأخبار 🔥',
    sub_text: 'إليك آخر المستجدات حتى هذه اللحظة، باختصار لا يفوّت',
    topics: ['أخبار عاجلة', 'سياسة', 'رياضة'],
    view_count: 89,
    interaction_count: 7,
    created_at: new Date().toISOString()
  },
  evening: {
    id: 'fallback-evening',
    period: 'evening',
    main_text: 'مساؤك ذكاء واطّلاع 🌇',
    sub_text: 'إليك تحليلًا خفيفًا وذكيًا لأبرز قصص اليوم',
    topics: ['تحليلات', 'ثقافة', 'مجتمع'],
    view_count: 203,
    interaction_count: 18,
    created_at: new Date().toISOString()
  },
  night: {
    id: 'fallback-night',
    period: 'night',
    main_text: 'قبل أن تنام… تعرف على ملخص اليوم 🌙',
    sub_text: '3 أخبار مختارة بعناية، خالية من الضجيج',
    topics: ['ملخص اليوم', 'أخبار هادئة', 'إيجابية'],
    view_count: 67,
    interaction_count: 4,
    created_at: new Date().toISOString()
  }
};

function createFallbackDoses() {
  console.log('🧠 إنشاء جرعات احتياطية...');

  const outputPath = path.join(__dirname, '..', 'data', 'fallback-doses.json');
  
  // إنشاء مجلد data إذا لم يكن موجوداً
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // كتابة الملف
  fs.writeFileSync(outputPath, JSON.stringify(fallbackDoses, null, 2), 'utf8');
  
  console.log(`✅ تم إنشاء الجرعات الاحتياطية في: ${outputPath}`);
  console.log(`📄 عدد الجرعات: ${Object.keys(fallbackDoses).length}`);
  
  return fallbackDoses;
}

// تشغيل السكريبت
if (require.main === module) {
  createFallbackDoses();
}

module.exports = { fallbackDoses, createFallbackDoses };