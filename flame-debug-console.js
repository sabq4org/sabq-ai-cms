// ملف للفحص السريع في Dev Tools للمتصفح
// اجلس Ctrl+Shift+I وألصق هذا الكود في Console

console.log('🔥 فحص شعلة اللهب...');

// البحث عن عناصر الشعلة
const flameContainers = document.querySelectorAll('.flame-container');
console.log(`وجدت ${flameContainers.length} شعلة في الصفحة`);

flameContainers.forEach((flame, i) => {
  console.log(`شعلة ${i+1}:`, flame);
  
  // فحص CSS Animation
  const mainFlame = flame.querySelector('.flame-main');
  const innerFlame = flame.querySelector('.flame-inner');
  
  if (mainFlame) {
    const mainStyle = window.getComputedStyle(mainFlame);
    console.log(`  - Main flame animation: ${mainStyle.animation}`);
  }
  
  if (innerFlame) {
    const innerStyle = window.getComputedStyle(innerFlame);  
    console.log(`  - Inner flame animation: ${innerStyle.animation}`);
  }
});

// البحث عن عدد المشاهدات
const viewCounts = document.querySelectorAll('[class*="view"], [class*="مشاهد"]');
console.log(`وجدت ${viewCounts.length} عنصر مشاهدات`);

// فحص حالة CSS
const globalCSS = Array.from(document.styleSheets)
  .flatMap(sheet => {
    try {
      return Array.from(sheet.cssRules);
    } catch(e) {
      return [];
    }
  })
  .filter(rule => rule.name === 'flameFlicker');

console.log(`وجدت ${globalCSS.length} تعريف للأنيميشن flameFlicker`);

if (flameContainers.length === 0) {
  console.warn('⚠️  لم أجد أي شعلة في الصفحة');
  console.log('تأكد من:');
  console.log('1. وجود أخبار بمشاهدات > 300');
  console.log('2. تحميل المكونات بشكل صحيح');
  console.log('3. وجود CSS animation');
} else {
  console.log('✅ تم العثور على شعل اللهب!');
}

// نسخ هذا الكود في console المتصفح وسيعرض لك معلومات مفيدة
