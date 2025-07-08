const fs = require('fs');
const path = require('path');

function fixImportsAndQuotes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // إصلاح استيراد الوحدات
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+&quot;([^&]+)&quot;/g, 'import { $1 } from "$2"');
  
  // إصلاح الأقواس المكررة
  content = content.replace(/&quot;/g, '"');
  
  // إصلاح استيراد الصور
  content = content.replace(/import\s+Image\s+from\s+&quot;next\/image&quot;/g, 'import Image from "next/image"');
  
  // إصلاح استيراد الخوادم التالية
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+&quot;next\/server&quot;/g, 'import { $1 } from "next/server"');
  
  // إصلاح الأقواس في الكود
  content = content.replace(/&quot;/g, '"');
  
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
        fixImportsAndQuotes(fullPath);
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