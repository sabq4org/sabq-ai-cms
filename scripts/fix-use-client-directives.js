#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// قائمة الملفات التي تحتاج إصلاح بناءً على الأخطاء
const filesToFix = [
  // app directory files
  'app/error.tsx',
  'app/global-error.tsx',
  'app/page.tsx',
  'app/providers.tsx',
  'app/theme-script.tsx',
  
  // dashboard files
  'app/dashboard/error.tsx',
  'app/dashboard/layout.tsx',
  'app/dashboard/page.tsx',
  'app/dashboard/news/page.tsx',
  'app/dashboard/news/[id]/page.tsx',
  'app/dashboard/news/create/page.tsx',
  'app/dashboard/ai-editor/page.tsx',
  'app/dashboard/analytics/behavior/page.tsx',
  'app/dashboard/analytics/page.tsx',
  'app/dashboard/article/edit/[id]/page.tsx',
  'app/dashboard/blocks/deep-analysis/page.tsx',
  'app/dashboard/categories/[id]/page.tsx',
  'app/dashboard/activities/page.tsx',
  'app/dashboard/ai-analytics/page.tsx',
  
  // other app pages
  'app/articles/page.tsx',
  'app/auth/verify/page.tsx',
  'app/author/[id]/page.tsx',
  'app/categories/[slug]/page.tsx',
  'app/article/[id]/page.tsx',
  'app/categories/page.tsx',
  'app/components-showcase/page.tsx',
  'app/contact/page.tsx',
  'app/daily-dose/page.tsx',
  
  // components
  'components/DeepAnalysisWidget.tsx',
  'components/Header.tsx',
  'components/PowerBar.tsx',
  'components/TodayOpinionsSection.tsx',
  'components/UserDropdown.tsx',
  'components/Editor/Editor.tsx',
  'components/Editor/EditorToolbar.tsx',
  'components/Editor/ImageUploader.tsx',
  'components/Editor/LinkDialog.tsx',
  'components/ui/tabs-enhanced.tsx',
  
  // home components
  'components/home/SmartContextWidget.tsx',
  'components/home/SmartSlot.tsx',
  
  // mobile components
  'components/mobile/MobileLayout.tsx',
  'components/mobile/MobileHeader.tsx',
  'components/mobile/MobileOptimizer.tsx',
  
  // smart blocks
  'components/smart-blocks/SmartBlockRenderer.tsx',
  'components/smart-blocks/AlHilalWorldCupBlock.tsx',
  'components/smart-blocks/CardGridBlock.tsx',
  'components/smart-blocks/CarouselBlock.tsx',
  'components/smart-blocks/HeroSliderBlock.tsx',
  'components/smart-blocks/SmartDigestBlock.tsx'
];

// البحث عن جميع ملفات TypeScript/TSX في المشروع
function findAllTsxFiles() {
  const patterns = [
    'app/**/*.tsx',
    'app/**/*.ts',
    'components/**/*.tsx',
    'components/**/*.ts',
    'contexts/**/*.tsx',
    'contexts/**/*.ts'
  ];
  
  let allFiles = [];
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: ['node_modules/**', '.next/**'] });
    allFiles = allFiles.concat(files);
  });
  
  return allFiles;
}

function fixUseClientDirective(filePath) {
  try {
    // قراءة محتوى الملف
    let content = fs.readFileSync(filePath, 'utf8');
    
    // إزالة جميع توجيهات 'use client' الموجودة (مع أو بدون فاصلة منقوطة)
    content = content.replace(/['"]use client['"];?\s*\n/g, '');
    
    // إضافة 'use client' في البداية
    content = "'use client';\n\n" + content.trim();
    
    // كتابة الملف المحدث
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// إصلاح جميع الملفات
console.log('🔧 بدء إصلاح توجيهات "use client"...\n');

let successCount = 0;
let errorCount = 0;

// إصلاح الملفات المحددة أولاً
filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  
  // التحقق من وجود الملف
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  // التحقق من أن الملف يحتوي على React hooks أو components
  const content = fs.readFileSync(fullPath, 'utf8');
  const needsUseClient = 
    content.includes('useState') ||
    content.includes('useEffect') ||
    content.includes('useContext') ||
    content.includes('useReducer') ||
    content.includes('useCallback') ||
    content.includes('useMemo') ||
    content.includes('useRef') ||
    content.includes('useRouter') ||
    content.includes('useParams') ||
    content.includes('useSearchParams') ||
    content.includes('usePathname') ||
    content.includes('onClick') ||
    content.includes('onChange') ||
    content.includes('onSubmit');
  
  if (needsUseClient) {
    if (fixUseClientDirective(fullPath)) {
      successCount++;
    } else {
      errorCount++;
    }
  } else {
    console.log(`⏭️  Skipped (no client features): ${file}`);
  }
});

// البحث عن ملفات إضافية قد تحتاج إصلاح
console.log('\n🔍 البحث عن ملفات إضافية...\n');
const allFiles = findAllTsxFiles();
const processedFiles = new Set(filesToFix.map(f => path.join(process.cwd(), f)));

allFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  
  // تجاهل الملفات التي تمت معالجتها بالفعل
  if (processedFiles.has(fullPath)) {
    return;
  }
  
  // قراءة الملف والتحقق من وجود 'use client' في مكان خاطئ
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // التحقق من وجود 'use client' في مكان خاطئ
    const hasUseClientWrong = /^(?!['"]use client['"];?\s*\n)[\s\S]*['"]use client['"];?/m.test(content);
    
    if (hasUseClientWrong) {
      console.log(`🔧 Found misplaced 'use client' in: ${file}`);
      if (fixUseClientDirective(fullPath)) {
        successCount++;
      } else {
        errorCount++;
      }
    }
  } catch (error) {
    // تجاهل الأخطاء في قراءة الملفات
  }
});

console.log('\n📊 النتائج:');
console.log(`✅ تم إصلاح: ${successCount} ملف`);
console.log(`❌ فشل: ${errorCount} ملف`);
console.log('\n✨ اكتمل إصلاح توجيهات "use client"!');

// إصلاح أخطاء الصور
console.log('\n🖼️ بدء إصلاح أخطاء الصور...\n');

const imageFixPatterns = [
  {
    pattern: /<Image\s+src={undefined}/g,
    replacement: '<Image src="/placeholder.jpg"',
    description: 'إصلاح src={undefined}'
  },
  {
    pattern: /Image\s+src={undefined}\s+alt=""\s+width={100}\s+height={100}\s+\/>/g,
    replacement: 'Image src="/placeholder.jpg" alt="" width={100} height={100} />',
    description: 'إصلاح Image tags مع undefined src'
  }
];

[...filesToFix, ...allFiles].forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(fullPath)) {
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    imageFixPatterns.forEach(({pattern, replacement, description}) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        console.log(`🖼️  ${description} في: ${file}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content);
    }
  } catch (error) {
    console.error(`❌ خطأ في إصلاح الصور في ${file}:`, error.message);
  }
});

console.log('\n✅ اكتمل إصلاح جميع الملفات!');
console.log('🚀 يمكنك الآن تشغيل: npm run dev'); 