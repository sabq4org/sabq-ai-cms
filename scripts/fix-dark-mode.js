#!/usr/bin/env node

/**
 * سكريبت إصلاح شامل لمشاكل الوضع المظلم
 * يقوم بتحديث جميع الملفات لإضافة دعم كامل للوضع المظلم
 */

const fs = require('fs');
const path = require('path');

// قائمة التحويلات المطلوبة
const darkModeReplacements = [
  // الخلفيات
  { from: /bg-white(?!\w)/g, to: 'bg-white dark:bg-gray-800' },
  { from: /bg-gray-50(?!\w)/g, to: 'bg-gray-50 dark:bg-gray-900' },
  { from: /bg-gray-100(?!\w)/g, to: 'bg-gray-100 dark:bg-gray-800' },
  { from: /bg-gray-200(?!\w)/g, to: 'bg-gray-200 dark:bg-gray-700' },
  { from: /bg-blue-50(?!\w)/g, to: 'bg-blue-50 dark:bg-blue-900/20' },
  
  // النصوص
  { from: /text-gray-900(?!\w)/g, to: 'text-gray-900 dark:text-white' },
  { from: /text-gray-800(?!\w)/g, to: 'text-gray-800 dark:text-gray-100' },
  { from: /text-gray-700(?!\w)/g, to: 'text-gray-700 dark:text-gray-300' },
  { from: /text-gray-600(?!\w)/g, to: 'text-gray-600 dark:text-gray-400' },
  { from: /text-gray-500(?!\w)/g, to: 'text-gray-500 dark:text-gray-400' },
  { from: /text-gray-400(?!\w)/g, to: 'text-gray-400 dark:text-gray-500' },
  
  // الحدود
  { from: /border-gray-200(?!\w)/g, to: 'border-gray-200 dark:border-gray-700' },
  { from: /border-gray-300(?!\w)/g, to: 'border-gray-300 dark:border-gray-600' },
  { from: /border-gray-100(?!\w)/g, to: 'border-gray-100 dark:border-gray-700' },
  
  // الظلال
  { from: /shadow-sm(?!\w)/g, to: 'shadow-sm dark:shadow-gray-900/50' },
  { from: /shadow-md(?!\w)/g, to: 'shadow-md dark:shadow-gray-900/50' },
  { from: /shadow-lg(?!\w)/g, to: 'shadow-lg dark:shadow-gray-900/50' },
  { from: /shadow-xl(?!\w)/g, to: 'shadow-xl dark:shadow-gray-900/50' },
  
  // hover states
  { from: /hover:bg-gray-50(?!\w)/g, to: 'hover:bg-gray-50 dark:hover:bg-gray-700' },
  { from: /hover:bg-gray-100(?!\w)/g, to: 'hover:bg-gray-100 dark:hover:bg-gray-700' },
  { from: /hover:bg-gray-200(?!\w)/g, to: 'hover:bg-gray-200 dark:hover:bg-gray-600' },
  
  // التدرجات
  { from: /from-white(?!\w)/g, to: 'from-white dark:from-gray-800' },
  { from: /to-gray-50(?!\w)/g, to: 'to-gray-50 dark:to-gray-900' },
];

// الملفات المستهدفة
const targetFiles = [
  'app/page.tsx',
  'app/categories/page.tsx',
  'app/article/[id]/page.tsx',
  'app/contact/page.tsx',
  'app/profile/page.tsx',
  'app/author/[id]/page.tsx',
  'components/Header.tsx',
  'components/Footer.tsx',
  'components/NewsCard.tsx',
  'components/CategoryBadge.tsx',
];

// دالة معالجة الملف
function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  الملف غير موجود: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // تطبيق التحويلات
  darkModeReplacements.forEach(replacement => {
    const matches = content.match(replacement.from);
    if (matches && matches.length > 0) {
      content = content.replace(replacement.from, replacement.to);
      modified = true;
    }
  });
  
  // إضافة تحسينات خاصة
  // التأكد من أن العناصر التفاعلية لديها transition
  if (!content.includes('transition-colors') && content.includes('hover:')) {
    content = content.replace(/className="([^"]*hover:[^"]*)"/, 'className="$1 transition-colors"');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ تم تحديث: ${filePath}`);
  } else {
    console.log(`ℹ️  لا يحتاج تحديث: ${filePath}`);
  }
}

// دالة إضافة دعم الوضع المظلم للـ CSS
function updateCSSFiles() {
  const cssFiles = [
    'app/globals.css',
    'app/article/[id]/article-styles.css'
  ];
  
  cssFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  ملف CSS غير موجود: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // إضافة دعم الوضع المظلم إذا لم يكن موجوداً
    if (!content.includes('@media (prefers-color-scheme: dark)') && !content.includes('.dark')) {
      const darkModeCSS = `
/* دعم الوضع المظلم */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}

/* تحسينات إضافية للوضع المظلم */
.dark body {
  background-color: #0a0a0a;
  color: #ededed;
}

.dark .prose {
  color: #d1d5db;
}

.dark .prose h1,
.dark .prose h2,
.dark .prose h3,
.dark .prose h4 {
  color: #f3f4f6;
}

.dark .prose strong {
  color: #f3f4f6;
}

.dark .prose a {
  color: #60a5fa;
}

.dark .prose a:hover {
  color: #93bbfc;
}

.dark .prose blockquote {
  border-left-color: #4b5563;
  color: #d1d5db;
}

.dark .prose code {
  background-color: #374151;
  color: #f3f4f6;
}

.dark .prose pre {
  background-color: #1f2937;
  color: #f3f4f6;
}

.dark .prose hr {
  border-color: #374151;
}
`;
      
      content += darkModeCSS;
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ تم إضافة دعم الوضع المظلم لـ: ${filePath}`);
    }
  });
}

// التنفيذ
console.log('🌙 بدء إصلاح الوضع المظلم...\n');

// معالجة ملفات TypeScript/React
targetFiles.forEach(processFile);

// معالجة ملفات CSS
updateCSSFiles();

console.log('\n✨ تم الانتهاء من إصلاح الوضع المظلم!');
console.log('💡 نصيحة: تأكد من إعادة تشغيل خادم التطوير لرؤية التغييرات'); 