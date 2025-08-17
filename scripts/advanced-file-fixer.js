const fs = require('fs');
const path = require('path');

function fixImportAndClientDirectives(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // نقل توجيه 'use client' إلى أعلى الملف
  if (content.includes("'use client';") && !content.startsWith("'use client';")) {
    content = content.replace("'use client';", '');
    content = "'use client';\n" + content;
  }
  
  // معالجة مشاكل الاستيراد المكررة
  const importLines = content.match(/^import\s+.*from\s+['"].*['"];/gm) || [];
  const uniqueImports = new Set();
  const cleanImportLines = importLines.filter(line => {
    const cleanLine = line.trim();
    if (uniqueImports.has(cleanLine)) {
      return false;
    }
    uniqueImports.add(cleanLine);
    return true;
  });
  
  // استبدال الاستيرادات الأصلية بالاستيرادات الفريدة
  content = content.replace(/^import\s+.*from\s+['"].*['"];/gm, '');
  content = cleanImportLines.join('\n') + '\n\n' + content;
  
  // إصلاح استيراد Lucide React
  content = content.replace(
    /import\s+\{[^}]+\}\s+from\s+['"]__barrel_optimize__\?[^'"]*['"];/g, 
    ''
  );
  
  // إضافة استيراد React إذا كان مفقودًا
  if ((content.includes('useState') || content.includes('useEffect') || content.includes('useRef')) 
      && !content.includes("import React")) {
    content = "import React from 'react';\n" + content;
  }
  
  // إصلاح الأخطاء في العناصر HTML
  content = content.replace(/<header/g, '<div');
  content = content.replace(/<\/header>/g, '</div>');
  
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
        fixImportAndClientDirectives(fullPath);
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