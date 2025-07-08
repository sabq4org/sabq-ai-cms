const fs = require('fs');
const path = require('path');

function fixClientDirectives(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // نقل توجيه 'use client' إلى أعلى الملف
  if (content.includes("'use client';") && !content.startsWith("'use client';")) {
    content = content.replace("'use client';", '');
    content = "'use client';\n" + content;
  }
  
  // إصلاح الأخطاء في العناصر HTML
  content = content.replace(/<header/g, '<div');
  content = content.replace(/<\/header>/g, '</div>');
  
  // إضافة استيراد React إذا كان مفقودًا
  if (content.includes('useState') || content.includes('useEffect') || content.includes('useRef')) {
    if (!content.includes("import React")) {
      content = "import React from 'react';\n" + content;
    }
  }
  
  fs.writeFileSync(filePath, content);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        fixClientDirectives(fullPath);
        console.log(`Processed: ${fullPath}`);
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
      }
    }
  });
}

// ابدأ من مجلد المكونات والتطبيق
processDirectory(path.join(__dirname, '..', 'components'));
processDirectory(path.join(__dirname, '..', 'app'));

console.log('تم معالجة جميع الملفات'); 