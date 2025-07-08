const fs = require('fs');
const path = require('path');

function fixPageFiles(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // قائمة بالهوكات التي تتطلب توجيه 'use client'
  const clientHooks = [
    'useState', 'useEffect', 'useRef', 'useCallback', 
    'useContext', 'useMemo', 'useReducer', 'useRouter', 
    'useSearchParams', 'useParams', 'use', 'useCallback'
  ];
  
  // التحقق مما إذا كان الملف يحتاج إلى توجيه 'use client'
  const needsClientDirective = clientHooks.some(hook => 
    content.includes(`import { ${hook}`) || content.includes(`from 'react'`) && content.includes(hook)
  );
  
  // إضافة توجيه 'use client' إذا كان مطلوبًا
  if (needsClientDirective) {
    // إزالة أي توجيه موجود
    content = content.replace(/^'use client';\n/m, '');
    
    // إضافة التوجيه في بداية الملف
    content = "'use client';\n\n" + content;
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
  if (needsClientDirective && !content.includes("import React")) {
    content = "import React from 'react';\n" + content;
  }
  
  // إصلاح الأخطاء في العناصر HTML
  content = content.replace(/<header/g, '<div');
  content = content.replace(/<\/header>/g, '</div>');
  
  // إصلاح مشكلة الـ div غير المتوقع
  content = content.replace(/return\s*\(\s*<div/g, 'return (\n  <div');
  
  // إصلاح مشكلة الإعادة
  content = content.replace(/return\s*\(\s*\n\s*<div/g, 'return (\n  <div');
  
  // إضافة فراغات للتنسيق
  content = content.replace(/return\s*\(\s*<div/g, 'return (\n  <div');
  
  // إزالة الفراغات الزائدة
  content = content.replace(/\n\s*\n/g, '\n');
  
  fs.writeFileSync(filePath, content);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('page.tsx')) {
      try {
        fixPageFiles(fullPath);
        console.log(`Processed: ${fullPath}`);
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
      }
    }
  });
}

// ابدأ من مجلد التطبيق
processDirectory(path.join(__dirname, '..', 'app'));

console.log('تم معالجة جميع الصفحات'); 